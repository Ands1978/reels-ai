function createScript(idea, duration, variation) {
  const tema = idea.trim();
  const lower = tema.toLowerCase();

  const ehDinheiroIA =
    lower.includes("ganhar dinheiro") &&
    (lower.includes("ia") || lower.includes("inteligência artificial"));

  let ideias;

  if (ehDinheiroIA) {
    ideias = [
      {
        titulo: "Criar conteúdo para empresas",
        texto:
          "Você pode usar inteligência artificial para criar roteiros, legendas e ideias de conteúdo e oferecer esse serviço para pequenos negócios."
      },
      {
        titulo: "Automatizar tarefas",
        texto:
          "Muitas empresas gastam horas em tarefas repetitivas. Você pode criar automações simples usando IA e cobrar pela solução."
      },
      {
        titulo: "Criar produtos digitais",
        texto:
          "Ebooks, checklists, modelos e aulas podem ser criados com ajuda da IA e vendidos pela internet."
      },
      {
        titulo: "Prestar serviços usando IA",
        texto:
          "Você pode usar IA para trabalhar com textos, pesquisas, apresentações, atendimento ou outras tarefas e vender esse serviço."
      },
      {
        titulo: "Criar ferramentas simples",
        texto:
          "Encontre um problema específico e use ferramentas de IA para criar uma solução simples que possa ser vendida."
      }
    ];
  } else {
    ideias = [
      {
        titulo: "Comece pelo problema",
        texto:
          `Identifique primeiro qual problema relacionado a ${tema} você quer resolver.`
      },
      {
        titulo: "Escolha uma solução",
        texto:
          `Em vez de tentar fazer tudo, escolha uma solução simples relacionada a ${tema}.`
      },
      {
        titulo: "Transforme conhecimento em serviço",
        texto:
          `Veja como seu conhecimento sobre ${tema} pode ajudar outras pessoas.`
      },
      {
        titulo: "Crie um processo",
        texto:
          `Organize uma maneira simples e repetível de trabalhar com ${tema}.`
      },
      {
        titulo: "Teste e melhore",
        texto:
          `Faça um primeiro teste com ${tema}, observe o resultado e faça melhorias.`
      }
    ];
  }

  const hooks = ehDinheiroIA
    ? [
        "5 formas reais de ganhar dinheiro com inteligência artificial.",
        "Quer ganhar dinheiro com IA? Veja estas 5 ideias.",
        "5 maneiras de transformar inteligência artificial em renda.",
        "Se você quer ganhar dinheiro com IA, comece por aqui.",
        "5 oportunidades com IA que você pode testar hoje."
      ]
    : [
        `5 ideias práticas para começar com ${tema}.`,
        `5 formas de aproveitar melhor ${tema}.`,
        `5 estratégias para você testar em ${tema}.`,
        `Se você está começando em ${tema}, veja isso.`,
        `5 maneiras de melhorar seus resultados com ${tema}.`
      ];

  const ctas = [
    "Escolha uma dessas ideias e teste ainda hoje.",
    "Comece pela mais simples e veja o resultado.",
    "Salve este Reel para consultar depois.",
    "Compartilhe com alguém que precisa dessas ideias.",
    "Teste uma ideia por vez e veja o que funciona."
  ];

  const offset = variation % ideias.length;
  const selecionadas = [];

  for (let i = 0; i < ideias.length; i++) {
    selecionadas.push(
      ideias[(i + offset) % ideias.length]
    );
  }

  const hook = hooks[variation % hooks.length];
  const cta = ctas[variation % ctas.length];

  const scenes = [
    hook,
    `1. ${selecionadas[0].titulo}: ${selecionadas[0].texto}`,
    `2. ${selecionadas[1].titulo}: ${selecionadas[1].texto}`,
    `3. ${selecionadas[2].titulo}: ${selecionadas[2].texto}`,
    `4. ${selecionadas[3].titulo}: ${selecionadas[3].texto}`,
    `5. ${selecionadas[4].titulo}: ${selecionadas[4].texto}`,
    cta
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
