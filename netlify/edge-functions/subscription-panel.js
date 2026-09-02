import { getUser } from "@netlify/identity";

export default async function handler(request, context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  try {
    const user = await getUser();
    if (!user) return response;

    const plan = String(user.appMetadata?.plan || "free").toLowerCase();
    const label = plan === "studio" ? "Studio" : plan === "pro" ? "Pro" : "Grátis";
    const color = plan === "studio" ? "#8b5cf6" : plan === "pro" ? "#2563eb" : "#343447";
    const action = plan === "free"
      ? '<a href="/planos" style="display:block;text-align:center;text-decoration:none;padding:10px;border-radius:10px;background:linear-gradient(135deg,#9b5cf6,#7140d4);color:#fff;font-size:11px;font-weight:950">VER PLANOS</a>'
      : '<a href="/api/customer-portal" style="display:block;text-align:center;text-decoration:none;padding:10px;border-radius:10px;background:linear-gradient(135deg,#9b5cf6,#7140d4);color:#fff;font-size:11px;font-weight:950">GERENCIAR ASSINATURA</a>';

    const html = await response.text();
    if (html.includes("reelsAiSubscriptionPanel")) return new Response(html, response);

    const panel = `<div id="reelsAiSubscriptionPanel" style="position:fixed;left:18px;bottom:18px;z-index:99997;width:min(310px,calc(100vw - 36px));background:rgba(15,15,24,.97);border:1px solid #343447;border-radius:18px;padding:14px;box-shadow:0 20px 60px rgba(0,0,0,.5);font-family:Inter,system-ui,sans-serif;color:#fff;backdrop-filter:blur(14px)"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><div><div style="font-size:10px;color:#9f9fad;font-weight:800;text-transform:uppercase;letter-spacing:.08em">Minha assinatura</div><div style="font-size:20px;font-weight:950;margin-top:3px">${label}</div></div><div style="padding:6px 9px;border-radius:999px;background:${color};font-size:10px;font-weight:950;text-transform:uppercase">${plan}</div></div><div style="font-size:11px;color:#aaaab8;margin-top:8px">${user.email || "Conta ReelsAI"}</div><div style="margin-top:12px">${action}</div></div>`;
    const updated = html.replace("</body>", panel + "\n</body>");
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.set("cache-control", "no-store");
    return new Response(updated, { status: response.status, statusText: response.statusText, headers });
  } catch (error) {
    console.error("subscription-panel error", error);
    return response;
  }
}

export const config = { path: "/" };
