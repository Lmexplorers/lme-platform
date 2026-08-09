/* ============================================================
   LME Læringsverksted — delt visning av ressurskort og produktside,
   samme mønster som gruppe-render.js: én renderer brukt både av den
   offentlige katalogen (/laeringsverksted, /lv/<slug>), forhåndsvisningen
   i byggeren (/laeringsverksted-bygger) og den kompakte visningen i
   butikken (/butikk), slik at data aldri opprettes to ganger.

   window.LMELaeringsverksted.TAXONOMY   — felles nøkkel -> {no,en}-etiketter
   window.LMELaeringsverksted.pick(v,en) — henter riktig språk av et {no,en}-felt
   window.LMELaeringsverksted.renderGrid(container, resources, opts)
   window.LMELaeringsverksted.renderCard(resource, opts) -> DOM-node
   window.LMELaeringsverksted.renderDetail(container, resource, opts)
   window.LMELaeringsverksted.booklyUrl(resource)
   All brukertekst settes som tekstnoder, aldri som rå HTML.
   ============================================================ */
(function () {
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function pick(v, en) {
    if (v && typeof v === "object") return (en && v.en) ? v.en : (v.no || "");
    return v || "";
  }

  var TAXONOMY = {
    audience: {
      foreldre: ["Forelder", "Parent"],
      pedagog: ["Pedagog", "Educator"],
      montessoripedagog: ["Montessoripedagog", "Montessori teacher"],
      spesialpedagog: ["Spesialpedagog", "Special education teacher"],
      hjemme: ["Hjemmeskole/hjemmelæring", "Homeschool"],
    },
    ageBands: {
      "0-3": ["0–3 år", "Ages 0-3"],
      "3-6": ["3–6 år", "Ages 3-6"],
      "1-2trinn": ["1.–2. trinn", "Grades 1-2"],
      "3-4trinn": ["3.–4. trinn", "Grades 3-4"],
      "5-7trinn": ["5.–7. trinn", "Grades 5-7"],
      "8-10trinn": ["8.–10. trinn", "Grades 8-10"],
      vgs: ["Videregående", "Upper secondary"],
      "m6-9": ["Montessori 6–9", "Montessori 6-9"],
      "m9-12": ["Montessori 9–12", "Montessori 9-12"],
      "m12-16": ["Montessori 12–16", "Montessori 12-16"],
    },
    direction: {
      montessori: ["Montessori", "Montessori"],
      offentlig: ["Offentlig skole", "Public school"],
      begge: ["Begge", "Both"],
      ingen: ["Ikke knyttet til læreplan", "Not curriculum-linked"],
    },
    subjects: {
      norsk: ["Norsk", "Norwegian"],
      matematikk: ["Matematikk", "Mathematics"],
      engelsk: ["Engelsk", "English"],
      naturfag: ["Naturfag", "Science"],
      samfunnsfag: ["Samfunnsfag", "Social studies"],
      krle: ["KRLE", "Religion and ethics"],
      "praktisk-estetisk": ["Praktisk-estetiske fag", "Practical & aesthetic subjects"],
      sprakutvikling: ["Språkutvikling", "Language development"],
      "lesing-skriving": ["Lesing og skriving", "Reading and writing"],
      "sosial-kompetanse": ["Sosial kompetanse", "Social skills"],
      livsmestring: ["Livsmestring", "Life skills"],
      "tilpasset-opplaring": ["Tilpasset opplæring", "Adapted education"],
      spesialpedagogikk: ["Spesialpedagogikk", "Special education"],
      barnehage: ["Barnehage", "Kindergarten"],
      "praktisk-liv": ["Praktisk liv", "Practical life"],
      sensorisk: ["Sensorisk", "Sensorial"],
      kultur: ["Kultur", "Culture"],
      geografi: ["Geografi", "Geography"],
      botanikk: ["Botanikk", "Botany"],
      zoologi: ["Zoologi", "Zoology"],
      historie: ["Historie", "History"],
    },
    resourceType: {
      arbeidsark: ["Arbeidsark", "Worksheet"],
      arbeidshefte: ["Arbeidshefte", "Workbook"],
      trepartskort: ["Tredelte kort", "Three-part cards"],
      begrepskort: ["Begrepskort", "Concept cards"],
      plakat: ["Plakat", "Poster"],
      plansje: ["Plansje", "Chart"],
      tidslinje: ["Tidslinje", "Timeline"],
      spill: ["Spill", "Game"],
      quiz: ["Quiz", "Quiz"],
      aktivitetskort: ["Aktivitetskort", "Activity card"],
      lesetekst: ["Lesetekst", "Reading text"],
      skriveoppgave: ["Skriveoppgave", "Writing task"],
      matematikkoppgave: ["Matematikkoppgave", "Math task"],
      minibok: ["Minibok", "Mini book"],
      temapakke: ["Temapakke", "Theme pack"],
      prosjektarbeid: ["Prosjektarbeid", "Project work"],
      larerveiledning: ["Lærerveiledning", "Teacher guide"],
      observasjonsskjema: ["Observasjonsskjema", "Observation form"],
      planleggingsverktoy: ["Planleggingsverktøy", "Planning tool"],
      "mia-teo": ["Mia & Teo-ressurs", "Mia & Teo resource"],
      gratisressurs: ["Gratisressurs", "Free resource"],
      redigerbar: ["Redigerbar ressurs", "Editable resource"],
      samlepakke: ["Samlepakke", "Bundle"],
    },
    priceType: {
      gratis: ["Gratis", "Free"],
      betalt: ["Betalt", "Paid"],
      medlem: ["Inkludert i medlemskap", "Included in membership"],
    },
    license: {
      gratis: ["Gratis lisens", "Free license"],
      privat: ["Privat lisens (én familie)", "Private license (one family)"],
      pedagog: ["Pedagoglisens (én pedagog/gruppe)", "Educator license (one educator/group)"],
      barnehage: ["Barnehagelisens", "Kindergarten license"],
      skole: ["Skolelisens", "School license"],
    },
  };

  function label(group, key, en) {
    var g = TAXONOMY[group] || {};
    var e = g[key];
    return e ? (en ? e[1] : e[0]) : key;
  }

  function coverNode(r, cls) {
    if (r.cover) {
      var im = el("img", cls);
      im.src = r.cover;
      im.alt = "";
      im.loading = "lazy";
      return im;
    }
    var ph = el("div", cls + " lv-cover-ph");
    ph.appendChild(el("span", null, "📘"));
    return ph;
  }

  function priceNode(r, en) {
    if (r.priceType === "gratis") return el("span", "lv-badge lv-badge-free", en ? "Free" : "Gratis");
    if (r.priceType === "medlem") return el("span", "lv-badge lv-badge-member", en ? "Member benefit" : "Medlemsfordel");
    var p = pick(r.price, en);
    return el("span", "lv-badge lv-badge-paid", p || (en ? "Paid" : "Betalt"));
  }

  /* Bygger en dyplenke inn i Bookly med fag, trinn og læreplanmål forhåndsvalgt,
     via BK.pendingTemplate-mekanismen (se bookly/js/bookly-app.js). */
  function booklyUrl(r) {
    var b = r && r.bookly;
    if (!b || !b.type) return "/bookly/";
    var q = new URLSearchParams();
    q.set("lv", "1");
    q.set("type", b.type);
    q.set("title", pick(r.title, false));
    if (b.category) q.set("category", b.category);
    if (b.topic) q.set("topic", b.topic);
    if (b.age) q.set("age", b.age);
    if (b.plan) q.set("plan", b.plan);
    if (b.fag) q.set("fag", b.fag);
    if (b.alder) q.set("alder", b.alder);
    return "/bookly/?" + q.toString();
  }

  function renderCard(r, opts) {
    opts = opts || {};
    var en = !!opts.en;
    var card = el("article", "lv-card");
    if (r.example) card.classList.add("lv-card-example");
    var a = el("a", "lv-card-link");
    a.href = opts.detailBase ? (opts.detailBase + r.slug) : ("/lv/" + r.slug);
    var media = el("div", "lv-card-media");
    media.appendChild(coverNode(r, "lv-card-cover"));
    if (r.example) media.appendChild(el("span", "lv-tag-example", en ? "EXAMPLE" : "EKSEMPEL"));
    if (r.featured && !r.example) media.appendChild(el("span", "lv-tag-featured", en ? "★ Featured" : "★ Utvalgt"));
    a.appendChild(media);
    var body = el("div", "lv-card-body");
    body.appendChild(el("h3", "lv-card-title", pick(r.title, en)));
    if (pick(r.subtitle, en)) body.appendChild(el("p", "lv-card-sub", pick(r.subtitle, en)));
    var badges = el("div", "lv-card-badges");
    (r.ageBands || []).slice(0, 2).forEach(function (k) { badges.appendChild(el("span", "lv-badge lv-badge-age", label("ageBands", k, en))); });
    (r.resourceType || []).slice(0, 1).forEach(function (k) { badges.appendChild(el("span", "lv-badge lv-badge-type", label("resourceType", k, en))); });
    badges.appendChild(priceNode(r, en));
    body.appendChild(badges);
    a.appendChild(body);
    card.appendChild(a);

    var fav = el("button", "lv-fav-btn", opts.isFavorite && opts.isFavorite(r.slug) ? "♥" : "♡");
    fav.type = "button";
    fav.setAttribute("aria-label", en ? "Save to favorites" : "Lagre som favoritt");
    fav.setAttribute("aria-pressed", opts.isFavorite && opts.isFavorite(r.slug) ? "true" : "false");
    if (opts.onFavorite) {
      fav.addEventListener("click", function (e) {
        e.preventDefault();
        var on = opts.onFavorite(r.slug);
        fav.textContent = on ? "♥" : "♡";
        fav.setAttribute("aria-pressed", on ? "true" : "false");
      });
    } else {
      fav.disabled = true;
    }
    card.appendChild(fav);
    return card;
  }

  function renderGrid(container, resources, opts) {
    opts = opts || {};
    var en = !!opts.en;
    container.innerHTML = "";
    if (!resources || !resources.length) {
      var empty = el("div", "lv-empty");
      empty.appendChild(el("div", "lv-empty-icon", "🔎"));
      empty.appendChild(el("p", null, opts.emptyText || (en ? "No resources match your filters yet." : "Ingen ressurser matcher filtrene ennå.")));
      container.appendChild(empty);
      return;
    }
    var grid = el("div", "lv-grid");
    resources.forEach(function (r) { grid.appendChild(renderCard(r, opts)); });
    container.appendChild(grid);
  }

  function richPara(text) {
    text = String(text || "");
    var p = el("p");
    text.split(/(\*\*[^*]+\*\*)/g).forEach(function (part) {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        var b = document.createElement("strong");
        b.textContent = part.slice(2, -2);
        p.appendChild(b);
      } else if (part) {
        p.appendChild(document.createTextNode(part));
      }
    });
    return p;
  }

  function section(title, node) {
    if (!node) return null;
    var box = el("div", "lv-section");
    box.appendChild(el("h2", "lv-h2", title));
    box.appendChild(node);
    return box;
  }

  function listBlock(items, en) {
    if (!items || !items.length) return null;
    var ul = el("ul", "lv-list");
    items.forEach(function (it) { ul.appendChild(el("li", null, pick(it, en))); });
    return ul;
  }

  function renderDetail(container, r, opts) {
    opts = opts || {};
    var en = !!opts.en;
    container.innerHTML = "";
    if (!r) {
      var missing = el("div", "lv-next");
      missing.appendChild(el("h2", null, en ? "Resource not found" : "Fant ikke ressursen"));
      missing.appendChild(el("p", null, en
        ? "A newly saved resource can take up to a minute to appear. Try again shortly, or check the address."
        : "En nylagret ressurs kan bruke opptil ett minutt på å dukke opp. Prøv igjen om litt, eller sjekk at adressen stemmer."));
      var back = el("a", "lv-cta", en ? "← Learning Workshop" : "← Læringsverksted");
      back.href = "/laeringsverksted";
      missing.appendChild(back);
      container.appendChild(missing);
      return;
    }

    var shell = el("div", "lv-shell");
    if (r.example) {
      var exBanner = el("div", "lv-example-banner", en
        ? "EXAMPLE — demonstrates how a resource looks. Not a finished product for sale."
        : "EKSEMPEL — viser hvordan en ressurs ser ut. Ikke et ferdig salgsprodukt.");
      shell.appendChild(exBanner);
    }

    var hero = el("div", "lv-hero");
    hero.appendChild(coverNode(r, "lv-hero-cover"));
    shell.appendChild(hero);

    if (r.gallery && r.gallery.length) {
      var strip = el("div", "lv-thumbs");
      r.gallery.forEach(function (src) {
        var t = el("img", "lv-thumb");
        t.src = src; t.alt = "";
        strip.appendChild(t);
      });
      shell.appendChild(strip);
    }

    if (pick(r.subtitle, en)) shell.appendChild(el("div", "lv-kick", pick(r.subtitle, en)));
    shell.appendChild(el("h1", "lv-title", pick(r.title, en)));

    var badges = el("div", "lv-detail-badges");
    (r.audience || []).forEach(function (k) { badges.appendChild(el("span", "lv-badge", label("audience", k, en))); });
    (r.ageBands || []).forEach(function (k) { badges.appendChild(el("span", "lv-badge lv-badge-age", label("ageBands", k, en))); });
    badges.appendChild(el("span", "lv-badge", label("direction", r.direction || "ingen", en)));
    (r.subjects || []).forEach(function (k) { badges.appendChild(el("span", "lv-badge", label("subjects", k, en))); });
    shell.appendChild(badges);

    if (pick(r.description, en)) shell.appendChild(el("p", "lv-lede", pick(r.description, en)));

    var buyBox = el("div", "lv-buybox");
    buyBox.appendChild(priceNode(r, en));
    if (pick(r.memberPrice, en) && r.priceType === "betalt") {
      buyBox.appendChild(el("span", "lv-memberprice", (en ? "Member price: " : "Medlemspris: ") + pick(r.memberPrice, en)));
    }

    var buyBtn = el("a", "lv-cta");
    function applyBuyOption(o) {
      var isFreeBase = o.isBase && r.priceType === "gratis";
      buyBtn.textContent = isFreeBase ? (en ? "Download for free" : "Last ned gratis") : (en ? "Buy / add to cart" : "Kjøp / legg i handlekurv");
      buyBtn.href = (isFreeBase ? (r.fileUrl || o.buyUrl) : o.buyUrl) || (isFreeBase ? "#" : "/butikk");
    }
    /* Flere kjøpbare lisensnivåer (privat/pedagog/barnehage/skole): vis en
       velger som bytter kjøpsknappens lenke, i tillegg til standardprisen
       øverst i lv-buybox. Uten licenseOptions oppfører knappen seg som før. */
    var licenseOptions = r.licenseOptions || [];
    if (licenseOptions.length) {
      var allOptions = [{ license: r.license || "gratis", price: r.price, buyUrl: r.buyUrl, isBase: true }].concat(licenseOptions);
      var licWrap = el("div", "lv-license-picker");
      licWrap.appendChild(el("label", "lv-license-label", en ? "Choose a license" : "Velg lisens"));
      var licSelect = document.createElement("select");
      licSelect.className = "lv-license-select";
      allOptions.forEach(function (o, i) {
        var priceTxt = pick(o.price, en) || (o.isBase && r.priceType === "gratis" ? (en ? "Free" : "Gratis") : "");
        var opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = label("license", o.license, en) + (priceTxt ? " — " + priceTxt : "");
        licSelect.appendChild(opt);
      });
      licSelect.addEventListener("change", function () { applyBuyOption(allOptions[parseInt(licSelect.value, 10)]); });
      licWrap.appendChild(licSelect);
      buyBox.appendChild(licWrap);
      applyBuyOption(allOptions[0]);
    } else {
      applyBuyOption({ license: r.license || "gratis", price: r.price, buyUrl: r.buyUrl, isBase: true });
    }

    var actions = el("div", "lv-actions");
    if (opts.onDownload) buyBtn.addEventListener("click", function () { opts.onDownload(r.slug); });
    actions.appendChild(buyBtn);
    if (r.bookly && r.bookly.type) {
      var bkBtn = el("a", "lv-cta lv-cta-secondary", en ? "Customize in Bookly" : "Tilpass i Bookly");
      bkBtn.href = booklyUrl(r);
      actions.appendChild(bkBtn);
    }
    var favBtn = el("button", "lv-cta lv-cta-ghost", opts.isFavorite && opts.isFavorite(r.slug) ? (en ? "♥ Saved" : "♥ Lagret") : (en ? "♡ Save" : "♡ Lagre"));
    favBtn.type = "button";
    if (opts.onFavorite) {
      favBtn.addEventListener("click", function () {
        var on = opts.onFavorite(r.slug);
        favBtn.textContent = on ? (en ? "♥ Saved" : "♥ Lagret") : (en ? "♡ Save" : "♡ Lagre");
      });
    } else { favBtn.disabled = true; }
    actions.appendChild(favBtn);
    buyBox.appendChild(actions);
    shell.appendChild(buyBox);

    var facts = el("div", "lv-facts");
    function fact(k, v) { if (!v) return; var d = el("div", "lv-fact"); d.appendChild(el("span", "lv-fact-k", k)); d.appendChild(el("span", "lv-fact-v", v)); facts.appendChild(d); }
    fact(en ? "Pages" : "Sider", r.pageCount ? String(r.pageCount) : "");
    fact(en ? "Language" : "Språk", (r.language || []).map(function (l) { return l === "nb" ? "Bokmål" : l === "nn" ? "Nynorsk" : "English"; }).join(", "));
    fact(en ? "Format" : "Filformat", (r.fileFormat || []).join(", ").toUpperCase());
    fact(en ? "Editable" : "Redigerbar", r.editable ? (en ? "Yes" : "Ja") : (en ? "No" : "Nei"));
    fact(en ? "License" : "Lisens", r.license ? label("license", r.license, en) : "");
    if (facts.children.length) shell.appendChild(section(en ? "Details" : "Detaljer", facts));

    var containsList = listBlock(r.contains, en);
    var containsSec = section(en ? "What's included" : "Hva ressursen inneholder", containsList);
    if (containsSec) shell.appendChild(containsSec);

    var goalsList = listBlock(r.competencyGoals, en);
    var goalsSec = section(en ? "Competence aims" : "Kompetansemål", goalsList);
    if (goalsSec) shell.appendChild(goalsSec);

    var ma = r.montessoriArea;
    if (ma && (pick(ma.area, en) || pick(ma.presentation, en))) {
      var maBox = el("div", "lv-montessori");
      function maRow(k, v) { if (!pick(v, en)) return; var row = el("div", "lv-ma-row"); row.appendChild(el("strong", null, k)); row.appendChild(document.createTextNode(" " + pick(v, en))); maBox.appendChild(row); }
      maRow(en ? "Area:" : "Område:", ma.area);
      maRow(en ? "Presentation:" : "Presentasjon:", ma.presentation);
      maRow(en ? "Prerequisites:" : "Forkunnskaper:", ma.prerequisites);
      maRow(en ? "Direct purpose:" : "Direkte formål:", ma.directPurpose);
      maRow(en ? "Indirect purpose:" : "Indirekte formål:", ma.indirectPurpose);
      maRow(en ? "Control of error:" : "Kontroll av feil:", ma.controlOfError);
      maRow(en ? "Extension:" : "Videre arbeid:", ma.extension);
      var maSec = section(en ? "Montessori connection" : "Montessori-tilknytning", maBox);
      shell.appendChild(maSec);
    }

    function textSec(title, v) { if (!pick(v, en)) return; shell.appendChild(section(title, el("p", null, pick(v, en)))); }
    textSec(en ? "Suggested use" : "Forslag til bruk", r.usageTips);
    textSec(en ? "Preparation" : "Forberedelser", r.prep);
    textSec(en ? "Differentiation" : "Differensieringsmuligheter", r.differentiation);

    if (r.related && r.related.length && opts.relatedResources) {
      var relWrap = el("div", "lv-grid lv-grid-small");
      opts.relatedResources.forEach(function (rr) { relWrap.appendChild(renderCard(rr, opts)); });
      var relSec = section(en ? "Related resources" : "Relaterte ressurser", relWrap);
      if (relSec) shell.appendChild(relSec);
    }

    container.appendChild(shell);
  }

  window.LMELaeringsverksted = {
    TAXONOMY: TAXONOMY,
    label: label,
    pick: pick,
    renderGrid: renderGrid,
    renderCard: renderCard,
    renderDetail: renderDetail,
    booklyUrl: booklyUrl,
  };
})();
