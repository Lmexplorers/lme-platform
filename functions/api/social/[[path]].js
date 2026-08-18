/**
 * LME Sosialplanlegger — API.
 *
 * Planlegg innlegg, følg opp kommentarer og la automatiseringen svare, på
 * medlemmets egen Facebook-side og Instagram profesjonelle konto. Siden er
 * /planlegger, og all Meta-logikken ligger i functions/_lib/social.js.
 *
 *   GET  /api/social/status                  -> hvem du er, hva som er koblet til
 *   POST /api/social/app     { appId, appSecret }   (kun eier) Meta-appen
 *   GET  /api/social/connect                 -> videresender til Facebook-innlogging
 *   GET  /api/social/callback                -> tar imot svaret fra Facebook
 *   POST /api/social/disconnect              -> glem kontoene igjen
 *
 *   GET  /api/social/comments?account=&fresh=1
 *   POST /api/social/reply   { account, id, message }
 *   POST /api/social/like    { account, id, on }
 *   POST /api/social/hide    { account, id, on }
 *   POST /api/social/delete  { account, id }
 *
 *   GET  /api/social/stats?account=&fresh=1  -> følgere og tall per innlegg
 *
 *   GET  /api/social/plan                    -> planlagte og publiserte innlegg
 *   POST /api/social/plan    { targets, text, imageUrl, when }
 *   POST /api/social/plan-delete { id }
 *   POST /api/social/publish { id }          -> publiser nå
 *
 *   GET  /api/social/rules                   -> automatiseringsreglene
 *   POST /api/social/rules   { rules: [...] }
 *   POST /api/social/run                     -> kjør automatiseringen nå
 *
 *   POST /api/social/ai      { mode, ... }   -> forslag til svar, innlegg eller DM
 *
 * Et medlem ser og rører bare sine egne kontoer. Tilgangsnøklene fra Meta
 * ligger i KV på serveren og sendes aldri til nettleseren.
 */

