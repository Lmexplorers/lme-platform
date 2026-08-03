# LME-plattformen — prosjektnotater for Claude

Statisk HTML-side (Cloudflare Pages) for Little Montessori Explorers.
Eier: Renate Dahl. Tekst er som hovedregel på **norsk** (bokmål), med engelsk
oversettelse via `data-no` / `data-en` der språkbytte finnes.

## 🚫 To ulike navn: LME Studio og LME Autopilot

VIKTIG skille (beskjed fra Renate, morgen etter autoposting-fiksen, presisert
3. august 2026 — bruk aldri ordet "hub" om LME Studio, verken som navn eller
beskrivelse):

- **LME Studio** = navnet på selve skaper-/AI-delen av LME. Dette er det som
  tidligere het "Creative Academy" (og "Creative Studio"). Bruk "LME Studio".
- **LME Autopilot** = appen inni LME Studio, innholdet på autopilot
  (reels, stories, karuseller). Tidligere "LME Content Studio". Skriv aldri
  "LME Content Studio".

De to skal **ikke blandes**: siden/delen er LME Studio, appen inni er LME
Autopilot. "LME Studio" er altså IKKE forbudt. Ikke "rett" det tilbake til
Creative Academy, Creative Studio eller LME Autopilot.

Selve app-kortet/verktøyet (bl.a. på forsiden/dashbordet) skal ellers ikke endres,
"ryddes i" eller få endret lenker/design uten at Renate eksplisitt ber om det.

## 🔓 Eieren skal alltid ha tilgang til alt

Avtalt med Renate 3. august 2026: Renate (eier) skal aldri måtte betale for sitt
eget produkt. Alt som selges eller låses på plattformen (kurs, abonnementer,
apper, utfordringer osv.) skal ha et eier-unntak, samme mønster som
`isOwner()`/`OWNER_EMAILS` i `functions/_lib/access.js` allerede bruker for
LME Autopilot, Video Studio og AI Headshot. For nye betalte produkter uten
egen innlogging (f.eks. en Stripe-betalingslenke-side): sjekk `/api/access`
(`plan === "owner"`) på siden, og gi eieren en egen gratis vei inn i stedet
for kjøpsknappen, ikke bare et unntak dypt i betalings-webhooken.

## 🗺️ Hold roadmapen oppdatert

`/roadmap` skal alltid speile plattformen. Når nye moduler, kurs eller verktøy
lanseres (eller fjernes), oppdater riktig fase på `roadmap.html` i samme slengen.

## 🔗 Alt nytt skal ha et synlig kort/lenke — aldri en gjemt URL

Avtalt med Renate 3. august 2026, etter at 10 000-visninger-utfordringen kun var
nåbar via direkte URL (`/utfordringen`), ikke lenket fra noe sted i plattformen:
en ny side, et nytt kurs eller en ny funnel er ikke ferdig før den også er
lenket fra et synlig sted i plattformen, som et kort i `hero-cta-row` på
`dashboard.html` (samme mønster som Claude-kurs-kortet) eller et annet naturlig
sted i navigasjonen. Renate skal aldri måtte huske eller lete etter en URL for
å finne noe jeg har bygget.

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

6. **LME er kun Renate (enkeltperson).** Skriv "jeg", ikke "vi/oss", når teksten
   er fra LME/Renate til leseren. Gjelder også engelsk ("I", ikke "we").

Disse reglene gjelder all norsk tekst jeg skriver: nettsider, kursinnhold,
e-poster og lignende.

## 🌍 Tospråklig — VIKTIG

**Alt i LME skal lett kunne byttes til engelsk.** Når jeg lager ny tekst på en
side, skal hvert synlig tekst-element ha både `data-no="…"` og `data-en="…"`,
og siden må ha et fungerende språkbytte (samme `switchLanguage`-mønster som
`om-renate.html`: går gjennom alle `[data-no][data-en]` og setter tekst/HTML
etter valgt språk). Lag aldri ny norsk-only tekst uten engelsk oversettelse.

