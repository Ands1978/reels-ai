function normalizeStyle(value) {
  const style = String(value || "viral").trim().toLowerCase();
  if (style.includes("educ")) return "educativo";
  if (style.includes("motiv")) return "motivacional";
  if (style.includes("story")) return "storytelling";
  return "viral";
}

const TOPIC_BANKS = {
  dinheiroIA: [
    ["Criar conteúdo para empresas", "Pequenos negócios precisam de posts, vídeos e legendas todos os dias. Você pode usar inteligência artificial para produzir esse conteúdo e vender o serviço para empresas."],
    ["Automatizar tarefas", "Muitas empresas perdem horas com tarefas repetitivas. Você pode criar pequenas automações com inteligência artificial e cobrar pela solução."],
    ["Criar produtos digitais", "Ebooks, checklists, modelos e materiais educativos podem ser criados com ajuda da inteligência artificial e vendidos pela internet."],
    ["Prestar serviços com IA", "Você não precisa criar uma inteligência artificial. Pode usar ferramentas que já existem para oferecer edição, pesquisa, atendimento ou produção de conteúdo como serviço."],
    ["Criar soluções para nichos", "Escolha um mercado específico e descubra um problema que ele enfrenta. Depois use inteligência artificial para criar uma solução simples e cobrar por ela."],
    ["Criar vídeos com IA", "Você pode usar inteligência artificial para criar vídeos curtos para empresas, produtos e redes sociais e transformar isso em um serviço."],
    ["Criar posts para redes sociais", "Empresas precisam publicar constantemente. Você pode usar inteligência artificial para criar calendários, posts e legendas e cobrar por esse trabalho."],
    ["Criar anúncios com IA", "A inteligência artificial pode ajudar a criar ideias de anúncios, textos e variações para campanhas de empresas que querem vender mais."],
    ["Criar conteúdo para profissionais", "Dentistas, advogados, corretores e outros profissionais precisam de conteúdo. Você pode usar inteligência artificial para produzir materiais para eles."],
    ["Criar um negócio com automação", "Pequenas automações podem economizar horas de trabalho. Você pode encontrar tarefas repetitivas e transformar a solução em um serviço."]
  ],
  marketing: [
    ["Comece pelo problema", "Antes de criar uma campanha, descubra qual problema o cliente realmente quer resolver. Uma mensagem específica costuma chamar mais atenção do que uma mensagem genérica."],
    ["Mostre transformação", "Em vez de falar apenas sobre seu produto, mostre o resultado que ele pode gerar. As pessoas entendem melhor uma oferta quando conseguem visualizar a transformação."],
    ["Teste diferentes ganchos", "Não dependa de uma única abertura. Teste perguntas, afirmações, histórias e números para descobrir qual formato prende mais atenção."],
    ["Fale com um público específico", "Quanto mais claro for o público, mais fácil fica criar uma mensagem que pareça feita especialmente para aquela pessoa."],
    ["Analise o que funcionou", "Depois de publicar, observe retenção, cliques e respostas. Use esses dados para melhorar o próximo conteúdo em vez de publicar no automático."]
  ],
  produtividade: [
    ["Escolha uma prioridade", "Em vez de começar o dia com uma lista enorme, escolha a tarefa que realmente precisa avançar. Isso reduz a sensação de estar ocupado sem produzir."],
    ["Elimine tarefas repetitivas", "Sempre que você fizer a mesma tarefa várias vezes, pergunte se ela pode ser simplificada, automatizada ou transformada em um modelo."],
    ["Trabalhe em blocos", "Agrupe tarefas parecidas e faça cada grupo de uma vez. Trocar constantemente de atividade consome mais energia e atenção."],
    ["Crie processos simples", "Se uma tarefa acontece toda semana, transforme o processo em um passo a passo. Assim você não precisa reinventar a solução toda vez."],
    ["Revise seus resultados", "No final do dia, veja o que realmente avançou. Essa pequena revisão ajuda a descobrir onde seu tempo está sendo desperdiçado."]
  ],
  vendas: [
    ["Descubra a necessidade", "Uma venda começa antes da apresentação do produto. Primeiro descubra o que o cliente precisa e qual problema ele quer resolver."],
    ["Explique o benefício", "Não fale somente das características. Explique como aquela característica melhora a situação do cliente."],
    ["Use exemplos", "Um exemplo concreto pode ser muito mais convincente do que uma explicação abstrata. Mostre como a solução funciona na prática."],
    ["Reduza a dúvida", "Quanto mais simples for entender o que você oferece, para quem serve e qual resultado esperar, mais fácil fica tomar uma decisão."],
    ["Faça acompanhamento", "Muitas oportunidades desaparecem porque ninguém acompanha o cliente depois do primeiro contato. Um bom acompanhamento pode recuperar vendas."]
  ]
};

