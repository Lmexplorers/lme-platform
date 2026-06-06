# LME AI Visibility Engine — Arkitektur & Integrasjonsplan

> Modul som hjelper Little Montessori Explorers å bli funnet i Google, Pinterest
> og AI-søk (ChatGPT, Gemini, Claude, Perplexity) gjennom automatisert,
> GEO-optimalisert innholdsproduksjon — **bygget rundt eksisterende LME-økosystem.**

Dette dokumentet er skrevet **etter** en faktisk kartlegging av repoet
(`lmexplorers/lme-platform`) og Cloudflare-kontoen, ikke ut fra antakelser.

---

## Fase 0 — Faktisk arkitektur (slik LME er bygget i dag)

LME er **ikke** en tradisjonell app med backend-rammeverk. Det er en
**statisk Cloudflare Pages-site** der hvert område er én selvstendig
HTML-fil, kombinert med **Cloudflare Workers** for alt som krever en server
(AI-kall, hemmeligheter). Dette er fundamentet alt nytt må passe inn i.

| Lag | Teknologi | Bevis i repoet |
|-----|-----------|----------------|
| Frontend | Statiske HTML-filer, Cloudflare Pages, "clean URLs" | `dashboard.html` serveres på `/dashboard`; `_redirects` |
| Designsystem | Inline `:root`-tokens, Playpen Sans, rosa/krem-palett | `--cerise:#E91E89`, `--cream:#FBF6F0` i hver fil |
| AI-backend | Cloudflare Worker → Anthropic API (nøkkel som Worker-secret) | `renate-ai-worker.js`, `lme-proxy.renateshobby.workers.dev` |
| Database | Cloudflare D1 | `lme-bookly`, `lme-inner-circle` (eksisterer) |
| Filer/PDF | GitHub Releases + `/butikk/nedlasting/` | `host-skoledagbok-pdfs.yml` |
| Betaling | Stripe (payment links → takkeside) | `butikk/butikk-config.js`, `takk.html?p=<id>` |
| i18n | NO-autorert + `window.LME_TRANSLATIONS` (NO→EN), `lme_lang` | `dashboard.html` |
| Produktregister | JS-konfig med `{no, en}`-tekst | `butikk/butikk-config.js` |

**Designprinsipp som styrer alt under:** ny funksjonalitet leveres som
selvstendige HTML-sider med samme inline-designsystem + nye Worker-endepunkter
som gjenbruker den eksisterende Anthropic-proxy-en. Ingen ny stack.

---

## Fase 1 — Kartlegging av LME-økosystemet

### Plattform
Selve LME-plattformen = Cloudflare Pages-site (`lme-plattform.pages.dev`,
domener `lmexplorers.com` / `littlemontessoriexplorers.com`) med `/dashboard`
som medlemshjem. Bilingual norsk/engelsk Montessori-plattform.

### Hovedområder (sidebar / nav)
| Område | Fil | Rolle |
|--------|-----|-------|
| Dashbord | `dashboard.html` | Medlems-hjem |
| Akademiet | `academy/` (intro, 3-6, 6-9, 9-12, forberedt-miljø, observasjon) | Kurs |
| Biblioteket | `biblioteket.html`, `ressurser.html`, `favoritter.html` | Ressurser |
| Butikk | `butikk.html` + `butikk/` | Digitale produkter/bøker |
| Community (Inner Circle) | `community.html`, `grupper.html`, `medlemmer.html`, `wins.html`, `live.html`, `replays.html`, `spillplaner.html`, `partnere.html` | Fellesskap |
| Perks | `perks.html` | Medlemsfordeler |
| Min konto / Oppgrader | `min-konto.html`, `oppgrader.html` | Konto & plan |
| Hjelp | `help/` | Support, booking, kontakt |

### Apper / verktøy
- **LME Creative Studio** (`creative-studio.html`) — hub for alle AI-/skaperverktøy.
- **Content Studio** (ekstern: `lme-conten-studio-no-eng.pages.dev`) — bilingual sosiale-medier-innhold (AI SaaS).
- **LME Builder** (`lme-builder.html`) — side-/bok-/ressursbygger (bruker `lme-proxy/ai-generate`).
- **Renate AI** (`spor-renate-ai.html`, `ask-renate-ai.html`, worker `renate-ai-worker.js`) — pedagogisk AI-assistent.
- **Tripwire-funnel** (`funnel/`) — salgstrakt.
- **LME Bookly** (D1: `lme-bookly`) — bok-relatert backend.
- **Mia & Teo Lek & Lær / Skoledagbok** (`skoledagbok/`, `build_book*.py`) — produkter.
- **Learn Norwegian App** — norskopplæring (produktområde).

