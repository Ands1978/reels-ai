const OpenAI = require("openai");

function normalizeStyle(value) {
  const style = String(value || "viral").trim().toLowerCase();
  if (style.includes("educ")) return "educativo";
  if (style.includes("motiv")) return "motivacional";
  if (style.includes("story")) return "storytelling";
  return "viral";
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractTopic(value) {
  let topic = cleanText(value);
  topic = topic
    .replace(/^\s*(?:crie|criar|gere|gerar|faça|faca|escreva|produza)\s+/i, "")
    .replace(/^\s*\d+\s+(?:frases?|hooks?|ideias?|roteiros?)\s+(?:fortes?|virais?|curtos?|sobre)\s*/i, "")
    .replace(/^\s*(?:frases?|hooks?|ideias?|roteiros?)\s+(?:sobre|de)\s+/i, "")
    .replace(/^\s*(?:fortes?|virais?|curtos?)\s+(?:sobre|de)\s+/i, "")
    .replace(/\s+(?:para|pra)\s+(?:um|uma)\s+reel\s*$/i, "")
    .trim();
  return topic || cleanText(value);
}

function uniqueParts(parts) {
  const seen = new Set();
  const result = [];
  for (const raw of parts) {
    const text = cleanText(raw);
    if (!text) continue;
    const key = text.toLowerCase().replace(/[^a-z0-9áàâãéêíóôõúç ]/gi, "").replace(/\s+/g, " ");
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(text);
  }
  return result;
}

function buildScenes(script, duration) {
  const requested = Array.isArray(script?.scenes) ? script.scenes : [];
  const fields = [script?.hook, script?.body, script?.example, script?.action, script?.close];
  const parts = uniqueParts(requested.length ? requested : fields).slice(0, 5);
  const fallbacks = [
    "Apresente o primeiro ponto concreto e específico do tema.",
    "Explique a segunda ideia com uma consequência ou contraste real.",
    "Mostre um exemplo diferente para tornar a ideia fácil de entender.",
    "Dê uma ação prática que a pessoa consiga aplicar hoje.",
    "Feche com uma conclusão curta que resuma a ideia sem repetir a abertura."
  ];
  for (const fallback of fallbacks) {
    if (parts.length >= 5) break;
    if (!parts.includes(fallback)) parts.push(fallback);
  }
  const step = duration / 5;
  return parts.map((text, index) => ({
    start: Number((index * step).toFixed(1)),
    end: Number(((index + 1) * step).toFixed(1)),
    text
  }));
}

function localScripts(idea, count) {
  const topic = extractTopic(idea);
  const angles = [
    ["O ponto central", `Em ${topic}, o primeiro ponto é separar o que realmente importa do que só parece importante.`, `Olhe para o problema por uma causa de cada vez, em vez de tentar resolver tudo simultaneamente.`, `Pegue uma situação real de ${topic} e identifique qual decisão muda o resultado.`, `Teste essa decisão isoladamente e observe o que acontece.`, `Quando você encontra a variável certa, o restante fica mais claro.`],
    ["A diferença", `A mesma estratégia em ${topic} pode funcionar em um cenário e falhar em outro.`, `A diferença está nas condições: objetivo, momento, contexto ou execução.`, `Compare dois casos de ${topic} mudando apenas uma dessas condições.`, `Descubra qual condição está presente no seu caso antes de agir.`, `Contexto não é detalhe; ele faz parte da resposta.`],
    ["O erro", `Um erro comum em ${topic} é começar pela solução antes de entender o problema.`, `Quando a causa não está clara, qualquer conselho vira tentativa e erro.`, `Escolha um exemplo concreto e descreva primeiro a causa, depois a consequência.`, `Só então selecione a ação mais adequada para esse caso.`, `Entender o problema evita repetir a mesma tentativa.`],
    ["Na prática", `Transforme ${topic} em uma situação que poderia acontecer hoje.`, `Imagine uma decisão real, com duas alternativas e uma consequência para cada escolha.`, `Mostre o que muda entre a primeira e a segunda alternativa.`, `Use o mesmo critério para analisar uma situação parecida.`, `Um exemplo concreto vale mais do que uma explicação abstrata.`],
    ["A pergunta certa", `Antes de decidir sobre ${topic}, faça uma pergunta diferente: o que precisa ser verdade para isso funcionar?`, `Essa pergunta revela as condições que normalmente ficam escondidas.`, `Aplique-a a um caso real e liste duas condições verificáveis.`, `Confira essas condições antes de executar a próxima ação.`, `Perguntas melhores levam a decisões mais precisas.`],
    ["Teste pequeno", `Você não precisa resolver ${topic} inteiro para começar a aprender.`, `Um teste pequeno pode mostrar qual caminho merece ser aprofundado.`, `Escolha uma mudança que possa ser observada e compare antes e depois.`, `Registre o resultado antes de fazer outra mudança.`, `Evidência pequena também é informação útil.`],
    ["Mito", `Uma afirmação comum sobre ${topic} só é útil quando você sabe em quais situações ela funciona.`, `Uma regra pode ser verdadeira em um contexto e inadequada em outro.`, `Procure um caso em que o contexto seja diferente e compare o resultado.`, `Não trate uma regra como universal sem verificar as condições.`, `A exceção também ensina como a regra funciona.`],
    ["Explicação simples", `Explique ${topic} usando causa e efeito, sem palavras complicadas.`, `Mostre o que acontece primeiro, qual escolha vem depois e qual consequência aparece.`, `Use uma situação cotidiana para representar essa sequência.`, `Se alguma etapa ficar confusa, volte e simplifique o mecanismo.`, `Clareza aumenta quando cada etapa tem uma função.`],
    ["Próximo passo", `O melhor próximo passo em ${topic} é aquele que produz informação nova.`, `Em vez de mudar tudo, escolha uma única ação que possa ser avaliada.`, `Faça esse teste e anote exatamente o que mudou.`, `Use o resultado para decidir o segundo passo.`, `Progresso fica mais fácil quando cada ação ensina alguma coisa.`],
    ["Outro ângulo", `Talvez ${topic} esteja sendo analisado pela pergunta errada.`, `Em vez de olhar só para o resultado, observe o processo que produz esse resultado.`, `Mapeie uma situação do início ao fim e encontre a etapa de maior impacto.`, `Mude primeiro essa etapa e compare o efeito.`, `Às vezes a solução aparece quando a pergunta muda.`]
  ];
  return Array.from({ length: count }, (_, i) => {
    const a = angles[i % angles.length];
    return {
      titulo: `${a[0]}: ${topic}`,
      hook: a[1],
      body: a[2],
      example: a[3],
      action: a[4],
      close: a[5],
      scenes: a.slice(1)
    };
  });
}

function extractJson(text) {
  let value = String(text || "").trim();
  value = value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try { return JSON.parse(value); } catch (_) {}
  const match = value.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  throw new Error("A IA retornou uma resposta em formato inválido.");
}

function generationInstructions({ idea, duration, style, count }) {
  const topic = extractTopic(idea);
  return `Você é o roteirista principal do ReelsAI. Tema real: "${topic}". Estilo: ${style}. Duração aproximada: ${duration}s. Gere ${count} roteiro(s).\n\nSe o pedido original tiver palavras como "crie X frases", trate essas palavras como instrução e NÃO como parte do tema. O tema é somente o assunto depois de "sobre" ou "de".\n\nCada Reel precisa responder ao tema com conteúdo concreto. PROIBIDO repetir frases, argumentos, exemplos ou conclusões entre cenas ou entre Reels. Não faça paráfrases da mesma frase.\n\nIMPORTANTE PARA AS 5 CENAS: cada Reel deve ter exatamente 5 cenas e cada cena deve trazer uma frase/trecho NOVO. A cena 1 abre a ideia; a 2 acrescenta informação; a 3 traz exemplo ou consequência; a 4 dá aplicação prática; a 5 fecha sem repetir a abertura. Não coloque o nome completo do tema em todas as frases.\n\nSe o usuário pediu frases, gere frases específicas sobre o tema. Evite enchimentos genéricos como "pouca gente fala disso", "comece por aqui", "isso pode mudar tudo", "salve este post" e "compartilhe com alguém".\n\nPortuguês brasileiro natural, direto e específico. Não invente fatos. Para Bíblia, use referências reais; para saúde, direito e finanças, seja responsável. Retorne somente JSON neste formato: {"reels":[{"titulo":"...","scenes":["cena 1","cena 2","cena 3","cena 4","cena 5"]}]}.`;
}

function hasGateway(name, baseName) {
  return Boolean(process.env[name] || process.env[baseName]);
}

async function callClaude({ idea, duration, style, count }) {
  const baseURL = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não disponível.");
  const response = await fetch(`${baseURL.replace(/\/$/, "")}/v1/messages`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: 6000,
      system: generationInstructions({ idea, duration, style, count }),
      messages: [{ role: "user", content: `Responda ao tema: ${extractTopic(idea)}` }]
    })
  });
  if (!response.ok) throw new Error(`Claude API ${response.status}: ${await response.text()}`);
  const data = await response.json();
  const text = (data.content || []).map(x => x.text || "").join("\n");
  return { parsed: extractJson(text), mode: "claude" };
}

