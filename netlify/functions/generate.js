function normalizeStyle(value) {
  const style = String(value || "viral").trim().toLowerCase();
  if (style.includes("educ")) return "educativo";
  if (style.includes("motiv")) return "motivacional";
  if (style.includes("story")) return "storytelling";
  return "viral";
}

const STYLE_TEMPLATES = {
  viral: {
    hooks: [
      "Você está fazendo isso errado com {tema}.",
      "Pouca gente percebe este detalhe sobre {tema}.",
      "Quer entender {tema} em poucos segundos?",
      "Antes de ignorar {tema}, veja isso.",
      "Isso pode mudar sua forma de pensar sobre {tema}."
    ],
    titles: [
      "O ponto que chama atenção em {tema}",
      "O erro mais comum em {tema}",
      "O detalhe de {tema} que você precisa ver",
      "Como simplificar {tema}"
    ],
    bodies: [
      "A ideia principal é simples: {tema} fica mais fácil quando você começa pelo que realmente importa.",
      "Em vez de tentar fazer tudo ao mesmo tempo, escolha um ponto, teste e observe o resultado.",
      "Um exemplo prático é transformar essa ideia em uma pequena ação que você consegue testar hoje.",
      "O próximo passo é colocar isso em prática e ajustar com base no que funcionar melhor."
    ],
    close: "Salve este vídeo e teste a ideia hoje."
  },
  educativo: {
    hooks: [
      "Vamos entender {tema} de forma simples.",
      "Se você está começando em {tema}, comece por aqui.",
      "Aqui está o conceito mais importante sobre {tema}.",
      "Em poucos passos, você vai entender {tema}.",
      "Antes de avançar em {tema}, entenda este ponto."
    ],
    titles: [
      "O básico que você precisa saber sobre {tema}",
      "Como entender {tema} passo a passo",
      "3 pontos importantes sobre {tema}",
      "Como aplicar {tema} na prática"
    ],
    bodies: [
      "Primeiro, entenda o conceito central. Depois, divida o assunto em partes menores para facilitar a aplicação.",
      "Um bom exemplo é começar com uma situação real e observar como {tema} funciona nesse contexto.",
      "Depois de entender a teoria, escolha uma pequena tarefa e aplique o conceito nela.",
      "Assim você transforma conhecimento em prática e consegue identificar o que ainda precisa melhorar."
    ],
    close: "Agora escolha um exemplo e pratique o conceito."
  },
  motivacional: {
    hooks: [
      "Se você quer avançar em {tema}, comece pequeno.",
      "Não espere estar pronto para começar com {tema}.",
      "Você não precisa dominar {tema} para dar o primeiro passo.",
      "O seu próximo resultado com {tema} pode começar hoje.",
      "Pare de adiar {tema}: faça uma coisa agora."
    ],
    titles: [
      "Comece hoje com {tema}",
      "O primeiro passo em {tema}",
      "Como sair da teoria em {tema}",
      "Uma pequena ação sobre {tema}"
    ],
    bodies: [
      "Você não precisa resolver tudo de uma vez. Escolha uma única ação que aproxime você do resultado que procura.",
      "Se algo der errado, use o resultado como informação para ajustar o próximo passo.",
      "Por exemplo, reserve alguns minutos hoje para testar uma parte de {tema} em uma situação real.",
      "Consistência vale mais do que esperar pelo momento perfeito."
    ],
    close: "Escolha uma ação e faça acontecer hoje."
  },
  storytelling: {
    hooks: [
      "Imagine descobrir {tema} começando por uma situação comum.",
      "Tudo começa com um problema simples relacionado a {tema}.",
      "Imagine que você precisa resolver algo usando {tema}.",
      "Foi assim que uma ideia simples sobre {tema} começou a fazer sentido.",
      "Existe uma história simples que ajuda a entender {tema}."
    ],
    titles: [
      "Uma história sobre {tema}",
      "O problema que explica {tema}",
      "Como uma situação comum revela {tema}",
      "A lição por trás de {tema}"
    ],
    bodies: [
      "Imagine uma pessoa diante de um problema real. Em vez de procurar uma solução perfeita, ela começa pelo passo mais simples.",
      "Depois do primeiro teste, ela percebe o que funcionou e muda a estratégia onde precisava.",
      "É aí que {tema} deixa de ser apenas uma ideia e passa a fazer sentido na prática.",
      "A lição é simples: começar, observar e ajustar costuma ser mais útil do que ficar apenas planejando."
    ],
    close: "E essa é a lição: comece pelo próximo passo."
  }
};

function fill(template, tema) {
  return template.replaceAll("{tema}", tema);
}

function createScript(idea, duration, variation = 0, style = "viral") {
  const tema = idea.trim();
  const mode = normalizeStyle(style);
  const template = STYLE_TEMPLATES[mode];
  const offset = Math.abs(Number(variation) || 0);

  const hook = fill(template.hooks[offset % template.hooks.length], tema);
  const title = fill(template.titles[offset % template.titles.length], tema);
  const body = template.bodies.map((text) => fill(text, tema));
  const texts = [hook, body[0], body[1], body[2], template.close];
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
      return {
        statusCode: 405,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "Método não permitido." })
      };
    }

    let data;
    try {
      data = JSON.parse(event.body || "{}");
    } catch (error) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "JSON inválido." })
      };
    }

    const idea = String(data.idea || data.ideia || "").trim();
    const durationValue = Number(data.duration || data.duracao || 30);
    const duration = [30, 45, 60].includes(durationValue) ? durationValue : 30;
    const countValue = Number(data.count || 1);
    const count = Math.max(1, Math.min(10, Number.isFinite(countValue) ? Math.floor(countValue) : 1));
    const variation = Number(data.variation || 0);
    const style = normalizeStyle(data.style || data.estilo);

    if (!idea) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "Informe o tema do Reel." })
      };
    }

    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(createScript(idea, duration, variation + i, style));
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: require("crypto").randomUUID(),
        idea,
        style,
        count: items.length,
        items
      })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: error.message || "Erro ao gerar os Reels." })
    };
  }
};
