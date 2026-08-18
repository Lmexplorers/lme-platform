/**
 * LME Innboks — alle kommentarer fra Facebook og Instagram på ett sted.
 *
 * Dette er delen som snakker med Meta (Graph API) og som husker hvilke
 * kontoer hvert medlem har koblet til. Selve rutene ligger i
 * functions/api/innboks/[[path]].js, og siden er /innboks.
 *
 * ==========================================================================
 * HVORFOR EN EGEN FIL
 * ==========================================================================
 * Kommentarene hentes fra to helt ulike API-er (Facebook-sider og Instagram
 * profesjonelle kontoer), med hver sine feltnavn, hver sin måte å svare på
 * og hver sine begrensninger. Alt det oversettes her, slik at resten av
 * plattformen bare ser én enkel liste med kommentarer.
 *
 * ==========================================================================
 * VIKTIG OM TILGANGER
 * ==========================================================================
 * Medlemmet kobler til SIN EGEN Facebook-side og Instagram-konto. LME lagrer
 * bare de tilgangsnøklene Meta gir tilbake, aldri passord, og nøklene
 * forlater aldri serveren. Et medlem ser kun sine egne kommentarer.
 *
 * KV-nøkler:
 *   cfg:meta_app          -> { appId, appSecret }   (satt av eier, valgfritt
 *                            alternativ til miljøvariablene META_APP_ID /
 *                            META_APP_SECRET)
 *   inbox:<e-post>        -> { connectedAt, expiresAt, accounts: [...] }
 *   inboxstate:<tilfeldig> -> e-posten som startet tilkoblingen (10 min)
 *   inboxc:<e-post>:<konto> -> mellomlagrede kommentarer (60 sekunder)
 */

import { sessionUser, isOwner, getAccess } from "./access.js";

/* Graph-versjonen kan overstyres uten ny utrulling (META_GRAPH_VERSION),
   slik at en versjon som går ut på dato kan byttes fra Cloudflare. */
export function graphVersion(env) {
  return ((env && env.META_GRAPH_VERSION) || "v23.0").trim();
}

export function graphBase(env) {
  return "https://graph.facebook.com/" + graphVersion(env);
}

/* Tilgangene appen ber om. Hver enkelt trengs:
   pages_show_list          hvilke sider du er administrator for
   pages_read_engagement    lese sidens egne innlegg
   pages_read_user_content  lese kommentarene andre har skrevet
   pages_manage_engagement  svare, like, skjule og slette kommentarer
   instagram_basic          koble Instagram-kontoen til siden
   instagram_manage_comments lese og svare på Instagram-kommentarer */
export const SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_read_user_content",
  "pages_manage_engagement",
  "instagram_basic",
  "instagram_manage_comments",
].join(",");

/* Meta-appen: fra KV først (eier kan lime den inn selv på /innboks), ellers
   miljøvariabler. Samme mønster som Blotato-nøkkelen, og av samme grunn:
   Renate skal kunne koble til uten å åpne Cloudflare. .trim() er kritisk,
   et usynlig linjeskift fra en innliming gir en helt annen streng. */
export async function metaApp(env) {
  try {
    const raw = await env.BUILDER_KV.get("cfg:meta_app");
    if (raw) {
      const c = JSON.parse(raw);
      const id = String(c.appId || "").trim();
      const secret = String(c.appSecret || "").trim();
      if (id && secret) return { appId: id, appSecret: secret, source: "kv" };
    }
  } catch (e) {}
  const id = String((env && env.META_APP_ID) || "").trim();
  const secret = String((env && env.META_APP_SECRET) || "").trim();
  if (id && secret) return { appId: id, appSecret: secret, source: "env" };
  return { appId: "", appSecret: "", source: "none" };
}

/* Hvem er du, og har du tilgang til Innboksen.
   Eier har alltid tilgang, ellers kreves et aktivt medlemskap. */
export async function inboxAccess(context) {
  const user = await sessionUser(context);
  if (!user) return { loggedIn: false, entitled: false, owner: false, email: "" };
  const owner = isOwner(user);
  if (owner) return { loggedIn: true, entitled: true, owner: true, email: user.email };
  const acc = await getAccess(context);
  return { loggedIn: true, entitled: !!acc.active, owner: false, email: user.email };
}

/* ---------------------------------------------------------------------- */
/* Lagring av tilkoblede kontoer                                           */
/* ---------------------------------------------------------------------- */

export async function readConnection(env, email) {
  try {
    const raw = await env.BUILDER_KV.get("inbox:" + email);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c || !Array.isArray(c.accounts)) return null;
    return c;
  } catch (e) { return null; }
}

export async function writeConnection(env, email, conn) {
  await env.BUILDER_KV.put("inbox:" + email, JSON.stringify(conn));
}

