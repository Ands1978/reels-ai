const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

exports.handler = async function(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "Método não permitido." })
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 503,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "OPENAI_API_KEY não configurada no Netlify." })
      };
    }

    let data;
    try {
      data = JSON.parse(event.body || "{}");
    } catch (_) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "JSON inválido." })
      };
    }

    const text = cleanText(data.text);
    if (!text) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "Texto da narração não informado." })
      };
    }

    const speech = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "marin",
      input: text,
      instructions: "Fale em português brasileiro, com voz natural, clara, profissional e envolvente. Ritmo de narrador de vídeo curto, com pausas leves e sem soar robótico. Não leia títulos ou instruções, apenas o texto fornecido."
    });

    const buffer = Buffer.from(await speech.arrayBuffer());

    return {
      statusCode: 200,
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "no-store"
      },
      isBase64Encoded: true,
      body: buffer.toString("base64")
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: error.message || "Erro ao gerar a narração." })
    };
  }
};