### Eksisterende AI-funksjoner (VIKTIG — må gjenbrukes, ikke dupliseres)
1. **Renate AI** — Anthropic-proxy med system-prompt (`renate-ai-worker.js`).
2. **LME Builder `ai-generate`** — generativ tekst via `lme-proxy`.
3. **Content Studio** — multi-format sosial-innholdsgenerering.

### Trafikk- og markedsføringsfunksjoner
- Tripwire-funnel, Stripe payment links, takkesider.
- Markedsføringsseksjon i Creative Studio (Forms/Email/Automations — i dag "Snart").
- MailerLite + Make.com tilgjengelig som integrasjoner.

### Oppsummerende oversikt
- **Plattform:** Cloudflare Pages-site, medlemsportal på `/dashboard`.
- **Apper:** Creative Studio, Content Studio, LME Builder, Renate AI, Tripwire, Bookly, Skoledagbok, Learn Norwegian.
- **Verktøy:** AI-generering (proxy), bokbygger, funnel-bygger.
- **Medlemskap:** Start (299/$29), Proff (499/$49), Proff + Fellesskap (699/$69). 7 dager gratis prøve.
- **Bibliotek:** kurs (Akademiet), ressurser/printables (Biblioteket), favoritter, spillplaner.
- **Butikk:** Mia & Teo-bøker, skoledagbøker, arbeidsbøker, digitale Montessori-ressurser (registerdrevet).
- **Community:** Inner Circle — grupper, medlemmer, wins, live-samlinger, replays.

---

## Fase 2 — Naturlig plassering

| Alternativ | Fordel | Ulempe | Dom |
|------------|--------|--------|-----|
| **Egen topp-modul** | Synlig, premium-ferdig | Bryter "ikke nye produkter", isolert fra AI-verktøyene | ❌ |
| Del av Content Studio | Nær innholdsgenerering | Content Studio er en **ekstern** app — vanskelig å utvide raskt | ⚠️ |
| Del av "AI Traffic Engine" | — | Finnes ikke i LME i dag | ❌ |
| Del av markedsføringsområdet | Logisk for trafikk | Markedsføringsseksjonen er kun stubs ("Snart") | ⚠️ |
| Del av medlemskap | Klar premium-vei | Det er en leveringsmekanisme, ikke et hjem | ➕ (Fase 3) |
| **Kombinasjon: ny side under Creative Studio + premium-gating** | Bor der ALLE AI-verktøy bor, gjenbruker proxy/design/i18n, premium-klar | Krever ett nytt kort + sidebar-lenke | ✅ **VALGT** |

**Konklusjon:** AI Visibility Engine blir en ny selvstendig side
(`/ai-visibility`) som hører hjemme i **Creative Studio**-verktøysamlingen
(internt verktøy nå, premium-funksjon senere via eksisterende plan-gating i
`oppgrader.html`). Den **gjenbruker** Renate-/Builder-proxyen i stedet for å
lage en ny AI-stack, og henter innhold fra det eksisterende biblioteket/butikken
i stedet for å duplisere det.

---

## Fase 3 — Arkitekturkjede

```
Bruker (medlem / besøkende)
        │
        ▼
LME Plattform  (Cloudflare Pages — /dashboard, clean URLs, lme_lang i18n)
        │
        ▼
Creative Studio  (verktøy-hub)  ──►  /ai-visibility  (ny side, LME-designsystem)
        │
        ▼
AI Visibility Engine
   ├─ Keyword & Question Discovery
   ├─ SEO/GEO Article Generator (NO/EN)
   ├─ FAQ Engine + Schema Generator (JSON-LD)
   ├─ Pinterest Traffic Generator
   ├─ Content Studio repurpose (1 keyword → mange formater)
   └─ AI Visibility Score (dashboard)
        │
        ▼
ai-visibility-worker.js  (Cloudflare Worker — gjenbruker Anthropic-proxy + D1)
        │
        ▼  publisert, GEO-optimalisert innhold + sitemap + JSON-LD
        ▼
   Google  →  Pinterest  →  ChatGPT  →  Gemini  →  Claude  →  Perplexity
```

