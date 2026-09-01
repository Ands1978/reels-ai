function normalizeStyle(value) {
  const style = String(value || "viral").trim().toLowerCase();
  if (style.includes("educ")) return "educativo";
  if (style.includes("motiv")) return "motivacional";
  if (style.includes("story")) return "storytelling";
  return "viral";
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

const GENERIC = [
  ["5 pontos importantes sobre {tema}", "Vamos mostrar cinco pontos importantes sobre {tema} que podem ajudar você a entender melhor esse assunto."],
  ["Como começar com {tema}", "Se você está começando a aprender sobre {tema}, avance pelo básico e coloque pequenas ações em prática."],
  ["Dicas práticas sobre {tema}", "Transforme o conhecimento sobre {tema} em pequenas ações que você consegue testar no dia a dia."],
  ["O que ninguém explica sobre {tema}", "Existe uma parte de {tema} que muitas pessoas ignoram. Entender esse ponto pode mudar sua visão sobre o assunto."],
  ["Como usar {tema} na prática", "Conhecer {tema} é apenas o começo. O mais importante é descobrir como aplicar esse conhecimento em uma situação real."]
];

const HOOKS = {
  viral: ["Você está fazendo isso errado com {tema}.", "Pouca gente percebe este detalhe sobre {tema}.", "Quer entender {tema} em poucos segundos?", "Antes de ignorar {tema}, veja isso."],
  educativo: ["Vamos entender {tema} de forma simples.", "Aqui está o ponto mais importante sobre {tema}.", "Em poucos passos, você vai entender {tema}."],
  motivacional: ["Se você quer avançar em {tema}, comece hoje.", "Não espere estar pronto para começar com {tema}.", "Seu próximo passo com {tema} pode começar agora."],
  storytelling: ["Imagine uma história que começa com {tema}.", "Tudo começa com uma situação simples ligada a {tema}.", "Existe uma história que ajuda a entender {tema}."]
};

const CLOSE = {
  viral: "Salve este vídeo e compartilhe com alguém.",
  educativo: "Agora escolha um exemplo e pratique o conceito.",
  motivacional: "Escolha uma ação e faça acontecer hoje.",
  storytelling: "E essa é a lição: comece pelo próximo passo."
};

function fill(text, tema) { return String(text).replace(/\{tema\}/g, tema); }

function getTopicItems(tema) {
  const lower = tema.toLowerCase();
  if (/bíblic|biblic|versícul|versicul|salmo|oração|oracao|palavra de deus|deus|jesus/.test(lower)) return BIBLICAL;
  if (/ferramentas?|apps?|aplicativos?/.test(lower) && /ia|inteligência artificial|chatgpt/.test(lower)) return TOOLS;
  if (/ia|inteligência artificial|chatgpt|automação|automatizar/.test(lower)) return TOOLS;
  return null;
}

function createScript(idea, duration, variation = 0, style = "viral") {
  const tema = String(idea || "").trim();
  const mode = normalizeStyle(style);
  const items = getTopicItems(tema);
  const offset = Math.abs(Number(variation) || 0);
  const selected = items ? items[offset % items.length] : GENERIC[offset % GENERIC.length];
  const isBiblical = items === BIBLICAL;

  const title = items ? selected[0] : fill(selected[0], tema);
  const body = isBiblical ? selected[2] : (selected[1] || fill(selected[1], tema));
  const example = isBiblical ? selected[3] : (selected[2] || `Um exemplo prático é aplicar ${title.toLowerCase()} no seu dia a dia.`);
  const action = isBiblical ? "Compartilhe esta mensagem com alguém que precisa ouvir uma palavra de fé." : (selected[3] || "Escolha uma pequena ação e coloque esta ideia em prática hoje.");
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
