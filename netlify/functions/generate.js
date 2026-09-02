import OpenAI from "openai";
import { getUser } from "@netlify/identity";

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { "cache-control": "no-store" }
});

const clean = value => String(value || "").replace(/\s+/g, " ").trim();

function topicFrom(value) {
  let topic = clean(value)
    .replace(/^\s*(?:crie|criar|gere|gerar|faça|faca|escreva|produza)\s+/i, "")
    .replace(/^\s*\d+\s+(?:frases?|hooks?|ideias?|roteiros?)\s+(?:fortes?|virais?|curtos?|sobre)\s*/i, "")
    .replace(/^\s*(?:frases?|hooks?|ideias?|roteiros?)\s+(?:sobre|de)\s+/i, "")
    .replace(/^\s*(?:fortes?|virais?|curtos?)\s+(?:sobre|de)\s+/i, "")
    .replace(/\s+(?:para|pra)\s+(?:um|uma)\s+reel\s*$/i, "");
  return topic || clean(value);
}

function unique(parts) {
  const seen = new Set();
  const result = [];
  for (const value of parts) {
    const text = clean(value);
    const key = text.toLowerCase().replace(/[^a-z0-9áàâãéêíóôõúç ]/gi, "").replace(/\s+/g, " ");
    if (!text || seen.has(key)) continue;
    seen.add(key);
    result.push(text);
  }
  return result;
}

function localScripts(idea, duration, count) {
  const topic = topicFrom(idea);
  const angles = [
    ["O ponto central", `Em ${topic}, o primeiro ponto é separar o que realmente importa do que só parece importante.`, `Olhe para o problema por uma causa de cada vez e identifique a variável que mais muda o resultado.`, `Pegue uma situação real de ${topic} e compare duas decisões mudando apenas uma condição.`, `Teste essa condição isoladamente antes de mudar outras partes do processo.`, `Quando a variável certa fica clara, a decisão fica mais precisa.`],
    ["A diferença", `A mesma estratégia em ${topic} pode funcionar em um cenário e falhar em outro.`, `A diferença pode estar no objetivo, no momento, no contexto ou na execução.`, `Compare dois casos de ${topic} alterando somente uma dessas condições.`, `Descubra qual condição está presente no seu caso antes de agir.`, `Contexto faz parte da resposta.`],
    ["O erro", `Um erro comum em ${topic} é começar pela solução antes de entender o problema.`, `Sem uma causa clara, qualquer conselho vira tentativa e erro.`, `Escolha um exemplo concreto e descreva primeiro a causa e depois a consequência.`, `Só então selecione a ação mais adequada para aquele caso.`, `Entender o problema evita repetir a mesma tentativa.`],
    ["Na prática", `Transforme ${topic} em uma situação que poderia acontecer hoje.`, `Imagine uma decisão real com duas alternativas e uma consequência para cada escolha.`, `Mostre exatamente onde os caminhos se separam e por que o resultado muda.`, `Use o mesmo critério para analisar uma situação parecida.`, `Um exemplo concreto torna a ideia mais fácil de aplicar.`],
    ["A pergunta certa", `Antes de decidir sobre ${topic}, faça uma pergunta diferente: o que precisa ser verdade para isso funcionar?`, `Essa pergunta revela condições que normalmente ficam escondidas.`, `Aplique-a a um caso real e liste duas condições verificáveis.`, `Confira essas condições antes de executar a próxima ação.`, `Perguntas melhores levam a decisões mais precisas.`],
    ["Teste pequeno", `Você não precisa resolver ${topic} inteiro para começar a aprender.`, `Um teste pequeno pode mostrar qual caminho merece ser aprofundado.`, `Escolha uma mudança observável e compare antes e depois.`, `Registre o resultado antes de fazer outra mudança.`, `Evidência pequena também é informação útil.`],
    ["Mito", `Uma afirmação comum sobre ${topic} só é útil quando você sabe em quais situações ela funciona.`, `Uma regra pode ser verdadeira em um contexto e inadequada em outro.`, `Procure um caso com contexto diferente e compare o resultado.`, `Não trate uma regra como universal sem verificar as condições.`, `A exceção também ensina como a regra funciona.`],
    ["Explicação simples", `Explique ${topic} usando causa e efeito, sem palavras complicadas.`, `Mostre o que acontece primeiro, qual escolha vem depois e qual consequência aparece.`, `Use uma situação cotidiana para representar essa sequência.`, `Se alguma etapa ficar confusa, simplifique o mecanismo antes de avançar.`, `Clareza aumenta quando cada etapa tem uma função.`],
    ["Próximo passo", `O melhor próximo passo em ${topic} é aquele que produz informação nova.`, `Em vez de mudar tudo, escolha uma única ação que possa ser avaliada.`, `Faça esse teste e anote exatamente o que mudou.`, `Use o resultado para decidir o segundo passo.`, `Progresso fica mais fácil quando cada ação ensina alguma coisa.`],
    ["Outro ângulo", `Talvez ${topic} esteja sendo analisado pela pergunta errada.`, `Em vez de olhar só para o resultado, observe o processo que produz esse resultado.`, `Mapeie uma situação do início ao fim e encontre a etapa de maior impacto.`, `Mude primeiro essa etapa e compare o efeito.`, `Às vezes a solução aparece quando a pergunta muda.`]
  ];

  const total = Math.min(Math.max(Number(count) || 1, 1), 10);
  const step = Math.max(1, duration / 5);
  return Array.from({ length: total }, (_, i) => {
    const angle = angles[i % angles.length];
    return {
      titulo: `${angle[0]}: ${topic}`,
      scenes: angle.slice(1).map((text, n) => ({
        start: Number((n * step).toFixed(1)),
        end: Number(((n + 1) * step).toFixed(1)),
        text
      }))
    };
  });
}