## 🚀 Utgivelse / git

- **Publiser alltid med en gang** (avtalt med Renate 3. juli 2026): når en endring
  er ferdig og verifisert, commit på arbeidsbranchen, ff-merge til `main` og push
  umiddelbart, uten å vente på klarsignal. Cloudflare Pages bygger fra `main`.
- Push med retry (2s, 4s, 8s, 16s) ved nettverksfeil.
- Ikke lag pull request med mindre Renate ber om det.

## 📧 Automatiserte e-postserier — bruk MailerSend, ikke MailerLite-automasjoner

Avtalt med Renate 3. august 2026: for e-postserier som skal sendes automatisk
etter et kjøp eller en hendelse (velkomstserier, oppfølgingsmail, drypp-kampanjer),
bruk **MailerSend rett fra koden**, samme mønster som Claude-kurset
(`functions/_lib/claude-mail.js` + `functions/api/cron/claude-followups.js` +
`.github/workflows/claude-followups.yml`, daglig cron som sender fra en kø i
`BUILDER_KV`). Skriv all e-post-tekst (norsk og engelsk) direkte i koden, og
send via `MAILERSEND_API_KEY` (samme hemmelighet er allerede satt opp).

**Ikke** bygg dette som en MailerLite-automasjon (visuell drag-and-drop-serie
med flere e-poststeg). Grunnen: MailerLites API kan opprette automasjonen og
utløseren, men kan ikke fylle ut selve e-post-designet, hvert e-poststeg må
åpnes og lagres manuelt i deres redigeringsvindu før automasjonen kan
aktiveres. Det er tungvint og tidkrevende for Renate, og hun har bedt om at
det aldri gjøres sånn igjen. MailerLite er fortsatt fint til enkeltstående
utsendelser/nyhetsbrev der hun uansett skal inn og se på innholdet selv.

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
- Delt kontoknapp: `js/lme-account.js` legger bildet + nedtrekksmeny (til egen
  konto, Logg inn/Logg ut) øverst til høyre på alle sider. Hopper automatisk
  over sider som har egen `#avatarMenu`. Innlogging er rullerende (økten fornyes
  ved hvert `/api/auth/me`), så innloggede brukere forblir innlogget.
- `js/lme-member.js` sjekker medlemsstatus (`/api/group/access`) og bytter
  "Bli med i Inner Circle"-knapper (merket `data-lme-join` / `data-lme-enter`)
  til "Gå inn i Inner Circle" for innloggede eiere/medlemmer.

### Kursbygger (for Renate, uten kode)
- `/kursbygger` lager mini- og større kurs som JSON i KV via `functions/api/kurs.js`.
- Kursene vises på `/kurs/<slug>` (`academy/kurs.html` + regel i `_redirects`)
  og listes automatisk under "Dine egne kurs" på `/academy`.
- Samme passord som kursredigering. Detaljer i `docs/kursbygger.md`.

### Gruppebygger (for Renate, uten kode)
- `/gruppebygger` lager salgssider for grupper/fellesskap (Skool-stil) som JSON
  i KV via `functions/api/gruppe.js`.
- Sidene vises på `/g/<slug>` (`academy/gruppe.html` + regel i `_redirects`) og
  listes automatisk under "Finn din gruppe" på `/community`.
- Delt visning: `js/gruppe-render.js` + `css/gruppe.css` (samme utseende i
  byggerens forhåndsvisning og på den offentlige siden). Samme passord som
  kurs. Detaljer i `docs/gruppebygger.md`.

### Mia & Teo Studio (for Renate, uten kode)
- `/mia-teo-studio` lager og publiserer animerte Mia og Teo læringsepisoder
  (3D Pixar-stil) som JSON i KV via `functions/api/episode.js`.
- Episodene vises automatisk i hyllen "Filmer med Mia & Teo" på `/mia-og-teo`
  (Lek & Lær) og spilles av den eksisterende fullskjermspilleren.
