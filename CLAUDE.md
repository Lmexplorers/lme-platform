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

## 📚 Hold A til Å-kurset oppdatert

Avtalt med Renate 29. august 2026: `LME-plattformen fra A til Å` er kurset som
viser rundt i hele plattformen, og det skal alltid speile den. Endrer jeg noe
brukeren merker (nytt verktøy, nytt produkt, endret arbeidsflyt), oppdaterer jeg
kurset i samme slengen, i `functions/_lib/seed-plattform-kurs-data.js`, og sier
fra til Renate at hun må kjøre `/kurs-import` én gang for at endringen skal nå
det lagrede kurset.

Importen legger til nye leksjoner OG oppdaterer teksten i leksjoner som er
endret i koden, men bare der teksten er nøyaktig den importen leverte sist. Har
Renate skrevet om en leksjon i Kursbygger, står hennes versjon, og den telles
som beholdt. Arbeidsboken `ressurser/print/lme-plattformen-arbeidsbok.html`
speiler kurset og oppdateres samtidig.

## ⛔ ALDRI skriv `/x  /x.html  200` i `_redirects`

Lært den harde veien 31. august 2026, av to økter samme dag, uavhengig av
hverandre: workshop-økten med `/kurs-import`, og denne med `/momentum`.
Begge la inn en regel som "sikkerhetsnett", og begge gjorde siden umulig å
åpne. Renate fikk `Load cannot follow more than 20 redirections` i Safari.

Grunnen: Cloudflare Pages sender `.html`-adresser videre til den rene
adressen helt av seg selv. Regelen sender den rene adressen tilbake til
`.html`. De to peker på hverandre, og nettleseren gir opp etter tjue hopp.

**En fil i roten trenger ingen regel.** `momentum.html` serveres på
`/momentum` uansett, det er slik rene URL-er virker her fra før. Regelen
løser ingenting og ødelegger siden.

To ting til, som gjorde feilen verre enn den trengte å være:

- **En 301 lagres permanent i Safari.** Har hun rukket å treffe ringen én
  gang, spiller telefonen den av igjen uten å spørre serveren, og
  rettelsen ser ut til å ikke virke. Gi henne da adressen med noe bak, for
  eksempel `?ny=1`, så nettleseren må hente den på nytt. Nye sider bør ha
  `Cache-Control: no-store` i `_headers`, samme som salgssidene.
- **Sjekk at målet finnes.** `/momentum` sendte alle uten tilgang til
  `/momentum-info`, en side som ikke var laget. Peker en kurslås eller en
  regel på en adresse, må den adressen finnes før det publiseres.

## 🛠️ Fiks feil du finner underveis, ikke spør om lov

Avtalt 29. august 2026: finner jeg en feil mens jeg jobber med noe annet,
retter jeg den med en gang og forteller hva jeg gjorde. Renate skal ikke måtte
godkjenne at noe ødelagt blir reparert. Gjelder også feil i deler jeg ikke ble
bedt om å røre. Unntaket er endringer som forandrer hva et produkt ER, eller
som koster penger utad, for eksempel priser, betalingslenker og utsending av
e-post til ekte mottakere. De spør jeg om først.

## 💳 ALLTID Vipps til norske kunder

Sagt av Renate 31. august 2026, etter at jeg laget tre Stripe-betalingslenker
til tjenestepakkene og glemte Vipps: **alt som selges til norske kunder skal ha
Vipps ved siden av kortbetalingen.** Ikke som noe jeg legger til hvis noen ber
om det, men fra første versjon av hver eneste salgsside.

Vipps er allerede bygget, og skal ikke lages på nytt:

- `js/vipps-knapp.js` lager knappen, e-postfeltet og hele kjøpet. Legg
  `data-vipps-produkt="<slug>"` og `data-vipps-type="<type>"` på boksen rundt
  kjøpsknappen, og ta med skriptet nederst på siden. Står det en tom
  `<div class="pay-methods"></div>` rett under kjøpsknappen, havner Vipps
  akkurat der.
- `functions/api/vipps-pay.js` starter kjøpet. Prisen leses ALLTID på
  serveren, aldri fra siden. Varetypene i dag er `lv`, `kurs`, `oppskrift`
  og `tjeneste`. Ny vare betyr en ny gren her.
- `functions/_lib/vipps-lever.js` leverer varen etter betaling, og skal gjøre
  nøyaktig det samme som Stripe-flyten gjør for den samme varen.
- Vipps tar bare kroner, så knappen skjuler seg selv i engelsk visning.
  Kortbetalingen står igjen alene der.

E-postadressen må samles inn før kunden sendes til Vipps. Vipps forteller oss
ikke hvem som betalte, så uten adressen har vi ingen å levere til.

