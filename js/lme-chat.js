/* =========================================================
   LME gruppe-chat (delt klient)
   - Krever innlogging + Inner Circle-medlemskap (/api/group/access).
   - Naer-live: henter meldinger hvert par sekund.
   - Messenger-aktig: emoji, kamera, bilde, fil, lyd (mikrofon) og
     reaksjoner (hjerte, tommel opp osv.).
   - Klar for WebSocket: window.LME_CHAT_LIVE + window.LME_CHAT_WS_PATH.

   Siden setter window.LME_GROUP_ID / window.LME_GROUP_NAME og har
   <div id="lme-chat"></div>. Alle stiler injiseres herfra.
   ========================================================= */
(function () {
  var GID = window.LME_GROUP_ID;
  var GNAME = window.LME_GROUP_NAME || "Gruppe";
  var root = document.getElementById("lme-chat");
  if (!GID || !root) return;

  var POLL_MS = 3000;
  var rendered = {};        // id -> { el, reactRow }
  var meName = null, meEmail = null, meOwner = false;
  var pollTimer = null, ws = null;
  var mediaRecorder = null, recChunks = [];
  var curPop = null;

  var COMPOSE_EMOJI = ["😊","😀","😍","🥰","😂","😉","😮","😢","😭","🙏","👍","👎","👏","🙌","💪","🌸","🌿","☀️","⭐","✨","❤️","🧡","💛","💚","💙","💜","🎉","🎈","📚","✏️","🖍️","🧩","🍎","🌈","🐛","🦋","🐌","🐞","🌷"];
  var REACTIONS = ["❤️","👍","😂","😮","😢","🙏"];

  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function lang() { try { return localStorage.getItem("lme_lang") || "no"; } catch (e) { return "no"; } }
  function t(no, en) { return lang() === "en" ? en : no; }
  function timeLabel(ts) {
    try { return new Date(ts).toLocaleTimeString(lang() === "en" ? "en-GB" : "nb-NO", { hour: "2-digit", minute: "2-digit" }); }
    catch (e) { return ""; }
  }

  /* ---------- Stiler ---------- */
  function injectCss() {
    var css = [
      ".lme-compose{display:flex;flex-direction:column;gap:8px;margin-top:12px;}",
      ".lme-compose .lme-chat-form{margin-top:0;}",
      ".lme-tools{display:flex;gap:6px;align-items:center;flex-wrap:wrap;}",
      ".lme-tool{width:38px;height:38px;border:1px solid #eedce2;background:#fff;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;line-height:1;}",
      ".lme-tool:hover{background:#FCEFF2;}",
      ".lme-tool.rec{background:#E91E89;border-color:#E91E89;animation:lmepulse 1s infinite;}",
      "@keyframes lmepulse{0%,100%{opacity:1}50%{opacity:.45}}",
      ".lme-pop{position:fixed;background:#fff;border:1px solid #f3dce6;border-radius:14px;box-shadow:0 12px 34px rgba(180,120,140,.28);padding:8px;display:flex;flex-wrap:wrap;gap:4px;max-width:300px;z-index:99999;}",
      ".lme-pop.round{border-radius:999px;flex-wrap:nowrap;padding:5px 9px;}",
      ".lme-pop button{border:0;background:none;font-size:22px;cursor:pointer;padding:4px;border-radius:8px;line-height:1;}",
      ".lme-pop button:hover{background:#FCEFF2;}",
      ".lme-msg-wrap{display:flex;flex-direction:column;max-width:80%;}",
      ".lme-msg.mine .lme-msg-wrap{align-items:flex-end;}",
      ".lme-att-img{max-width:240px;max-height:260px;border-radius:12px;margin-top:6px;display:block;cursor:pointer;}",
      ".lme-att-audio{margin-top:6px;width:240px;max-width:60vw;}",
      ".lme-att-file{display:inline-flex;gap:7px;align-items:center;margin-top:6px;background:#fff;border:1px solid #eedce2;border-radius:10px;padding:8px 12px;text-decoration:none;color:#2a1e2e;font-size:14px;}",
      ".lme-msg-bubble{position:relative;}",
      ".lme-msg-ctrls{position:absolute;top:-12px;display:none;gap:3px;}",
      ".lme-msg .lme-msg-bubble:hover .lme-msg-ctrls{display:flex;}",
      ".lme-msg.mine .lme-msg-ctrls{left:-8px;}",
      ".lme-msg:not(.mine) .lme-msg-ctrls{right:-8px;}",
      ".lme-ctrl-btn{font-size:12px;background:#fff;border:1px solid #f3dce6;border-radius:999px;width:24px;height:24px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;color:#9a7b85;}",
      ".lme-ctrl-btn:hover{background:#FCEFF2;}",
      ".lme-react-row{display:flex;gap:4px;align-items:center;margin-top:4px;flex-wrap:wrap;}",
      ".lme-react-chip{font-size:12.5px;background:#fff;border:1px solid #f3dce6;border-radius:999px;padding:1px 8px;cursor:pointer;}",
      ".lme-react-chip.mine{background:#FCE3EC;border-color:#E91E89;}",
      "a.lme-msg-name{color:#E91E89;text-decoration:none;cursor:pointer;}",
      "a.lme-msg-name:hover{text-decoration:underline;}",
    ].join("");
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------- Popover ---------- */
  function closePop() { if (curPop) { curPop.remove(); curPop = null; document.removeEventListener("click", outside, true); } }
  function outside(e) { if (curPop && !curPop.contains(e.target)) closePop(); }
  function openPop(anchor, emojis, round, cb) {
    closePop();
    var p = document.createElement("div");
    p.className = "lme-pop" + (round ? " round" : "");
    emojis.forEach(function (em) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = em;
      b.addEventListener("click", function (e) { e.stopPropagation(); cb(em); closePop(); });
      p.appendChild(b);
    });
    document.body.appendChild(p);
    var r = anchor.getBoundingClientRect();
    var left = Math.max(8, Math.min(r.left, window.innerWidth - p.offsetWidth - 8));
    var top = r.top - p.offsetHeight - 8;
    if (top < 8) top = r.bottom + 8;
    p.style.left = left + "px"; p.style.top = top + "px";
    curPop = p;
    setTimeout(function () { document.addEventListener("click", outside, true); }, 0);
  }

  /* ---------- Porter ---------- */
  function renderGate(state) {
    var loginNext = "/login?next=" + encodeURIComponent(location.pathname);
    var title, body, actions;
    if (!state.loggedIn) {
      title = t("Logg inn for å delta", "Log in to take part");
      body = t("Gruppene er et trygt rom for Inner Circle-medlemmer. Logg inn for å se og skrive i " + GNAME + ".",
               "The groups are a safe space for Inner Circle members. Log in to view and post in " + GNAME + ".");
      actions =
        '<a class="lme-chat-btn primary" href="' + loginNext + '">' + t("Logg inn", "Log in") + '</a>' +
        '<a class="lme-chat-btn" href="https://buy.stripe.com/14A3cw5RXbjxcupapp9R60x">' + t("Bli med i Inner Circle", "Join Inner Circle") + '</a>';
    } else {
      title = t("Dette er for Inner Circle-medlemmer", "This is for Inner Circle members");
      body = t("Du er logget inn, men gruppene er en del av Inner Circle. Bli medlem for å skrive med de andre i " + GNAME + ".",
               "You're logged in, but the groups are part of Inner Circle. Become a member to chat with the others in " + GNAME + ".");
      actions =
        '<a class="lme-chat-btn primary" href="https://buy.stripe.com/14A3cw5RXbjxcupapp9R60x">' + t("Bli med i Inner Circle", "Join Inner Circle") + '</a>' +
        '<a class="lme-chat-btn" href="/community#fordeler">' + t("Se hva som inngår", "See what's included") + '</a>';
    }
    root.innerHTML =
      '<div class="lme-chat-gate"><div class="lme-chat-gate-icon">♡</div>' +
      '<h2>' + esc(title) + '</h2><p>' + esc(body) + '</p>' +
      '<div class="lme-chat-gate-actions">' + actions + '</div></div>';
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
        '<form class="lme-compose" id="lme-chat-form">' +
          '<div class="lme-tools">' +
            '<button type="button" class="lme-tool" id="lme-emoji" title="Emoji">😊</button>' +
            '<button type="button" class="lme-tool" id="lme-camera" title="' + esc(t("Kamera","Camera")) + '">📷</button>' +
            '<button type="button" class="lme-tool" id="lme-image" title="' + esc(t("Bilde","Image")) + '">🖼️</button>' +
            '<button type="button" class="lme-tool" id="lme-file" title="' + esc(t("Fil","File")) + '">📎</button>' +
            '<button type="button" class="lme-tool" id="lme-mic" title="' + esc(t("Lyd","Audio")) + '">🎤</button>' +
          '</div>' +
          '<div class="lme-chat-form">' +
            '<input type="text" id="lme-chat-input" autocomplete="off" maxlength="1000" placeholder="' + esc(t("Skriv en melding…","Write a message…")) + '">' +
            '<button type="submit" class="lme-chat-send">' + esc(t("Send","Send")) + '</button>' +
          '</div>' +
        '</form>' +
        '<p class="lme-chat-note" id="lme-chat-note"></p>' +
        '<input type="file" id="lme-in-image" accept="image/*" hidden>' +
        '<input type="file" id="lme-in-camera" accept="image/*" capture="environment" hidden>' +
        '<input type="file" id="lme-in-file" hidden>' +
      '</div>';

    document.getElementById("lme-chat-form").addEventListener("submit", onSend);
    document.getElementById("lme-emoji").addEventListener("click", function () {
      openPop(this, COMPOSE_EMOJI, false, function (em) {
        var inp = document.getElementById("lme-chat-input"); inp.value += em; inp.focus();
      });
    });
    var imgIn = document.getElementById("lme-in-image");
    var camIn = document.getElementById("lme-in-camera");
    var fileIn = document.getElementById("lme-in-file");
    document.getElementById("lme-image").addEventListener("click", function () { imgIn.click(); });
    document.getElementById("lme-camera").addEventListener("click", function () { camIn.click(); });
    document.getElementById("lme-file").addEventListener("click", function () { fileIn.click(); });
    imgIn.addEventListener("change", function () { if (this.files[0]) handleImage(this.files[0]); this.value = ""; });
    camIn.addEventListener("change", function () { if (this.files[0]) handleImage(this.files[0]); this.value = ""; });
    fileIn.addEventListener("change", function () { if (this.files[0]) handleFile(this.files[0]); this.value = ""; });
    document.getElementById("lme-mic").addEventListener("click", function () { toggleMic(this); });
  }

  function streamEl() { return document.getElementById("lme-chat-stream"); }

  /* ---------- Tegne meldinger ---------- */
  function attachmentHtml(a) {
    if (!a || !a.url) return "";
    if (a.kind === "image") return '<img class="lme-att-img" src="' + esc(a.url) + '" alt="' + esc(a.name || "bilde") + '" onclick="window.open(this.src)">';
    if (a.kind === "audio") return '<audio class="lme-att-audio" controls src="' + esc(a.url) + '"></audio>';
    return '<a class="lme-att-file" href="' + esc(a.url) + '" target="_blank" rel="noopener" download="' + esc(a.name || "fil") + '">📎 ' + esc(a.name || "fil") + '</a>';
  }

  function reactionRowHtml(m) {
    var r = m.r || {};
    var chips = "";
    Object.keys(r).forEach(function (em) {
      var list = r[em] || [];
      if (!list.length) return;
      var mine = meEmail && list.indexOf(meEmail) !== -1;
      chips += '<span class="lme-react-chip' + (mine ? " mine" : "") + '" data-em="' + esc(em) + '">' + esc(em) + " " + list.length + "</span>";
    });
    return chips;
  }

  function bindReactionRow(rowEl, m) {
    Array.prototype.forEach.call(rowEl.querySelectorAll(".lme-react-chip"), function (chip) {
      chip.addEventListener("click", function (e) { e.stopPropagation(); react(m.id, chip.getAttribute("data-em")); });
    });
  }

  function buildBubble(m) {
    var mine = meEmail && m.u === meEmail;
    var wrap = document.createElement("div");
    wrap.className = "lme-msg" + (mine ? " mine" : "");

    var inner = document.createElement("div");
    inner.className = "lme-msg-wrap";

    var canDelete = (meEmail && m.u === meEmail) || meOwner;
    var nameHtml = (m.uid && !mine)
      ? '<a class="lme-msg-name" href="/medlem?u=' + encodeURIComponent(m.uid) + '">' + esc(m.n) + '</a>'
      : '<span class="lme-msg-name">' + esc(m.n) + '</span>';
    var bubble = document.createElement("div");
    bubble.className = "lme-msg-bubble";
    bubble.innerHTML =
      nameHtml +
      (m.t ? '<span class="lme-msg-text">' + esc(m.t) + '</span>' : "") +
      attachmentHtml(m.a) +
      '<span class="lme-msg-time">' + esc(timeLabel(m.ts)) + '</span>' +
      '<div class="lme-msg-ctrls">' +
        '<button type="button" class="lme-ctrl-btn lme-react-btn" title="' + esc(t("Reager", "React")) + '">☺</button>' +
        (canDelete ? '<button type="button" class="lme-ctrl-btn lme-del-btn" title="' + esc(t("Slett", "Delete")) + '">🗑</button>' : "") +
      '</div>';
    bubble.querySelector(".lme-react-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      openPop(this, REACTIONS, true, function (em) { react(m.id, em); });
    });
    if (canDelete) {
      bubble.querySelector(".lme-del-btn").addEventListener("click", function (e) {
        e.stopPropagation();
        if (confirm(t("Slette denne meldingen?", "Delete this message?"))) deleteMessage(m.id);
      });
    }

    var row = document.createElement("div");
    row.className = "lme-react-row";
    row.innerHTML = reactionRowHtml(m);

    inner.appendChild(bubble);
    inner.appendChild(row);
    wrap.appendChild(inner);
    rendered[m.id] = { el: wrap, row: row };
    bindReactionRow(row, m);
    return wrap;
  }

  function syncMessages(list, full) {
    if (!list) return;
    var s = streamEl(); if (!s) return;
    var atBottom = s.scrollHeight - s.scrollTop - s.clientHeight < 80;
    var appended = false, mineAppended = false;
    list.forEach(function (m) {
      if (!rendered[m.id]) {
        var empty = document.getElementById("lme-chat-empty"); if (empty) empty.remove();
        s.appendChild(buildBubble(m));
        appended = true;
        if (meEmail && m.u === meEmail) mineAppended = true;
      } else {
        var rec = rendered[m.id];
        var html = reactionRowHtml(m);
        if (rec.row.innerHTML !== html) { rec.row.innerHTML = html; bindReactionRow(rec.row, m); }
      }
    });
    // Ved full liste (polling): fjern meldinger som er slettet hos andre.
    if (full) {
      var present = {};
      list.forEach(function (m) { present[m.id] = true; });
      Object.keys(rendered).forEach(function (id) {
        if (!present[id]) { removeRendered(id); }
      });
    }
    if (appended && (atBottom || mineAppended)) s.scrollTop = s.scrollHeight;
  }

  function removeRendered(id) {
    var rec = rendered[id];
    if (rec && rec.el && rec.el.parentNode) rec.el.parentNode.removeChild(rec.el);
    delete rendered[id];
  }

  function deleteMessage(id) {
    removeRendered(id); // fjern med en gang
    fetch("/api/group/" + GID + "/delete", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messageId: id }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (!d || !d.ok) { note(t("Klarte ikke å slette.", "Couldn't delete.")); poll(); } })
      .catch(function () { note(t("Klarte ikke å slette.", "Couldn't delete.")); poll(); });
  }

  /* ---------- Henting ---------- */
  function poll() {
    fetch("/api/group/" + GID + "/messages", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.messages) syncMessages(d.messages, true); })
      .catch(function () {});
  }
  function startPolling() { poll(); pollTimer = setInterval(poll, POLL_MS); }

  /* ---------- Sending ---------- */
  function note(msg) {
    var n = document.getElementById("lme-chat-note");
    if (n) { n.textContent = msg || ""; if (msg) setTimeout(function () { if (n.textContent === msg) n.textContent = ""; }, 4000); }
  }

  function onSend(e) {
    e.preventDefault();
    var input = document.getElementById("lme-chat-input");
    var text = (input.value || "").trim();
    if (!text) return;
    input.value = "";
    if (ws && ws.readyState === 1) { try { ws.send(JSON.stringify({ text: text })); return; } catch (e2) {} }
    postMessage({ text: text });
  }

  function postMessage(payload) {
    return fetch("/api/group/" + GID + "/messages", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok && d.message) syncMessages([d.message]);
        else if (d && d.error === "forbidden") note(t("Du må være medlem for å skrive.", "You must be a member to post."));
        else if (d && d.error === "too_large") note(t("Filen er for stor (maks 5 MB).", "File too large (max 5 MB)."));
        return d;
      })
      .catch(function () { note(t("Klarte ikke å sende. Prøv igjen.", "Couldn't send. Try again.")); });
  }

  /* ---------- Reaksjoner ---------- */
  function react(messageId, emoji) {
    fetch("/api/group/" + GID + "/react", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messageId: messageId, emoji: emoji }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok) {
          var rec = rendered[messageId];
          if (rec) { var m = { id: messageId, r: d.reactions }; rec.row.innerHTML = reactionRowHtml(m); bindReactionRow(rec.row, m); }
        }
      })
      .catch(function () {});
  }

  /* ---------- Opplasting ---------- */
  function toBase64(blob) {
    return new Promise(function (res) {
      var r = new FileReader();
      r.onload = function () { var s = String(r.result); var i = s.indexOf(","); res(i >= 0 ? s.slice(i + 1) : s); };
      r.readAsDataURL(blob);
    });
  }
  function compressImage(file) {
    return new Promise(function (res) {
      var img = new Image(); var url = URL.createObjectURL(file);
      img.onload = function () {
        var max = 1280, w = img.width, h = img.height;
        if (w > max || h > max) { if (w > h) { h = Math.round(h * max / w); w = max; } else { w = Math.round(w * max / h); h = max; } }
        var c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { res(b || file); }, "image/jpeg", 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); res(file); };
      img.src = url;
    });
  }
  function uploadBlob(blob, name, type) {
    return toBase64(blob).then(function (data) {
      return fetch("/api/group/" + GID + "/upload", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name, type: type, data: data }),
      }).then(function (r) { return r.json(); });
    });
  }
  function sendFileLike(blob, name, type) {
    note(t("Laster opp…", "Uploading…"));
    uploadBlob(blob, name, type).then(function (j) {
      if (j && j.ok && j.file) { note(""); return postMessage({ text: "", attachment: { url: j.file.url, type: j.file.type, name: j.file.name, kind: j.file.kind } }); }
      if (j && j.error === "too_large") note(t("Filen er for stor (maks 5 MB).", "File too large (max 5 MB)."));
      else note(t("Klarte ikke å laste opp.", "Upload failed."));
    }).catch(function () { note(t("Klarte ikke å laste opp.", "Upload failed.")); });
  }
  function handleImage(file) {
    if (/^image\//.test(file.type)) compressImage(file).then(function (b) { sendFileLike(b, (file.name || "bilde").replace(/\.\w+$/, "") + ".jpg", "image/jpeg"); });
    else handleFile(file);
  }
  function handleFile(file) {
    if (file.size > 5 * 1024 * 1024) { note(t("Filen er for stor (maks 5 MB).", "File too large (max 5 MB).")); return; }
    sendFileLike(file, file.name || "fil", file.type || "application/octet-stream");
  }

  /* ---------- Mikrofon ---------- */
  function toggleMic(btn) {
    if (mediaRecorder && mediaRecorder.state === "recording") { mediaRecorder.stop(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === "undefined") {
      note(t("Lydopptak støttes ikke her.", "Audio recording not supported here.")); return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      recChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = function (e) { if (e.data && e.data.size) recChunks.push(e.data); };
      mediaRecorder.onstop = function () {
        stream.getTracks().forEach(function (tr) { tr.stop(); });
        btn.classList.remove("rec");
        var type = (recChunks[0] && recChunks[0].type) || "audio/webm";
        var blob = new Blob(recChunks, { type: type });
        mediaRecorder = null;
        if (blob.size) sendFileLike(blob, "lydmelding." + (type.indexOf("ogg") >= 0 ? "ogg" : "webm"), type);
      };
      mediaRecorder.start();
      btn.classList.add("rec");
      note(t("Tar opp… trykk mikrofonen igjen for å sende.", "Recording… tap the mic again to send."));
    }).catch(function () { note(t("Fikk ikke tilgang til mikrofonen.", "Microphone access denied.")); });
  }

  /* ---------- WebSocket (valgfri) ---------- */
  function startLive() {
    try {
      var base = window.LME_CHAT_WS_PATH || "/api/chat-ws";
      var proto = location.protocol === "https:" ? "wss://" : "ws://";
      ws = new WebSocket(proto + location.host + base + "/room/" + GID);
      var fellBack = false;
      var fallback = function () { if (!fellBack) { fellBack = true; startPolling(); } };
      ws.addEventListener("message", function (ev) {
        try { var data = JSON.parse(ev.data); syncMessages(Array.isArray(data) ? data : [data]); } catch (e) {}
      });
      ws.addEventListener("error", fallback);
      ws.addEventListener("close", fallback);
      // Poll i tillegg, slik at reaksjoner og vedlegg (som gaar via REST) ogsaa vises.
      pollTimer = setInterval(poll, POLL_MS);
    } catch (e) { startPolling(); }
  }

  /* ---------- Oppstart ---------- */
  injectCss();
  fetch("/api/group/" + GID + "/access", { credentials: "same-origin" })
    .then(function (r) { return r.json(); })
    .then(function (state) {
      if (!state || !state.member) { renderGate(state || {}); return; }
      meName = state.name || (state.email ? state.email.split("@")[0] : null);
      meEmail = state.email || null;
      meOwner = !!state.owner;
      if (state.title) {
        var ttl = document.getElementById("lme-chat-title");
        if (ttl) ttl.textContent = state.title;
      }
      renderShell();
      if (window.LME_CHAT_LIVE) startLive(); else startPolling();
    })
    .catch(function () { renderGate({ loggedIn: false }); });
})();
