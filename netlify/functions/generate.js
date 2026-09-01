function normalizeStyle(value) {
  const style = String(value || "viral").trim().toLowerCase();
  if (style.includes("educ")) return "educativo";
  if (style.includes("motiv")) return "motivacional";
  if (style.includes("story")) return "storytelling";
  return "viral";
}

function cleanIdea(value) {
  let text = String(value || "").trim();
  text = text.replace(/^[\s,.:;-]*(?:crie|criar|cria|gere|gerar|gera|faça|faca|fazer|monte|montar|produza|produzir)\s+(?:pra|para)?\s*(?:mim)?\s*/i, "");
  text = text.replace(/^(?:um|uma)\s+(?:reel|vídeo|video)\s+(?:sobre|de)\s+/i, "");
  text = text.replace(/^(?:reel|vídeo|video)\s+(?:sobre|de)\s+/i, "");
  text = text.replace(/^(?:sobre|de)\s+/i, "");
  text = text.replace(/\s+(?:para|pra)\s+(?:mim|você|voce)\s*$/i, "");
  return text.replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "");
}

const BIBLICAL = [
  ["Salmo 23:1 — O Senhor é o meu pastor", "O Senhor é o meu pastor; nada me faltará.", "Mesmo em tempos difíceis, Deus continua cuidando de você.", "Compartilhe esta palavra com alguém que precisa de esperança."],
  ["Isaías 41:10 — Não tenha medo", "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus.", "Você não precisa enfrentar seus desafios sozinho.", "Respire fundo, ore e dê hoje o próximo passo com fé."],
  ["Filipenses 4:13 — Força para continuar", "Posso todas as coisas naquele que me fortalece.", "Sua força não depende apenas das circunstâncias ao seu redor.", "Enfrente uma dificuldade de hoje lembrando desta promessa."],
  ["Josué 1:9 — Seja forte e corajoso", "Sê forte e corajoso; não temas, nem te espantes.", "Coragem também é continuar quando o caminho parece difícil.", "Escolha uma atitude corajosa e faça isso hoje."],
  ["Provérbios 3:5 — Confie no Senhor", "Confia no Senhor de todo o teu coração.", "Nem sempre você terá todas as respostas, mas pode escolher confiar.", "Entregue uma preocupação a Deus e siga com fé."],
  ["Salmo 46:1 — Deus é refúgio", "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.", "Nos momentos de pressão, você pode buscar força e segurança em Deus.", "Faça uma pausa, ore e entregue a Deus aquilo que está pesando no coração."],
  ["Salmo 37:5 — Entregue o seu caminho", "Entrega o teu caminho ao Senhor; confia nele, e ele o fará.", "Confiar também significa colocar seus planos nas mãos de Deus.", "Escolha um plano importante e apresente-o a Deus em oração."],
  ["Romanos 8:28 — Deus pode transformar tudo", "Todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.", "Uma fase difícil não precisa ser o capítulo final da sua história.", "Procure uma lição no desafio que você está vivendo hoje."],
  ["Salmo 121:1-2 — De onde vem o socorro?", "Elevo os meus olhos para os montes: de onde me vem o socorro? O meu socorro vem do Senhor.", "Quando faltar direção, lembre-se de onde vem seu socorro.", "Comece o dia com uma oração pedindo direção e força."],
  ["Jeremias 29:11 — Há esperança", "Eu bem sei os pensamentos que penso de vós, pensamentos de paz e não de mal.", "Sua história pode ter esperança mesmo quando você ainda não consegue enxergar o próximo capítulo.", "Não desista hoje; continue construindo seu próximo passo com fé."]
];

const TOOLS = [
  ["ChatGPT: transformar conhecimento em serviço", "Use o ChatGPT para pesquisar, estruturar textos e criar roteiros para entregar resultados a clientes.", "Criar um calendário de conteúdo para uma pequena empresa.", "Monte uma primeira entrega e use-a como portfólio."],
  ["Canva: criar conteúdo visual", "O Canva pode acelerar posts, apresentações e materiais visuais.", "Criar um pacote de dez posts para uma empresa.", "Crie três peças e apresente uma proposta."],
  ["CapCut: editar vídeos", "Use o CapCut para transformar gravações simples em vídeos curtos para redes sociais.", "Editar vídeos de um comércio local.", "Crie uma edição de demonstração para seu portfólio."],
  ["Make: automatizar processos", "O Make pode conectar ferramentas e reduzir tarefas repetitivas.", "Automatizar dados entre formulário e planilha.", "Desenhe um primeiro fluxo de automação."],
  ["Perplexity: acelerar pesquisas", "Ferramentas de pesquisa com IA podem ajudar a organizar informações para decisões.", "Pesquisar concorrentes e tendências de um mercado.", "Monte uma pesquisa curta com fontes e use-a como portfólio."]
];