## 👀 Skriv lesbart til Renate, aldri i liten kodeskrift

Sagt av Renate 31. august 2026: hun klarer ikke å lese den lille skriften.
Hun leser stort sett på mobil.

Derfor, i alt jeg skriver til henne i chatten:

- Ikke skriv filnavn, stier, mappenavn eller knappetekst i kodeformat
  (bakoverfnutter). Skriv dem som vanlig tekst i setningen: filen store.js
  ligger i mappen functions, så api.
- Ikke lim inn kodeblokker med mindre hun ber om kode. Forklar hva koden
  gjør i stedet, med vanlige ord.
- Bruk hele setninger og vanlig tekststørrelse. Tabeller er greit når de
  sammenligner tall, men hold dem korte.

Dette gjelder bare chatten. Kommentarer og kode i selve filene skrives som før.

## 🔗 Skriv alltid HELE lenken til Renate

Avtalt 29. august 2026: når jeg nevner en side i chatten, skriver jeg aldri
bare stien (`/min-epost`). Den kan hun ikke trykke på, og hun må sette den
sammen selv. Skriv alltid hele adressen, `https://lmexplorers.com/min-epost`,
også når jeg nevner den midt i en setning eller i en liste. Gjelder alle sider,
også de som bare er for henne.

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

7. **Norske sammensatte ord skrives i ett ord, ikke med bindestrek.**
   Eksempel: `Montessoripedagog`, ikke `Montessori-pedagog`. Bindestrek i
   sammensetninger er engelsk mønster, ikke norsk. Gjelder alle sammensatte
   ord jeg skriver, ikke bare Montessorieksemplene.

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

## 📧 All e-post går via MailerSend — MailerLite er fjernet fra plattformen

Avtalt med Renate 3. august 2026, og skjerpet 12. august 2026 (ryddet HELT ut
av plattformen, ingen unntak lenger): all e-post, både automatiske serier
etter et kjøp eller en hendelse (velkomstserier, oppfølgingsmail, drypp-
kampanjer) OG enkeltstående nyhetsbrev, sendes med **MailerSend rett fra
koden**, samme mønster som Claude-kurset (`functions/_lib/claude-mail.js` +
`functions/api/cron/claude-followups.js` + `.github/workflows/claude-followups.yml`,
daglig cron som sender fra en kø i `BUILDER_KV`). Skriv all e-post-tekst
(norsk og engelsk) direkte i koden, og send via `MAILERSEND_API_KEY` (samme
hemmelighet er allerede satt opp).

Lead-fangst (opt-in-skjemaer) går til plattformens egen abonnentliste
(`BUILDER_KV`, `nl:<e-post>`, `functions/_lib/newsletter.js`), via det
felles endepunktet `functions/api/subscribe.js`. Eier-siden `/email` viser
abonnenttall (fra `functions/api/newsletter-stats.js`), `/automations`
lister de faktiske e-postseriene i koden.

**Bygg aldri noe mot MailerLite igjen**, verken en automasjon (visuell
drag-and-drop-serie) eller bare listeoppbevaring. Grunnen fra 3. august
2026 (opprinnelig avtale): MailerLites API kunne opprette automasjonen og
utløseren, men ikke fylle ut selve e-post-designet, hvert e-poststeg måtte
åpnes og lagres manuelt i deres redigeringsvindu før automasjonen kunne
aktiveres. Det var tungvint og tidkrevende for Renate. 12. august 2026 ba
hun om å fjerne MailerLite fullstendig, inkludert den tidligere unntatte
bruken til enkeltstående nyhetsbrev, så det finnes ikke lenger noe scenario
der MailerLite skal brukes.

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
  Lagring krever passord. Passordet ligger i `functions/_lib/edit-password.js`
  (`LME2026`), og en eventuell hemmelighet `COURSE_EDIT_PASSWORD` i Cloudflare
  godtas i tillegg, ikke i stedet. Skal passordet byttes, endres verdien i den
  filen, så gjelder det alle byggerne.
- **Lagret tekst overstyrer HTML-en.** Hvis Renate har redigert en side, spør henne
  før du endrer samme tekst i kildekoden.

## 🌐 Plattformstruktur — KANONISK (all AI må forstå dette)

LME (Little Montessori Explorers) er **én samlet plattform / ett økosystem**, ikke
en samling separate apper. Beskriv den aldri som "bare en Montessoriplattform", og
omtal aldri delene som frittstående produkter. Montessorifilosofien er fundamentet,
men LME er langt mer: læring, skaping, synlighet, salg og vekst i én sammenhengende
arbeidsflyt: **Lær → Skap → Bli synlig → Selg → Voks.**

Grunnlegger: Renate Dahl (Montessoripedagog med utdanning fra Høyskolen i Vestfold,
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
