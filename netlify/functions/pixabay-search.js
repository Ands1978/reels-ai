const json = (body, status = 200) => ({
  statusCode: status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  body: JSON.stringify(body)
});

const clean = value => String(value || "").replace(/\s+/g, " ").trim().slice(0, 100);

exports.handler = async event => {
  if (event.httpMethod !== "GET") return json({ error: "Método não permitido." }, 405);

  const key = process.env.PIXABAY_API_KEY;
  if (!key) return json({ error: "PIXABAY_API_KEY não configurada no Netlify." }, 503);

  const params = new URLSearchParams(event.queryStringParameters || {});
  const q = clean(params.get("q"));
  const page = Math.min(Math.max(Number(params.get("page")) || 1, 1), 25);
  const perPage = Math.min(Math.max(Number(params.get("per_page")) || 24, 3), 60);

  const api = new URL("https://pixabay.com/api/");
  api.searchParams.set("key", key);
  api.searchParams.set("lang", "pt");
  api.searchParams.set("q", q);
  api.searchParams.set("image_type", "photo");
  api.searchParams.set("orientation", params.get("orientation") === "horizontal" ? "horizontal" : "vertical");
  api.searchParams.set("safesearch", "true");
  api.searchParams.set("order", "popular");
  api.searchParams.set("page", String(page));
  api.searchParams.set("per_page", String(perPage));

  try {
    const response = await fetch(api);
    const text = await response.text();
    if (!response.ok) return json({ error: `Pixabay respondeu ${response.status}.` }, response.status === 429 ? 429 : 502);
    const data = JSON.parse(text);
    return json({
      total: Number(data.total) || 0,
      totalHits: Number(data.totalHits) || 0,
      page,
      hits: (Array.isArray(data.hits) ? data.hits : []).map(item => ({
        id: item.id,
        pageURL: item.pageURL,
        previewURL: item.previewURL,
        webformatURL: item.webformatURL,
        largeImageURL: item.largeImageURL,
        tags: item.tags,
        user: item.user
      }))
    });
  } catch (error) {
    console.error("pixabay-search", error);
    return json({ error: "Não foi possível consultar o Pixabay agora." }, 502);
  }
};
