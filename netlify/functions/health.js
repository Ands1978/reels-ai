exports.handler = async () => {
  const has = name => Boolean(process.env[name]);

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store"
    },
    body: JSON.stringify({
      online: true,
      app: "ReelsAI",
      aiGateway: {
        key: has("NETLIFY_AI_GATEWAY_KEY"),
        baseUrl: has("NETLIFY_AI_GATEWAY_BASE_URL")
      },
      providers: {
        openai: {
          key: has("OPENAI_API_KEY"),
          baseUrl: has("OPENAI_BASE_URL")
        },
        anthropic: {
          key: has("ANTHROPIC_API_KEY"),
          baseUrl: has("ANTHROPIC_BASE_URL")
        },
        perplexity: {
          key: has("PERPLEXITY_API_KEY")
        }
      },
      message: "Diagnóstico sem exibir valores secretos."
    })
  };
};
