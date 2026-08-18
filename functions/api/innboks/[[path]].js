/**
 * LME Innboks — API.
 *
 * Alle kommentarer fra medlemmets egen Facebook-side og Instagram-konto på
 * ett sted, med svar, liking, skjuling og sletting rett herfra. Siden er
 * /innboks, og all Meta-logikken ligger i functions/_lib/innboks.js.
 *
 *   GET  /api/innboks/status                 -> hvem du er, hva som er koblet til
 *   POST /api/innboks/app        { appId, appSecret }   (kun eier) Meta-appen
 *   GET  /api/innboks/connect                -> videresender til Facebook-innlogging
 *   GET  /api/innboks/callback               -> tar imot svaret fra Facebook
 *   POST /api/innboks/disconnect             -> glem kontoene igjen
 *   GET  /api/innboks/comments?account=&fresh=1
 *   POST /api/innboks/reply      { account, id, message }
 *   POST /api/innboks/like       { account, id, on }
 *   POST /api/innboks/hide       { account, id, on }
 *   POST /api/innboks/delete     { account, id }
 *   POST /api/innboks/ai-reply   { text, post, lang, tone }
 *
 * Et medlem ser og rører bare sine egne kontoer. Tilgangsnøklene fra Meta
 * ligger i KV på serveren og sendes aldri til nettleseren.
 */

import { sessionUser } from "../../_lib/access.js";
import { logUsage, anthropicUnits } from "../../_lib/ai-core/usage.js";
import { checkLimit, callerKey } from "../../_lib/ai-core/ratelimit.js";
import {
  SCOPES, metaApp, inboxAccess, readConnection, writeConnection, clearConnection,
  publicAccounts, findAccount, exchangeCode, accountsFor, commentsFor, dropCache,
  graphPost, graphDelete, graphError, graphVersion,
} from "../../_lib/innboks.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function redirect(url) {
  return new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "no-store" } });
}

function langOf(request, body) {
  if (body && body.lang === "en") return "en";
  if (body && body.lang === "no") return "no";
  return new URL(request.url).searchParams.get("lang") === "en" ? "en" : "no";
}

function L(lang, no, en) { return lang === "en" ? en : no; }

/* Tilbakeveien Facebook sender medlemmet til. Kan settes fast med
   META_REDIRECT_URI, ellers samme domene som siden ble åpnet fra. Adressen
   må stå i Meta-appen under "Valid OAuth Redirect URIs", ellers avviser
   Facebook innloggingen før den i det hele tatt starter. */
