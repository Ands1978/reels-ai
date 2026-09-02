const PLANS = {
  pro: 'STRIPE_PRO_PAYMENT_LINK',
  studio: 'STRIPE_STUDIO_PAYMENT_LINK',
};

export default async (request) => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Método não permitido.' }), {
      status: 405,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  const url = new URL(request.url);
  const plan = (url.searchParams.get('plan') || '').toLowerCase();
  const envName = PLANS[plan];
  const paymentLink = envName ? process.env[envName] : '';

  if (!envName) {
    return new Response('Plano inválido. Use ?plan=pro ou ?plan=studio.', {
      status: 400,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  if (!paymentLink) {
    return new Response(
      `Pagamento do plano ${plan} ainda não configurado. Configure ${envName} nas variáveis de ambiente do Netlify.`,
      {
        status: 503,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
      },
    );
  }

  let target;
  try {
    target = new URL(paymentLink);
  } catch {
    return new Response(`O valor de ${envName} não é uma URL válida.`, {
      status: 500,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  if (target.protocol !== 'https:') {
    return new Response(`O valor de ${envName} precisa usar HTTPS.`, {
      status: 500,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  return Response.redirect(target.toString(), 302);
};
