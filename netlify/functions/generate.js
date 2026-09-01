function createScript(idea, duration, variation = 0) {
  const tema = idea.trim();
  const lower = tema.toLowerCase();

  const bancos = {
    dinheiroIA: [
      {
        titulo: "Criar conteúdo para empresas",
        texto: "Pequenos negócios precisam de posts, vídeos e legendas todos os dias. Você pode usar inteligência artificial para produzir esse conteúdo e vender o serviço para empresas."
      },
      {
        titulo: "Automatizar tarefas",
        texto: "Muitas empresas perdem horas com tarefas repetitivas. Você pode criar pequenas automações com inteligência artificial e cobrar pela solução."
      },
      {
        titulo: "Criar produtos digitais",
        texto: "Ebooks, checklists, modelos e materiais educativos podem ser criados com ajuda da inteligência artificial e vendidos pela internet."
      },
      {
        titulo: "Prestar serviços com IA",
        texto: "Você não precisa criar uma inteligência artificial. Pode usar ferramentas que já existem para oferecer edição, pesquisa, atendimento ou produção de conteúdo como serviço."
      },
      {
       {
  titulo: "Criar soluções para nichos",
  texto: "..."
},
{
  titulo: "Criar vídeos com IA",r ela."
      ,
{
  titulo: "Criar vídeos com IA",
  texto: "Você pode usar inteligência artificial para criar vídeos curtos para empresas, produtos e redes sociais e transformar isso em um serviço."
},
{
  titulo: "Criar posts para redes sociais",
  texto: "Empresas precisam publicar constantemente. Você pode usar inteligência artificial para criar calendários, posts e legendas e cobrar por esse trabalho."
},
{
  titulo: "Criar anúncios com IA",
  texto: "A inteligência artificial pode ajudar a criar ideias de anúncios, textos e variações para campanhas de empresas que querem vender mais."
},
{
  titulo: "Criar conteúdo para profissionais",
  texto: "Dentistas, médicos, advogados, corretores e outros profissionais precisam de conteúdo. Você pode usar inteligência artificial para produzir materiais para eles."
},
{
  
  titulo: "Criar um negócio com automação",
  texto: "Pequenas automações podem economizar horas de trabalho. Você pode encontrar tarefas repetitivas e transformar a solução em um serviço."
}


    ],

    marketing: [
      {
        titulo: "Comece pelo problema",
        texto: "Antes de criar uma campanha, descubra qual problema o cliente realmente quer resolver. Uma mensagem específica costuma chamar mais atenção do que uma mensagem genérica."
      },
      {
        titulo: "Mostre transformação",
        texto: "Em vez de falar apenas sobre seu produto, mostre o resultado que ele pode gerar. As pessoas entendem melhor uma oferta quando conseguem visualizar a transformação."
      },
      {
        titulo: "Teste diferentes ganchos",
        texto: "Não dependa de uma única abertura. Teste perguntas, afirmações, histórias e números para descobrir qual formato prende mais atenção."
      },
      {
        titulo: "Fale com um público específico",
        texto: "Quanto mais claro for o público, mais fácil fica criar uma mensagem que pareça feita especialmente para aquela pessoa."
      },
      {
        titulo: "Analise o que funcionou",
        texto: "Depois de publicar, observe retenção, cliques e respostas. Use esses dados para melhorar o próximo conteúdo em vez de publicar no automático."
      }
    ],

    produtividade: [
      {
        titulo: "Escolha uma prioridade",
        texto: "Em vez de começar o dia com uma lista enorme, escolha a tarefa que realmente precisa avançar. Isso reduz a sensação de estar ocupado sem produzir."
      },
      {
        titulo: "Elimine tarefas repetitivas",
        texto: "Sempre que você fizer a mesma tarefa várias vezes, pergunte se ela pode ser simplificada, automatizada ou transformada em um modelo."
      },
      {
        titulo: "Trabalhe em blocos",
        texto: "Agrupe tarefas parecidas e faça cada grupo de uma vez. Trocar constantemente de atividade consome mais energia e atenção."
      },
      {
        titulo: "Crie processos simples",
        texto: "Se uma tarefa acontece toda semana, transforme o processo em um passo a passo. Assim você não precisa reinventar a solução toda vez."
      },
      {
        titulo: "Revise seus resultados",
        texto: "No final do dia, veja o que realmente avançou. Essa pequena revisão ajuda a descobrir onde seu tempo está sendo desperdiçado."
      }
    ],

    vendas: [
      {
        titulo: "Descubra a necessidade",
        texto: "Uma venda começa antes da apresentação do produto. Primeiro descubra o que o cliente precisa e qual problema ele quer resolver."
      },
      {
        titulo: "Explique o benefício",
        texto: "Não fale somente das características. Explique como aquela característica melhora a situação do cliente."
      },
      {
        titulo: "Use exemplos",
        texto: "Um exemplo concreto pode ser muito mais convincente do que uma explicação abstrata. Mostre como a solução funciona na prática."
      },
      {
        titulo: "Reduza a dúvida",
        texto: "Quanto mais simples for entender o que você oferece, para quem serve e qual resultado esperar, mais fácil fica tomar uma decisão."
      },
      {
        titulo: "Faça acompanhamento",
        texto: "Muitas oportunidades desaparecem porque ninguém acompanha o cliente depois do primeiro contato. Um bom acompanhamento pode recuperar vendas."
      }
    ]
  };

  let banco;

  if (
    lower.includes("ganhar dinheiro") ||
    lower.includes("renda") ||
    lower.includes("dinheiro com ia") ||
    lower.includes("inteligência artificial")
  ) {
    banco = bancos.dinheiroIA;
  } else if (
    lower.includes("marketing") ||
    lower.includes("instagram") ||
    lower.includes("conteúdo") ||
    lower.includes("reels")
  ) {
    banco = bancos.marketing;
  } else if (
    lower.includes("produtividade") ||
    lower.includes("tempo") ||
    lower.includes("organização")
  ) {
    banco = bancos.produtividade;
  } else if (
    lower.includes("vendas") ||
    lower.includes("vender") ||
    lower.includes("cliente")
  ) {
    banco = bancos.vendas;
  } else {
    banco = [
      {
        titulo: "O ponto principal",
        texto: `O primeiro passo para entender ${tema} é descobrir qual problema ele resolve e para quem essa solução realmente é útil.`
      },
      {
        titulo: "Comece pelo básico",
        texto: `Em vez de tentar fazer tudo sobre ${tema} de uma vez, escolha uma única ação e coloque essa ideia em prática.`
      },
      {
        titulo: "Evite complicar",
        texto: `Uma solução simples relacionada a ${tema} pode ser mais útil do que uma estratégia complicada que nunca sai do papel.`
      },
      {
        titulo: "Teste na prática",
        texto: `Escolha uma pequena ação relacionada a ${tema}, teste o resultado e use o que aprender para melhorar a próxima tentativa.`
      },
      {
        titulo: "Transforme em ação",
        texto: `Conhecer ${tema} é apenas o começo. O resultado aparece quando você transforma o conhecimento em uma ação que pode ser repetida.`
      }
    ];
  }

  // Faz cada Reel começar por uma ideia diferente.
  const inicio = Math.abs(Number(variation) || 0) % banco.length;
  const ideias = [];

  for (let i = 0; i < banco.length; i++) {
    ideias.push(banco[(inicio + i) % banco.length]);
  }

  const selecionada = ideias[0];

  const hook = criarHook(selecionada, tema, variation);

  const corpos = [
    selecionada.texto,
    gerarExemplo(selecionada, tema),
    gerarAcao(selecionada),
    gerarFechamento(selecionada)
  ];

  const quantidadeCenas = duration <= 20 ? 4 : 5;
  const textos = [hook, ...corpos];

  while (textos.length < quantidadeCenas) {
    textos.push(
      "Escolha uma pequena ação, teste o resultado e ajuste o próximo passo."
    );
  }

  const cenasFinais = textos.slice(0, quantidadeCenas);
  const step = duration / cenasFinais.length;

  return {
    titulo: selecionada.titulo,
    hook,
    duration,
    tema,
    scenes: cenasFinais.map((text, index) => ({
      start: Number((index * step).toFixed(1)),
      end: Number(((index + 1) * step).toFixed(1)),
      text
    }))
  };
}

function criarHook(item, tema, variation) {
  const hooks = [
    `Quer uma ideia prática sobre ${item.titulo.toLowerCase()}?`,
    `Existe uma forma simples de aproveitar ${item.titulo.toLowerCase()}.`,
    `Se você está pensando em ${tema}, preste atenção nesta ideia.`,
    `Essa é uma das oportunidades mais interessantes sobre ${tema}.`,
    `Pouca gente explica esta parte de ${tema}.`,
    `Veja como transformar essa ideia em uma ação prática.`
  ];

  return hooks[Math.abs(Number(variation) || 0) % hooks.length];
}

function gerarExemplo(item, tema) {
  const exemplos = {
    "Criar conteúdo para empresas":
      "Por exemplo: um restaurante pode precisar de vídeos curtos, legendas e ideias de posts toda semana. Você pode montar esse pacote e cobrar mensalmente.",
    "Automatizar tarefas":
      "Por exemplo: uma empresa pode automatizar respostas iniciais, organização de pedidos ou geração de relatórios e economizar várias horas por mês.",
    "Criar produtos digitais":
      "Por exemplo: você pode transformar seu conhecimento sobre um assunto em um guia prático, checklist ou modelo pronto para outras pessoas.",
    "Prestar serviços com IA":
      "Por exemplo: em vez de vender a ferramenta, você pode vender o resultado final, como vídeos, textos, pesquisas ou atendimento.",
    "Criar soluções para nichos":
      "Por exemplo: escolha um segmento específico, descubra uma tarefa que consome tempo e crie uma solução simples para aquele problema.",
    "Comece pelo problema":
      "Por exemplo: se o cliente quer aumentar as vendas, sua comunicação precisa mostrar como sua solução ajuda exatamente nesse objetivo.",
    "Mostre transformação":
      "Compare a situação antes e depois da solução. Essa comparação ajuda o público a entender rapidamente o valor da sua oferta.",
    "Teste diferentes ganchos":
      "Crie três versões da abertura do mesmo vídeo e compare qual delas consegue manter mais pessoas assistindo.",
    "Fale com um público específico":
      "Em vez de falar com todo mundo, escolha um grupo específico e use exemplos que façam sentido para aquela realidade.",
    "Analise o que funcionou":
      "Se um conteúdo teve mais retenção ou comentários, descubra o motivo e use esse aprendizado na próxima publicação."
  };

  return exemplos[item.titulo] ||
    `Um exemplo prático é aplicar essa ideia diretamente em uma situação relacionada a ${tema}.`;
}

function gerarAcao(item) {
  const acoes = {
    "Criar conteúdo para empresas":
      "Monte três exemplos de conteúdo e apresente o serviço para um pequeno negócio.",
    "Automatizar tarefas":
      "Escolha uma tarefa repetitiva que uma empresa faz todos os dias e procure uma forma de automatizá-la.",
    "Criar produtos digitais":
      "Escolha um problema específico e transforme sua solução em um material simples que possa ser vendido.",
    "Prestar serviços com IA":
      "Escolha um serviço que você consiga entregar usando ferramentas de IA e crie uma primeira oferta.",
    "Criar soluções para nichos":
      "Escolha um nicho e converse com pessoas desse mercado para descobrir um problema real.",
    "Comece pelo problema":
      "Antes de criar sua próxima campanha, escreva claramente qual problema você quer resolver.",
    "Mostre transformação":
      "Pegue seu próximo conteúdo e transforme uma característica em um benefício concreto.",
    "Teste diferentes ganchos":
      "Crie três aberturas diferentes para o mesmo conteúdo e compare os resultados.",
    "Fale com um público específico":
      "Escolha um público específico e reescreva sua mensagem pensando somente nele.",
    "Analise o que funcionou":
      "Reserve alguns minutos para analisar os números do último conteúdo publicado."
  };

  return acoes[item.titulo] ||
    "Escolha uma pequena ação e coloque essa ideia em prática hoje.";
}

function gerarFechamento(item) {
  return `O importante é não ficar apenas na teoria. Teste a ideia de ${item.titulo.toLowerCase()} e veja o que acontece.`;
}

exports.handler = async function(event) {
  try {
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

    const data = JSON.parse(event.body || "{}");

    const idea = String(data.idea || data.ideia || "").trim();
    const duration = Number(data.duration || data.duracao || 30);
    const count = Math.max(1, Math.min(10, Number(data.count || 1)));
    const variation = Number(data.variation || 0);

    if (!idea) {
      return {
        statusCode: 400,
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          error: "Informe o tema do Reel."
        })
      };
    }

    const items = [];

    for (let i = 0; i < count; i++) {
      items.push(
        createScript(
          idea,
          duration,
          variation + i
        )
      );
    }

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        idea,
        count: items.length,
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
