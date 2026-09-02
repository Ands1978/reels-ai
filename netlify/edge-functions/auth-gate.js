import { getUser } from "@netlify/identity";

export default async function handler(request, context) {
  try {
    const user = await getUser();
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", new URL(request.url).pathname);
      return Response.redirect(loginUrl, 302);
    }
    return context.next();
  } catch (error) {
    console.error("auth-gate error", error);
    const loginUrl = new URL("/login", request.url);
    return Response.redirect(loginUrl, 302);
  }
}

export const config = {
  path: "/",
};
