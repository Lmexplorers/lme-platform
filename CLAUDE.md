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

3. **Stor forbokstav etter kolon (`:`)** når det følger en overskrift, setning
   eller hel ledd-setning. Eksempel: `Praktisk liv: Der alt starter.`
   (Rene oppramsinger midt i en setning kan ha liten bokstav: `verktøy: kanne, klut, kost`.)

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

## 🧩 Arkitektur (kort)

- Cloudflare Pages + Functions (`functions/`). KV-binding: `BUILDER_KV`.
- Rene URL-er: `/x` krever `x.html` eller `x/index.html`.
- Delt sidemeny: `js/sidebar.js`. Merkefarger/typografi i CSS-variabler (Playpen Sans).

### Rediger tekst på siden (for Renate, uten kode)
- `js/page-editor.js` (vanlige sider) og `js/course-editor.js` (akademi-kurs).
- Bare elementer merket `data-edit="…"` (og `section.crs` på kurs) er redigerbare.
- Lagres i Cloudflare KV via `functions/api/content.js` og `functions/api/course.js`.
- Knappen er skjult: vis med `#rediger` i adressen eller `Ctrl/Cmd+Shift+E`.
  Lagring krever passord (`COURSE_EDIT_PASSWORD`, ellers standardpassordet i koden).
- **Lagret tekst overstyrer HTML-en.** Hvis Renate har redigert en side, spør henne
  før du endrer samme tekst i kildekoden.
