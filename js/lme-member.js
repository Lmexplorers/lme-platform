/* ============================================================
   LME medlemsstatus — én felles sjekk av "hvem er jeg", slik at
   plattformen oppfører seg som FEA: er du innlogget som eier eller
   medlem, får du tilgang med en gang, uten "Bli med"-vegger.

   Tar seg av:
   - Setter body-klasser (lme-auth-in / lme-auth-out / lme-owner /
     lme-member) som andre sider kan style etter.
   - Bytter "Bli med i Inner Circle"-oppfordringer merket
     data-lme-join til "Gå inn i Inner Circle →" for innloggede
     eiere/medlemmer, og peker dem til fellesskapet i stedet for
     salgssiden.
   - Viser elementer merket data-lme-when="in|out|owner|member" bare
     for riktig tilstand (enkел "logg inn / min konto"-veksling).

   Tilgangen avgjøres av /api/group/access, samme kilde som gruppene
   bruker, så eier alltid regnes som innenfor.
   ============================================================ */
(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function isEn() { return window.LME_CURRENT_LANG === "en"; }

  var state = { loggedIn: false, member: false, owner: false, inside: false, name: null };

  function applyWhen() {
    document.querySelectorAll("[data-lme-when]").forEach(function (el) {
      var want = (el.getAttribute("data-lme-when") || "").split(/\s+/);
      var show = want.some(function (w) {
        if (w === "in") return state.loggedIn;
        if (w === "out") return !state.loggedIn;
        if (w === "owner") return state.owner;
        if (w === "member") return state.inside;
        return false;
      });
      el.hidden = !show;
    });
  }

  function upgradeJoinCtas() {
    if (!state.inside) return;
    var label = isEn() ? "Enter Inner Circle →" : "Gå inn i Inner Circle →";
    // Enkle tekst-knapper: bytt både lenke og tekst.
    document.querySelectorAll("[data-lme-join]").forEach(function (a) {
      if (a.tagName === "A") a.setAttribute("href", "/community");
      a.textContent = label;
    });
    // Store kort med egen layout: bytt bare lenken, la innholdet stå.
    document.querySelectorAll("[data-lme-enter]").forEach(function (a) {
      if (a.tagName === "A") a.setAttribute("href", "/community");
    });
  }

  function apply() {
    document.body.classList.toggle("lme-auth-in", state.loggedIn);
    document.body.classList.toggle("lme-auth-out", !state.loggedIn);
    document.body.classList.toggle("lme-owner", state.owner);
    document.body.classList.toggle("lme-member", state.inside);
    applyWhen();
    upgradeJoinCtas();
  }

  function wireLogout() {
    document.querySelectorAll("[data-lme-logout]").forEach(function (b) {
      if (b.__lmeWired) return;
      b.__lmeWired = true;
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" })
          .then(function () { location.replace("/login"); })
          .catch(function () { location.replace("/login"); });
      });
    });
  }

  ready(function () {
    apply(); // sett utgangstilstand (utlogget) med en gang
    wireLogout();
    fetch("/api/group/access", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        d = d || {};
        state.loggedIn = !!d.loggedIn;
        state.member = !!d.member;
        state.owner = !!d.owner;
        state.inside = !!(d.owner || d.member);
        state.name = d.name || null;
        window.LME_MEMBER = state;
        apply();
        try { window.dispatchEvent(new Event("lme-member")); } catch (e) {}
      })
      .catch(function () { /* utlogget-visning beholdes */ });

    // Følg språkbytte, så "Gå inn"-teksten bytter språk den også.
    window.addEventListener("lme-lang", upgradeJoinCtas);
    var origToggle = window.lmeToggleLang;
    if (typeof origToggle === "function" && !origToggle.__lmeMember) {
      window.lmeToggleLang = function () { origToggle.apply(this, arguments); upgradeJoinCtas(); };
      window.lmeToggleLang.__lmeMember = true;
    }
  });
})();
