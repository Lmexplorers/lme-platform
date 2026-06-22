/**
 * LME chat-worker — EKTE sanntids-chat med Durable Objects + WebSocket.
 *
 * Dette er OPPGRADERINGEN fra naer-live polling. Den deployes som en EGEN
 * Worker (ikke en del av Pages-bygget) og rutes paa samme domene som siden,
 * slik at innloggings-cookien (lme_sess) følger med. Se CHAT-SETUP.md.
 *
 * Rute (samme origin som lmexplorers.com):
 *   GET wss://lmexplorers.com/api/chat-ws/room/<id>   (WebSocket-upgrade)
 *
 * Binder seg til SAMME KV-namespace som resten (BUILDER_KV) for aa:
 *   - validere sesjon (sess:<sid>) og medlemskap (user:<e-post>)
 *   - skrive meldinger gjennom til gchat:<id> slik at polling-klienter og
 *     historikk holder seg synkronisert.
 */

const GROUPS = {
  "3-6": "3–6 år",
  "6-9": "6–9 år",
  "9-12": "9–12 år",
  "voksen": "Voksengruppe",
  "inner-circle": "Inner Circle",
};

const OWNER_EMAILS = [
  "renate@lmexplorers.com", "hei@lmexplorers.com", "hello@lmexplorers.com",
  "support@lmexplorers.com", "renateshobby@hotmail.com",
];

function readCookies(request) {
  const out = {};
  (request.headers.get("Cookie") || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}

function activeStatus(s) {
  if (!s) return false;
  if (s.status && /cancel|inactive|expired|none/i.test(s.status)) return false;
  return true;
}

function isMember(u, membership) {
  if (u) {
    if (u.role === "owner") return true;
    if (OWNER_EMAILS.indexOf((u.email || "").toLowerCase()) !== -1) return true;
    if (activeStatus(u.subscription)) return true;
  }
  if (activeStatus(membership)) return true;
  return false;
}

async function authedUser(request, env) {
  const sid = readCookies(request)["lme_sess"];
  if (!sid || !env.BUILDER_KV) return null;
  const sraw = await env.BUILDER_KV.get("sess:" + sid);
  if (!sraw) return null;
  let sess;
  try { sess = JSON.parse(sraw); } catch (e) { return null; }
  const uraw = await env.BUILDER_KV.get("user:" + (sess.email || "").toLowerCase());
  if (!uraw) return null;
  let u;
  try { u = JSON.parse(uraw); } catch (e) { return null; }
  const mraw = await env.BUILDER_KV.get("member:" + (u.email || "").toLowerCase());
  if (mraw) { try { u._membership = JSON.parse(mraw); } catch (e) {} }
  return u;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const m = url.pathname.match(/\/api\/chat-ws\/room\/([^/]+)$/);
    if (!m) return new Response("not found", { status: 404 });
    const id = m[1];
    if (!GROUPS[id]) return new Response("unknown group", { status: 404 });

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 426 });
    }

    const user = await authedUser(request, env);
    if (!isMember(user, user && user._membership)) return new Response("forbidden", { status: 403 });

    const roomId = env.CHAT_ROOM.idFromName(id);
    const stub = env.CHAT_ROOM.get(roomId);
    // Send identiteten videre til DO-en via headere (klienten kan ikke forfalske
    // disse, de settes server-side etter at sesjonen er validert).
    const fwd = new Request(url.toString(), request);
    fwd.headers.set("X-LME-Name", user.name || (user.email ? user.email.split("@")[0] : "Medlem"));
    fwd.headers.set("X-LME-Email", user.email || "");
    fwd.headers.set("X-LME-Group", id);
    return stub.fetch(fwd);
  },
};

export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Set();
  }

  async fetch(request) {
    const pair = new WebSocketPair();
    const client = pair[0], server = pair[1];
    const name = request.headers.get("X-LME-Name") || "Medlem";
    const email = request.headers.get("X-LME-Email") || "";
    const gid = request.headers.get("X-LME-Group") || "";

    server.accept();
    const meta = { name, email, gid };
    this.sessions.add(server);

    // Send siste historikk til den nye klienten.
    const history = (await this.state.storage.get("messages")) || [];
    try { server.send(JSON.stringify(history.slice(-100))); } catch (e) {}

    server.addEventListener("message", async (ev) => {
      let data;
      try { data = JSON.parse(ev.data); } catch (e) { return; }
      let text = (data.text || "").toString().trim();
      if (!text) return;
      if (text.length > 1000) text = text.slice(0, 1000);
      const message = {
        id: crypto.randomUUID(),
        u: meta.email, n: meta.name, t: text, ts: Date.now(),
      };
      const msgs = (await this.state.storage.get("messages")) || [];
      msgs.push(message);
      while (msgs.length > 200) msgs.shift();
      await this.state.storage.put("messages", msgs);
      // Skriv gjennom til KV saa polling-klienter og historikk er synket.
      if (this.env.BUILDER_KV && meta.gid) {
        try { await this.env.BUILDER_KV.put("gchat:" + meta.gid, JSON.stringify(msgs)); } catch (e) {}
      }
      const payload = JSON.stringify(message);
      for (const s of this.sessions) {
        try { s.send(payload); } catch (e) { this.sessions.delete(s); }
      }
    });

    const close = () => this.sessions.delete(server);
    server.addEventListener("close", close);
    server.addEventListener("error", close);

    return new Response(null, { status: 101, webSocket: client });
  }
}