const STYLE_TEMPLATES = {
  viral: {
    hooks: ["Você está fazendo isso errado com {tema}.", "Pouca gente percebe este detalhe sobre {tema}.", "Quer entender {tema} em poucos segundos?", "Antes de ignorar {tema}, veja isso.", "Isso pode mudar sua forma de pensar sobre {tema}."],
    close: "Salve este vídeo e teste a ideia hoje."
  },
  educativo: {
    hooks: ["Vamos entender {tema} de forma simples.", "Se você está começando em {tema}, comece por aqui.", "Aqui está o conceito mais importante sobre {tema}.", "Em poucos passos, você vai entender {tema}.", "Antes de avançar em {tema}, entenda este ponto."],
    close: "Agora escolha um exemplo e pratique o conceito."
  },
  motivacional: {
    hooks: ["Se você quer avançar em {tema}, comece pequeno.", "Não espere estar pronto para começar com {tema}.", "Você não precisa dominar {tema} para dar o primeiro passo.", "O seu próximo resultado com {tema} pode começar hoje.", "Pare de adiar {tema}: faça uma coisa agora."],
    close: "Escolha uma ação e faça acontecer hoje."
  },
  storytelling: {
    hooks: ["Imagine descobrir {tema} começando por uma situação comum.", "Tudo começa com um problema simples relacionado a {tema}.", "Imagine que você precisa resolver algo usando {tema}.", "Foi assim que uma ideia simples sobre {tema} começou a fazer sentido.", "Existe uma história simples que ajuda a entender {tema}."],
    close: "E essa é a lição: comece pelo próximo passo."
  }
};

function fill(text, tema) {
  return String(text).replace(/\{tema\}/g, tema);
}

function getTopicItems(tema) {
  const lower = tema.toLowerCase();
  if (/\b(ia|inteligência artificial|chatgpt|automação|automatizar)\b/.test(lower)) return TOPIC_BANKS.dinheiroIA;
  if (/marketing|publicidade|anúncio|anuncios|instagram|conteúdo|vendas online/.test(lower)) return TOPIC_BANKS.marketing;
  if (/produtividade|tempo|organização|organizar|foco|hábitos|rotina/.test(lower)) return TOPIC_BANKS.produtividade;
  if (/venda|vendas|cliente|negócio|negocios|oferta/.test(lower)) return TOPIC_BANKS.vendas;
  return null;
}

function createScript(idea, duration, variation = 0, style = "viral") {
  const tema = String(idea || "").trim();
  const mode = normalizeStyle(style);
  const template = STYLE_TEMPLATES[mode];
  const offset = Math.abs(Number(variation) || 0);
  const topicItems = getTopicItems(tema);
  const genericTitles = [
    `5 pontos importantes sobre ${tema}`, `Erros comuns sobre ${tema}`, `Como começar com ${tema}`, `Dicas práticas sobre ${tema}`,
    `O que ninguém explica sobre ${tema}`, `Como melhorar seus resultados com ${tema}`, `Mitos e verdades sobre ${tema}`,
    `Passo a passo sobre ${tema}`, `O maior erro ao lidar com ${tema}`, `Como usar ${tema} na prática`,
    `3 coisas que você precisa saber sobre ${tema}`, `Vale a pena aprender sobre ${tema}?`
  ];
  const hook = fill(template.hooks[offset % template.hooks.length], tema);
  const selected = topicItems ? topicItems[offset % topicItems.length] : null;
  const title = selected ? selected[0] : genericTitles[offset % genericTitles.length];
  const topicText = selected ? selected[1] : `Neste conteúdo, vamos mostrar um ponto importante sobre ${tema} e como transformar esse conhecimento em uma ação prática.`;
  const example = selected ? `Por exemplo: aplique a ideia de ${selected[0].toLowerCase()} em uma situação real e observe o resultado.` : `Um exemplo prático é testar essa ideia diretamente em uma situação relacionada a ${tema}.`;
  const action = selected ? `Escolha uma pequena ação relacionada a ${selected[0].toLowerCase()} e teste hoje.` : `Escolha uma pequena ação sobre ${tema}, teste o resultado e ajuste o próximo passo.`;
  const texts = [hook, topicText, example, action, template.close];
  const sceneCount = duration <= 20 ? 4 : 5;
  const scenes = texts.slice(0, sceneCount);
  const step = duration / scenes.length;

  return {
    titulo: title,
    hook,
    duration,
    tema,
    style: mode,
    scenes: scenes.map((text, index) => ({
      start: Number((index * step).toFixed(1)),
      end: Number(((index + 1) * step).toFixed(1)),
      text
    }))
  };
}

exports.handler = async function(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "Método não permitido." }) };
    }

    let data;
    try {
      data = JSON.parse(event.body || "{}");
    } catch (error) {
      return { statusCode: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "JSON inválido." }) };
    }

    const idea = String(data.idea || data.ideia || "").trim();
    const durationValue = Number(data.duration || data.duracao || 30);
    const duration = [30, 45, 60].includes(durationValue) ? durationValue : 30;
    const countValue = Number(data.count || 1);
    const count = Math.max(1, Math.min(10, Number.isFinite(countValue) ? Math.floor(countValue) : 1));
    const variation = Number(data.variation || 0);
    const style = normalizeStyle(data.style || data.estilo);

    if (!idea) {
      return { statusCode: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "Informe o tema do Reel." }) };
    }

    const items = [];
    for (let i = 0; i < count; i++) items.push(createScript(idea, duration, variation + i, style));

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: require("crypto").randomUUID(), idea, style, duration, count: items.length, items })
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: error.message || "Erro ao gerar os Reels." }) };
  }
};
