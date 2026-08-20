/**
 * LME Sosialplanlegger — planlegg innlegg, følg opp kommentarer og la
 * automatiseringen svare for deg, på Facebook og Instagram.
 *
 * Dette er delen som snakker med Meta (Graph API) og som husker hva hvert
 * medlem har koblet til, planlagt og satt opp av regler. Rutene ligger i
 * functions/api/social/[[path]].js, jobben som kjører i bakgrunnen ligger i
 * functions/api/cron/social.js, og siden er /planlegger.
 *
 * ==========================================================================
 * TRE DELER, SAMME TILKOBLING
 * ==========================================================================
 *   1. Planlegger      lag et innlegg, velg kontoer og tidspunkt, så
 *                      publiseres det av seg selv når tiden kommer.
 *   2. Kommentarer     alle kommentarer fra begge plattformer i én liste,
 *                      med svar, liking, skjuling og sletting.
 *   3. Automatisering  regler i ManyChat-stil: når en kommentar inneholder
 *                      et nøkkelord, svar offentlig og send en DM.
 *
 * ==========================================================================
 * VIKTIG OM TILGANGER
 * ==========================================================================
 * Medlemmet kobler til SIN EGEN Facebook-side og Instagram profesjonelle
 * konto. LME lagrer bare tilgangsnøklene Meta gir tilbake, aldri passord, og
 * nøklene forlater aldri serveren. Et medlem ser kun sine egne kontoer.
 *
 * KV-nøkler:
 *   cfg:meta_app             { appId, appSecret }   (satt av eier, valgfritt
 *                            alternativ til META_APP_ID / META_APP_SECRET)
 *   social:<e-post>          tilkoblede kontoer med tilgangsnøkler
 *   socialstate:<tilfeldig>  e-posten som startet tilkoblingen (10 min)
 *   socialc:<e-post>:<konto> mellomlagrede kommentarer (60 sekunder)
 *   splan:<e-post>:<id>      ett planlagt innlegg
 *   srule:<e-post>           automatiseringsreglene til medlemmet
 *   sseen:<e-post>           kommentarer automatiseringen alt har svart på
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
   pages_show_list            hvilke sider du er administrator for
   pages_read_engagement      lese sidens egne innlegg
   pages_read_user_content    lese kommentarene andre har skrevet
   pages_manage_engagement    svare, like, skjule og slette kommentarer
   pages_manage_posts         publisere og planlegge innlegg på siden
   pages_messaging            sende DM som svar på en kommentar
   read_insights              tall for rekkevidde på sidens innlegg
   instagram_basic            koble Instagram-kontoen til siden
   instagram_manage_comments  lese og svare på Instagram-kommentarer
   instagram_content_publish  publisere innlegg på Instagram
   instagram_manage_messages  sende DM som svar på en Instagram-kommentar
   instagram_manage_insights  tall for rekkevidde og lagringer på Instagram

   De to insights-tilgangene er de eneste som bare gjelder statistikk. Blir de
   avslått i app-gjennomgangen, virker alt annet som før: statistikkfanen viser
   da likes, kommentarer og delinger, bare uten rekkevidde. */
export const SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_read_user_content",
  "pages_manage_engagement",
  "pages_manage_posts",
  "pages_messaging",
  "read_insights",
  "instagram_basic",
  "instagram_manage_comments",
  "instagram_content_publish",
  "instagram_manage_messages",
  "instagram_manage_insights",
].join(",");

/* Meta-appen: fra KV først (eier kan lime den inn selv på /planlegger),
   ellers miljøvariabler. Samme mønster som Blotato-nøkkelen, og av samme
   grunn: Renate skal kunne koble til uten å åpne Cloudflare. .trim() er
   kritisk, et usynlig linjeskift fra en innliming gir en helt annen streng. */
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

/* Hvem er du, og har du tilgang til planleggeren.
   Eier har alltid tilgang, ellers kreves et aktivt medlemskap. */
