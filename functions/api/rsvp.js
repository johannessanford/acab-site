// Cloudflare Pages Function: /api/rsvp
// POST {name}  -> saves an RSVP in KV (binding ACAB)
// GET  ?key=YOUR_SECRET -> downloads all RSVPs as a CSV spreadsheet.
//   Set the secret as an environment variable named RSVP_KEY in Cloudflare.
export async function onRequestPost({ request, env }) {
  let body = {};
  try { body = await request.json(); } catch {}
  if (body.botField) return new Response(null, { status: 204 });
  const name = String(body.name || "").trim().replace(/\s+/g, " ").slice(0, 40);
  if (!name) return new Response("name required", { status: 400 });
  const at = new Date().toISOString();
  await env.ACAB.put(`rsvp:vol3:${at}:${crypto.randomUUID().slice(0, 8)}`, JSON.stringify({ name, at }));
  return new Response(null, { status: 204 });
}

export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get("key");
  if (!env.RSVP_KEY || key !== env.RSVP_KEY) return new Response("Not found", { status: 404 });
  const rows = [["name", "confirmed_at_utc"]];
  let cursor;
  do {
    const page = await env.ACAB.list({ prefix: "rsvp:vol3:", cursor });
    for (const k of page.keys) {
      const v = await env.ACAB.get(k.name, "json");
      if (v) rows.push([v.name, v.at]);
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="acab-vol3-rsvp.csv"' } });
}