const PROFESSIONAL = [
  ["Como começar com {tema}", "Se você quer entender {tema}, comece pelo princípio mais importante e transforme a informação em uma ação concreta.", "Na prática, escolha uma situação real em que {tema} faça diferença e aplique uma única melhoria.", "Teste essa melhoria hoje e observe o resultado."],
  ["{tema}: 3 pontos que realmente importam", "Para falar de {tema} com clareza, concentre-se no problema, na solução e no resultado que você busca.", "Por exemplo, pegue uma situação comum ligada a {tema} e compare o antes e o depois de uma mudança simples.", "Anote o que funcionou e ajuste o próximo passo."],
  ["Erros comuns em {tema}", "Um erro frequente em {tema} é tentar fazer tudo de uma vez, sem definir o objetivo principal.", "Em vez disso, escolha uma meta específica relacionada a {tema} e elimine uma etapa desnecessária.", "Faça esse ajuste hoje e veja se o processo fica mais simples."],
  ["{tema} na prática", "Conhecer {tema} é apenas o começo. O valor aparece quando você consegue aplicar o conceito em uma situação real.", "Imagine que você precise resolver um problema relacionado a {tema}: primeiro identifique a causa, depois escolha uma solução simples e mensure o resultado.", "Escolha um caso real e coloque esse processo em prática."],
  ["O que você precisa saber sobre {tema}", "Antes de buscar soluções complexas para {tema}, entenda o objetivo, as principais dificuldades e o resultado esperado.", "Um bom exemplo é dividir {tema} em uma pequena tarefa que possa ser executada, medida e melhorada.", "Comece pela menor ação capaz de gerar um resultado claro."]
];

const HOOKS = {
  viral: ["Se você quer melhorar em {tema}, preste atenção nisso.", "Existe um jeito mais simples de entender {tema}.", "Se eu tivesse que começar hoje com {tema}, faria isso.", "Antes de fazer qualquer coisa sobre {tema}, veja este ponto."],
  educativo: ["Vamos entender {tema} de forma simples e prática.", "Aqui estão os pontos essenciais para entender {tema}.", "Em poucos segundos, você vai entender como aplicar {tema}."],
  motivacional: ["Se você quer avançar em {tema}, comece pelo próximo passo.", "Você não precisa saber tudo para começar com {tema}.", "Seu progresso em {tema} começa com uma decisão simples."],
  storytelling: ["Tudo começou com um problema simples relacionado a {tema}.", "Imagine descobrir uma forma diferente de lidar com {tema}.", "Uma pequena mudança em {tema} pode mudar o resultado final."]
};

const CLOSE = {
  viral: "Salve este vídeo e teste essa ideia hoje.",
  educativo: "Agora aplique este conceito em uma situação real.",
  motivacional: "Escolha um pequeno passo e faça acontecer hoje.",
  storytelling: "A lição é simples: comece pelo próximo passo."
};

function fill(text, tema) { return String(text).replace(/\{tema\}/g, tema); }

function getTopicItems(tema) {
  const lower = tema.toLowerCase();
  if (/bíblic|biblic|versícul|versicul|salmo|oração|oracao|palavra de deus|deus|jesus/.test(lower)) return BIBLICAL;
  if (/ferramentas?|apps?|aplicativos?/.test(lower) && /ia|inteligência artificial|chatgpt/.test(lower)) return TOOLS;
  if (/ia|inteligência artificial|chatgpt|automação|automatizar/.test(lower)) return TOOLS;
  return PROFESSIONAL;
}

function createScript(idea, duration, variation = 0, style = "viral") {
  const rawTema = String(idea || "").trim();
  const tema = cleanIdea(rawTema) || rawTema;
  const mode = normalizeStyle(style);
  const items = getTopicItems(tema);
  const offset = Math.abs(Number(variation) || 0);
  const selected = items[offset % items.length];
  const isBiblical = items === BIBLICAL;
  const title = isBiblical ? selected[0] : fill(selected[0], tema);
  const body = isBiblical ? selected[2] : fill(selected[1], tema);
  const example = isBiblical ? selected[3] : fill(selected[2], tema);
  const action = isBiblical ? "Compartilhe esta mensagem com alguém que precisa ouvir uma palavra de fé." : fill(selected[3], tema);
  const hook = isBiblical ? selected[1] : fill(HOOKS[mode][offset % HOOKS[mode].length], tema);
  const texts = isBiblical ? [hook, body, example, action] : [hook, body, example, action, CLOSE[mode]];
  const step = duration / texts.length;
  return {
    titulo: title,
    hook,
    duration,
    tema,
    style: mode,
    scenes: texts.map((text, index) => ({
      start: Number((index * step).toFixed(1)),
      end: Number(((index + 1) * step).toFixed(1)),
      text
    }))
  };
}

exports.handler = async function(event) {
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "Método não permitido." }) };
    let data;
    try { data = JSON.parse(event.body || "{}"); } catch (error) { return { statusCode: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "JSON inválido." }) }; }
    const idea = String(data.idea || data.ideia || "").trim();
    const durationValue = Number(data.duration || data.duracao || 30);
    const duration = [30, 45, 60].includes(durationValue) ? durationValue : 30;
    const countValue = Number(data.count || 1);
    const count = Math.max(1, Math.min(10, Number.isFinite(countValue) ? Math.floor(countValue) : 1));
    const variation = Number(data.variation || 0);
    const style = normalizeStyle(data.style || data.estilo);
    if (!idea) return { statusCode: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "Informe o tema do Reel." }) };
    const items = [];
    for (let i = 0; i < count; i += 1) items.push(createScript(idea, duration, variation + i, style));
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ id: require("crypto").randomUUID(), idea, style, duration, count: items.length, items }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: error.message || "Erro ao gerar os Reels." }) };
  }
};