export async function socialAccess(context) {
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
    const raw = await env.BUILDER_KV.get("social:" + email);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c || !Array.isArray(c.accounts)) return null;
    return c;
  } catch (e) { return null; }
}

export async function writeConnection(env, email, conn) {
  await env.BUILDER_KV.put("social:" + email, JSON.stringify(conn));
}

export async function clearConnection(env, email) {
  await env.BUILDER_KV.delete("social:" + email);
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
  const cacheKey = "socialc:" + email + ":" + account.key;
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
  try { await env.BUILDER_KV.delete("socialc:" + email + ":" + accountKey); } catch (e) {}
}

/* Svar offentlig på en kommentar. Facebook og Instagram bruker hver sin sti. */
export function replyToComment(env, account, commentId, message) {
  const sub = account.platform === "instagram" ? "/replies" : "/comments";
  return graphPost(env, "/" + commentId + sub, { access_token: account.token, message: message });
}

/* Send en DM som svar på en kommentar (det ManyChat er kjent for).
   Facebook: /{kommentar}/private_replies.
   Instagram: Messenger-API-et, med kommentaren som mottaker. */
export function privateReply(env, account, commentId, message) {
  if (account.platform === "instagram") {
    const url = graphBase(env) + "/" + account.id + "/messages?access_token=" +
      encodeURIComponent(account.token);
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ recipient: { comment_id: commentId }, message: { text: message } }),
    }).then(async (r) => {
      const text = await r.text();
      let data; try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }
      return { ok: r.ok && !(data && data.error), status: r.status, data };
    }).catch(() => ({ ok: false, status: 0, data: { error: { message: "Nettverksfeil mot Meta." } } }));
  }
  return graphPost(env, "/" + commentId + "/private_replies", {
    access_token: account.token, message: message,
  });
}

/* ---------------------------------------------------------------------- */
/* Planlagte innlegg                                                       */
/* ---------------------------------------------------------------------- */

export function planKey(email, id) { return "splan:" + email + ":" + id; }

export async function listPlan(env, email) {
  const out = [];
  let cursor;
  do {
    const res = await env.BUILDER_KV.list({ prefix: "splan:" + email + ":", cursor: cursor });
    for (const k of res.keys) {
      try {
        const raw = await env.BUILDER_KV.get(k.name);
        if (raw) out.push(JSON.parse(raw));
      } catch (e) {}
    }
    cursor = res.list_complete ? null : res.cursor;
  } while (cursor);
  out.sort((a, b) => new Date(a.when) - new Date(b.when));
  return out;
}

