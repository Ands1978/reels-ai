function normalizeStyle(value) {
  const style = String(value || "viral").trim().toLowerCase();
  if (style.includes("educ")) return "educativo";
  if (style.includes("motiv")) return "motivacional";
  if (style.includes("story")) return "storytelling";
  return "viral";
}

// Limpa comandos do usuário para que o texto final use apenas o assunto real.
function cleanTopic(value) {
  return String(value || "")
    .trim()
    .replace(/^(cria|crie|gera|gere|faça|faca|faz|monta|monte)\s+(pra mim|para mim|um|uma|o|a)?\s*/i, "")
    .replace(/\s+(motivacional|educativo|educacional|viral|storytelling)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

const BIBLICAL = [
  ["Salmo 23:1 — O Senhor é o meu pastor", "O Senhor é o meu pastor; nada me faltará.", "Mensagem: mesmo em tempos difíceis, Deus continua cuidando de você.", "Compartilhe esta palavra com alguém que precisa de esperança."],
  ["Isaías 41:10 — Não tenha medo", "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus.", "Mensagem: você não precisa enfrentar seus desafios sozinho.", "Respire fundo, ore e dê hoje o próximo passo com fé."],
  ["Filipenses 4:13 — Força para continuar", "Posso todas as coisas naquele que me fortalece.", "Mensagem: sua força não depende apenas das circunstâncias ao seu redor.", "Enfrente uma dificuldade de hoje lembrando desta promessa."],
  ["Josué 1:9 — Seja forte e corajoso", "Sê forte e corajoso; não temas, nem te espantes.", "Mensagem: coragem também é continuar quando o caminho parece difícil.", "Escolha uma atitude corajosa e faça isso hoje."],
  ["Provérbios 3:5 — Confie no Senhor", "Confia no Senhor de todo o teu coração.", "Mensagem: nem sempre você terá todas as respostas, mas pode escolher confiar.", "Entregue uma preocupação a Deus e siga com fé."],
  ["Salmo 46:1 — Deus é refúgio", "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.", "Mensagem: nos momentos de pressão, você pode buscar força e segurança em Deus.", "Faça uma pausa, ore e entregue a Deus aquilo que está pesando no coração."],
  ["Salmo 37:5 — Entregue o seu caminho", "Entrega o teu caminho ao Senhor; confia nele, e ele o fará.", "Mensagem: confiar também significa colocar seus planos nas mãos de Deus.", "Escolha um plano importante e apresente-o a Deus em oração."],
  ["Romanos 8:28 — Deus pode transformar tudo", "Todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.", "Mensagem: uma fase difícil não precisa ser o capítulo final da sua história.", "Procure uma lição no desafio que você está vivendo hoje."],
  ["Salmo 121:1-2 — De onde vem o socorro?", "Elevo os meus olhos para os montes: de onde me vem o socorro? O meu socorro vem do Senhor.", "Mensagem: quando faltar direção, lembre-se de onde vem seu socorro.", "Comece o dia com uma oração pedindo direção e força."],
  ["Jeremias 29:11 — Há esperança", "Eu bem sei os pensamentos que penso de vós, pensamentos de paz e não de mal.", "Mensagem: sua história pode ter esperança mesmo quando você ainda não consegue enxergar o próximo capítulo.", "Não desista hoje; continue construindo seu próximo passo com fé."]
];

const TOOLS = [
  ["ChatGPT: transformar conhecimento em serviço", "Use o ChatGPT para pesquisar, estruturar textos e criar roteiros para entregar resultados a clientes.", "Exemplo: criar um calendário de conteúdo para uma pequena empresa.", "Monte uma primeira entrega e use-a como portfólio."],
  ["Canva: criar conteúdo visual", "O Canva pode acelerar posts, apresentações e materiais visuais.", "Exemplo: um pacote de dez posts para uma empresa.", "Crie três peças e apresente uma proposta."],
  ["CapCut: editar vídeos", "Use o CapCut para transformar gravações simples em vídeos curtos para redes sociais.", "Exemplo: editar vídeos de um comércio local.", "Crie uma edição de demonstração para seu portfólio."],
  ["Make: automatizar processos", "O Make pode conectar ferramentas e reduzir tarefas repetitivas.", "Exemplo: automatizar dados entre formulário e planilha.", "Desenhe um primeiro fluxo de automação."],
  ["Perplexity: acelerar pesquisas", "Ferramentas de pesquisa com IA podem ajudar a organizar informações para decisões.", "Exemplo: pesquisar concorrentes e tendências de um mercado.", "Monte uma pesquisa curta com fontes e use-a como portfólio."]
];

// Fallback profissional: funciona mesmo quando o assunto não pertence a um banco específico.
const PROFESSIONAL = [
  ["Entenda o essencial sobre {tema}", "Para falar sobre {tema} com clareza, comece pelo conceito central, explique por que ele importa e mostre como pode ser aplicado na prática."],
  ["Como começar com {tema}", "Quem está começando em {tema} não precisa aprender tudo de uma vez. O melhor caminho é entender o básico, escolher uma prioridade e avançar por etapas."],
  ["3 pontos essenciais sobre {tema}", "Existem três pontos que ajudam a organizar qualquer conteúdo sobre {tema}: contexto, aplicação e próximo passo. Essa estrutura torna a informação mais clara e útil."],
  ["Erros que você deve evitar em {tema}", "Em {tema}, um erro comum é tentar fazer tudo ao mesmo tempo. Uma abordagem mais profissional é definir o objetivo, selecionar o que realmente importa e executar com consistência."],
  ["Guia rápido de {tema}", "Uma forma prática de abordar {tema} é começar pelo objetivo, separar a informação em etapas e transformar cada etapa em uma ação concreta."],
  ["Como aplicar {tema} na prática", "Conhecimento só gera valor quando pode ser aplicado. Em {tema}, escolha uma situação real, teste uma abordagem simples e observe o resultado."],
  ["O que realmente importa em {tema}", "Nem toda informação sobre {tema} tem o mesmo peso. Priorize o que ajuda a entender o assunto, tomar uma decisão ou resolver um problema real."],
  ["Passo a passo para entender {tema}", "Divida {tema} em partes menores: primeiro o objetivo, depois os pontos principais e, por fim, a aplicação. Assim o assunto fica mais fácil de compreender."],
  ["Como melhorar seus resultados com {tema}", "Para evoluir em {tema}, compare o que está sendo feito hoje com o resultado desejado, identifique um ponto de melhoria e teste uma mudança por vez."],
  ["Por onde começar em {tema}?", "Comece definindo exatamente o que você quer aprender ou resolver em {tema}. Depois escolha uma primeira ação simples e mensurável."]
];

const HOOKS = {
  viral: ["Pare por alguns segundos: isso pode mudar sua visão sobre {tema}.", "Se {tema} faz parte da sua rotina, preste atenção nisso.", "Existe uma forma mais inteligente de entender {tema}.", "Antes de tomar uma decisão sobre {tema}, veja este ponto.", "Você pode estar complicando {tema} sem necessidade."],
  educativo: ["Vamos entender {tema} de forma simples e profissional.", "Aqui está o ponto central para entender {tema}.", "Em poucos segundos, você vai organizar as ideias sobre {tema}.", "Comece por este conceito se você quer entender {tema}.", "Veja como transformar {tema} em algo fácil de aplicar."],
  motivacional: ["Se {tema} é importante para você, comece pelo próximo passo.", "Você não precisa saber tudo sobre {tema} para começar.", "Seu progresso em {tema} começa com uma decisão simples.", "Não espere o momento perfeito para avançar em {tema}.", "Hoje você pode dar um passo concreto em direção a {tema}."],
  storytelling: ["Tudo começou com uma situação simples envolvendo {tema}.", "Imagine precisar resolver um problema relacionado a {tema}.", "Existe uma situação comum que explica muito sobre {tema}.", "Uma pequena decisão pode mudar a forma como você encara {tema}.", "Vamos começar esta história por um problema ligado a {tema}."]
};

const CLOSE = {
  viral: "Salve este vídeo e compartilhe com quem precisa saber disso.",
  educativo: "Agora aplique este conceito em uma situação real.",
  motivacional: "Escolha um próximo passo e coloque a ideia em prática hoje.",
  storytelling: "Essa é a lição: transforme o próximo passo em ação."
};

function fill(text, tema) { return String(text).replace(/\{tema\}/g, tema); }

function getTopicItems(topic) {
  const lower = topic.toLowerCase();
  if (/bíblic|biblic|versícul|versicul|salmo|oração|oracao|palavra de deus|deus|jesus/.test(lower)) return BIBLICAL;
  if (/ferramentas?|apps?|aplicativos?/.test(lower) && /ia|inteligência artificial|chatgpt/.test(lower)) return TOOLS;
  if (/ia|inteligência artificial|chatgpt|automação|automatizar/.test(lower)) return TOOLS;
  return null;
}

function createScript(idea, duration, variation = 0, style = "viral") {
  const rawTopic = String(idea || "").trim();
  const tema = cleanTopic(rawTopic) || rawTopic;
  const mode = normalizeStyle(style);
  const items = getTopicItems(tema);
  const offset = Math.abs(Number(variation) || 0);
  const selected = items ? items[offset % items.length] : PROFESSIONAL[offset % PROFESSIONAL.length];
  const isBiblical = items === BIBLICAL;

  if (isBiblical) {
    const verse = selected[1];
    const message = selected[2];
    const action = selected[3];
    const texts = [verse, message, action, "Se esta palavra falou ao seu coração, compartilhe com alguém."];
    const step = duration / texts.length;
    return {
      titulo: selected[0],
      hook: verse,
      duration,
      tema,
      style: mode,
      scenes: texts.map((text, index) => ({ start: Number((index * step).toFixed(1)), end: Number(((index + 1) * step).toFixed(1)), text }))
    };
  }

  const title = items ? selected[0] : fill(selected[0], tema);
  const body = items ? selected[1] : fill(selected[1], tema);
  const example = items && selected[2] ? selected[2] : `Exemplo prático: escolha uma situação real relacionada a ${tema} e mostre como essa ideia pode ajudar a resolver o problema.`;
  const action = items && selected[3] ? selected[3] : `Próximo passo: defina um objetivo claro para ${tema} e coloque uma pequena ação em prática hoje.`;
  const hook = fill(HOOKS[mode][offset % HOOKS[mode].length], tema);
  const texts = [hook, body, example, action, CLOSE[mode]];
  const step = duration / texts.length;

  return {
    titulo: title,
    hook,
    duration,
    tema,
    style: mode,
    scenes: texts.map((text, index) => ({ start: Number((index * step).toFixed(1)), end: Number(((index + 1) * step).toFixed(1)), text }))
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