export async function clearConnection(env, email) {
  await env.BUILDER_KV.delete("inbox:" + email);
}

/* Kontoene slik nettleseren får se dem: uten tilgangsnøkler. */
export function publicAccounts(conn) {
  if (!conn) return [];
  return conn.accounts.map((a) => ({
    key: a.key, platform: a.platform, name: a.name, picture: a.picture || "",
  }));
}

export function findAccount(conn, key) {
  if (!conn) return null;
  return conn.accounts.find((a) => a.key === key) || null;
}

/* ---------------------------------------------------------------------- */
/* Graph-kall                                                              */
/* ---------------------------------------------------------------------- */

async function graph(env, path, params, init) {
  const url = new URL(graphBase(env) + path);
  Object.keys(params || {}).forEach((k) => {
    if (params[k] !== undefined && params[k] !== null) url.searchParams.set(k, params[k]);
  });
  const r = await fetch(url.toString(), init || {});
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }
  // Meta svarer stort sett med en feilkode, men ikke alltid. Et svar som
  // inneholder `error` er en feil selv om statuslinjen sier 200.
  return { ok: r.ok && !(data && data.error), status: r.status, data };
}

export function graphGet(env, path, params) {
  return graph(env, path, params, { headers: { Accept: "application/json" } });
}

export function graphPost(env, path, params) {
  return graph(env, path, params, { method: "POST", headers: { Accept: "application/json" } });
}

export function graphDelete(env, path, params) {
  return graph(env, path, params, { method: "DELETE", headers: { Accept: "application/json" } });
}

/* En lesbar feilmelding ut av Metas feilobjekt, i stedet for "[object Object]". */
export function graphError(res, lang) {
  const en = lang === "en";
  const e = res && res.data && res.data.error;
  const msg = (e && (e.error_user_msg || e.message)) || "";
  if (/expired|session has been invalidated|Error validating access token/i.test(msg)) {
    return en
      ? "The connection to Facebook has expired. Connect your accounts again."
      : "Tilkoblingen til Facebook har gått ut. Koble til kontoene dine på nytt.";
  }
  if (msg) return (en ? "Facebook said: " : "Facebook svarte: ") + msg;
  return en ? "Facebook did not respond as expected." : "Facebook svarte ikke som forventet.";
}

/* Bytt engangskoden fra innloggingen mot en langlevd brukernøkkel, og hent
   sidene brukeren er administrator for. Sidenøklene som følger med en
   langlevd brukernøkkel går ikke ut av seg selv, så medlemmet slipper å
   koble til på nytt hver andre måned. */
export async function exchangeCode(env, app, code, redirectUri) {
  const short = await graphGet(env, "/oauth/access_token", {
    client_id: app.appId, client_secret: app.appSecret,
    redirect_uri: redirectUri, code: code,
  });
  if (!short.ok || !short.data.access_token) return { ok: false, res: short };

  const long = await graphGet(env, "/oauth/access_token", {
    grant_type: "fb_exchange_token", client_id: app.appId,
    client_secret: app.appSecret, fb_exchange_token: short.data.access_token,
  });
  const userToken = (long.ok && long.data.access_token) || short.data.access_token;
  const expiresIn = (long.ok && long.data.expires_in) || short.data.expires_in || 0;
  return { ok: true, userToken, expiresIn };
}

/* Sidene og de tilknyttede Instagram-kontoene, som ferdige konto-oppføringer. */
export async function accountsFor(env, userToken) {
  const res = await graphGet(env, "/me/accounts", {
    access_token: userToken,
    fields: "id,name,picture{url},access_token,instagram_business_account{id,username,profile_picture_url}",
    limit: 50,
  });
  if (!res.ok) return { ok: false, res };
  const out = [];
  (res.data.data || []).forEach((p) => {
    if (!p.access_token) return;
    out.push({
      key: "fb:" + p.id, platform: "facebook", id: p.id, name: p.name || "Facebook",
      picture: (p.picture && p.picture.data && p.picture.data.url) || "", token: p.access_token,
    });
    const ig = p.instagram_business_account;
    if (ig && ig.id) {
      out.push({
        key: "ig:" + ig.id, platform: "instagram", id: ig.id,
        name: ig.username ? "@" + ig.username : "Instagram",
        username: ig.username || "", picture: ig.profile_picture_url || "",
        token: p.access_token, pageId: p.id,
      });
    }
  });
  return { ok: true, accounts: out };
}

/* ---------------------------------------------------------------------- */
/* Kommentarer                                                             */
/* ---------------------------------------------------------------------- */

function trim(s, n) {
  const v = String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  return v.length > n ? v.slice(0, n - 1) + "…" : v;
}

