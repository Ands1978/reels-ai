import { admin, getUser } from "@netlify/identity";

const response = (body, status = 200) => Response.json(body, {
  status,
  headers: { "cache-control": "no-store" }
});

const safeUser = user => ({
  id: user.id,
  email: user.email || "",
  name: user.name || user.userMetadata?.full_name || "",
  roles: user.roles || user.appMetadata?.roles || [],
  plan: user.appMetadata?.plan || "free",
  stripeCustomerId: user.appMetadata?.stripe_customer_id || null,
  stripeSubscriptionId: user.appMetadata?.stripe_subscription_id || null,
  confirmedAt: user.confirmedAt || null,
  createdAt: user.createdAt || null,
  lastSignInAt: user.lastSignInAt || null,
  invitedAt: user.invitedAt || null
});

const parseBody = async request => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

export default async request => {
  try {
    const current = await getUser();
    if (!current) return response({ error: "Não autenticado." }, 401);
    if (!(current.roles || []).includes("admin")) {
      return response({ error: "Acesso restrito ao administrador." }, 403);
    }

    if (request.method === "GET") {
      const users = await admin.listUsers({ perPage: 200 });
      return response({ users: users.map(safeUser) });
    }

    if (request.method === "POST") {
      const body = await parseBody(request);
      const email = String(body?.email || "").trim().toLowerCase();
      const password = String(body?.password || "");
      const role = body?.role === "admin" ? "admin" : "customer";
      const name = String(body?.name || "").trim();

      if (!email || !email.includes("@")) return response({ error: "E-mail inválido." }, 400);
      if (password.length < 10) return response({ error: "A senha temporária precisa ter pelo menos 10 caracteres." }, 400);

      const user = await admin.createUser({
        email,
        password,
        data: {
          app_metadata: { plan: "free", roles: [role] },
          user_metadata: name ? { full_name: name } : {}
        }
      });

      return response({ user: safeUser(user) }, 201);
    }

    const body = await parseBody(request);
    const id = String(body?.id || "").trim();
    if (!id) return response({ error: "Usuário não informado." }, 400);

    if (request.method === "PATCH") {
      const attributes = {};
      if (body.email) attributes.email = String(body.email).trim().toLowerCase();
      if (body.password) {
        const password = String(body.password);
        if (password.length < 10) return response({ error: "A senha precisa ter pelo menos 10 caracteres." }, 400);
        attributes.password = password;
      }
      if (body.role === "admin" || body.role === "customer") {
        if (id === current.id && body.role !== "admin") {
          return response({ error: "O administrador atual não pode remover a própria role admin." }, 400);
        }
        attributes.app_metadata = {
          plan: body.plan === "studio" ? "studio" : body.plan === "pro" ? "pro" : "free",
          roles: [body.role]
        };
      } else if (body.plan === "pro" || body.plan === "studio" || body.plan === "free") {
        const existing = (await admin.listUsers({ perPage: 200 })).find(user => user.id === id);
        if (!existing) return response({ error: "Usuário não encontrado." }, 404);
        attributes.app_metadata = {
          ...(existing.appMetadata || {}),
          plan: body.plan,
          roles: body.plan === "studio" ? ["customer", "studio"] : body.plan === "pro" ? ["customer", "pro"] : ["customer"]
        };
      }
      if (!Object.keys(attributes).length) return response({ error: "Nenhuma alteração informada." }, 400);

      const user = await admin.updateUser(id, attributes);
      return response({ user: safeUser(user) });
    }

    if (request.method === "DELETE") {
      if (id === current.id) return response({ error: "Você não pode excluir a própria conta admin." }, 400);
      await admin.deleteUser(id);
      return response({ ok: true });
    }

    return response({ error: "Método não suportado." }, 405);
  } catch (error) {
    console.error("admin-users error", error);
    return response({ error: error?.message || "Falha ao administrar usuários." }, 500);
  }
};
