import { getUser } from "@netlify/identity";

export default async function handler(request, context) {
  try {
    const user = await getUser();
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", new URL(request.url).pathname);
      return Response.redirect(loginUrl, 302);
    }

    const response = await context.next();
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    const html = await response.text();
    if (html.includes("reelsAiPixabayPanelInjected")) return new Response(html, response);

    const block = `
<script id="reelsAiPixabayPanelInjected" src="/pixabay-panel.js"></script>`;
    const updated = html.replace("</body>", block + "\n</body>");
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.set("cache-control","no-store");
    return new Response(updated,{status:response.status,statusText:response.statusText,headers});
  } catch (error) {
    console.error("auth-gate error", error);
    const loginUrl = new URL("/login", request.url);
    return Response.redirect(loginUrl, 302);
  }
}

export const config = { path: "/" };
