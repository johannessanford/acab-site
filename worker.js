// A.C.A.B site on Cloudflare Workers: serves the static site and the two small APIs.
import * as tally from "./functions/api/tally.js";
import * as rsvp from "./functions/api/rsvp.js";

const routes = { "/api/tally": tally, "/api/rsvp": rsvp };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const mod = routes[url.pathname];
    if (mod) {
      const h = request.method === "POST" ? mod.onRequestPost : request.method === "GET" ? mod.onRequestGet : null;
      if (!h) return new Response("Method not allowed", { status: 405 });
      return h({ request, env });
    }
    return env.ASSETS.fetch(request);
  },
};
