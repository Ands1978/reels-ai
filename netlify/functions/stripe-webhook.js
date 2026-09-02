import { admin } from "@netlify/identity";

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { "cache-control": "no-store" }
});

const textEncoder = new TextEncoder();

async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(value));
  return [...new Uint8Array(signature)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function verifyStripeSignature(payload, signature, secret) {
  if (!signature || !secret) return false;
  const parts = signature.split(",");
  const timestamp = parts.find(part => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter(part => part.startsWith("v1=")).map(part => part.slice(3));
  if (!timestamp || !signatures.length) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const expected = await hmacHex(secret, `${timestamp}.${payload}`);
  return signatures.some(value => timingSafeEqual(value, expected));
}

async function stripeRequest(path) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY não configurada.");

  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: "application/json"
    }
  });

  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message || `Stripe API ${response.status}`);
  return body;
}

function planFromPrice(priceId) {
  if (priceId && priceId === process.env.STRIPE_STUDIO_PRICE_ID) return "studio";
  if (priceId && priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  return null;
}

function rolesForPlan(plan) {
  return plan === "studio" ? ["customer", "studio"] : plan === "pro" ? ["customer", "pro"] : ["customer"];
}

async function findUserByEmail(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const users = await admin.listUsers({ perPage: 200 });
  return users.find(user => String(user.email || "").trim().toLowerCase() === normalized) || null;
}

async function savePlan(user, plan, stripeCustomerId = null, stripeSubscriptionId = null) {
  if (!user) return false;
  const appMetadata = {
    ...(user.appMetadata || {}),
    plan,
    roles: rolesForPlan(plan),
    stripe_customer_id: stripeCustomerId || user.appMetadata?.stripe_customer_id || null,
    stripe_subscription_id: stripeSubscriptionId || user.appMetadata?.stripe_subscription_id || null,
    plan_updated_at: new Date().toISOString()
  };

  await admin.updateUser(user.id, { app_metadata: appMetadata });
  return true;
}

export default async request => {
  if (request.method !== "POST") return json({ error: "Método não suportado." }, 405);

  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) return json({ error: "STRIPE_WEBHOOK_SECRET não configurada." }, 500);
    if (!(await verifyStripeSignature(payload, signature, secret))) {
      return json({ error: "Assinatura Stripe inválida." }, 400);
    }

    const event = JSON.parse(payload);
    const object = event?.data?.object || {};

    if (event.type === "checkout.session.completed") {
      const customerId = typeof object.customer === "string" ? object.customer : object.customer?.id;
      const subscriptionId = typeof object.subscription === "string" ? object.subscription : object.subscription?.id;
      let email = object.customer_details?.email || object.customer_email || null;
      let priceId = null;

      if (subscriptionId) {
        const subscription = await stripeRequest(`subscriptions/${encodeURIComponent(subscriptionId)}`);
        priceId = subscription.items?.data?.[0]?.price?.id || null;
        email = email || subscription.customer_details?.email || null;
      }

      if (!email && customerId) {
        const customer = await stripeRequest(`customers/${encodeURIComponent(customerId)}`);
        email = customer.email || null;
      }

      const plan = planFromPrice(priceId);
      if (plan && email) {
        const user = await findUserByEmail(email);
        await savePlan(user, plan, customerId, subscriptionId);
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const subscriptionId = object.id;
      const customerId = typeof object.customer === "string" ? object.customer : object.customer?.id;
      const priceId = object.items?.data?.[0]?.price?.id || null;
      const plan = planFromPrice(priceId);
      const active = ["active", "trialing"].includes(object.status);

      if (plan && active && customerId) {
        const customer = await stripeRequest(`customers/${encodeURIComponent(customerId)}`);
        const user = await findUserByEmail(customer.email);
        await savePlan(user, plan, customerId, subscriptionId);
      } else if (!active && customerId) {
        const customer = await stripeRequest(`customers/${encodeURIComponent(customerId)}`);
        const user = await findUserByEmail(customer.email);
        await savePlan(user, "free", customerId, subscriptionId);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const customerId = typeof object.customer === "string" ? object.customer : object.customer?.id;
      if (customerId) {
        const customer = await stripeRequest(`customers/${encodeURIComponent(customerId)}`);
        const user = await findUserByEmail(customer.email);
        await savePlan(user, "free", customerId, object.id || null);
      }
    }

    if (event.type === "invoice.paid") {
      const customerId = typeof object.customer === "string" ? object.customer : object.customer?.id;
      const subscriptionId = typeof object.subscription === "string" ? object.subscription : object.subscription?.id;
      if (customerId && subscriptionId) {
        const subscription = await stripeRequest(`subscriptions/${encodeURIComponent(subscriptionId)}`);
        const priceId = subscription.items?.data?.[0]?.price?.id || null;
        const plan = planFromPrice(priceId);
        if (plan) {
          const customer = await stripeRequest(`customers/${encodeURIComponent(customerId)}`);
          const user = await findUserByEmail(customer.email);
          await savePlan(user, plan, customerId, subscriptionId);
        }
      }
    }

    if (event.type === "invoice.payment_failed") {
      console.warn("Stripe invoice.payment_failed", { customer: object.customer, subscription: object.subscription });
    }

    return json({ received: true });
  } catch (error) {
    console.error("stripe-webhook error", error);
    return json({ error: error?.message || "Falha ao processar webhook." }, 500);
  }
};