/* Facebook: sidens egne innlegg, med kommentarene under hvert innlegg. */
async function facebookComments(env, account, limit) {
  const res = await graphGet(env, "/" + account.id + "/published_posts", {
    access_token: account.token,
    limit: limit,
    fields: "id,message,created_time,permalink_url,full_picture," +
      "comments.limit(25).filter(toplevel).order(reverse_chronological)" +
      "{id,message,created_time,like_count,user_likes,is_hidden,from{id,name,picture}," +
      "comments.limit(5){id,message,from{id},created_time}}",
  });
  if (!res.ok) return { ok: false, res };
  const out = [];
  (res.data.data || []).forEach((post) => {
    const kids = (post.comments && post.comments.data) || [];
    kids.forEach((c) => {
      if (c.from && c.from.id === account.id) return; // egne kommentarer er ikke innboks
      const replies = (c.comments && c.comments.data) || [];
      out.push({
        platform: "facebook", account: account.key, accountName: account.name,
        id: c.id, text: c.message || "", ts: c.created_time || "",
        author: (c.from && c.from.name) || "Facebook",
        authorPic: (c.from && c.from.picture && c.from.picture.data && c.from.picture.data.url) || "",
        likes: c.like_count || 0, liked: !!c.user_likes, hidden: !!c.is_hidden,
        answered: replies.some((r) => r.from && r.from.id === account.id),
        replies: replies.map((r) => ({
          id: r.id, text: r.message || "", ts: r.created_time || "",
          mine: !!(r.from && r.from.id === account.id),
        })),
        postId: post.id, postText: trim(post.message, 120),
        postUrl: post.permalink_url || "", postImg: post.full_picture || "",
      });
    });
  });
  return { ok: true, comments: out };
}

/* Instagram: kontoens medier, med kommentarene under hvert medium. */
async function instagramComments(env, account, limit) {
  const res = await graphGet(env, "/" + account.id + "/media", {
    access_token: account.token,
    limit: limit,
    fields: "id,caption,permalink,timestamp,media_type,media_url,thumbnail_url," +
      "comments.limit(25){id,text,timestamp,username,like_count,hidden," +
      "replies{id,text,username,timestamp}}",
  });
  if (!res.ok) return { ok: false, res };
  const me = (account.username || "").toLowerCase();
  const out = [];
  (res.data.data || []).forEach((post) => {
    const kids = (post.comments && post.comments.data) || [];
    kids.forEach((c) => {
      if (me && String(c.username || "").toLowerCase() === me) return;
      const replies = (c.replies && c.replies.data) || [];
      out.push({
        platform: "instagram", account: account.key, accountName: account.name,
        id: c.id, text: c.text || "", ts: c.timestamp || "",
        author: c.username ? "@" + c.username : "Instagram", authorPic: "",
        likes: c.like_count || 0, liked: false, hidden: !!c.hidden,
        answered: replies.some((r) => me && String(r.username || "").toLowerCase() === me),
        replies: replies.map((r) => ({
          id: r.id, text: r.text || "", ts: r.timestamp || "",
          mine: !!(me && String(r.username || "").toLowerCase() === me),
        })),
        postId: post.id, postText: trim(post.caption, 120),
        postUrl: post.permalink || "",
        postImg: post.media_type === "VIDEO" ? (post.thumbnail_url || "") : (post.media_url || ""),
      });
    });
  });
  return { ok: true, comments: out };
}

/* Kommentarene for én konto, nyeste først. Mellomlagres i 60 sekunder, så
   en utålmodig oppdatering ikke spiser av Metas timegrense. */
export async function commentsFor(env, email, account, opts) {
  const posts = Math.min(25, Math.max(3, (opts && opts.posts) || 10));
  const cacheKey = "inboxc:" + email + ":" + account.key;
  if (!(opts && opts.fresh)) {
    try {
      const raw = await env.BUILDER_KV.get(cacheKey);
      if (raw) return { ok: true, comments: JSON.parse(raw), cached: true };
    } catch (e) {}
  }
  const res = account.platform === "instagram"
    ? await instagramComments(env, account, posts)
    : await facebookComments(env, account, posts);
  if (!res.ok) return res;
  res.comments.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  try {
    await env.BUILDER_KV.put(cacheKey, JSON.stringify(res.comments), { expirationTtl: 60 });
  } catch (e) {}
  return res;
}

/* Tøm mellomlagringen når medlemmet nettopp har svart, likt eller skjult noe,
   ellers ser det ut som ingenting skjedde. */
export async function dropCache(env, email, accountKey) {
  try { await env.BUILDER_KV.delete("inboxc:" + email + ":" + accountKey); } catch (e) {}
}