import { sessionUser } from "../../_lib/access.js";
import { logUsage, anthropicUnits } from "../../_lib/ai-core/usage.js";
import { checkLimit, callerKey } from "../../_lib/ai-core/ratelimit.js";
import {
  SCOPES, metaApp, socialAccess, readConnection, writeConnection, clearConnection,
  publicAccounts, findAccount, exchangeCode, accountsFor, commentsFor, dropCache,
  graphPost, graphDelete, graphError, graphVersion, replyToComment,
  statsFor, listPlan, readPlan, writePlan, deletePlan, runPlan,
  readRules, writeRules, runAutomation,
} from "../../_lib/social.js";

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
  return new URL(request.url).origin + "/api/social/callback";
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!env || !env.BUILDER_KV) return json({ error: "KV mangler." }, 500);

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/social\/?/, "").replace(/\/$/, "");
  const me = await socialAccess(context);

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
    if (!me.loggedIn) return redirect("/login?next=/planlegger");
    if (!me.entitled) return redirect("/planlegger?feil=tilgang");
    const app = await metaApp(env);
    if (!app.appId) return redirect("/planlegger?feil=oppsett");

    const state = crypto.randomUUID().replace(/-/g, "");
    await env.BUILDER_KV.put("socialstate:" + state, me.email, { expirationTtl: 600 });

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
    if (url.searchParams.get("error")) return redirect("/planlegger?feil=avbrutt");
    if (!state || !code) return redirect("/planlegger?feil=svar");

    const stateEmail = await env.BUILDER_KV.get("socialstate:" + state);
    if (!stateEmail) return redirect("/planlegger?feil=utlopt");
    await env.BUILDER_KV.delete("socialstate:" + state);

    // Økten må fortsatt tilhøre den som startet tilkoblingen, ellers kunne en
    // fremmed lenke koblet noen andres kontoer til feil konto.
    const user = await sessionUser(context);
    if (!user || user.email !== stateEmail) return redirect("/planlegger?feil=okt");

    const app = await metaApp(env);
    if (!app.appId) return redirect("/planlegger?feil=oppsett");

    const ex = await exchangeCode(env, app, code, redirectUri(env, request));
    if (!ex.ok) return redirect("/planlegger?feil=nokkel");

    const acc = await accountsFor(env, ex.userToken);
    if (!acc.ok) return redirect("/planlegger?feil=kontoer");
    if (!acc.accounts.length) return redirect("/planlegger?feil=ingen");

    await writeConnection(env, stateEmail, {
      v: 1,
      connectedAt: new Date().toISOString(),
      expiresAt: ex.expiresIn ? new Date(Date.now() + ex.expiresIn * 1000).toISOString() : "",
      accounts: acc.accounts,
    });
    return redirect("/planlegger?koblet=1");
  }

  if (path === "disconnect" && request.method === "POST") {
    if (!me.loggedIn) return json({ error: "Logg inn først." }, 401);
    await clearConnection(env, me.email);
    return json({ ok: true });
  }

  /* Alt under her krever innlogget medlem. */
  if (!me.loggedIn) {
    return json({ error: "Logg inn for å bruke planleggeren." }, 401);
  }
  if (!me.entitled) {
    return json({ error: "Planleggeren er for medlemmer. Se planene på /medlemskap." }, 403);
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
  /* Statistikk                                                        */
  /* ---------------------------------------------------------------- */
  if (path === "stats" && request.method === "GET") {
    const lang = langOf(request, null);
    const conn = await readConnection(env, me.email);
    if (!conn || !conn.accounts.length) return json({ connected: false, accounts: [], stats: [] });

    const wanted = url.searchParams.get("account") || "";
    const fresh = url.searchParams.get("fresh") === "1";
    const list = wanted ? conn.accounts.filter((a) => a.key === wanted) : conn.accounts;
    if (!list.length) return json({ error: L(lang, "Ukjent konto.", "Unknown account.") }, 400);

    const stats = [];
    const problems = [];
    for (const a of list) {
      const res = await statsFor(env, me.email, a, { fresh: fresh });
      if (res.ok) stats.push(res.stats);
      else problems.push({ account: a.key, name: a.name, error: graphError(res.res, lang) });
    }
    return json({ connected: true, accounts: publicAccounts(conn), stats: stats, problems: problems });
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
      res = await replyToComment(env, account, id, message);
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
  /* Planlagte innlegg                                                 */
  /* ---------------------------------------------------------------- */
  if (path === "plan" && request.method === "GET") {
    const conn = await readConnection(env, me.email);
    return json({ accounts: publicAccounts(conn), posts: await listPlan(env, me.email) });
  }

  if (path === "plan" && request.method === "POST") {
    let body; try { body = await request.json(); } catch (e) { return json({ error: "Ugyldig JSON" }, 400); }
    const lang = langOf(request, body);
    const conn = await readConnection(env, me.email);
    if (!conn) return json({ error: L(lang, "Koble til kontoene dine først.", "Connect your accounts first.") }, 400);

    const targets = (Array.isArray(body.targets) ? body.targets : [])
      .filter((k) => !!findAccount(conn, k));
    if (!targets.length) return json({ error: L(lang, "Velg minst én konto.", "Pick at least one account.") }, 400);

    const text = String(body.text || "").trim();
    const imageUrl = String(body.imageUrl || "").trim();
    if (!text && !imageUrl) return json({ error: L(lang, "Skriv en tekst eller legg til et bilde.", "Write some text or add an image.") }, 400);
    if (text.length > 5000) return json({ error: L(lang, "Teksten er for lang.", "The text is too long.") }, 400);

    // Instagram krever bilde. Bedre å si det med en gang enn å la innlegget
    // feile stille klokka syv om morgenen.
    const igWithoutImage = targets.some((k) => k.indexOf("ig:") === 0) && !imageUrl;
    if (igWithoutImage) {
      return json({ error: L(lang,
        "Instagram trenger et bilde. Legg til et, eller velg bare Facebook.",
        "Instagram needs an image. Add one, or pick Facebook only.") }, 400);
    }

    const now = Date.now();
    const whenRaw = String(body.when || "").trim();
    const when = whenRaw ? new Date(whenRaw) : new Date(now);
    if (isNaN(when.getTime())) return json({ error: L(lang, "Ugyldig tidspunkt.", "Invalid time.") }, 400);
    if (when.getTime() > now + 1000 * 60 * 60 * 24 * 180) {
      return json({ error: L(lang, "Velg et tidspunkt innen seks måneder.", "Pick a time within six months.") }, 400);
    }

    const post = {
      id: crypto.randomUUID().replace(/-/g, "").slice(0, 16),
      text: text, imageUrl: imageUrl, targets: targets,
      when: when.toISOString(), status: "planlagt",
      created: new Date().toISOString(), results: [],
    };

    // Tidspunkt i fortiden, eller "nå": publiser med én gang i stedet for å
    // vente på neste runde av bakgrunnsjobben.
    if (when.getTime() <= now + 60000) {
      await writePlan(env, me.email, post);
      const done = await runPlan(env, me.email, post, conn, lang);
      return json({ ok: true, post: done, published: true });
    }
    await writePlan(env, me.email, post);
    return json({ ok: true, post: post });
  }

  if (path === "plan-delete" && request.method === "POST") {
    let body; try { body = await request.json(); } catch (e) { return json({ error: "Ugyldig JSON" }, 400); }
    const id = String((body && body.id) || "").trim();
    if (!id) return json({ error: "Mangler id." }, 400);
    await deletePlan(env, me.email, id);
    return json({ ok: true });
  }

  if (path === "publish" && request.method === "POST") {
    let body; try { body = await request.json(); } catch (e) { return json({ error: "Ugyldig JSON" }, 400); }
    const lang = langOf(request, body);
    const post = await readPlan(env, me.email, String((body && body.id) || ""));
    if (!post) return json({ error: L(lang, "Fant ikke innlegget.", "Post not found.") }, 404);
    if (post.status !== "planlagt") {
      return json({ error: L(lang, "Innlegget er allerede publisert.", "That post is already published.") }, 400);
    }
    const conn = await readConnection(env, me.email);
    if (!conn) return json({ error: L(lang, "Koble til kontoene dine først.", "Connect your accounts first.") }, 400);
    const done = await runPlan(env, me.email, post, conn, lang);
    return json({ ok: true, post: done });
  }

  /* ---------------------------------------------------------------- */
  /* Automatisering                                                    */
  /* ---------------------------------------------------------------- */
  if (path === "rules" && request.method === "GET") {
    const conn = await readConnection(env, me.email);
    return json({ accounts: publicAccounts(conn), rules: await readRules(env, me.email) });
  }

  if (path === "rules" && request.method === "POST") {
    let body; try { body = await request.json(); } catch (e) { return json({ error: "Ugyldig JSON" }, 400); }
    const lang = langOf(request, body);
    const raw = Array.isArray(body.rules) ? body.rules : [];
    if (raw.length > 20) return json({ error: L(lang, "Maks 20 regler.", "Maximum 20 rules.") }, 400);
    const conn = await readConnection(env, me.email);
    const rules = raw.slice(0, 20).map((r, i) => ({
      id: String(r.id || "").trim() || ("r" + Date.now() + i),
      name: String(r.name || "").trim().slice(0, 80),
      on: r.on !== false,
      accounts: (Array.isArray(r.accounts) ? r.accounts : []).filter((k) => !!findAccount(conn, k)),
      keywords: (Array.isArray(r.keywords) ? r.keywords : [])
        .map((w) => String(w).trim().slice(0, 40)).filter(Boolean).slice(0, 12),
      reply: String(r.reply || "").trim().slice(0, 1000),
      dm: String(r.dm || "").trim().slice(0, 1000),
      dmLink: String(r.dmLink || "").trim().slice(0, 300),
    })).filter((r) => r.reply || r.dm);
    await writeRules(env, me.email, rules);
    return json({ ok: true, rules: rules });
  }

  if (path === "run" && request.method === "POST") {
    let body; try { body = await request.json(); } catch (e) { body = {}; }
    const lang = langOf(request, body);
    const conn = await readConnection(env, me.email);
    if (!conn) return json({ error: L(lang, "Koble til kontoene dine først.", "Connect your accounts first.") }, 400);
    // Én manuell kjøring i minuttet holder. Uten dette kan en utålmodig
    // finger tømme Metas timegrense på under et minutt.
    const gate = await checkLimit(env, { area: "social-run", who: callerKey(request, me.email), limit: 20, hours: 1 });
    if (!gate.ok) {
      return json({ error: L(lang, "Vent litt før du kjører automatiseringen igjen.", "Wait a moment before running the automation again.") }, 429);
    }
    const rules = await readRules(env, me.email);
    const res = await runAutomation(env, me.email, conn, rules, lang);
    return json({ ok: true, result: res });
  }

  /* ---------------------------------------------------------------- */
  /* Forslag fra Claude (svar, innlegg eller DM)                       */
  /* ---------------------------------------------------------------- */
  if (path === "ai" && request.method === "POST") {
    let body; try { body = await request.json(); } catch (e) { return json({ error: "Ugyldig JSON" }, 400); }
    const lang = langOf(request, body);
    const feil = L(lang, "Fikk ikke laget et forslag. Prøv igjen.", "Could not create a suggestion. Try again.");
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: L(lang, "Forslag er ikke tilgjengelig akkurat nå.", "Suggestions are not available right now.") }, 503);
    }

    const mode = ["reply", "post", "dm"].indexOf(String(body.mode || "reply")) !== -1
      ? String(body.mode) : "reply";
    const text = String(body.text || "").trim().slice(0, 900);
    if (!text) return json({ error: L(lang, "Skriv noe å jobbe ut fra først.", "Write something to work from first.") }, 400);
    const context2 = String(body.context || "").trim().slice(0, 300);

    // Kostnadsvern: et forslag koster lite, men uten en grense kan én bruker
    // trykke tusen ganger. Eier har ingen grense.
    const gate = await checkLimit(env, {
      area: "social-ai", who: callerKey(request, me.email),
      limit: me.owner ? 0 : 80, hours: 24,
    });
    if (!gate.ok) {
      return json({ error: L(lang,
        "Du har brukt opp forslagene for i dag. De nullstilles om " + gate.resetInHours + " timer.",
        "You have used up today's suggestions. They reset in " + gate.resetInHours + " hours.") }, 429);
    }

    const felles =
      " Skriv som skaperen selv, i jeg-form, aldri vi. Bruk rette anførselstegn oppe, aldri " +
      "vinkel-anførselstegn. Bruk aldri tankestrek eller lang bindestrek, bruk komma, kolon " +
      "eller punktum i stedet. Ikke lov noe, ikke oppgi priser og ikke dikt opp fakta. " +
      "Svar KUN med selve teksten, ingen forklaring og ingen overskrift.";
    const tones = {
      varm: "varm og personlig", kort: "kort og vennlig",
      takk: "takknemlig", svar: "hjelpsom, og svarer på spørsmålet",
    };
    const tone = tones[String(body.tone || "varm")] || tones.varm;

    let system, user;
    if (mode === "post") {
      system = "Du hjelper en innholdsskaper med å skrive et innlegg til Facebook og Instagram." +
        " Tonen skal være " + tone + ". Skriv på " + L(lang, "norsk (bokmål)", "English") + "." +
        " Start med en linje som fanger oppmerksomheten, hold det til fire korte avsnitt," +
        " og avslutt med en enkel oppfordring til å kommentere. Høyst tre hashtags til slutt." +
        felles;
      user = "Innlegget skal handle om: " + text;
    } else if (mode === "dm") {
      system = "Du hjelper en innholdsskaper med å skrive en kort DM som sendes automatisk" +
        " til den som kommenterer med et bestemt nøkkelord. Tonen skal være " + tone + "." +
        " Skriv på " + L(lang, "norsk (bokmål)", "English") + ". Maks tre setninger, personlig," +
        " og gjør det tydelig hva mottakeren får." + felles;
      user = "DM-en gjelder: " + text + (context2 ? "\nNøkkelord: " + context2 : "");
    } else {
      system = "Du hjelper en innholdsskaper med å svare på en kommentar på Facebook eller" +
        " Instagram. Tonen skal være " + tone + ". Svar på SAMME språk som kommentaren er" +
        " skrevet på. Maks to setninger. Ingen hashtags, ingen emoji-regn (høyst én emoji, og" +
        " bare hvis det passer). Er kommentaren negativ, svar rolig og vennlig uten å krangle." +
        felles;
      user = (context2 ? "Innlegget handler om: " + context2 + "\n\n" : "") + "Kommentaren: " + text;
    }

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
          model: "claude-sonnet-5", max_tokens: mode === "post" ? 700 : 300, system: system,
          messages: [{ role: "user", content: user }],
        }),
      });
      clearTimeout(timer);
    } catch (e) {
      return json({ error: feil }, 502);
    }
    const data = await resp.json().catch(() => null);
    if (!resp.ok || !data) return json({ error: feil }, 502);
    const out = ((data.content || []).map((c) => c.text || "").join("")).trim();
    await logUsage(env, {
      app: "planlegger", task: "text", modelId: "claude-sonnet-5", email: me.email,
      units: anthropicUnits(data), status: "ok", ms: Date.now() - t0,
      note: mode === "post" ? "Innleggsforslag" : mode === "dm" ? "DM-forslag" : "Svarforslag",
    });
    if (!out) return json({ error: feil }, 502);
    return json({ ok: true, text: out });
  }

  return json({ error: "Ukjent endepunkt." }, 404);
}
