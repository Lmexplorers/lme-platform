/**
 * LME — rediger merkede tekstblokker rett på siden.
 *
 * Bare elementer merket med  data-edit="en-unik-nokkel"  kan redigeres.
 * Meny, knapper, kort og layout røres ikke.
 *
 * - Laster lagret tekst fra Cloudflare (alle besøkende ser siste versjon).
 * - Redigeringsknappen er SKJULT for vanlige besøkende. Vis den med
 *   #rediger i adressen, Ctrl/Cmd+Shift+E, eller etter at du har redigert før.
 * - Lagring krever passord (sjekkes på serveren).
 */
(function () {
  var nodes = document.querySelectorAll("[data-edit]");
  if (!nodes.length) return;

  var id = location.pathname.replace(/\.html$/, "").replace(/\/+$/, "");
  if (id === "") id = "/index";

  var FLAG = "lme-page-edit";
  var FLAGS = ["lme-edit", "lme-page-edit", "lme-course-edit"];

  // 1) Hent lagret innhold og bytt ut de merkede blokkene.
  fetch("/api/content?id=" + encodeURIComponent(id))
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d || !d.blocks) return;
      nodes.forEach(function (el) {
        var k = el.getAttribute("data-edit");
        if (k && typeof d.blocks[k] === "string" && d.blocks[k].trim()) {
          el.innerHTML = d.blocks[k];
          // Hold språk-systemet i sync, så et språkbytte ikke overskriver redigert tekst.
          if (el.hasAttribute("data-no")) el.setAttribute("data-no", d.blocks[k]);
        }
      });
    })
    .catch(function () {});

  // 2) Skjult knapperad.
  var bar = document.createElement("div");
  bar.style.cssText =
    "position:fixed;right:18px;bottom:18px;z-index:99999;display:none;gap:8px;" +
    "font-family:'Playpen Sans',system-ui,sans-serif;";
  var editBtn = mkBtn("✏️ Rediger", "#E91E89");
  bar.appendChild(editBtn);
  document.body.appendChild(bar);

  function reveal() { bar.style.display = "flex"; }
  if (/(^|[#&?])rediger(=1)?($|[&])/.test(location.hash + location.search) ||
      FLAGS.some(function(k){ return localStorage.getItem(k) === "1"; })) reveal();
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "E" || e.key === "e")) reveal();
  });

  var pw = null, originals = null, saveBtn = null, cancelBtn = null;

  editBtn.onclick = function () {
    if (!pw) { pw = prompt("Skriv inn passord for å redigere:"); if (!pw) return; }
    startEdit();
  };

  function startEdit() {
    originals = {};
    nodes.forEach(function (el) {
      originals[el.getAttribute("data-edit")] = el.innerHTML;
      el.setAttribute("contenteditable", "true");
      el.style.outline = "2px dashed #F5A8B8";
      el.style.outlineOffset = "4px";
      el.style.borderRadius = "8px";
    });
    editBtn.style.display = "none";
    saveBtn = mkBtn("💾 Lagre", "#7AAE1F");
    cancelBtn = mkBtn("Avbryt", "#9aa0a6");
    saveBtn.onclick = save;
    cancelBtn.onclick = cancel;
    bar.appendChild(saveBtn);
    bar.appendChild(cancelBtn);
  }

  function stopEdit() {
    nodes.forEach(function (el) {
      el.removeAttribute("contenteditable");
      el.style.outline = "";
      el.style.outlineOffset = "";
    });
    if (saveBtn) { bar.removeChild(saveBtn); saveBtn = null; }
    if (cancelBtn) { bar.removeChild(cancelBtn); cancelBtn = null; }
    editBtn.style.display = "";
  }

  function cancel() {
    nodes.forEach(function (el) {
      var k = el.getAttribute("data-edit");
      if (originals && k in originals) el.innerHTML = originals[k];
    });
    stopEdit();
  }

  function save() {
    saveBtn.textContent = "Lagrer…";
    saveBtn.disabled = true;
    var blocks = {};
    nodes.forEach(function (el) {
      var html = el.innerHTML;
      blocks[el.getAttribute("data-edit")] = html;
      if (el.hasAttribute("data-no")) el.setAttribute("data-no", html);
    });
    fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id, password: pw, blocks: blocks }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok) { localStorage.setItem(FLAG, "1"); localStorage.setItem("lme-edit", "1"); toast("☁️ Lagret i skyen"); stopEdit(); }
        else if (d && d.error === "bad_password") { pw = null; alert("Feil passord. Prøv igjen."); resetSave(); }
        else { alert("Kunne ikke lagre: " + ((d && d.error) || "ukjent feil")); resetSave(); }
      })
      .catch(function () { alert("Nettverksfeil ved lagring. Prøv igjen."); resetSave(); });
  }

  function resetSave() { if (saveBtn) { saveBtn.textContent = "💾 Lagre"; saveBtn.disabled = false; } }

  function mkBtn(txt, color) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = txt;
    b.style.cssText =
      "background:" + color + ";color:#fff;border:none;border-radius:999px;" +
      "padding:11px 18px;font-size:14px;font-weight:700;cursor:pointer;" +
      "box-shadow:0 6px 18px rgba(0,0,0,.18);font-family:inherit;";
    return b;
  }

  function toast(msg) {
    var t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText =
      "position:fixed;left:50%;bottom:86px;transform:translateX(-50%);background:#2b2b2b;" +
      "color:#fff;padding:12px 20px;border-radius:999px;z-index:100000;font-weight:700;" +
      "font-family:'Playpen Sans',system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);";
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }
})();