async function callPerplexity({ idea, duration, style, count }) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("PERPLEXITY_API_KEY não disponível.");
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.PERPLEXITY_MODEL || "sonar",
      messages: [
        { role: "system", content: generationInstructions({ idea, duration, style, count }) },
        { role: "user", content: `Responda ao tema: ${extractTopic(idea)}` }
      ],
      temperature: 0.9
    })
  });
  if (!response.ok) throw new Error(`Perplexity API ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return { parsed: extractJson(data.choices?.[0]?.message?.content || ""), mode: "perplexity" };
}

async function callOpenAI({ idea, duration, style, count }) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY não disponível.");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL || undefined });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1",
    instructions: generationInstructions({ idea, duration, style, count }),
    input: cleanText(idea),
    text: { format: { type: "json_schema", name: "reels_generation", strict: true, schema: {
      type: "object", additionalProperties: false,
      properties: { reels: { type: "array", minItems: 1, maxItems: 10, items: {
        type: "object", additionalProperties: false,
        properties: { titulo: { type: "string" }, scenes: { type: "array", minItems: 5, maxItems: 5, items: { type: "string" } } },
        required: ["titulo", "scenes"]
      } } }, required: ["reels"]
    } } }
  });
  return { parsed: extractJson(response.output_text || ""), mode: "openai" };
}

function normalizeItem(item, duration) {
  const scenes = buildScenes(item || {}, duration);
  return {
    titulo: cleanText(item?.titulo) || "Reel sem título",
    hook: scenes[0]?.text || "",
    body: scenes[1]?.text || "",
    example: scenes[2]?.text || "",
    action: scenes[3]?.text || "",
    close: scenes[4]?.text || "",
    scenes
  };
}

async function generateWithAI({ idea, duration, style, count }) {
  const provider = String(process.env.AI_PROVIDER || "claude").toLowerCase();
  const attempts = [];
  if (provider === "claude") attempts.push(["claude", callClaude]);
  if (provider === "perplexity") attempts.push(["perplexity", callPerplexity]);
  if (provider === "openai") attempts.push(["openai", callOpenAI]);
  if (provider === "auto" || !["claude", "perplexity", "openai"].includes(provider)) {
    attempts.push(["claude", callClaude], ["openai", callOpenAI], ["perplexity", callPerplexity]);
  } else {
    if (provider === "claude") attempts.push(["openai", callOpenAI], ["perplexity", callPerplexity]);
    if (provider === "perplexity") attempts.push(["claude", callClaude], ["openai", callOpenAI]);
    if (provider === "openai") attempts.push(["claude", callClaude], ["perplexity", callPerplexity]);
  }

  const errors = [];
  for (const [name, fn] of attempts) {
    try {
      if (name === "claude" && !hasGateway("ANTHROPIC_API_KEY", "ANTHROPIC_BASE_URL")) continue;
      if (name === "openai" && !hasGateway("OPENAI_API_KEY", "OPENAI_BASE_URL")) continue;
      if (name === "perplexity" && !process.env.PERPLEXITY_API_KEY) continue;
      const result = await fn({ idea, duration, style, count });
      if (!result.parsed?.reels?.length) throw new Error(`${name} não retornou roteiros.`);
      const items = result.parsed.reels.slice(0, count).map(item => normalizeItem(item, duration));
      if (!items.length) throw new Error(`${name} retornou lista vazia.`);
      return { items, mode: result.mode };
    } catch (error) {
      console.error(`${name} generation failed:`, error);
      errors.push(`${name}: ${error?.message || "erro desconhecido"}`);
    }
  }

  if (process.env.ALLOW_LOCAL_FALLBACK === "true") {
    return { items: localScripts(idea, count).map(item => normalizeItem(item, duration)), mode: "local-fallback", warning: errors.join(" | ") || "Nenhum provedor de IA disponível." };
  }
  throw new Error(errors.join(" | ") || "Nenhum provedor de IA disponível. Ative o Netlify AI Gateway ou configure um provedor de IA.");
}

exports.handler = async function(event) {
  const headers = { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" };
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Método não permitido." }) };
    let data;
    try { data = JSON.parse(event.body || "{}"); } catch (_) { return { statusCode: 400, headers, body: JSON.stringify({ error: "JSON inválido." }) }; }
    const idea = cleanText(data.idea || data.topic || "");
    if (!idea) return { statusCode: 400, headers, body: JSON.stringify({ error: "Informe um tema para o Reel." }) };
    const count = Math.max(1, Math.min(10, Number(data.count) || 1));
    const duration = Math.max(15, Math.min(120, Number(data.duration) || 30));
    const style = normalizeStyle(data.style);
    const result = await generateWithAI({ idea, duration, style, count });
    return { statusCode: 200, headers, body: JSON.stringify({ items: result.items, mode: result.mode, warning: result.warning || null, topic: extractTopic(idea) }) };
  } catch (error) {
    console.error("generate error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error?.message || "Não foi possível gerar os roteiros." }) };
  }
};
