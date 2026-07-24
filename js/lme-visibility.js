/* =========================================================
   LME "Gjoer synlig" — delt delings-hjelper (AI Visibility)
   ---------------------------------------------------------
   Legg denne paa en hvilken som helst side, saa faar du en liten
   "Gjoer synlig"-knapp. Den leser innholdet paa siden og gir deg
   ferdige versjoner til Instagram, Facebook, Pinterest, TikTok,
   reel og e-post, med kopier-knapp. Ingen ny app, ingenting aa
   skrive paa nytt.

   Bruk:
     <script src="/js/lme-visibility.js" defer></script>

   Valgfritt, om du vil styre hva som deles fra siden:
     window.LME_SHARE = { title: "...", text: "...", image: "..." };
     (eller en funksjon som returnerer det samme objektet)

   Motoren (AI Visibility-workeren) kan overstyres med:
     window.LME_VISIBILITY_BASE = "https://.../";
   ========================================================= */
(function () {
  if (window.__lmeVisibilityLoaded) return;
  window.__lmeVisibilityLoaded = true;

  var BASE = (window.LME_VISIBILITY_BASE || "https://lme-ai-visibility.lmexplorers.workers.dev").replace(/\/$/, "");
  // Autopublisering styres nå fra plattformen selv (samme-origin), slik at
  // Renate kan koble til Blotato ved å lime inn nøkkelen i appen, uten Cloudflare.
  var BL_API = "/api/blotato";

  function lang() {
    try { if (localStorage.getItem("lme-lang") === "en") return "en"; } catch (e) {}
    return (document.documentElement.lang || "no").slice(0, 2) === "en" ? "en" : "no";
  }
  var NO = { no: true };
  function T(no, en) { return lang() === "en" ? en : no; }

  // tt = Blotato-targetType (kan publiseres automatisk). needsMedia = krever
  // bilde. extra = ekstra felt Blotato trenger. Samme oppsett som "Publiser alle".
  var CHANNELS = [
    { key: "instagram", ico: "📸", no: "Instagram", en: "Instagram", tt: "instagram", needsMedia: true },
    { key: "facebook", ico: "👍", no: "Facebook", en: "Facebook", tt: "facebook", needsMedia: false, extra: ["pageId"] },
    { key: "pinterest", ico: "📌", no: "Pinterest", en: "Pinterest", tt: "pinterest", needsMedia: true, extra: ["boardId"] },
    { key: "tiktok", ico: "🎵", no: "TikTok", en: "TikTok", tt: "tiktok", needsMedia: true },
    { key: "reelScript", ico: "🎬", no: "Reel-manus", en: "Reel script" },
    { key: "email", ico: "✉️", no: "E-post", en: "Email" },
  ];

  // Kontoene er allerede koblet i Blotato. Workeren henter dem med sin
  // server-nøkkel, så dialogen trenger ingen manuell konto-ID.
  var BL_MAP = null; // plattform -> { accountId, pageId }
  function fetchBlAccounts() {
    if (BL_MAP) return Promise.resolve(BL_MAP);
    return fetch(BL_API + "/accounts", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}" })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.error) throw new Error(res.error);
        var list = (res && res.result && (res.result.items || res.result.accounts || res.result)) || [];
        var map = {};
        (Array.isArray(list) ? list : []).forEach(function (a) {
          var plat = String(a.platform || a.type || a.targetType || "").toLowerCase();
          if (!plat || map[plat]) return; // første konto per plattform
          map[plat] = { accountId: String(a.id || a.accountId || ""), pageId: a.pageId ? String(a.pageId) : undefined };
        });
        BL_MAP = map; return map;
      })
      .catch(function () { return {}; });
  }
  function buildPost(ch, text, imgUrl) {
    var conf = (BL_MAP && BL_MAP[ch.tt]) || null;
    if (!conf || !conf.accountId) return { err: T("Fant ikke kontoen i Blotato", "Account not found in Blotato") };
    if (ch.needsMedia && !imgUrl) return { err: T("Mangler bilde på siden", "No image on this page") };
    var target = { targetType: ch.tt };
    if (ch.tt === "facebook" && conf.pageId) target.pageId = conf.pageId;
    var content = { text: String(text), platform: ch.tt };
    if (imgUrl) content.mediaUrls = [imgUrl];
    return { label: ch.no, post: { accountId: conf.accountId, content: content, target: target } };
  }

  /* ---------- hent innholdet paa siden ---------- */
  function readShare() {
    var s = window.LME_SHARE;
    if (typeof s === "function") { try { s = s(); } catch (e) { s = null; } }
    if (s && (s.title || s.text)) return s;
    // Auto: overskrift + hovedtekst + foerste bilde.
    var title = (document.querySelector("h1") || {}).innerText ||
      (document.querySelector('meta[property="og:title"]') || {}).content ||
      document.title || "";
    var text = "";
    var main = document.querySelector("main, article, .wrap, .content, section");
    if (main) text = main.innerText || "";
    if (!text) text = (document.querySelector('meta[name="description"]') || {}).content || "";
    text = text.replace(/\s+/g, " ").trim().slice(0, 4000);
    var img = (document.querySelector('meta[property="og:image"]') || {}).content ||
      (document.querySelector("img") || {}).src || "";
    return { title: (title || "").trim(), text: text, image: img };
  }

  /* ---------- stiler ---------- */
  function injectStyles() {
    if (document.getElementById("lme-vis-css")) return;
    var css = document.createElement("style");
    css.id = "lme-vis-css";
    css.textContent = [
      ".lme-vis-fab{position:fixed;right:18px;bottom:18px;z-index:2147483000;",
      "font-family:'Playpen Sans',system-ui,sans-serif;font-weight:700;font-size:14px;cursor:pointer;",
      "border:none;border-radius:999px;padding:12px 18px;color:#fff;display:flex;align-items:center;gap:8px;",
      "background:linear-gradient(120deg,#e85a92,#c43d75);box-shadow:0 12px 30px -10px rgba(196,61,117,.6);}",
      ".lme-vis-fab:hover{transform:translateY(-2px);}",
      ".lme-vis-ov{position:fixed;inset:0;z-index:2147483001;background:rgba(61,36,56,.45);",
      "backdrop-filter:blur(3px);display:none;align-items:flex-end;justify-content:center;}",
      ".lme-vis-ov.show{display:flex;}",
      "@media(min-width:640px){.lme-vis-ov{align-items:center;}}",
      ".lme-vis-panel{background:#fffcf9;color:#3d2438;width:100%;max-width:620px;max-height:88vh;overflow:auto;",
      "border-radius:22px 22px 0 0;box-shadow:0 -10px 40px rgba(61,36,56,.3);font-family:'Sasson Montessori','Playpen Sans',system-ui,sans-serif;}",
      "@media(min-width:640px){.lme-vis-panel{border-radius:22px;}}",
      ".lme-vis-hd{position:sticky;top:0;background:#fffcf9;display:flex;align-items:center;gap:12px;",
      "padding:18px 22px;border-bottom:1px solid #f0dde6;}",
      ".lme-vis-hd h3{margin:0;font-family:'Playpen Sans',system-ui,sans-serif;font-size:18px;font-weight:800;color:#3d2438;flex:1;}",
      ".lme-vis-hd .sub{font-size:12px;color:#9a8693;font-weight:400;display:block;}",
      ".lme-vis-x{border:none;background:#ffe8f0;color:#c43d75;width:34px;height:34px;border-radius:50%;font-size:18px;cursor:pointer;}",
      ".lme-vis-body{padding:18px 22px 26px;}",
      ".lme-vis-src{font-size:13px;color:#6b4760;background:#fff5f8;border:1px solid #ffd1e1;border-radius:14px;padding:12px 14px;margin-bottom:16px;}",
      ".lme-vis-src b{color:#c43d75;}",
      ".lme-vis-go{font-family:'Playpen Sans',system-ui,sans-serif;font-weight:700;font-size:15px;border:none;cursor:pointer;",
      "border-radius:999px;padding:12px 20px;color:#fff;background:linear-gradient(120deg,#e85a92,#c43d75);width:100%;}",
      ".lme-vis-go:disabled{opacity:.6;}",
      ".lme-vis-card{border:1px solid #f0dde6;border-radius:16px;padding:14px 16px;margin-top:12px;background:#fff;}",
      ".lme-vis-card .top{display:flex;align-items:center;gap:8px;margin-bottom:8px;}",
      ".lme-vis-card .top b{font-family:'Playpen Sans',system-ui,sans-serif;font-size:14px;flex:1;}",
      ".lme-vis-card .txt{font-size:14px;line-height:1.55;white-space:pre-wrap;color:#3d2438;}",
      ".lme-vis-copy{border:1.5px solid #ffd1e1;background:#fff;color:#c43d75;font-family:'Playpen Sans',system-ui,sans-serif;",
      "font-weight:700;font-size:12px;border-radius:999px;padding:6px 12px;cursor:pointer;}",
      ".lme-vis-copy:hover{background:#ffe8f0;}",
      ".lme-vis-pub{border:none;background:linear-gradient(120deg,#e85a92,#c43d75);color:#fff;",
      "font-family:'Playpen Sans',system-ui,sans-serif;font-weight:700;font-size:12px;border-radius:999px;",
      "padding:6px 12px;cursor:pointer;margin-right:6px;}",
      ".lme-vis-pub:hover{filter:brightness(1.05);}",
      ".lme-vis-pub:disabled{opacity:.7;cursor:default;}",
      ".lme-vis-pubmsg{font-size:12.5px;color:#6b4760;margin-top:8px;}",
      ".lme-vis-note{font-size:13px;color:#9a8693;margin:14px 0 0;text-align:center;}",
      ".lme-vis-sp{display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,.5);",
      "border-top-color:#fff;border-radius:50%;animation:lmevisspin .7s linear infinite;vertical-align:-2px;}",
      "@keyframes lmevisspin{to{transform:rotate(360deg)}}",
    ].join("");
    document.head.appendChild(css);
  }

  /* ---------- bygg UI ---------- */
  var overlay, panel, resultsEl, goBtn, srcEl;

  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function buildPanel() {
    overlay = document.createElement("div");
    overlay.className = "lme-vis-ov";
    overlay.innerHTML =
      '<div class="lme-vis-panel" role="dialog" aria-modal="true">' +
      '<div class="lme-vis-hd"><h3>' + T("Gjør synlig", "Make it visible") +
      '<span class="sub">' + T("Klar til deling: Instagram, Facebook, Pinterest, TikTok og mer", "Ready to share: Instagram, Facebook, Pinterest, TikTok and more") + '</span></h3>' +
      '<button class="lme-vis-x" aria-label="Lukk">×</button></div>' +
      '<div class="lme-vis-body">' +
      '<div class="lme-vis-src"></div>' +
      '<button class="lme-vis-go">✨ ' + T("Lag ferdige delinger", "Create ready-to-share posts") + '</button>' +
      '<div class="lme-vis-results"></div>' +
      '<p class="lme-vis-note" id="lmeVisFoot"></p>' +
      '</div></div>';
    document.body.appendChild(overlay);
    panel = overlay.querySelector(".lme-vis-panel");
    resultsEl = overlay.querySelector(".lme-vis-results");
    goBtn = overlay.querySelector(".lme-vis-go");
    srcEl = overlay.querySelector(".lme-vis-src");
    overlay.querySelector(".lme-vis-x").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    goBtn.addEventListener("click", run);
  }

  function open() {
    if (!overlay) buildPanel();
    var s = readShare();
    overlay.__share = s;
    srcEl.innerHTML = "<b>" + T("Fra denne siden:", "From this page:") + "</b> " +
      esc((s.title || T("(uten tittel)", "(no title)"))) +
      (s.text ? '<br><span style="color:#9a8693">' + esc(s.text.slice(0, 160)) + (s.text.length > 160 ? "…" : "") + "</span>" : "");
    resultsEl.innerHTML = "";
    var foot = overlay.querySelector("#lmeVisFoot");
    if (foot) {
      foot.textContent = T("Kopier og lim inn, eller trykk 📣 Publiser for å legge ut automatisk.",
        "Copy and paste, or tap 📣 Publish to post automatically.");
    }
    fetchBlAccounts().then(function (map) { // varm opp kontoene fra Blotato
      if (foot && (!map || !Object.keys(map).length)) {
        offerBlotatoSetup(foot);
      }
    });
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function close() { if (overlay) { overlay.classList.remove("show"); document.body.style.overflow = ""; } }

  // Autopublisering er ikke koblet til. Er du eier, får du lime inn Blotato-
  // nøkkelen her og slå det på med en gang. Ellers en vennlig kopier/lim-melding.
  function offerBlotatoSetup(foot) {
    var generic = T(
      "⚠️ Autopublisering er ikke koblet til enda. Du kan kopiere og lime inn i mellomtiden.",
      "⚠️ Auto-publishing isn't connected yet. You can copy and paste in the meantime.");
    foot.textContent = T("Sjekker kobling …", "Checking connection …");
    fetch(BL_API + "/status", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (st) {
        if (!st || !st.owner) { foot.textContent = generic; return; }
        if (st.hasKey && !st.connected) {
          foot.textContent = T(
            "⚠️ Nøkkelen er lagret, men ingen kontoer er koblet til i Blotato ennå. Koble til Instagram/Facebook/TikTok inne på blotato.com, så er du klar.",
            "⚠️ The key is saved, but no accounts are connected in Blotato yet. Connect Instagram/Facebook/TikTok inside blotato.com and you're ready.");
          return;
        }
        // Eier, ingen nøkkel: la henne lime den inn her.
        foot.innerHTML = "";
        var lbl = document.createElement("div");
        lbl.style.cssText = "margin-bottom:6px;font-weight:700;color:#C2185B";
        lbl.textContent = T("Koble til autopublisering", "Connect auto-publishing");
        var hint = document.createElement("div");
        hint.style.cssText = "margin-bottom:8px;color:#9a8693;font-size:13px";
        hint.textContent = T(
          "Lim inn Blotato-nøkkelen din (blotato.com, under API). Den lagres trygt på serveren.",
          "Paste your Blotato key (blotato.com, under API). It's stored safely on the server.");
        var row = document.createElement("div");
        row.style.cssText = "display:flex;gap:8px;flex-wrap:wrap";
        var inp = document.createElement("input");
        inp.type = "password"; inp.placeholder = T("Blotato-nøkkel", "Blotato key");
        inp.style.cssText = "flex:1;min-width:180px;padding:9px 12px;border:1px solid #f0c9d8;border-radius:10px;font-family:inherit";
        var save = document.createElement("button");
        save.textContent = T("Lagre og koble til", "Save and connect");
        save.style.cssText = "background:linear-gradient(120deg,#E91E89,#ff5fb0);color:#fff;font-weight:800;border:0;border-radius:999px;padding:9px 18px;cursor:pointer;font-family:inherit";
        save.addEventListener("click", function () {
          var key = (inp.value || "").trim();
          if (!key) { inp.focus(); return; }
          save.disabled = true; save.textContent = T("Kobler til …", "Connecting …");
          fetch(BL_API + "/key", {
            method: "POST", credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: key }),
          }).then(function (r) { return r.json(); }).then(function (d) {
            if (d && d.ok && d.connected) {
              BL_MAP = null; // tving ny henting av kontoer
              foot.textContent = "✓ " + T("Koblet til! Lukk og åpne denne igjen for Publiser-knappene.",
                "Connected! Close and reopen this to see the Publish buttons.");
            } else if (d && d.ok && d.hasKey) {
              foot.textContent = "✓ " + T(
                "Nøkkelen er lagret. Koble til kontoene dine inne på blotato.com, så dukker Publiser opp.",
                "Key saved. Connect your accounts inside blotato.com and Publish will appear.");
            } else {
              save.disabled = false; save.textContent = T("Prøv igjen", "Try again");
              foot.insertBefore(document.createTextNode(""), foot.firstChild);
            }
          }).catch(function () {
            save.disabled = false; save.textContent = T("Prøv igjen", "Try again");
          });
        });
        row.appendChild(inp); row.appendChild(save);
        foot.appendChild(lbl); foot.appendChild(hint); foot.appendChild(row);
      })
      .catch(function () { foot.textContent = generic; });
  }

  function cardHTML(ch, text) {
    if (!text) return "";
    var name = T(ch.no, ch.en);
    // Publiser-knapp på kanaler som kan autopubliseres og finnes i Blotato.
    var pub = "";
    if (ch.tt && BL_MAP && BL_MAP[ch.tt] && BL_MAP[ch.tt].accountId) {
      pub = '<button class="lme-vis-pub" data-pub="' + ch.key + '">📣 ' + T("Publiser", "Publish") + '</button>';
    }
    return '<div class="lme-vis-card" data-ch="' + esc(ch.key) + '"><div class="top"><span>' + ch.ico + '</span><b>' + name + '</b>' +
      pub +
      '<button class="lme-vis-copy" data-copy>' + T("Kopier", "Copy") + '</button></div>' +
      '<div class="txt">' + esc(text) + '</div>' +
      '<div class="lme-vis-pubmsg" hidden></div></div>';
  }

  // Publiser ett kort automatisk via den eksisterende Blotato-motoren.
  function publishCard(ch, btn) {
    var card = btn.closest(".lme-vis-card");
    var text = card.querySelector(".txt").innerText;
    var msg = card.querySelector(".lme-vis-pubmsg");
    var s = (overlay && overlay.__share) || readShare();
    var built = buildPost(ch, text, s.image || "");
    if (built.err) {
      msg.hidden = false; msg.textContent = "⚠️ " + built.err; return;
    }
    var old = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = '<span class="lme-vis-sp"></span> ' + T("Publiserer…", "Publishing…");
    msg.hidden = true;
    fetch(BL_API + "/publish", {
      method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ label: built.label, post: built.post }] }),
    }).then(function (r) { return r.json(); }).then(function (d) {
      var res = d && d.result && d.result.results && d.result.results[0];
      if (res && res.ok) {
        btn.innerHTML = "✓ " + T("Publisert", "Published");
        msg.hidden = false; msg.textContent = T("Lagt ut automatisk 🎉", "Posted automatically 🎉");
      } else {
        btn.disabled = false; btn.innerHTML = old;
        msg.hidden = false;
        msg.textContent = "⚠️ " + T("Klarte ikke å publisere. Sjekk kobling i Publiser alle.", "Could not publish. Check the connection in Publish all.");
      }
    }).catch(function () {
      btn.disabled = false; btn.innerHTML = old;
      msg.hidden = false; msg.textContent = "⚠️ " + T("Nettverksfeil. Prøv igjen.", "Network error. Try again.");
    });
  }

  function run() {
    var s = (overlay && overlay.__share) || readShare();
    var article = ((s.title ? s.title + ". " : "") + (s.text || "")).trim();
    // Fjern oppdiktede loefter (garanti, "14 dager", pengene tilbake) fra tekst
    // som kan komme fra en gammel bufret side, saa de aldri havner i det jeg lager.
    article = article.replace(/([.!?])\s+/g, "$1\n").split(/\n+/).filter(function (line) {
      return !/pengene[- ]?tilbake|penger tilbake|money[- ]?back|\b14 dag|garanti|guarantee|angrerett|refusjon|refund/i.test(line);
    }).join(" ").replace(/\s{2,}/g, " ").trim();
    if (!article) { resultsEl.innerHTML = '<p class="lme-vis-note">' + T("Fant ikke tekst å dele fra denne siden.", "No text found to share from this page.") + "</p>"; return; }
    goBtn.disabled = true;
    var label = goBtn.innerHTML;
    goBtn.innerHTML = '<span class="lme-vis-sp"></span> ' + T("Lager…", "Creating…");
    resultsEl.innerHTML = "";
    // Hent Blotato-kontoene i parallell så publiser-knappene er klare.
    Promise.all([
      // Bruker Pages-funksjonen på samme domene (deployer med siden), ikke den
      // separate workeren, så "Gjør synlig" alltid er oppdatert og tilgjengelig.
      fetch("/api/ai/repurpose", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article: article.slice(0, 6000), lang: lang() }),
      }).then(function (r) {
        return r.text().then(function (t) {
          var j = null; try { j = JSON.parse(t); } catch (e) {}
          if (!j) { var e2 = new Error("[repurpose " + r.status + ": " + (t || "").replace(/\s+/g, " ").slice(0, 60) + "]"); throw e2; }
          if (j.error) throw new Error("[" + (j.error) + (j.detail ? ": " + String(j.detail).slice(0, 80) : "") + "]");
          return j;
        });
      }),
      fetchBlAccounts(),
    ]).then(function (arr) {
      var d = arr[0];
      goBtn.disabled = false; goBtn.innerHTML = label;
      var out = d && d.result;
      if (typeof out === "string") { var m = out.match(/\{[\s\S]*\}/); out = JSON.parse(m ? m[0] : out); }
      if (!out || typeof out !== "object") throw new Error("bad");
      var html = "";
      // Lag reel automatisk av dette innholdet i Reel Studio.
      html += '<button class="lme-vis-go" style="margin:0 0 14px;" id="lmeVisReel">🎬 ' +
        T("Lag reel av dette", "Turn this into a reel") + "</button>";
      CHANNELS.forEach(function (ch) { html += cardHTML(ch, out[ch.key]); });
      resultsEl.innerHTML = html || ('<p class="lme-vis-note">' + T("Ingen forslag denne gangen. Prøv igjen.", "No suggestions this time. Try again.") + "</p>");
      var reelBtn = resultsEl.querySelector("#lmeVisReel");
      if (reelBtn) reelBtn.addEventListener("click", function () {
        try { localStorage.setItem("lme-reel-seed", article.slice(0, 4000)); } catch (e) {}
        // Fersk URL hver gang, så mobilen aldri åpner en gammel bufret Reel Studio.
        location.href = "/reel-studio?v=" + Date.now();
      });
      resultsEl.querySelectorAll("[data-copy]").forEach(function (b) {
        b.addEventListener("click", function () {
          var txt = b.closest(".lme-vis-card").querySelector(".txt").innerText;
          try { navigator.clipboard.writeText(txt); } catch (e) {}
          var o = b.textContent; b.textContent = T("Kopiert!", "Copied!"); setTimeout(function () { b.textContent = o; }, 1400);
        });
      });
      resultsEl.querySelectorAll("[data-pub]").forEach(function (b) {
        b.addEventListener("click", function () {
          var key = b.getAttribute("data-pub");
          var ch = CHANNELS.filter(function (x) { return x.key === key; })[0];
          if (ch) publishCard(ch, b);
        });
      });
    }).catch(function (e) {
      goBtn.disabled = false; goBtn.innerHTML = label;
      var why = (e && e.message && e.message !== "bad") ? " " + e.message : "";
      resultsEl.innerHTML = '<p class="lme-vis-note">' + T("Kunne ikke lage delinger akkurat nå. Prøv igjen om litt.", "Could not create posts right now. Try again shortly.") + why + "</p>";
    });
  }

  /* ---------- trigger ---------- */
  // Personvern-lenke i bunnen på hele plattforma (GDPR). Ikke på selve
  // personvern-siden, og aldri to ganger.
  function mountLegalFooter() {
    var path = (location.pathname || "").replace(/\/+$/, "");
    if (path === "/personvern") return;
    if (document.querySelector('a[href="/personvern"], a[href$="/personvern"]')) return;
    var link = '<a href="/personvern" style="color:inherit;opacity:.85;text-decoration:underline;font:inherit">' +
      T("Personvern", "Privacy") + "</a>";
    var footers = document.querySelectorAll("footer");
    if (footers.length) {
      var span = document.createElement("span");
      span.style.cssText = "display:inline-block;margin-left:12px;font-size:13px;opacity:.85";
      span.innerHTML = link;
      footers[footers.length - 1].appendChild(span);
      return;
    }
    // Ingen footer: en diskré linje nederst, i vanlig flyt (overlapper ingenting).
    var bar = document.createElement("div");
    bar.setAttribute("data-lme-legal", "1");
    bar.style.cssText = "text-align:center;padding:22px 16px;font-size:13px;color:#8a7a84;opacity:.9";
    bar.innerHTML = link;
    document.body.appendChild(bar);
  }

  function mount() {
    injectStyles();
    mountLegalFooter();
    // Egen knapp om siden har en, ellers en flytende knapp.
    var custom = document.querySelectorAll("[data-lme-visibility]");
    if (custom.length) {
      custom.forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); open(); }); });
    } else {
      var fab = document.createElement("button");
      fab.className = "lme-vis-fab";
      fab.type = "button";
      fab.innerHTML = "✨ <span>" + T("Gjør synlig", "Make visible") + "</span>";
      fab.addEventListener("click", open);
      document.body.appendChild(fab);
      window.__lmeVisFab = fab;
    }
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
