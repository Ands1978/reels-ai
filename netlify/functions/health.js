exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      online: true,
      app: "ReelsAI"
    })
  };
};
