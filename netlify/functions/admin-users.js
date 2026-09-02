import { admin, getUser } from "@netlify/identity";

const json = (body, status = 200) => ({
  statusCode: status,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(body)
});

const safeUser = user => ({
  id: user.id,
  email: user.email || "",
  name: user.name || user.userMetadata?.full_name || "",
  roles: user.roles || user.appMetadata?.roles || [],
  confirmedAt: user.confirmedAt || null,
  createdAt: user.createdAt || null,
  lastSignInAt: user.lastSignInAt || null,
  invitedAt: user.invitedAt || null
});

const parseBody = async event => {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return null;
  }
};

export default async event => {
  try {
    const current = await getUser();
    if (!current) return json({ error: "Não autenticado." }, 401);
    if (!(current.roles || []).includes("admin")) {
      return json({ error: "Acesso restrito ao administrador." }, 403);
    }

    if (event.httpMethod === "GET") {
      const users = await admin.listUsers({ perPage: 200 });
      return json({ users: users.map(safeUser) });
    }

    if (event.httpMethod === "POST") {
      const body = await parseBody(event);
      const email = String(body?.email || "").trim().toLowerCase();
      const password = String(body?.password || "");
      const role = body?.role === "admin" ? "admin" : "customer";
      const name = String(body?.name || "").trim();

      if (!email || !email.includes("@")) return json({ error: "E-mail inválido." }, 400);
      if (password.length < 10) return json({ error: "A senha temporária precisa ter pelo menos 10 caracteres." }, 400);

      const user = await admin.createUser({
        email,
        password,
        data: {
          app_metadata: { roles: [role] },
          user_metadata: name ? { full_name: name } : {}
        }
      });

      return json({ user: safeUser(user) }, 201);
    }

    const body = await parseBody(event);
    const id = String(body?.id || "").trim();
    if (!id) return json({ error: "Usuário não informado." }, 400);

    if (event.httpMethod === "PATCH") {
      const attributes = {};
      if (body.email) attributes.email = String(body.email).trim().toLowerCase();
      if (body.password) {
        const password = String(body.password);
        if (password.length < 10) return json({ error: "A senha precisa ter pelo menos 10 caracteres." }, 400);
        attributes.password = password;
      }
      if (body.role === "admin" || body.role === "customer") {
        if (id === current.id && body.role !== "admin") {
          return json({ error: "O administrador atual não pode remover a própria role admin." }, 400);
        }
        attributes.app_metadata = { roles: [body.role] };
      }
      if (!Object.keys(attributes).length) return json({ error: "Nenhuma alteração informada." }, 400);

      const user = await admin.updateUser(id, attributes);
      return json({ user: safeUser(user) });
    }

    if (event.httpMethod === "DELETE") {
      if (id === current.id) return json({ error: "Você não pode excluir a própria conta admin." }, 400);
      await admin.deleteUser(id);
      return json({ ok: true });
    }

    return json({ error: "Método não suportado." }, 405);
  } catch (error) {
    console.error("admin-users error", error);
    return json({ error: error?.message || "Falha ao administrar usuários." }, 500);
  }
};
