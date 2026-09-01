function createScript(idea, duration, variation) {
  const tema = idea.trim();

  const hooks = [
    `Você ainda não percebeu o potencial de ${tema}.`,
    `Se você está começando em ${tema}, preste atenção nisso.`,
    `Quer entender ${tema} de um jeito simples?`,
    `O maior erro de quem começa com ${tema} é este.`,
    `Pouca gente fala sobre isso quando o assunto é ${tema}.`,
    `Anote esta ideia se você quer evoluir em ${tema}.`,
    `Em poucos segundos você vai entender melhor ${tema}.`,
    `Isso pode mudar a forma como você vê ${tema}.`,
    `Antes de tentar ${tema}, você precisa saber disso.`,
    `Aqui está uma forma mais inteligente de pensar sobre ${tema}.`
  ];

  const hook = hooks[variation % hooks.length];

  const bodies = [
    `Comece entendendo o que realmente importa em ${tema}.`,
    `O primeiro passo é identificar qual resultado você quer conseguir com ${tema}.`,
    `Em vez de tentar fazer tudo de uma vez, escolha uma ação simples relacionada a ${tema}.`,
    `Um bom ponto de partida é separar o que é essencial do que é apenas distração.`,
    `Quando você entende o objetivo, fica muito mais fácil decidir o próximo passo.`,
    `Teste uma pequena mudança e observe o resultado antes de aumentar o esforço.`,
    `O segredo não é complicar: é transformar a ideia em uma ação que você consiga repetir.`,
    `Evite copiar estratégias sem entender por que elas funcionam.`,
    `Use o que faz sentido para sua situação e ajuste conforme seus resultados.`,
    `Quanto mais você pratica, mais fácil fica identificar o que realmente funciona.`
  ];

  const lessons = [
    `Pense em ${tema} como um processo, não como uma solução instantânea.`,
    `Comece pequeno e procure melhorar um detalhe de cada vez.`,
    `Compare os resultados e descubra qual abordagem funciona melhor para você.`,
    `Se algo não funcionar, ajuste a estratégia em vez de simplesmente desistir.`,
    `Uma boa ideia só ganha valor quando vira uma ação prática.`,
    `Evite buscar perfeição antes de começar.`,
    `Faça um teste simples e use o resultado para decidir o próximo passo.`,
    `Consistência costuma ser mais importante do que fazer tudo de uma vez.`,
    `Organize suas próximas ações antes de tentar acelerar.`,
    `Transforme o conhecimento em prática o quanto antes.`
  ];

  const endings = [
    `Agora você já tem um ponto de partida para ${tema}.`,
    `Teste essa ideia hoje e veja o que acontece.`,
    `Comece com uma pequena ação e evolua a partir dela.`,
    `Salve este Reel para consultar quando precisar.`,
    `Se isso foi útil, compartilhe com alguém que precisa saber disso.`,
    `O próximo passo é colocar essa ideia em prática.`,
    `Use essa estratégia como ponto de partida e faça seus próprios testes.`,
    `Quanto antes você começar, mais rápido poderá aprender.`,
    `Guarde esta dica e volte quando for colocar em prática.`,
    `Agora é sua vez de testar.`
  ];

  const body1 = bodies[(variation * 2) % bodies.length];
  const body2 = bodies[(variation * 3 + 1) % bodies.length];
  const lesson1 = lessons[(variation * 2 + 2) % lessons.length];
  const lesson2 = lessons[(variation * 3 + 1) % lessons.length];
  const ending = endings[variation % endings.length];

  const scenes = [
    hook,
    body1,
    body2,
    lesson1,
    lesson2,
    ending
  ];

  const step = duration / scenes.length;

  return {
    hook,
    duration,
    scenes: scenes.map((text, index) => ({
      start: Number((index * step).toFixed(2)),
      end: Number(((index + 1) * step).toFixed(2)),
      text
    }))
  };
}

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const idea = String(body.idea || "").trim();
    const duration = Number(body.duration || 30);
    const count = Number(body.count) === 10 ? 10 : 1;

    if (!idea) {
      return {
        statusCode: 400,
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          error: "Digite um tema."
        })
      };
    }

    const items = Array.from(
      { length: count },
      (_, index) => ({
        index: index + 1,
        script: createScript(
          idea,
          duration,
          index
        )
      })
    );

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        idea,
        count,
        items
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        error: "Erro ao gerar os Reels."
      })
    };
  }
};
