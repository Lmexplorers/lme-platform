# LME-plattformen — prosjektnotater for Claude

Statisk HTML-side (Cloudflare Pages) for Little Montessori Explorers.
Eier: Renate Dahl. Tekst er som hovedregel på **norsk** (bokmål), med engelsk
oversettelse via `data-no` / `data-en` der språkbytte finnes.

## ✍️ Skrivestil — VIKTIG (følg alltid når du skriver/redigerer norsk tekst)

Renate retter ofte disse tingene manuelt. Følg reglene fra start, så slipper hun det:

1. **Anførselstegn og apostrof "oppe"** — bruk rette/typografiske tegn oppe:
   `"sitat"` eller `"sitat"` og apostrof `'`. **Ikke** bruk vinkel-anførselstegn
   `«` `»` (guillemeter). Eksempel: skriv `"Going out"`, ikke `«Going out»`.

2. **Ingen lange bindestreker / tankestreker (`—` eller `–`)** i løpende tekst.
   Det er et typisk AI-mønster. Bruk i stedet komma, kolon, punktum eller "og".
   - Feil: `Du er ikke der for å underholde — du er der for å legge til rette.`
   - Riktig: `Du er ikke der for å underholde, men for å legge til rette.`

3. **Kolon (`:`):** stor forbokstav etter kolon **kun når en hel setning
   (helsetning) følger**. Ellers liten forbokstav (oppramsinger, undertitler,
   setningsfragmenter). Egennavn har alltid stor forbokstav.
   - Hel setning: `Husk: Du trenger ikke være ekspert.`
   - Fragment/liste: `Faste holdepunkter: måltider, hvile og leggetid.` ·
     `Sjekkliste: forberedt miljø` · `Praktisk liv: der alt starter`

4. **Liten forbokstav etter semikolon (`;`)**. Semikolon binder to setninger;
   det skal ikke følges av stor bokstav.

5. **Norske kommaregler** — følg dem nøye:
   - Komma foran `men`, `for`, `så` når de binder sammen to helsetninger.
   - Komma etter en leddsetning som står *foran* hovedsetningen
     (`Når barnet er konsentrert, lar du det få jobbe i fred.`).
   - Komma rundt innskutte setninger.
   - Komma i oppramsing, men som hovedregel **ikke** foran siste `og`.

Disse reglene gjelder all norsk tekst jeg skriver: nettsider, kursinnhold,
e-poster og lignende.

## 🌍 Tospråklig — VIKTIG

**Alt i LME skal lett kunne byttes til engelsk.** Når jeg lager ny tekst på en
side, skal hvert synlig tekst-element ha både `data-no="…"` og `data-en="…"`,
og siden må ha et fungerende språkbytte (samme `switchLanguage`-mønster som
`om-renate.html`: går gjennom alle `[data-no][data-en]` og setter tekst/HTML
etter valgt språk). Lag aldri ny norsk-only tekst uten engelsk oversettelse.

## 🚀 Utgivelse / git

- Utvikling skjer på arbeidsbranchen; publiser ved å ff-merge til `main` og pushe.
  Cloudflare Pages bygger fra `main`.
- Push med retry (2s, 4s, 8s, 16s) ved nettverksfeil.
- Ikke lag pull request med mindre Renate ber om det.

## 🔤 Fontregler — LÅST (aldri avvik)

LMEs fonter er ikke valgfrie. På alle sider, og i alt jeg genererer (også
worker-rendrede sider), gjelder:

- **Overskrifter (h1–h4/h6): Playpen Sans** — kun overskrifter.
- **All annen tekst (brødtekst, knapper, input, lister, osv.): Sasson Montessori.**

Sasson lastes lokalt med `@font-face` fra `/fonts/SassoonMontessori.woff2`
(+ `.ttf`), familienavn `'Sasson Montessori'`. Standard CSS-variabler:
`--font-head:'Playpen Sans',system-ui,sans-serif;`
`--font-body:'Sasson Montessori','Playpen Sans',system-ui,sans-serif;`
Bruk aldri Playpen (eller systemfont/Comic Sans) på brødtekst. Aldri avvik.

## 🧩 Arkitektur (kort)

- Cloudflare Pages + Functions (`functions/`). KV-binding: `BUILDER_KV`.
- Rene URL-er: `/x` krever `x.html` eller `x/index.html`.
- Delt sidemeny: `js/sidebar.js`. Merkefarger/typografi i CSS-variabler (Playpen Sans).

### Kursbygger (for Renate, uten kode)
- `/kursbygger` lager mini- og større kurs som JSON i KV via `functions/api/kurs.js`.
- Kursene vises på `/academy/kurs/<slug>` (`academy/kurs.html` + regel i `_redirects`)
  og listes automatisk under "Dine egne kurs" på `/academy`.
- Samme passord som kursredigering. Detaljer i `docs/kursbygger.md`.

### Rediger tekst på siden (for Renate, uten kode)
- `js/page-editor.js` (vanlige sider) og `js/course-editor.js` (akademi-kurs).
- Bare elementer merket `data-edit="…"` (og `section.crs` på kurs) er redigerbare.
- Lagres i Cloudflare KV via `functions/api/content.js` og `functions/api/course.js`.
- Knappen er skjult: vis med `#rediger` i adressen eller `Ctrl/Cmd+Shift+E`.
  Lagring krever passord (`COURSE_EDIT_PASSWORD`, ellers standardpassordet i koden).
- **Lagret tekst overstyrer HTML-en.** Hvis Renate har redigert en side, spør henne
  før du endrer samme tekst i kildekoden.
