const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function normalizeStyle(value) {
  const style = String(value || "viral").trim().toLowerCase();
  if (style.includes("educ")) return "educativo";
  if (style.includes("motiv")) return "motivacional";
  if (style.includes("story")) return "storytelling";
  return "viral";
}

function cleanText(value) {
  return String(value || "").replace(/\\s+/g, " ").trim();
}

function buildScenes(script, duration) {
  const parts = [script.hook, script.body, script.example, script.action, script.close]
    .map(cleanText)
    .filter(Boolean)
    .slice(0, 5);

  while (parts.length < 5) parts.push("Continue acompanhando para mais conteúdo prático.");

  const step = duration / 5;
  return parts.map((text, index) => ({
    start: Number((index * step).toFixed(1)),
    end: Number(((index + 1) * step).toFixed(1)),
    text
  }));
}

function extractJson(text) {
  const value = cleanText(text);
  try { return JSON.parse(value); } catch (_) {}
  const match = value.match(/\\{[\\s\\S]*\\}/);
  if (match) return JSON.parse(match[0]);
  throw new Error("A IA retornou uma resposta em formato inválido.");
}

async function generateWithAI({ idea, duration, style, count }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada no Netlify. Adicione a chave nas variáveis de ambiente para ativar a IA.");
  }

  const instructions = `Você é o roteirista profissional do ReelsAI. Sua função é transformar QUALQUER pedido do usuário em roteiros de Reels profissionais, específicos, naturais e úteis.

REGRAS OBRIGATÓRIAS:
1. Primeiro entenda qual é o ASSUNTO REAL pedido pelo usuário. Ignore comandos como “crie um reel”, “faça um vídeo”, “gere 10 reels”, “pra mim” e semelhantes. Nunca repita esses comandos no roteiro.
2. Nunca use frases genéricas como “vamos mostrar pontos importantes”, “entenda o essencial”, “existe um jeito simples”, “aplique esta ideia” ou equivalentes quando puder escrever algo concreto.
3. O título deve falar diretamente do assunto e parecer um título real de conteúdo para redes sociais.
4. O gancho deve despertar curiosidade sobre o assunto, sem mencionar que está criando um Reel.
5. O corpo deve ensinar algo CONCRETO sobre o assunto. Inclua fatos, passos, técnicas, exemplos, números ou detalhes específicos quando forem apropriados.
6. O exemplo deve ser realmente relacionado ao assunto, não um exemplo genérico que poderia servir para qualquer tema.
7. A ação final deve ser uma ação útil e relacionada ao assunto.
8. O fechamento deve soar natural e curto.
9. Cada variação deve ter um ângulo diferente. Não repita o mesmo roteiro trocando poucas palavras.
10. Se o pedido for sobre religião/Bíblia, use referências bíblicas reais e não invente versículos. Priorize referência + mensagem + aplicação.
11. Se o pedido for sobre saúde, direito, finanças ou outro tema sensível, seja responsável, evite promessas absolutas e deixe claro quando algo depende de profissional qualificado.
12. Escreva em português brasileiro natural. Não use placeholders como {tema}, [assunto] ou texto de instrução.
13. Não diga que você é IA e não explique seu processo.
14. O resultado deve parecer escrito por um roteirista experiente, não por um gerador de frases.

ESTILO: ${style}
DURAÇÃO: ${duration} segundos
QUANTIDADE: ${count}

Para cada Reel, produza: titulo, hook, body, example, action e close. Responda somente no formato JSON solicitado.`;

  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    instructions,
    input: cleanText(idea),
    text: {
      format: {
        type: "json_schema",
        name: "reels_generation",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            reels: {
              type: "array",
              minItems: 1,
              maxItems: 10,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  titulo: { type: "string" },
                  hook: { type: "string" },
                  body: { type: "string" },
                  example: { type: "string" },
                  action: { type: "string" },
                  close: { type: "string" }
                },
                required: ["titulo", "hook", "body", "example", "action", "close"]
              }
            }
          },
          required: ["reels"]
        }
      }
    }
  });

  const parsed = extractJson(response.output_text || "");
  if (!parsed.reels || !Array.isArray(parsed.reels) || !parsed.reels.length) {
    throw new Error("A IA não retornou nenhum roteiro.");
  }

  return parsed.reels.slice(0, count).map((script, index) => ({
    titulo: cleanText(script.titulo) || `Reel ${index + 1}`,
    hook: cleanText(script.hook),
    duration,
    tema: cleanText(idea),
    style,
    scenes: buildScenes(script, duration)
  }));
}

exports.handler = async function(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "Método não permitido." }) };
    }

    let data;
    try {
      data = JSON.parse(event.body || "{}");
    } catch (_) {
      return { statusCode: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "JSON inválido." }) };
    }

    const idea = cleanText(data.idea || data.ideia);
    const durationValue = Number(data.duration || data.duracao || 30);
    const duration = [30, 45, 60].includes(durationValue) ? durationValue : 30;
    const countValue = Number(data.count || 1);
    const count = Math.max(1, Math.min(10, Number.isFinite(countValue) ? Math.floor(countValue) : 1));
    const style = normalizeStyle(data.style || data.estilo);

    if (!idea) {
      return { statusCode: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "Informe o tema do Reel." }) };
    }

    const items = await generateWithAI({ idea, duration, style, count });

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: require("crypto").randomUUID(),
        idea,
        style,
        duration,
        count: items.length,
        items
      })
    };
  } catch (error) {
    console.error(error);
    const statusCode = error.message && error.message.includes("OPENAI_API_KEY") ? 503 : 500;
    return {
      statusCode,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: error.message || "Erro ao gerar os Reels." })
    };
  }
};
