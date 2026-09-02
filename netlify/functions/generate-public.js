import OpenAI from "openai";
import { getUser } from "@netlify/identity";

const json = (body, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });
const clean = v => String(v || "").replace(/\s+/g, " ").trim();
const topicFrom = v => clean(v).replace(/^\s*(?:crie|criar|gere|gerar|faça|faca|escreva|produza)\s+/i, "").replace(/^\s*\d+\s+(?:frases?|hooks?|ideias?|roteiros?)\s+(?:fortes?|virais?|curtos?|sobre)\s*/i, "").replace(/^\s*(?:frases?|hooks?|ideias?|roteiros?)\s+(?:sobre|de)\s+/i, "") || clean(v);
const unique = xs => { const seen = new Set(); return xs.map(clean).filter(x => { const k = x.toLowerCase().replace(/\W+/g, " ").trim(); if (!x || seen.has(k)) return false; seen.add(k); return true; }); };

function localScripts(idea, duration, count) {
  const topic = topicFrom(idea), step = Math.max(1, duration / 5);
  const angles = [
    ["O ponto central", `Em ${topic}, comece pelo que realmente muda o resultado.`, `Separe causa, contexto e consequência antes de escolher uma solução.`, `Compare dois casos reais mudando apenas uma condição.`, `Teste essa condição isoladamente antes de alterar o resto.`, `Quando a variável certa fica clara, a decisão fica mais precisa.`],
    ["A diferença", `A mesma estratégia em ${topic} pode funcionar em um cenário e falhar em outro.`, `Objetivo, momento, contexto e execução podem mudar o resultado.`, `Compare dois casos alterando somente uma dessas condições.`, `Descubra qual condição existe no seu caso antes de agir.`, `Contexto faz parte da resposta.`],
    ["O erro", `Um erro comum em ${topic} é começar pela solução antes de entender o problema.`, `Sem uma causa clara, qualquer conselho vira tentativa e erro.`, `Escolha um exemplo concreto e separe causa de consequência.`, `Só então selecione a ação adequada para aquele caso.`, `Entender o problema evita repetir a mesma tentativa.`],
    ["Na prática", `Transforme ${topic} em uma situação que poderia acontecer hoje.`, `Imagine duas alternativas e uma consequência para cada escolha.`, `Mostre exatamente onde os caminhos se separam.`, `Use o mesmo critério para analisar uma situação parecida.`, `Um exemplo concreto torna a ideia aplicável.`],
    ["A pergunta certa", `Antes de decidir sobre ${topic}, pergunte o que precisa ser verdade para funcionar.`, `Essa pergunta revela condições escondidas.`, `Aplique-a a um caso real e liste duas condições verificáveis.`, `Confira essas condições antes da próxima ação.`, `Perguntas melhores levam a decisões mais precisas.`],
    ["Teste pequeno", `Você não precisa resolver ${topic} inteiro para começar.`, `Um teste pequeno pode mostrar qual caminho merece atenção.`, `Escolha uma mudança observável e compare antes e depois.`, `Registre o resultado antes de fazer outra mudança.`, `Evidência pequena também é informação útil.`],
    ["Mito", `Uma afirmação sobre ${topic} só é útil quando sabemos onde ela funciona.`, `Uma regra pode ser verdadeira em um contexto e inadequada em outro.`, `Procure um caso diferente e compare o resultado.`, `Não trate uma regra como universal sem verificar as condições.`, `A exceção também ensina.`],
    ["Explicação simples", `Explique ${topic} usando causa e efeito.`, `Mostre o que acontece primeiro, qual escolha vem depois e qual consequência aparece.`, `Use uma situação cotidiana para representar a sequência.`, `Se algo ficar confuso, simplifique o mecanismo.`, `Clareza aumenta quando cada etapa tem uma função.`],
    ["Próximo passo", `O melhor próximo passo em ${topic} é aquele que produz informação nova.`, `Em vez de mudar tudo, escolha uma ação que possa ser avaliada.`, `Faça o teste e anote exatamente o que mudou.`, `Use o resultado para decidir o segundo passo.`, `Progresso fica mais fácil quando cada ação ensina.`],
    ["Outro ângulo", `Talvez ${topic} esteja sendo analisado pela pergunta errada.`, `Observe o processo que produz o resultado, não só o resultado.`, `Mapeie uma situação do início ao fim e encontre a etapa de maior impacto.`, `Mude primeiro essa etapa e compare o efeito.`, `Às vezes a solução aparece quando a pergunta muda.`]
  ];
  return Array.from({ length: Math.min(Math.max(Number(count) || 1, 1), 10) }, (_, i) => {
    const a = angles[i % angles.length];
    return { titulo: `${a[0]}: ${topic}`, scenes: a.slice(1).map((text, n) => ({ start: Number((n * step).toFixed(1)), end: Number(((n + 1) * step).toFixed(1)), text })) };
  });
}

