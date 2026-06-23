/**
 * LME Akademiet — rediger kursteksten rett på siden.
 *
 * - Laster inn lagret tekst fra Cloudflare (alle besøkende ser den siste versjonen).
 * - Redigeringsknappen er SKJULT for vanlige besøkende. Den vises bare når du
 *   åpner siden med #rediger i adressen, trykker Ctrl/Cmd+Shift+E, eller har
 *   redigert her før (huskes i nettleseren din).
 * - Lagring krever passord (sjekkes på serveren).
 */
(function () {
  var sec = document.querySelector("section.crs");
  if (!sec) return;

  var id = location.pathname.replace(/\.html$/, "").replace(/\/+$/, "");
  if (!/^\/academy\//.test(id)) return;

  var FLAG = "lme-course-edit";
  var FLAGS = ["lme-edit", "lme-page-edit", "lme-course-edit"];

  // 1) Hent lagret innhold (offentlig) og bytt ut teksten hvis noe er lagret.
  //    Hopp over hvis seksjonen er merket data-source-wins: da er kildekoden
  //    (HTML-en) fasit, og en gammel lagret versjon skal ikke overstyre den.
  if (!sec.hasAttribute("data-source-wins")) {
    fetch("/api/course?id=" + encodeURIComponent(id))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && typeof d.html === "string" && d.html.trim()) sec.innerHTML = d.html;
      })
      .catch(function () {});
  }

  // 2) Bygg knapperaden (skjult som standard).
  var bar = document.createElement("div");
  bar.style.cssText =
    "position:fixed;right:18px;bottom:18px;z-index:99999;display:none;gap:8px;font-family:'Playpen Sans',system-ui,sans-serif;";
  var editBtn = mkBtn("✏️ Rediger", "#E91E89");
  bar.appendChild(editBtn);
  document.body.appendChild(bar);

  function reveal() { bar.style.display = "flex"; }
  var wantsEdit =
    /(^|[#&?])rediger(=1)?($|[&])/.test(location.hash + location.search) ||
    FLAGS.some(function(k){ return localStorage.getItem(k) === "1"; });
  if (wantsEdit) reveal();

  // Hemmelig snarvei: Ctrl/Cmd + Shift + E
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "E" || e.key === "e")) {
      reveal();
    }
  });

  var pw = null, original = null, saveBtn = null, cancelBtn = null;

  editBtn.onclick = function () {
    if (!pw) {
      pw = prompt("Skriv inn passord for å redigere:");
      if (!pw) return;
    }
    startEdit();
  };

  function startEdit() {
    original = sec.innerHTML;
    sec.setAttribute("contenteditable", "true");
    sec.style.outline = "2px dashed #F5A8B8";
    sec.style.outlineOffset = "10px";
    sec.style.borderRadius = "12px";
    sec.focus();
    editBtn.style.display = "none";
    saveBtn = mkBtn("💾 Lagre", "#7AAE1F");
    cancelBtn = mkBtn("Avbryt", "#9aa0a6");
    saveBtn.onclick = save;
    cancelBtn.onclick = cancel;
    bar.appendChild(saveBtn);
    bar.appendChild(cancelBtn);
  }

  function stopEdit() {
    sec.removeAttribute("contenteditable");
    sec.style.outline = "";
    sec.style.outlineOffset = "";
    if (saveBtn) { bar.removeChild(saveBtn); saveBtn = null; }
    if (cancelBtn) { bar.removeChild(cancelBtn); cancelBtn = null; }
    editBtn.style.display = "";
  }

  function cancel() { sec.innerHTML = original; stopEdit(); }

  function save() {
    saveBtn.textContent = "Lagrer…";
    saveBtn.disabled = true;
    fetch("/api/course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id, html: sec.innerHTML, password: pw }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok) {
          localStorage.setItem(FLAG, "1"); localStorage.setItem("lme-edit", "1");
          toast("☁️ Lagret i skyen");
          stopEdit();
        } else if (d && d.error === "bad_password") {
          pw = null;
          alert("Feil passord. Prøv igjen.");
          resetSave();
        } else {
          alert("Kunne ikke lagre: " + ((d && d.error) || "ukjent feil"));
          resetSave();
        }
      })
      .catch(function () { alert("Nettverksfeil ved lagring. Prøv igjen."); resetSave(); });
  }

  function resetSave() {
    if (saveBtn) { saveBtn.textContent = "💾 Lagre"; saveBtn.disabled = false; }
  }

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
