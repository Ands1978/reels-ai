import { getUser } from "@netlify/identity";

export default async function handler(request, context) {
  try {
    const user = await getUser();

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      const next = new URL(request.url).pathname;
      if (next !== "/login") loginUrl.searchParams.set("next", next);
      return Response.redirect(loginUrl, 302);
    }

    return await context.next();
  } catch (error) {
    console.error("auth-gate error", error);
    return Response.redirect(new URL("/login", request.url), 302);
  }
}

export const config = { path: "/" };