function redirectUri(env, request) {
  const fixed = String((env && env.META_REDIRECT_URI) || "").trim();
  if (fixed) return fixed;
  return new URL(request.url).origin + "/api/innboks/callback";
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!env || !env.BUILDER_KV) return json({ error: "KV mangler." }, 500);

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/innboks\/?/, "").replace(/\/$/, "");
  const me = await inboxAccess(context);

  /* ---------------------------------------------------------------- */
  /* Status                                                            */
  /* ---------------------------------------------------------------- */
  if (path === "status" && request.method === "GET") {
    const app = await metaApp(env);
    const out = {
      loggedIn: me.loggedIn, entitled: me.entitled, owner: me.owner,
      configured: !!app.appId, connected: false, accounts: [],
    };
    if (me.owner) { out.appSource = app.source; out.graph = graphVersion(env); }
    if (me.loggedIn && me.entitled) {
      const conn = await readConnection(env, me.email);
      out.connected = !!(conn && conn.accounts.length);
      out.accounts = publicAccounts(conn);
      if (conn && conn.connectedAt) out.connectedAt = conn.connectedAt;
    }
    return json(out);
  }

  /* Meta-appen (kun eier), så den kan settes uten å åpne Cloudflare. */
  if (path === "app" && request.method === "POST") {
    if (!me.owner) return json({ error: "forbidden" }, 403);
    let body; try { body = await request.json(); } catch (e) { return json({ error: "Ugyldig JSON" }, 400); }
    const appId = String((body && body.appId) || "").trim();
    const appSecret = String((body && body.appSecret) || "").trim();
    if (!appId || !appSecret) {
      await env.BUILDER_KV.delete("cfg:meta_app");
      return json({ ok: true, configured: false });
    }
    await env.BUILDER_KV.put("cfg:meta_app", JSON.stringify({ appId, appSecret }));
    return json({ ok: true, configured: true });
  }

  /* ---------------------------------------------------------------- */
  /* Tilkobling                                                        */
  /* ---------------------------------------------------------------- */
  if (path === "connect" && request.method === "GET") {
    if (!me.loggedIn) return redirect("/login?next=/innboks");
    if (!me.entitled) return redirect("/innboks?feil=tilgang");
    const app = await metaApp(env);
    if (!app.appId) return redirect("/innboks?feil=oppsett");

    const state = crypto.randomUUID().replace(/-/g, "");
    await env.BUILDER_KV.put("inboxstate:" + state, me.email, { expirationTtl: 600 });

    const dialog = new URL("https://www.facebook.com/" + graphVersion(env) + "/dialog/oauth");
    dialog.searchParams.set("client_id", app.appId);
    dialog.searchParams.set("redirect_uri", redirectUri(env, request));
    dialog.searchParams.set("state", state);
    dialog.searchParams.set("scope", SCOPES);
    dialog.searchParams.set("response_type", "code");
    return redirect(dialog.toString());
  }

  if (path === "callback" && request.method === "GET") {
    const state = url.searchParams.get("state") || "";
    const code = url.searchParams.get("code") || "";
    if (url.searchParams.get("error")) return redirect("/innboks?feil=avbrutt");
    if (!state || !code) return redirect("/innboks?feil=svar");

    const stateEmail = await env.BUILDER_KV.get("inboxstate:" + state);
    if (!stateEmail) return redirect("/innboks?feil=utlopt");
    await env.BUILDER_KV.delete("inboxstate:" + state);

    // Økten må fortsatt tilhøre den som startet tilkoblingen, ellers kunne en
    // fremmed lenke koblet noen andres kontoer til feil konto.
    const user = await sessionUser(context);
    if (!user || user.email !== stateEmail) return redirect("/innboks?feil=okt");

    const app = await metaApp(env);
    if (!app.appId) return redirect("/innboks?feil=oppsett");

    const ex = await exchangeCode(env, app, code, redirectUri(env, request));
    if (!ex.ok) return redirect("/innboks?feil=nokkel");

    const acc = await accountsFor(env, ex.userToken);
    if (!acc.ok) return redirect("/innboks?feil=kontoer");
    if (!acc.accounts.length) return redirect("/innboks?feil=ingen");

    await writeConnection(env, stateEmail, {
      v: 1,
      connectedAt: new Date().toISOString(),
      expiresAt: ex.expiresIn ? new Date(Date.now() + ex.expiresIn * 1000).toISOString() : "",
      accounts: acc.accounts,
    });
    return redirect("/innboks?koblet=1");
  }

  if (path === "disconnect" && request.method === "POST") {
    if (!me.loggedIn) return json({ error: "Logg inn først." }, 401);
    await clearConnection(env, me.email);
    return json({ ok: true });
  }

  /* Alt under her krever innlogget medlem med en tilkobling. */
  if (!me.loggedIn) {
    return json({ error: "Logg inn for å bruke Innboksen." }, 401);
  }
  if (!me.entitled) {
    return json({ error: "Innboksen er for medlemmer. Se planene på /medlemskap." }, 403);
  }

  /* ---------------------------------------------------------------- */
  /* Kommentarer                                                       */
  /* ---------------------------------------------------------------- */
  if (path === "comments" && request.method === "GET") {
    const lang = langOf(request, null);
    const conn = await readConnection(env, me.email);
    if (!conn || !conn.accounts.length) return json({ connected: false, accounts: [], comments: [] });

    const wanted = url.searchParams.get("account") || "";
    const fresh = url.searchParams.get("fresh") === "1";
    const list = wanted ? conn.accounts.filter((a) => a.key === wanted) : conn.accounts;
    if (!list.length) return json({ error: L(lang, "Ukjent konto.", "Unknown account.") }, 400);

    const comments = [];
    const problems = [];
    for (const a of list) {
      const res = await commentsFor(env, me.email, a, { fresh: fresh });
      if (res.ok) comments.push.apply(comments, res.comments);
      else problems.push({ account: a.key, name: a.name, error: graphError(res.res, lang) });
    }
    comments.sort((x, y) => new Date(y.ts) - new Date(x.ts));
    return json({
      connected: true, accounts: publicAccounts(conn),
      comments: comments.slice(0, 200), problems: problems,
    });
  }

  /* ---------------------------------------------------------------- */
  /* Handlinger på én kommentar                                        */
  /* ---------------------------------------------------------------- */
  const actions = { reply: 1, like: 1, hide: 1, delete: 1 };
  if (actions[path] && request.method === "POST") {
    let body; try { body = await request.json(); } catch (e) { return json({ error: "Ugyldig JSON" }, 400); }
    const lang = langOf(request, body);
    const conn = await readConnection(env, me.email);
    const account = findAccount(conn, String((body && body.account) || ""));
    if (!account) return json({ error: L(lang, "Kontoen er ikke koblet til.", "That account is not connected.") }, 400);
    const id = String((body && body.id) || "").trim();
    if (!id) return json({ error: L(lang, "Mangler kommentar.", "Missing comment.") }, 400);

    let res;
    if (path === "reply") {
      const message = String((body && body.message) || "").trim();
      if (!message) return json({ error: L(lang, "Skriv et svar først.", "Write a reply first.") }, 400);
      if (message.length > 2000) return json({ error: L(lang, "Svaret er for langt.", "The reply is too long.") }, 400);
      // Facebook svarer på en kommentar med /comments, Instagram med /replies.
      const sub = account.platform === "instagram" ? "/replies" : "/comments";
      res = await graphPost(env, "/" + id + sub, { access_token: account.token, message: message });
    } else if (path === "like") {
      if (account.platform === "instagram") {
        // Instagram har ikke noe API for å like en kommentar. Bedre å si det
        // ærlig enn å vise en knapp som later som den virker.
        return json({ error: L(lang,
          "Instagram lar ikke apper like kommentarer. Du kan svare, skjule eller slette herfra.",
          "Instagram does not let apps like comments. You can reply, hide or delete from here.") }, 400);
      }
      const on = body.on !== false;
      res = on
        ? await graphPost(env, "/" + id + "/likes", { access_token: account.token })
        : await graphDelete(env, "/" + id + "/likes", { access_token: account.token });
    } else if (path === "hide") {
      const on = body.on !== false;
      res = account.platform === "instagram"
        ? await graphPost(env, "/" + id, { access_token: account.token, hide: on ? "true" : "false" })
        : await graphPost(env, "/" + id, { access_token: account.token, is_hidden: on ? "true" : "false" });
    } else {
      res = await graphDelete(env, "/" + id, { access_token: account.token });
    }

    if (!res.ok) return json({ error: graphError(res, lang) }, 400);
    await dropCache(env, me.email, account.key);
    return json({ ok: true, result: res.data });
  }

  /* ---------------------------------------------------------------- */
  /* Forslag til svar (Claude)                                         */
  /* ---------------------------------------------------------------- */
  if (path === "ai-reply" && request.method === "POST") {
    let body; try { body = await request.json(); } catch (e) { return json({ error: "Ugyldig JSON" }, 400); }
    const lang = langOf(request, body);
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: L(lang, "Forslag er ikke tilgjengelig akkurat nå.", "Suggestions are not available right now.") }, 503);
    }
    const text = String((body && body.text) || "").trim().slice(0, 800);
    if (!text) return json({ error: L(lang, "Ingen kommentar å svare på.", "No comment to reply to.") }, 400);
    const post = String((body && body.post) || "").trim().slice(0, 300);
    const tones = {
      varm: "varm og personlig", kort: "kort og vennlig",
      takk: "takknemlig", svar: "hjelpsom, og svarer på spørsmålet",
    };
    const tone = tones[String((body && body.tone) || "varm")] || tones.varm;

    // Kostnadsvern: et forslag koster lite, men uten en grense kan én bruker
    // trykke tusen ganger. Eier har ingen grense.
    const gate = await checkLimit(env, {
      area: "innboks-ai", who: callerKey(request, me.email),
      limit: me.owner ? 0 : 80, hours: 24,
    });
    if (!gate.ok) {
      return json({ error: L(lang,
        "Du har brukt opp forslagene for i dag. De nullstilles om " + gate.resetInHours + " timer.",
        "You have used up today's suggestions. They reset in " + gate.resetInHours + " hours.") }, 429);
    }

    const system =
      "Du hjelper en innholdsskaper med å svare på en kommentar på Facebook eller Instagram. " +
      "Skriv svaret som skaperen selv, i jeg-form, aldri vi. Tonen skal være " + tone + ". " +
      "Svar på SAMME språk som kommentaren er skrevet på. Maks to setninger. " +
      "Ingen hashtags, ingen emoji-regn (høyst én emoji, og bare hvis det passer). " +
      "Bruk rette anførselstegn oppe, aldri vinkel-anførselstegn. Bruk aldri tankestrek " +
      "eller lang bindestrek, bruk komma, kolon eller punktum i stedet. " +
      "Ikke lov noe, ikke oppgi priser og ikke dikt opp fakta. Er kommentaren negativ, " +
      "svar rolig og vennlig uten å krangle. Svar KUN med selve svarteksten, ingen forklaring.";
    const user = (post ? "Innlegget handler om: " + post + "\n\n" : "") + "Kommentaren: " + text;

    const t0 = Date.now();
    let resp;
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 20000);
      resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: ctl.signal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-5", max_tokens: 300, system: system,
          messages: [{ role: "user", content: user }],
        }),
      });
      clearTimeout(timer);
    } catch (e) {
      return json({ error: L(lang, "Fikk ikke laget et forslag. Prøv igjen.", "Could not create a suggestion. Try again.") }, 502);
    }
    const data = await resp.json().catch(() => null);
    if (!resp.ok || !data) {
      return json({ error: L(lang, "Fikk ikke laget et forslag. Prøv igjen.", "Could not create a suggestion. Try again.") }, 502);
    }
    const out = ((data.content || []).map((c) => c.text || "").join("")).trim();
    await logUsage(env, {
      app: "innboks", task: "text", modelId: "claude-sonnet-5", email: me.email,
      units: anthropicUnits(data), status: "ok", ms: Date.now() - t0, note: "Svarforslag",
    });
    if (!out) return json({ error: L(lang, "Fikk ikke laget et forslag. Prøv igjen.", "Could not create a suggestion. Try again.") }, 502);
    return json({ ok: true, reply: out });
  }

  return json({ error: "Ukjent endepunkt." }, 404);
}
