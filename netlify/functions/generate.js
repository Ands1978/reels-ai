function createScript(idea, duration, variation) {
  const tema = idea.trim();

  const hooks = [
    `Pare de ignorar isso sobre ${tema}.`,
    `Você está cometendo este erro em ${tema}.`,
    `3 coisas que ninguém te conta sobre ${tema}.`,
    `Se você quer melhorar em ${tema}, veja isso.`,
    `Antes de continuar com ${tema}, assista isso.`,
    `A maioria das pessoas começa ${tema} do jeito errado.`,
    `Quer aprender ${tema} mais rápido? Comece por aqui.`,
    `Existe uma forma mais simples de fazer ${tema}.`,
    `Se eu começasse hoje em ${tema}, faria isso.`,
    `Você precisa conhecer esta estratégia sobre ${tema}.`,
    `Pouca gente explica ${tema} dessa maneira.`,
    `Anote isso antes de tentar ${tema}.`
  ];

  const bodies = [
    `Primeiro, defina exatamente o que você quer conseguir com ${tema}.`,
    `Em vez de tentar fazer tudo ao mesmo tempo, escolha uma única ação.`,
    `O segredo está em transformar essa ideia em algo simples de executar.`,
    `Comece pelo básico e observe o que acontece quando você aplica isso.`,
    `Uma boa estratégia começa entendendo o problema antes de procurar a solução.`,
    `Teste uma pequena mudança e compare o resultado.`,
    `Não copie qualquer estratégia. Entenda primeiro por que ela funciona.`,
    `Escolha uma abordagem, coloque em prática e acompanhe os resultados.`,
    `Quanto mais claro for seu objetivo, mais fácil será escolher o próximo passo.`,
    `Faça um teste simples hoje e use o resultado para melhorar amanhã.`,
    `Evite complicar o processo antes mesmo de começar.`,
    `O importante é transformar conhecimento em uma ação prática.`
  ];

  const lessons = [
    `O primeiro passo é começar pequeno e melhorar aos poucos.`,
    `Consistência costuma trazer mais resultado do que tentar fazer tudo de uma vez.`,
    `O melhor caminho é testar, medir e ajustar.`,
    `Não espere perfeição para começar.`,
    `Aprenda com os resultados e mude aquilo que não estiver funcionando.`,
    `Uma estratégia só vale a pena quando consegue ser aplicada na prática.`,
    `Quanto mais você testa, melhor entende o que funciona para você.`,
    `Transforme essa ideia em uma tarefa que possa ser feita hoje.`,
    `Observe os resultados antes de aumentar o esforço.`,
    `O objetivo não é complicar. É encontrar uma maneira eficiente de agir.`,
    `Comece com o que você tem e evolua conforme aprende.`,
    `Pequenas melhorias repetidas podem gerar grandes resultados.`
  ];

  const endings = [
    `Agora escolha uma dessas ideias e coloque em prática.`,
    `Teste isso hoje e veja qual resultado consegue alcançar.`,
    `Salve este Reel para consultar depois.`,
    `Compartilhe com alguém que precisa saber disso.`,
    `Comece pequeno e evolua a partir dos resultados.`,
    `Agora é sua vez de testar.`,
    `Guarde essa ideia e coloque em prática.`,
    `O próximo passo é transformar isso em ação.`,
    `Teste, observe e ajuste.`,
    `Comece hoje mesmo com uma pequena mudança.`,
    `Se essa dica ajudou, salve este vídeo.`,
    `Use isso como ponto de partida para o próximo passo.`
  ];

  // Cria uma combinação diferente para cada Reel
  const hookIndex = variation % hooks.length;
  const body1Index = (variation * 3 + 1) % bodies.length;
  const body2Index = (variation * 5 + 4) % bodies.length;
  const lesson1Index = (variation * 7 + 2) % lessons.length;
  const lesson2Index = (variation * 11 + 5) % lessons.length;
  const endingIndex = (variation * 13 + 3) % endings.length;

  const scenes = [
    hooks[hookIndex],
    bodies[body1Index],
    bodies[body2Index],
    lessons[lesson1Index],
    lessons[lesson2Index],
    endings[endingIndex]
  ];

  const step = duration / scenes.length;

  return {
    hook: scenes[0],
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
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        error: "Método não permitido."
      })
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

    // Número aleatório para evitar que o mesmo tema
    // gere exatamente o mesmo roteiro toda vez
    const seed = Math.floor(Math.random() * 100000);

    const items = Array.from(
      { length: count },
      (_, index) => ({
        index: index + 1,
        script: createScript(
          idea,
          duration,
          seed + index
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
    console.error(error);

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
