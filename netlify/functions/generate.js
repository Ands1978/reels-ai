function createScript(idea, duration, variation) {
  const hooks = [
    `Pare de ignorar isso sobre ${idea}.`,
    `Você provavelmente está fazendo isso errado em ${idea}.`,
    `3 coisas que ninguém te conta sobre ${idea}.`,
    `Se você quer melhorar em ${idea}, veja isso.`,
    `Antes de continuar com ${idea}, assista isso.`
  ];

  const hook = hooks[variation % hooks.length];

  const scenes = [
    hook,
    `Primeiro: entenda o ponto principal de ${idea}.`,
    "Segundo: transforme essa ideia em uma ação simples.",
    "Terceiro: evite o erro mais comum.",
    "Agora você já sabe por onde começar.",
    "Salve este vídeo e siga para mais."
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