function instructions(topic, style, duration, count) {
  return `Você é o roteirista principal do ReelsAI. Tema: "${topic}". Estilo: ${style}. Duração: ${duration}s. Gere ${count} Reel(s). Cada Reel deve ter exatamente 5 cenas diferentes e específicas. Cena 1 abre a ideia, cena 2 acrescenta informação, cena 3 traz exemplo ou consequência, cena 4 dá aplicação prática e cena 5 fecha sem repetir a abertura. Não repita argumentos, frases ou exemplos entre Reels. Português brasileiro natural. Não invente fatos. Para Bíblia, use referências reais; para saúde, direito e finanças, seja responsável. Retorne somente JSON: {"reels":[{"titulo":"...","scenes":["cena 1","cena 2","cena 3","cena 4","cena 5"]}]}`;
}

function normalize(reels, duration) {
  const step = Math.max(1, duration / 5);
  return (Array.isArray(reels) ? reels : []).slice(0, 10).map((item, i) => {
    const raw = Array.isArray(item?.scenes) ? item.scenes : [item?.hook, item?.body, item?.example, item?.action, item?.close];
    const texts = unique(raw).slice(0, 5);
    while (texts.length < 5) texts.push(`Desenvolva um ponto específico sobre o tema.`);
    return {
      titulo: clean(item?.titulo) || `Reel ${i + 1}`,
      scenes: texts.map((text, n) => ({
        start: Number((n * step).toFixed(1)),
        end: Number(((n + 1) * step).toFixed(1)),
        text
      }))
    };
  });
}

async function tryOpenAI(idea, duration, style, count) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NETLIFY_AI_GATEWAY_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || process.env.NETLIFY_AI_GATEWAY_BASE_URL;
  if (!apiKey) throw new Error("Provedor de IA indisponível");

  const client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1",
    instructions: instructions(topicFrom(idea), style, duration, count),
    input: clean(idea),
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
                  scenes: { type: "array", minItems: 5, maxItems: 5, items: { type: "string" } }
                },
                required: ["titulo", "scenes"]
              }
            }
          },
          required: ["reels"]
        }
      }
    }
  });

  const parsed = JSON.parse(response.output_text || "{}");
  return normalize(parsed.reels, duration);
}

export default async request => {
  try {
    if (request.method !== "POST") return json({ error: "Método não permitido." }, 405);

    const user = await getUser();
    if (!user) return json({ error: "Não autenticado. Faça login novamente." }, 401);

    const body = await request.json().catch(() => ({}));
    const idea = clean(body?.idea);
    const duration = Number(body?.duration) || 30;
    const style = clean(body?.style) || "Viral / rápido";
    const count = Math.min(Math.max(Number(body?.count) || 1, 1), 10);
    if (!idea) return json({ error: "Digite um tema primeiro." }, 400);

    try {
      const items = await tryOpenAI(idea, duration, style, count);
      if (items.length) return json({ items, mode: "openai" });
    } catch (error) {
      console.error("AI provider unavailable; using local fallback", error);
    }

    return json({
      items: localScripts(idea, duration, count),
      mode: "local-fallback",
      warning: "O provedor de IA não está disponível neste deploy. O ReelsAI continuou em modo local."
    });
  } catch (error) {
    console.error("generate error", error);
    return json({ error: error?.message || "Não foi possível gerar os roteiros." }, 500);
  }
};
