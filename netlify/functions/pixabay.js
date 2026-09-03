const CACHE = new Map();

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

export default async (request) => {
  if (request.method !== "GET") return json({ error: "Método não permitido." }, 405);

  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    return json({
      error: "Banco Pixabay ainda não configurado. Configure PIXABAY_API_KEY no Netlify."
    }, 503);
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
  const page = Math.max(1, Math.min(20, Number(url.searchParams.get("page") || 1)));
  const perPage = Math.max(6, Math.min(30, Number(url.searchParams.get("per_page") || 18)));
  const imageType = url.searchParams.get("image_type") || "photo";
  const orientation = url.searchParams.get("orientation") || "all";
  const category = url.searchParams.get("category") || "";

  const key = JSON.stringify({ q, page, perPage, imageType, orientation, category });
  const cached = CACHE.get(key);
  if (cached && cached.expires > Date.now()) return json(cached.data);

  const params = new URLSearchParams({
    key: apiKey,
    lang: "pt",
    q,
    page: String(page),
    per_page: String(perPage),
    image_type: imageType,
    orientation,
    safesearch: "true",
    order: "popular",
  });

  if (category) params.set("category", category);

  try {
    const response = await fetch("https://pixabay.com/api/?" + params.toString(), {
      headers: { "user-agent": "ReelsAI-Studio/1.0" },
    });

    const text = await response.text();
    if (!response.ok) return json({ error: text || "Pixabay retornou um erro." }, response.status);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return json({ error: "Resposta inválida da API do Pixabay." }, 502);
    }

    const result = {
      total: Number(data.total || 0),
      totalHits: Number(data.totalHits || 0),
      hits: Array.isArray(data.hits) ? data.hits.map((item) => ({
        id: item.id,
        user: item.user,
        tags: item.tags,
        pageURL: item.pageURL,
        previewURL: item.previewURL,
        webformatURL: item.webformatURL,
        webformatWidth: item.webformatWidth,
        webformatHeight: item.webformatHeight,
        largeImageURL: item.largeImageURL,
        imageWidth: item.imageWidth,
        imageHeight: item.imageHeight,
        views: item.views,
        downloads: item.downloads,
        likes: item.likes,
      })) : [],
    };

    CACHE.set(key, { data: result, expires: Date.now() + 24 * 60 * 60 * 1000 });
    return json(result);
  } catch (error) {
    return json({ error: error?.message || "Falha ao consultar Pixabay." }, 502);
  }
};
