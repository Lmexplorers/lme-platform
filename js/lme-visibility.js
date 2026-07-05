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

  function lang() {
    try { if (localStorage.getItem("lme-lang") === "en") return "en"; } catch (e) {}
    return (document.documentElement.lang || "no").slice(0, 2) === "en" ? "en" : "no";
  }
  var NO = { no: true };
  function T(no, en) { return lang() === "en" ? en : no; }

  var CHANNELS = [
    { key: "instagram", ico: "📸", no: "Instagram", en: "Instagram" },
    { key: "facebook", ico: "👍", no: "Facebook", en: "Facebook" },
    { key: "pinterest", ico: "📌", no: "Pinterest", en: "Pinterest" },
    { key: "tiktok", ico: "🎵", no: "TikTok", en: "TikTok" },
    { key: "reelScript", ico: "🎬", no: "Reel-manus", en: "Reel script" },
    { key: "email", ico: "✉️", no: "E-post", en: "Email" },
  ];

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
      '<p class="lme-vis-note">' + T("Ingenting deles automatisk. Du kopierer og limer inn der du vil.", "Nothing is shared automatically. You copy and paste where you like.") + '</p>' +
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
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function close() { if (overlay) { overlay.classList.remove("show"); document.body.style.overflow = ""; } }

  function cardHTML(ch, text) {
    if (!text) return "";
    var name = T(ch.no, ch.en);
    return '<div class="lme-vis-card"><div class="top"><span>' + ch.ico + '</span><b>' + name + '</b>' +
      '<button class="lme-vis-copy" data-copy>' + T("Kopier", "Copy") + '</button></div>' +
      '<div class="txt">' + esc(text) + '</div></div>';
  }

  function run() {
    var s = (overlay && overlay.__share) || readShare();
    var article = ((s.title ? s.title + ". " : "") + (s.text || "")).trim();
    if (!article) { resultsEl.innerHTML = '<p class="lme-vis-note">' + T("Fant ikke tekst å dele fra denne siden.", "No text found to share from this page.") + "</p>"; return; }
    goBtn.disabled = true;
    var label = goBtn.innerHTML;
    goBtn.innerHTML = '<span class="lme-vis-sp"></span> ' + T("Lager…", "Creating…");
    resultsEl.innerHTML = "";
    fetch(BASE + "/ai/repurpose", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article: article.slice(0, 6000), lang: lang() }),
    }).then(function (r) { return r.json(); }).then(function (d) {
      goBtn.disabled = false; goBtn.innerHTML = label;
      var out = d && d.result;
      if (typeof out === "string") { var m = out.match(/\{[\s\S]*\}/); out = JSON.parse(m ? m[0] : out); }
      if (!out || typeof out !== "object") throw new Error("bad");
      var html = "";
      CHANNELS.forEach(function (ch) { html += cardHTML(ch, out[ch.key]); });
      resultsEl.innerHTML = html || ('<p class="lme-vis-note">' + T("Ingen forslag denne gangen. Prøv igjen.", "No suggestions this time. Try again.") + "</p>");
      resultsEl.querySelectorAll("[data-copy]").forEach(function (b) {
        b.addEventListener("click", function () {
          var txt = b.closest(".lme-vis-card").querySelector(".txt").innerText;
          try { navigator.clipboard.writeText(txt); } catch (e) {}
          var o = b.textContent; b.textContent = T("Kopiert!", "Copied!"); setTimeout(function () { b.textContent = o; }, 1400);
        });
      });
    }).catch(function () {
      goBtn.disabled = false; goBtn.innerHTML = label;
      resultsEl.innerHTML = '<p class="lme-vis-note">' + T("Kunne ikke lage delinger akkurat nå. Prøv igjen om litt.", "Could not create posts right now. Try again shortly.") + "</p>";
    });
  }

  /* ---------- trigger ---------- */
  function mount() {
    injectStyles();
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