- Fast utseende for Mia og Teo (master prompt) og en scene-planlegger ligger i
  selve studioet. Samme passord som kurs/grupper. Detaljer i `docs/mia-teo-studio.md`.

### Video Studio (for medlemmer, betalt med kreditt)
- `/video-studio` lager AI-video med brukerens egen karakter (last opp bilde,
  beskriv scene). Gjenbruker Higgsfield (`functions/api/video-studio.js`) og
  kredittsystemet. Mobil-først, installerbar som PWA.
- Tilgang: eier, Pro/VIP (Inner Circle) eller kjøp av appen. INGEN gratis
  generering, hver video trekker én forhåndskjøpt video-kreditt (refunderes ved
  feil). Tilgang/kreditt-logikk i `functions/_lib/access.js` (`enforceVideoApp`).
  Detaljer i `docs/video-studio.md`.

### Rediger tekst på siden (for Renate, uten kode)
- `js/page-editor.js` (vanlige sider) og `js/course-editor.js` (akademi-kurs).
- Bare elementer merket `data-edit="…"` (og `section.crs` på kurs) er redigerbare.
- Lagres i Cloudflare KV via `functions/api/content.js` og `functions/api/course.js`.
- Knappen er skjult: vis med `#rediger` i adressen eller `Ctrl/Cmd+Shift+E`.
  Lagring krever passord (`COURSE_EDIT_PASSWORD`, ellers standardpassordet i koden).
- **Lagret tekst overstyrer HTML-en.** Hvis Renate har redigert en side, spør henne
  før du endrer samme tekst i kildekoden.

## 🌐 Plattformstruktur — KANONISK (all AI må forstå dette)

LME (Little Montessori Explorers) er **én samlet plattform / ett økosystem**, ikke
en samling separate apper. Beskriv den aldri som "bare en Montessori-plattform", og
omtal aldri delene som frittstående produkter. Montessori-filosofien er fundamentet,
men LME er langt mer: læring, skaping, synlighet, salg og vekst i én sammenhengende
arbeidsflyt: **Lær → Skap → Bli synlig → Selg → Voks.**

Grunnlegger: Renate Dahl (Montessori-pedagog med utdanning fra Høyskolen i Vestfold,
Tønsberg). **Nevn aldri AMI eller Association Montessori Internationale.**

Plattformen har fire hovedområder, alle deler av samme økosystem:

- **LME Montessori** — den pedagogiske grunnmuren. Lærer hva Montessori er og hvordan
  filosofien brukes hjemme, i barnehage og skole. Inneholder blant annet:
  Montessorireisen med Renate, Din Montessorireise, kurs og guider, Biblioteket,
  Ressurser, Musikk, Live-arrangementer, Opptak, Nathalie AI, LME Lek & Lær med Mia & Teo.
- **LME Studio** — skaper- og AI-delen av LME som hjelper brukeren å skape,
  markedsføre og bygge en digital virksomhet med AI. Inneholder blant annet:
  LME Autopilot, Bookly, Builder, AI Visibility Engine, Reel Studio, Blogg,
  Podcast, Kursbygger, Nettsider, e-postmarkedsføring, Automatisering, Funnels,
  Produkter, Analyse, Betaling, Community.
- **LME Community** — møteplassen: fellesskap, medlemskap, Inner Circle, utfordringer,
  arrangementer og støtte fra andre medlemmer.
- **LME Shop** — alle digitale og fysiske produkter (kurs, bøker, ressurser,
  medlemskap og andre produkter).

AI-en skal alltid tenke helhetlig: forstå hvor brukeren er i reisen, hjelpe med
oppgaven her og nå, og foreslå neste naturlige steg. Områdene er deler av én plattform,
ikke separate løsninger.

"Akademiet" i menyen heter "LME Studio". Ikke "Creative Academy", ikke
"Creative Studio", og ikke omtal det som en "hub", bare "LME Studio".
