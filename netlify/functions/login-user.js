import { login, verifyRequestOrigin } from "@netlify/identity";

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { "cache-control": "no-store" }
});

export default async request => {
  try {
    if (request.method !== "POST") return json({ error: "Método não suportado." }, 405);

    verifyRequestOrigin(request);

    const body = await request.json().catch(() => null);
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) return json({ error: "Informe e-mail e senha." }, 400);

    const user = await login(email, password);
    return json({
      ok: true,
      user: { id: user?.id || "", email: user?.email || email, roles: user?.roles || [] }
    });
  } catch (error) {
    console.error("login-user error", error);
    return json({ error: error?.message || "E-mail ou senha inválidos." }, 401);
  }
};
