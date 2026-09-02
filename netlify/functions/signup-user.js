import { signup, verifyRequestOrigin } from "@netlify/identity";

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { "cache-control": "no-store" }
});

export default async request => {
  try {
    if (request.method !== "POST") return json({ error: "Método não suportado." }, 405);

    verifyRequestOrigin(request);

    const body = await request.json().catch(() => null);
    const name = String(body?.name || "").trim().slice(0, 120);
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) return json({ error: "Informe e-mail e senha." }, 400);
    if (password.length < 10) return json({ error: "A senha precisa ter pelo menos 10 caracteres." }, 400);

    const user = await signup(email, password, name ? { full_name: name } : undefined);

    return json({
      ok: true,
      confirmed: Boolean(user?.confirmedAt || user?.confirmed_at),
      email: user?.email || email
    });
  } catch (error) {
    console.error("signup-user error", error);
    return json({ error: error?.message || "Não foi possível criar a conta." }, 400);
  }
};