---

## Fase 4 — Integrasjoner (gjenbruk, ikke duplisering)

| Eksisterende LME-del | Hvordan AI Visibility Engine kobler seg på | Unngår duplisering av |
|----------------------|--------------------------------------------|------------------------|
| **D1-database** | Ny `lme-ai-visibility` D1 (eller tabeller i eksisterende) — se `ai-visibility-schema.sql` | Egen DB-stack |
| **Innholdsbibliotek** (`biblioteket.html`, `ressurser.html`) | Genererte ressurssider/CTA lenker til biblioteket; artikler refererer eksisterende ressurser | Nytt bibliotek |
| **Blogg/innhold** | Artikler publiseres som Pages-HTML i samme designsystem; FAQ/Schema injiseres | Ny CMS |
| **AI-verktøy** | Bruker `lme-proxy`-Anthropic-proxyen + Renate-system-prompten (merkevarestemme) | Ny AI-integrasjon |
| **Content Studio** | "Repurpose"-endepunkt gjenbruker artikkel → IG/TikTok/Pin/e-post | Ny multi-format-motor |
| **Automasjoner** | Make.com + MailerLite (MCP) for auto-publisering/utsendelse | Ny automasjonsmotor |
| **Butikk-register** | Product/Course Schema genereres fra `butikk-config.js`-mønsteret | Nytt produktregister |
| **Stripe** | Premium-gating av modulen via eksisterende plan-lenker | Ny betalingsflyt |

---

## Fase 5 — Implementeringsplan

### Fase 1 — MVP  *(levert i denne PR-en)*
- `/ai-visibility`-side i LME-designsystem, integrert i Creative Studio (kort + sidebar).
- Worker (`ai-visibility-worker.js`) med endepunkt: keywords, questions, article, faq, schema, pinterest, repurpose.
- D1-skjema (`ai-visibility-schema.sql`).
- AI Visibility Score-dashboard (klientberegnet fra genererte data).
- Bilingual (NO/EN) via samme `lme_lang`-mønster.

### Fase 2 — Utvidelse
- Persistér genererte keywords/artikler i D1 via worker (`POST /ai/save`).
- Google Search Console: sitemap-innsending + URL-inspeksjon (Worker + OAuth-secret).
- Auto-publisering av artikkel som Pages-HTML (GitHub Action, samme mønster som PDF-workflowen).
- Make.com-scenario: ny artikkel → Pinterest + MailerLite.

### Fase 3 — Premium-funksjoner
- Plan-gating (Proff+) via `oppgrader.html`.
- Medlems-spesifikt "Visibility Score" + planlagt innholdskalender.
- AI-readiness-revisjon av eksisterende sider (Schema/FAQ-mangler).

### Fase 4 — Full AI Visibility Suite
- Posisjonssporing i Google + AI-sitat-overvåking (Perplexity/ChatGPT-nevnelser).
- Konkurrent-/emneklynge-analyse (gjenbruk vidIQ MCP der relevant).
- Selvbetjent GEO-autopilot: emne → research → artikkel → schema → pin → e-post → publisering.

---

## Teknisk oppsett (Cloudflare)

```
Cloudflare Pages   →  hele siten + /ai-visibility (statisk)
Cloudflare Worker  →  ai-visibility-worker.js  (AI + D1, Anthropic-secret)
Cloudflare D1      →  lme-ai-visibility  (keywords, questions, articles, faqs, pins, scores)
Cloudflare R2      →  (Fase 2) genererte bilder/Canva-eksport
```

**Hovedregel:** Systemet er optimalisert for **GEO** (Generative Engine
Optimization) like mye som klassisk SEO — strukturert, sitatvennlig innhold med
FAQ + JSON-LD, slik at LME over tid blir en autoritativ kilde innen Montessori,
læring, språk, norskopplæring, bilingual education og Mia & Teo-universet.

Se `ai-visibility-worker.js` og `ai-visibility-schema.sql` for kjørbar kode,
og `/ai-visibility` for brukergrensesnittet.
