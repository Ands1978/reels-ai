import { getUser } from "@netlify/identity";

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { "cache-control": "no-store" }
});

export default async request => {
  if (request.method !== "GET") return json({ error: "Método não suportado." }, 405);

  try {
    const user = await getUser();
    if (!user) return json({ error: "Sessão expirada. Entre novamente." }, 401);

    const customerId = user.appMetadata?.stripe_customer_id || user.userMetadata?.stripe_customer_id;
    if (!customerId) {
      return json({ error: "Nenhuma assinatura Stripe vinculada a esta conta." }, 404);
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return json({ error: "STRIPE_SECRET_KEY não configurada." }, 500);

    const origin = new URL(request.url).origin;
    const form = new URLSearchParams();
    form.set("customer", customerId);
    form.set("return_url", `${origin}/`);

    const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form.toString()
    });

    const body = await response.json();
    if (!response.ok || !body.url) {
      console.error("Stripe Customer Portal error", body);
      return json({ error: body?.error?.message || "Não foi possível abrir o gerenciamento da assinatura." }, 502);
    }

    return Response.redirect(body.url, 303);
  } catch (error) {
    console.error("customer-portal error", error);
    return json({ error: error?.message || "Falha ao abrir o gerenciamento da assinatura." }, 500);
  }
};
