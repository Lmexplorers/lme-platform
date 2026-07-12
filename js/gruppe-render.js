/* ============================================================
   LME gruppe-render — bygger en Skool-stil salgsside for en
   gruppe/fellesskap ut fra gruppe-JSON (samme objekt som
   /api/gruppe lagrer). Brukes både av den offentlige siden
   (/g/<adresse>) og av forhåndsvisningen i gruppebyggeren, så
   de alltid ser like ut.

   window.LMEGruppe.render(container, group, { en: bool, live: bool })
     live=true brukes i byggeren: video vises som stillbilde med
     play-merke i stedet for en innebygd spiller, så skjemaet ikke
     mister fokus. All brukertekst settes som tekstnoder, aldri
     som rå HTML.
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

  /* Enkel formatering i «om»-avsnitt: "## tekst" gir en liten rosa
     overskrift, **ord** gir tykk skrift. Samme regler som i kurs. */
  function richPara(text) {
    text = String(text || "");
    if (/^##\s+/.test(text)) return el("h3", "g-sub", text.replace(/^##\s+/, ""));
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

  /* Tolker en trailer-lenke. Returnerer et objekt som beskriver hvordan
     videoen skal vises: youtube/vimeo (innebygd ramme) eller fil (<video>). */
  function parseVideo(url) {
    if (!url) return null;
    var yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_\-]{6,})/);
    if (yt) return { kind: "youtube", embed: "https://www.youtube.com/embed/" + yt[1] };
    var vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return { kind: "vimeo", embed: "https://player.vimeo.com/video/" + vm[1] };
    if (/\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url)) return { kind: "file", src: url };
    return { kind: "link", src: url };
  }

  function fmtMembers(n, en) {
    n = parseInt(n, 10) || 0;
    var s = n.toLocaleString(en ? "en-US" : "nb-NO");
    return s + " " + (en ? (n === 1 ? "member" : "members") : (n === 1 ? "medlem" : "medlemmer"));
  }

  function render(container, g, opts) {
    opts = opts || {};
    var en = !!opts.en;
    var live = !!opts.live;
    g = g || {};
    container.innerHTML = "";

    var shell = el("div", "g-shell");

    /* Topplinje: logo/portrett + navn + privatmerke */
    var top = el("div", "g-topline");
    var mark = g.cover || g.hostImg;
    if (mark) {
      var lg = el("img", "g-mark");
      lg.src = mark; lg.alt = "";
      top.appendChild(lg);
    } else {
      top.appendChild(el("div", "g-mark g-mark-ph", "🌸"));
    }
    top.appendChild(el("span", "g-topname", pick(g.title, en) || (en ? "Group name" : "Gruppenavn")));
    var priv = el("span", "g-priv");
    priv.textContent = g.privacy === "apen"
      ? (en ? "🌍 Open" : "🌍 Åpen")
      : (en ? "🔒 Private" : "🔒 Privat");
    top.appendChild(priv);
    shell.appendChild(top);

    /* Tittel + kicker */
    if (pick(g.kicker, en)) shell.appendChild(el("div", "g-kick", pick(g.kicker, en)));
    shell.appendChild(el("h1", "g-title", pick(g.title, en) || (en ? "Group name" : "Gruppenavn")));

    /* Hovedmedie: trailer eller omslagsbilde */
    var vid = parseVideo(g.videoUrl);
    var hero = el("div", "g-hero");
    if (vid && (vid.kind === "youtube" || vid.kind === "vimeo") && !live) {
      var ifr = document.createElement("iframe");
      ifr.src = vid.embed;
      ifr.title = pick(g.title, en) || "Video";
      ifr.loading = "lazy";
      ifr.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      ifr.setAttribute("allowfullscreen", "");
      hero.classList.add("g-hero-video");
      hero.appendChild(ifr);
    } else if (vid && vid.kind === "file" && !live) {
      var v = document.createElement("video");
      v.src = vid.src; v.controls = true; v.playsInline = true;
      if (g.cover) v.poster = g.cover;
      hero.classList.add("g-hero-video");
      hero.appendChild(v);
    } else if (g.cover) {
      var im = el("img", "g-cover");
      im.src = g.cover; im.alt = pick(g.title, en) || "";
      hero.appendChild(im);
      if (vid) hero.appendChild(el("div", "g-play", "▶"));
    } else {
      hero.classList.add("g-hero-ph");
      hero.appendChild(el("div", "g-hero-ph-in", vid ? "▶" : "🌷"));
    }
    shell.appendChild(hero);

    /* Miniatyrstripe */
    if (g.gallery && g.gallery.length) {
      var strip = el("div", "g-thumbs");
      g.gallery.forEach(function (src) {
        var t = el("img", "g-thumb");
        t.src = src; t.alt = "";
        strip.appendChild(t);
      });
      shell.appendChild(strip);
    }

    /* Metalinje: privat · medlemmer · pris · vert */
    var meta = el("div", "g-metarow");
    function metaItem(icon, text) {
      var it = el("div", "g-metaitem");
      it.appendChild(el("span", "g-metaicon", icon));
      it.appendChild(el("span", null, text));
      meta.appendChild(it);
    }
    metaItem(g.privacy === "apen" ? "🌍" : "🔒",
      g.privacy === "apen" ? (en ? "Open" : "Åpen") : (en ? "Private" : "Privat"));
    if (g.members > 0) metaItem("👥", fmtMembers(g.members, en));
    if (pick(g.price, en)) metaItem("🏷️", pick(g.price, en));
    if (pick(g.host, en)) metaItem("💗", (en ? "By " : "Av ") + pick(g.host, en));
    shell.appendChild(meta);

    /* Bli med-knapp */
    var ctaLabel = pick(g.cta, en) || (en ? "Join now" : "Bli med");
    var cta;
    if (g.ctaUrl && !live) {
      cta = el("a", "g-cta", ctaLabel);
      cta.href = g.ctaUrl;
    } else {
      cta = el("button", "g-cta", ctaLabel);
      cta.type = "button";
      if (live) cta.disabled = true;
    }
    shell.appendChild(cta);
    if (pick(g.priceNote, en)) shell.appendChild(el("div", "g-pricenote", pick(g.priceNote, en)));

    /* Kort beskrivelse */
    if (pick(g.lede, en)) shell.appendChild(el("p", "g-lede", pick(g.lede, en)));

    /* Dette får du */
    if (g.features && g.features.length) {
      var fx = el("div", "g-features");
      fx.appendChild(el("h2", "g-h2", en ? "What's inside" : "Dette får du"));
      var ul = el("ul");
      g.features.forEach(function (f) { ul.appendChild(el("li", null, pick(f, en))); });
      fx.appendChild(ul);
      shell.appendChild(fx);
    }

    /* Om gruppen (avsnitt) */
    if (g.about && g.about.length) {
      var ab = el("div", "g-about");
      g.about.forEach(function (p) { ab.appendChild(richPara(pick(p, en))); });
      shell.appendChild(ab);
    }

    /* Avslutning + knapp igjen */
    var outroT = pick(g.outro && g.outro.title, en);
    var outroX = pick(g.outro && g.outro.text, en);
    if (outroT || outroX) {
      var next = el("div", "g-next");
      next.appendChild(el("h2", null, outroT || (en ? "Come join us" : "Bli med oss")));
      if (outroX) next.appendChild(el("p", null, outroX));
      var cta2;
      if (g.ctaUrl && !live) { cta2 = el("a", "g-cta", ctaLabel); cta2.href = g.ctaUrl; }
      else { cta2 = el("button", "g-cta", ctaLabel); cta2.type = "button"; if (live) cta2.disabled = true; }
      next.appendChild(cta2);
      shell.appendChild(next);
    }

    container.appendChild(shell);
  }

  window.LMEGruppe = { render: render, parseVideo: parseVideo };
})();
