// Cloudflare Pages Function: /api/tally
// Needs a KV namespace bound as ACAB (Settings → Bindings → KV namespace → variable name ACAB).
const GROUPS = ["friends", "maybe"];
const KEY = "tally:vol3";
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export async function onRequestGet({ env }) {
  const data = (await env.ACAB.get(KEY, "json")) || { friends: 0, maybe: 0 };
  return json(data);
}

export async function onRequestPost({ request, env }) {
  let body = {};
  try { body = await request.json(); } catch {}
  const { group, prev } = body;
  if (!GROUPS.includes(group)) return json({ error: "unknown group" }, 400);
  const data = (await env.ACAB.get(KEY, "json")) || { friends: 0, maybe: 0 };
  if (GROUPS.includes(prev) && prev !== group && data[prev] > 0) data[prev] -= 1;
  if (prev !== group) data[group] += 1;
  await env.ACAB.put(KEY, JSON.stringify(data));
  return json(data);
}