function prompt(topic, style, duration, count) {
  return `Você é o roteirista principal do ReelsAI. Tema: "${topic}". Estilo: ${style}. Duração: ${duration}s. Gere ${count} Reels. Cada Reel deve ter exatamente 5 cenas diferentes, específicas e naturais em português brasileiro. Cena 1 abre a ideia; 2 desenvolve; 3 traz exemplo ou consequência; 4 aplica; 5 fecha sem repetir. Não invente fatos. Para Bíblia, use referências reais; para saúde, direito e finanças, seja responsável. Retorne somente JSON.`;
}

async function ai(idea, duration, style, count) {
  const key = process.env.OPENAI_API_KEY || process.env.NETLIFY_AI_GATEWAY_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || process.env.NETLIFY_AI_GATEWAY_BASE_URL;
  if (!key) throw new Error("AI indisponível");
  const client = new OpenAI({ apiKey: key, ...(baseURL ? { baseURL } : {}) });
  const r = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1",
    instructions: prompt(topicFrom(idea), style, duration, count),
    input: clean(idea),
    text: { format: { type: "json_schema", name: "reels_generation", strict: true, schema: { type: "object", additionalProperties: false, properties: { reels: { type: "array", minItems: 1, maxItems: 10, items: { type: "object", additionalProperties: false, properties: { titulo: { type: "string" }, scenes: { type: "array", minItems: 5, maxItems: 5, items: { type: "string" } } }, required: ["titulo", "scenes"] } } }, required: ["reels"] } } }
  });
  const data = JSON.parse(r.output_text || "{}");
  const step = Math.max(1, duration / 5);
  return (Array.isArray(data.reels) ? data.reels : []).slice(0, 10).map((x, i) => ({ titulo: clean(x.titulo) || `Reel ${i + 1}`, scenes: unique(x.scenes || []).slice(0, 5).map((text, n) => ({ start: Number((n * step).toFixed(1)), end: Number(((n + 1) * step).toFixed(1)), text })) }));
}

export default async request => {
  try {
    if (request.method !== "POST") return json({ error: "Método não permitido." }, 405);

    const user = await getUser();
    if (!user) return json({ error: "Sessão expirada. Entre novamente para gerar seus Reels." }, 401);

    const body = await request.json().catch(() => ({}));
    const idea = clean(body.idea), duration = Number(body.duration) || 30, style = clean(body.style) || "Viral / rápido", count = Math.min(Math.max(Number(body.count) || 1, 1), 10);
    if (!idea) return json({ error: "Digite um tema primeiro." }, 400);
    try {
      const items = await ai(idea, duration, style, count);
      if (items.length) return json({ items, mode: "openai", user: user.email || null });
    } catch (e) { console.error("AI failed, using local fallback", e); }
    return json({ items: localScripts(idea, duration, count), mode: "local-fallback", warning: "A IA não respondeu; o ReelsAI gerou os roteiros localmente para não interromper o trabalho.", user: user.email || null });
  } catch (e) { console.error("generate-public", e); return json({ error: e?.message || "Não foi possível gerar." }, 500); }
};
