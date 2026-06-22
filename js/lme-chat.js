/* =========================================================
   LME gruppe-chat (delt klient)
   - Krever innlogging + Inner Circle-medlemskap (sjekkes mot
     /api/group/access).
   - Naer-live: henter nye meldinger hvert par sekund.
   - Klar for ekte WebSocket: sett window.LME_CHAT_LIVE = true og
     window.LME_CHAT_WS_PATH (f.eks. "/api/chat-ws") naar Durable
     Objects-workeren er satt opp. Da brukes WebSocket i stedet for
     polling. Faller automatisk tilbake til polling ved feil.

   Siden setter:
     window.LME_GROUP_ID   = "3-6";
     window.LME_GROUP_NAME = "3–6 år";
   og har et tomt element <div id="lme-chat"></div>.
   ========================================================= */
(function () {
  var GID = window.LME_GROUP_ID;
  var GNAME = window.LME_GROUP_NAME || "Gruppe";
  var root = document.getElementById("lme-chat");
  if (!GID || !root) return;

  var POLL_MS = 3000;
  var lastTs = 0;
  var seen = {};
  var pollTimer = null;
  var ws = null;
  var meName = null;

  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  function lang() { try { return localStorage.getItem("lme_lang") || "no"; } catch (e) { return "no"; } }
  function t(no, en) { return lang() === "en" ? en : no; }

  function timeLabel(ts) {
    try {
      var d = new Date(ts);
      return d.toLocaleTimeString(lang() === "en" ? "en-GB" : "nb-NO", { hour: "2-digit", minute: "2-digit" });
    } catch (e) { return ""; }
  }

  /* ---------- Porter (ikke innlogget / ikke medlem) ---------- */
  function renderGate(state) {
    var loginNext = "/login?next=" + encodeURIComponent(location.pathname);
    var title, body, actions;
    if (!state.loggedIn) {
      title = t("Logg inn for å delta", "Log in to take part");
      body = t(
        "Gruppene er et trygt rom for Inner Circle-medlemmer. Logg inn for å se og skrive i " + GNAME + ".",
        "The groups are a safe space for Inner Circle members. Log in to view and post in " + GNAME + "."
      );
      actions =
        '<a class="lme-chat-btn primary" href="' + loginNext + '">' + t("Logg inn", "Log in") + '</a>' +
        '<a class="lme-chat-btn" href="https://buy.stripe.com/14A3cw5RXbjxcupapp9R60x">' + t("Bli med i Inner Circle", "Join Inner Circle") + '</a>';
    } else {
      title = t("Dette er for Inner Circle-medlemmer", "This is for Inner Circle members");
      body = t(
        "Du er logget inn, men gruppene er en del av Inner Circle. Bli medlem for å skrive med de andre i " + GNAME + ".",
        "You're logged in, but the groups are part of Inner Circle. Become a member to chat with the others in " + GNAME + "."
      );
      actions =
        '<a class="lme-chat-btn primary" href="https://buy.stripe.com/14A3cw5RXbjxcupapp9R60x">' + t("Bli med i Inner Circle", "Join Inner Circle") + '</a>' +
        '<a class="lme-chat-btn" href="/community#fordeler">' + t("Se hva som inngår", "See what's included") + '</a>';
    }
    root.innerHTML =
      '<div class="lme-chat-gate">' +
        '<div class="lme-chat-gate-icon">♡</div>' +
        '<h2>' + esc(title) + '</h2>' +
        '<p>' + esc(body) + '</p>' +
        '<div class="lme-chat-gate-actions">' + actions + '</div>' +
      '</div>';
  }

  /* ---------- Chat-skall ---------- */
  function renderShell() {
    root.innerHTML =
      '<div class="lme-chat-wrap">' +
        '<div class="lme-chat-stream" id="lme-chat-stream">' +
          '<div class="lme-chat-empty" id="lme-chat-empty">' +
            esc(t("Ingen meldinger ennå. Vær den første som skriver noe 💛", "No messages yet. Be the first to write something 💛")) +
          '</div>' +
        '</div>' +
        '<form class="lme-chat-form" id="lme-chat-form">' +
          '<input type="text" id="lme-chat-input" autocomplete="off" maxlength="1000" ' +
            'placeholder="' + esc(t("Skriv en melding…", "Write a message…")) + '">' +
          '<button type="submit" class="lme-chat-send">' + esc(t("Send", "Send")) + '</button>' +
        '</form>' +
        '<p class="lme-chat-note" id="lme-chat-note"></p>' +
      '</div>';

    document.getElementById("lme-chat-form").addEventListener("submit", onSend);
  }

  function streamEl() { return document.getElementById("lme-chat-stream"); }

  function appendMessage(m) {
    if (!m || seen[m.id]) return;
    seen[m.id] = true;
    if (m.ts > lastTs) lastTs = m.ts;
    var empty = document.getElementById("lme-chat-empty");
    if (empty) empty.remove();
    var mine = meName && m.n === meName;
    var el = document.createElement("div");
    el.className = "lme-msg" + (mine ? " mine" : "");
    el.innerHTML =
      '<div class="lme-msg-bubble">' +
        '<span class="lme-msg-name">' + esc(m.n) + '</span>' +
        '<span class="lme-msg-text">' + esc(m.t) + '</span>' +
        '<span class="lme-msg-time">' + esc(timeLabel(m.ts)) + '</span>' +
      '</div>';
    var s = streamEl();
    var atBottom = s.scrollHeight - s.scrollTop - s.clientHeight < 60;
    s.appendChild(el);
    if (atBottom || mine) s.scrollTop = s.scrollHeight;
  }

  /* ---------- Polling ---------- */
  function poll() {
    fetch("/api/group/" + GID + "/messages?after=" + lastTs, { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.messages) d.messages.forEach(appendMessage);
      })
      .catch(function () {});
  }

  function startPolling() {
    poll();
    pollTimer = setInterval(poll, POLL_MS);
  }

  /* ---------- Sending ---------- */
  function onSend(e) {
    e.preventDefault();
    var input = document.getElementById("lme-chat-input");
    var text = (input.value || "").trim();
    if (!text) return;
    input.value = "";
    // Live: send over WebSocket og la kringkastingen tegne meldingen.
    if (ws && ws.readyState === 1) {
      try { ws.send(JSON.stringify({ text: text })); return; } catch (e) {}
    }
    fetch("/api/group/" + GID + "/messages", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok && d.message) {
          appendMessage(d.message);
        } else if (d && d.error === "forbidden") {
          note(t("Du må være medlem for å skrive.", "You must be a member to post."));
        }
      })
      .catch(function () { note(t("Klarte ikke å sende. Prøv igjen.", "Couldn't send. Try again.")); });
  }

  function note(msg) {
    var n = document.getElementById("lme-chat-note");
    if (n) { n.textContent = msg; setTimeout(function () { if (n.textContent === msg) n.textContent = ""; }, 4000); }
  }

  /* ---------- WebSocket-oppgradering (valgfri) ---------- */
  function startLive() {
    try {
      var base = window.LME_CHAT_WS_PATH || "/api/chat-ws";
      var proto = location.protocol === "https:" ? "wss://" : "ws://";
      ws = new WebSocket(proto + location.host + base + "/room/" + GID);
      var fellBack = false;
      var fallback = function () { if (!fellBack) { fellBack = true; startPolling(); } };
      ws.addEventListener("open", function () { /* historikk kommer som meldinger */ });
      ws.addEventListener("message", function (ev) {
        try {
          var data = JSON.parse(ev.data);
          if (Array.isArray(data)) data.forEach(appendMessage);
          else appendMessage(data);
        } catch (e) {}
      });
      ws.addEventListener("error", fallback);
      ws.addEventListener("close", fallback);
      // Send via WS naar tilgjengelig, ellers POST (POST funker uansett).
    } catch (e) { startPolling(); }
  }

  /* ---------- Oppstart ---------- */
  fetch("/api/group/access", { credentials: "same-origin" })
    .then(function (r) { return r.json(); })
    .then(function (state) {
      if (!state || !state.member) { renderGate(state || {}); return; }
      meName = state.name || (state.email ? state.email.split("@")[0] : null);
      renderShell();
      if (window.LME_CHAT_LIVE) startLive(); else startPolling();
    })
    .catch(function () { renderGate({ loggedIn: false }); });
})();
