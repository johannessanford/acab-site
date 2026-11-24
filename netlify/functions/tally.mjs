// A.C.A.B Volume 3 tally — counts "Let's be Friends" and "Can we? Maybe..." sign-ups.
// GET  /api/tally            -> {friends, maybe}
// POST /api/tally {group, prev} -> adds one to group (and moves a previous vote if the visitor switches)
import { getStore } from "@netlify/blobs";

const GROUPS = ["friends", "maybe"];
const KEY = "vol3";

export default async (req) => {
  const store = getStore("acab-tally");
  let data = (await store.get(KEY, { type: "json" })) || { friends: 0, maybe: 0 };

  if (req.method === "POST") {
    let body = {};
    try { body = await req.json(); } catch {}
    const { group, prev } = body;
    if (!GROUPS.includes(group)) return Response.json({ error: "unknown group" }, { status: 400 });
    if (GROUPS.includes(prev) && prev !== group && data[prev] > 0) data[prev] -= 1;
    if (prev !== group) data[group] += 1;
    await store.setJSON(KEY, data);
  }
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
};

export const config = { path: "/api/tally" };
