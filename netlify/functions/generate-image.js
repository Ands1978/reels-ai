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
      return { statusCode: 503, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "OPENAI_API_KEY não configurada." }) };
    }

    const data = JSON.parse(event.body || "{}");
    const topic = cleanText(data.topic);
    const scene = cleanText(data.scene);
    const style = cleanText(data.style || "cinematográfico");

    if (!topic || !scene) {
      return { statusCode: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "Tema e cena são obrigatórios." }) };
    }

    const prompt = `Crie uma imagem vertical 9:16 profissional para um vídeo curto de redes sociais.\n\nTema: ${topic}\nCena/ideia que a imagem precisa representar: ${scene}\nEstética: ${style}, moderna, cinematográfica, realista, iluminação profissional, composição forte, profundidade, alto nível de detalhe.\n\nRegras: a imagem deve representar visualmente a cena de forma específica; não usar texto, letras, legendas, logotipos, marcas d'água ou interfaces; não repetir composição de uma cena anterior; variar enquadramento, ambiente e elementos visuais quando possível.`;

    const response = await client.images.generate({
      model: "gpt-image-2",
      prompt,
      size: "1024x1536",
      quality: "medium"
    });

    const image = response.data && response.data[0];
    if (!image || !image.b64_json) {
      throw new Error("A IA não retornou a imagem.");
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
      body: JSON.stringify({ image: `data:image/png;base64,${image.b64_json}` })
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
