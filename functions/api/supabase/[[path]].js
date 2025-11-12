const buildCorsHeaders = (origin = "*") => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,apikey,Content-Type,supabase-client,Prefer",
  "Access-Control-Allow-Credentials": "true",
});

export const onRequest = async ({ request, env, params }) => {
  const origin = request.headers.get("Origin") || "*";

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: buildCorsHeaders(origin) });
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return new Response("Supabase proxy is not configured", {
      status: 500,
      headers: buildCorsHeaders(origin),
    });
  }

  const upstreamBase = env.SUPABASE_URL.replace(/\/$/, "");
  const suffix = params.path ? `/${params.path}` : "";
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${upstreamBase}${suffix}${incomingUrl.search}`);

  const headers = new Headers(request.headers);
  headers.set("apikey", env.SUPABASE_ANON_KEY);
  if (!headers.has("authorization")) {
    headers.set("Authorization", `Bearer ${env.SUPABASE_ANON_KEY}`);
  }
  headers.set("origin", new URL(upstreamBase).origin);
  headers.delete("host");

  const fetchInit = {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
  };

  let response;
  try {
    response = await fetch(targetUrl.toString(), fetchInit);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message ?? String(error) }), {
      status: 502,
      headers: { "content-type": "application/json", ...buildCorsHeaders(origin) },
    });
  }

  const proxiedHeaders = new Headers(response.headers);
  const corsHeaders = buildCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    proxiedHeaders.set(key, value);
  });

  return new Response(response.body, { status: response.status, headers: proxiedHeaders });
};
