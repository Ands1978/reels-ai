const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

exports.handler = async function(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "Método não permitido." }) };
    }

    if (!process.env.OPENAI_API_KEY) {
      return { statusCode: 503, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "OPENAI_API_KEY não configurada no Netlify." }) };
    }

    let data;
    try {
      data = JSON.parse(event.body || "{}");
    } catch (_) {
      return { statusCode: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "JSON inválido." }) };
    }

    const scene = cleanText(data.scene);
    const topic = cleanText(data.topic);
    const index = Number(data.index || 1);

    if (!scene) {
      return { statusCode: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "Informe o texto da cena." }) };
    }

    const prompt = `Crie uma imagem vertical 9:16 para ilustrar um Reel profissional brasileiro.

Assunto do Reel: ${topic || scene}
Cena atual: ${scene}
Número da cena: ${index}

A imagem deve representar visualmente a cena de forma específica e realista, com aparência profissional de conteúdo para Instagram/TikTok. Crie uma composição diferente de outras cenas: varie enquadramento, ambiente, objetos, ação, perspectiva e iluminação. Não coloque texto, letras, legendas, marcas d'água ou logotipos na imagem. Não faça uma arte genérica. Priorize fotografia realista quando o assunto permitir; para conceitos abstratos, use uma composição visual editorial sofisticada.`;

    const response = await client.images.generate({
      model: "gpt-image-2",
      prompt,
      size: "1024x1536",
      quality: "low",
      output_format: "webp"
    });

    const image = response.data && response.data[0] && response.data[0].b64_json;
    if (!image) throw new Error("A IA não retornou a imagem.");

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ image: `data:image/webp;base64,${image}` })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.message && error.message.includes("OPENAI_API_KEY") ? 503 : 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: error.message || "Erro ao gerar imagem." })
    };
  }
};