export async function readPlan(env, email, id) {
  try {
    const raw = await env.BUILDER_KV.get(planKey(email, id));
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

/* Et publisert eller mislykket innlegg blir liggende i 60 dager, så
   medlemmet ser historikken sin, og forsvinner deretter av seg selv. */
export async function writePlan(env, email, post) {
  const opts = post.status === "planlagt" ? {} : { expirationTtl: 60 * 60 * 24 * 60 };
  await env.BUILDER_KV.put(planKey(email, post.id), JSON.stringify(post), opts);
}

export async function deletePlan(env, email, id) {
  await env.BUILDER_KV.delete(planKey(email, id));
}

/**
 * Publiser ett innlegg til én konto. Returnerer { ok, id } eller { ok:false, error }.
 *
 * Facebook tar bilde og tekst i ett kall. Instagram krever to steg: først
 * lages en beholder av bildet, så publiseres den. Instagram krever dessuten
 * alltid et bilde, tekst alene finnes ikke der.
 */
export async function publishTo(env, account, post, lang) {
  const text = String(post.text || "").trim();
  const img = String(post.imageUrl || "").trim();

  if (account.platform === "instagram") {
    if (!img) {
      return { ok: false, error: lang === "en"
        ? "Instagram needs an image. Add one, or publish to Facebook only."
        : "Instagram trenger et bilde. Legg til et, eller publiser bare til Facebook." };
    }
    const box = await graphPost(env, "/" + account.id + "/media", {
      access_token: account.token, image_url: img, caption: text,
    });
    if (!box.ok || !box.data.id) return { ok: false, error: graphError(box, lang) };
    const pub = await graphPost(env, "/" + account.id + "/media_publish", {
      access_token: account.token, creation_id: box.data.id,
    });
    if (!pub.ok) return { ok: false, error: graphError(pub, lang) };
    return { ok: true, id: pub.data.id || "" };
  }

  const res = img
    ? await graphPost(env, "/" + account.id + "/photos", {
        access_token: account.token, url: img, caption: text,
      })
    : await graphPost(env, "/" + account.id + "/feed", {
        access_token: account.token, message: text,
      });
  if (!res.ok) return { ok: false, error: graphError(res, lang) };
  return { ok: true, id: res.data.post_id || res.data.id || "" };
}

/* ---------------------------------------------------------------------- */
/* Automatisering (ManyChat-stil)                                          */
/* ---------------------------------------------------------------------- */

export async function readRules(env, email) {
  try {
    const raw = await env.BUILDER_KV.get("srule:" + email);
    const r = raw ? JSON.parse(raw) : [];
    return Array.isArray(r) ? r : [];
  } catch (e) { return []; }
}

export async function writeRules(env, email, rules) {
  await env.BUILDER_KV.put("srule:" + email, JSON.stringify(rules));
}

/* Passer denne regelen på denne kommentaren? Uten nøkkelord gjelder regelen
   alle nye kommentarer, det er "svar på alt"-varianten. */
export function ruleMatches(rule, comment) {
  if (!rule || rule.on === false) return false;
  if (Array.isArray(rule.accounts) && rule.accounts.length &&
      rule.accounts.indexOf(comment.account) === -1) return false;
  const words = (rule.keywords || []).map((w) => String(w).trim().toLowerCase()).filter(Boolean);
  if (!words.length) return true;
  const text = String(comment.text || "").toLowerCase();
  return words.some((w) => text.indexOf(w) !== -1);
}

/* Kommentarer automatiseringen allerede har tatt seg av. Listen holdes kort
   med vilje: den skal hindre dobbeltsvar, ikke være et arkiv. */
export async function readSeen(env, email) {
  try {
    const raw = await env.BUILDER_KV.get("sseen:" + email);
    const r = raw ? JSON.parse(raw) : [];
    return Array.isArray(r) ? r : [];
  } catch (e) { return []; }
}

export async function writeSeen(env, email, ids) {
  const capped = ids.slice(-800);
  await env.BUILDER_KV.put("sseen:" + email, JSON.stringify(capped),
    { expirationTtl: 60 * 60 * 24 * 60 });
}

/* ---------------------------------------------------------------------- */
/* Kjøringene: publiser et planlagt innlegg, og la reglene svare            */
/* ---------------------------------------------------------------------- */

/**
 * Publiser ett planlagt innlegg til alle kontoene det er satt opp for, og
 * lagre resultatet på selve innlegget. Brukes både av "Publiser nå" og av
 * bakgrunnsjobben, slik at de to aldri kan oppføre seg ulikt.
 */
export async function runPlan(env, email, post, conn, lang) {
  const results = [];
  for (const key of post.targets || []) {
    const account = findAccount(conn, key);
    if (!account) {
      results.push({ account: key, name: key, ok: false,
        error: lang === "en" ? "That account is no longer connected."
                             : "Kontoen er ikke koblet til lenger." });
      continue;
    }
    const r = await publishTo(env, account, post, lang);
    results.push({ account: key, name: account.name, ok: r.ok, id: r.id || "", error: r.error || "" });
    if (r.ok) await dropCache(env, email, key);
  }
  const good = results.filter((r) => r.ok).length;
  post.results = results;
  post.publishedAt = new Date().toISOString();
  post.status = good === results.length && good > 0 ? "publisert"
              : good > 0 ? "delvis" : "feilet";
  await writePlan(env, email, post);
  return post;
}

/**
 * Se etter nye kommentarer og la reglene svare. Kjøres av bakgrunnsjobben
 * hvert kvarter, og kan kjøres manuelt fra siden ("Kjør nå").
 *
 * Regelen er bevisst forsiktig: hver kommentar behandles bare én gang (se
 * sseen:<e-post>), og kommentarer medlemmet allerede har svart på selv
 * hoppes over. Ingen skal våkne til at automatiseringen har svart to ganger
 * på samme person.
 */
export async function runAutomation(env, email, conn, rules, lang) {
  const active = (rules || []).filter((r) => r.on !== false);
  if (!active.length) return { ran: 0, replies: 0, dms: 0, errors: [] };

  const seen = await readSeen(env, email);
  const seenSet = new Set(seen);
  let replies = 0, dms = 0, ran = 0;
  const errors = [];

  for (const account of conn.accounts) {
    const res = await commentsFor(env, email, account, { fresh: true, posts: 10 });
    if (!res.ok) { errors.push({ account: account.key, error: graphError(res.res, lang) }); continue; }
    for (const c of res.comments) {
      if (seenSet.has(c.id) || c.answered) continue;
      const rule = active.find((r) => ruleMatches(r, c));
      if (!rule) continue;
      ran++;
      seenSet.add(c.id);
      if (rule.reply) {
        const r = await replyToComment(env, account, c.id, rule.reply);
        if (r.ok) replies++; else errors.push({ account: account.key, error: graphError(r, lang) });
      }
      if (rule.dm) {
        const text = rule.dmLink ? rule.dm + "\n\n" + rule.dmLink : rule.dm;
        const d = await privateReply(env, account, c.id, text);
        if (d.ok) dms++; else errors.push({ account: account.key, error: graphError(d, lang) });
      }
    }
    if (ran) await dropCache(env, email, account.key);
  }

  await writeSeen(env, email, Array.from(seenSet));
  return { ran, replies, dms, errors };
}

/* ---------------------------------------------------------------------- */
/* Statistikk                                                              */
/* ---------------------------------------------------------------------- */

/**
 * Tallene for én konto: følgere, og de siste innleggene med likes,
 * kommentarer, delinger, rekkevidde og lagringer.
 *
 * ==========================================================================
 * HVORFOR TO FORSØK PER KALL
 * ==========================================================================
 * Rekkevidde og lagringer krever egne insights-tilganger fra Meta, og de kan
 * bli avslått i app-gjennomgangen uten at resten stopper. Derfor spør vi
 * først MED de feltene, og prøver på nytt UTEN dem hvis Meta klager. Da får
 * medlemmet alltid tallene som finnes, i stedet for en tom side.
 */
function engagement(p) {
  return (p.likes || 0) + (p.comments || 0) + (p.shares || 0) + (p.saved || 0);
}

async function facebookStats(env, account, limit) {
  const base = "id,message,created_time,permalink_url,full_picture," +
    "likes.summary(true).limit(0),comments.summary(true).limit(0),shares";
  let res = await graphGet(env, "/" + account.id + "/published_posts", {
    access_token: account.token, limit: limit,
    fields: base + ",insights.metric(post_impressions_unique)",
  });
  let harRekkevidde = res.ok;
  if (!res.ok) {
    res = await graphGet(env, "/" + account.id + "/published_posts", {
      access_token: account.token, limit: limit, fields: base,
    });
    harRekkevidde = false;
  }
  if (!res.ok) return { ok: false, res };

  const posts = (res.data.data || []).map((p) => {
    let reach = null;
    const ins = (p.insights && p.insights.data) || [];
    if (ins.length && ins[0].values && ins[0].values.length) {
      reach = ins[0].values[0].value || 0;
    }
    return {
      id: p.id, text: trim(p.message, 100), url: p.permalink_url || "",
      img: p.full_picture || "", ts: p.created_time || "",
      likes: (p.likes && p.likes.summary && p.likes.summary.total_count) || 0,
      comments: (p.comments && p.comments.summary && p.comments.summary.total_count) || 0,
      shares: (p.shares && p.shares.count) || 0,
      reach: reach, saved: null,
    };
  });

  let followers = null;
  const info = await graphGet(env, "/" + account.id, {
    access_token: account.token, fields: "followers_count,fan_count",
  });
  if (info.ok) followers = info.data.followers_count || info.data.fan_count || null;

  return { ok: true, followers, posts, harRekkevidde };
}

async function instagramStats(env, account, limit) {
  const base = "id,caption,permalink,timestamp,media_type,media_url,thumbnail_url," +
    "like_count,comments_count";
  let res = await graphGet(env, "/" + account.id + "/media", {
    access_token: account.token, limit: limit,
    fields: base + ",insights.metric(reach,saved)",
  });
  let harRekkevidde = res.ok;
  if (!res.ok) {
    res = await graphGet(env, "/" + account.id + "/media", {
      access_token: account.token, limit: limit, fields: base,
    });
    harRekkevidde = false;
  }
  if (!res.ok) return { ok: false, res };

  const posts = (res.data.data || []).map((p) => {
    let reach = null, saved = null;
    ((p.insights && p.insights.data) || []).forEach((m) => {
      const v = (m.values && m.values[0] && m.values[0].value) || 0;
      if (m.name === "reach") reach = v;
      if (m.name === "saved") saved = v;
    });
    return {
      id: p.id, text: trim(p.caption, 100), url: p.permalink || "",
      img: p.media_type === "VIDEO" ? (p.thumbnail_url || "") : (p.media_url || ""),
      ts: p.timestamp || "",
      likes: p.like_count || 0, comments: p.comments_count || 0,
      shares: 0, reach: reach, saved: saved,
    };
  });

  let followers = null;
  const info = await graphGet(env, "/" + account.id, {
    access_token: account.token, fields: "followers_count,media_count",
  });
  if (info.ok) followers = info.data.followers_count || null;

  return { ok: true, followers, posts, harRekkevidde };
}

/**
 * Statistikken for én konto, med et sammendrag over de hentede innleggene.
 * Mellomlagres i fem minutter: tallene endrer seg langsomt, og hvert oppslag
 * koster flere kall mot Meta.
 */
export async function statsFor(env, email, account, opts) {
  const limit = Math.min(25, Math.max(3, (opts && opts.posts) || 12));
  const cacheKey = "socials:" + email + ":" + account.key;
  if (!(opts && opts.fresh)) {
    try {
      const raw = await env.BUILDER_KV.get(cacheKey);
      if (raw) return { ok: true, stats: JSON.parse(raw), cached: true };
    } catch (e) {}
  }

  const res = account.platform === "instagram"
    ? await instagramStats(env, account, limit)
    : await facebookStats(env, account, limit);
  if (!res.ok) return res;

  const posts = res.posts.slice();
  posts.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const sum = (f) => posts.reduce((n, p) => n + (p[f] || 0), 0);
  const medRekkevidde = posts.filter((p) => typeof p.reach === "number");
  const best = posts.slice().sort((a, b) => engagement(b) - engagement(a))[0] || null;

  const stats = {
    account: account.key, name: account.name, platform: account.platform,
    followers: res.followers,
    posts: posts,
    harRekkevidde: !!res.harRekkevidde && medRekkevidde.length > 0,
    totals: {
      antall: posts.length,
      likes: sum("likes"), kommentarer: sum("comments"),
      delinger: sum("shares"), lagringer: sum("saved"),
      rekkevidde: medRekkevidde.reduce((n, p) => n + p.reach, 0),
      engasjement: posts.reduce((n, p) => n + engagement(p), 0),
    },
    best: best,
  };

  try {
    await env.BUILDER_KV.put(cacheKey, JSON.stringify(stats), { expirationTtl: 300 });
  } catch (e) {}
  return { ok: true, stats };
}
