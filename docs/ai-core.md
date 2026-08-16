# LME AI Core

Det felles laget som binder sammen AI-bruken på tvers av LME-appene. Denne
filen beskriver det som faktisk er bygget. Planen og begrunnelsen for hele
arbeidet ligger i `docs/ai-core-arkitektur.md`.

Status: fase 1, 2 og 3 er ferdige. Fase 4 til 7 gjenstår.

---

## Hva som er bygget

### `functions/_lib/ai-core/registry.js`

Ett sted som beskriver hver AI-modell plattformen bruker: leverandør,
oppgavetype (tekst, bilde, stemme, video, transkribering, rendering,
publisering), hvilke miljøvariabler som må være satt, og hva den koster.

Prisene er delt i to:

- **Anthropic-prisene er verifiserte** mot Anthropics egen prisliste.
  Merk at Claude Sonnet 5 kjører på introduksjonspris (2 og 10 dollar per
  million tokens inn og ut) til og med 31. august 2026, og deretter går opp
  til 3 og 15. Det står i registeret.
- **Alle andre priser er kvalifiserte anslag**, merket `verified: false`.
  Kostnadssiden viser dem med et grått "anslag"-stempel, slik at de aldri
  leses som fasit. Sjekk dem mot leverandørens eget dashbord før du stoler
  på et krontall.

Noen modeller har ingen kjent pris i det hele tatt. Higgsfield-video er den
viktigste: den prises som én forhåndskjøpt video-kreditt på `/kjop-kreditt`,
og det er den autoritative prisen. `costFor()` returnerer `null` for slike,
og `null` betyr "vet ikke", ikke "gratis".

Når du oppdaterer en pris, oppdater også `PRICES_CHECKED` øverst i filen. Da
kan siden si ærlig hvor gammelt tallet er.

### `functions/_lib/ai-core/usage.js`

Forbruksloggen. `logUsage(env, {...})` skriver én linje per AI-kall.

To regler som aldri brytes:

1. **Loggingen kan aldri velte en generering.** Alt er pakket i `try/catch`,
   og `logUsage()` returnerer alltid uten å kaste. En bruker skal aldri miste
   et bilde fordi en KV-skriving feilet.
2. **Loggingen skjer etter at resultatet er sikret.** Kall `logUsage()` når du
   allerede har svaret i hånda, aldri før.

Sammendraget ligger i KV-nøkkelens *metadata*, ikke i verdien. Cloudflare KV
`list()` returnerer nøkkelnavn og metadata i samme kall, inntil 1024 byte per
nøkkel, så kostnadssiden kan lese tusen kall med ett oppslag i stedet for
tusen. Selve detaljobjektet ligger i verdien og hentes bare ved behov.

KV-nøkkel: `ai:usage:<år-måned>:<tidsstempel>-<tilfeldig>`, 400 dagers levetid.

### Promptcache i Nathalie AI

Nathalie sender rundt 2 700 tokens med fast instruks, læreplankunnskap og
priser ved hvert eneste spørsmål. Det ble betalt for på nytt hver gang.
Anthropic-kontoen viste "Prompt caching: Not enabled" med et varsel om at de
fleste ser inndatakostnaden falle mellom 50 og 90 prosent.

Systemprompten sendes derfor som to blokker i stedet for én streng:

1. **Fast blokk**, merket med `cache_control: { type: "ephemeral" }`.
   Grunninstruksen pluss prisene fra `plans.js`. Full pris første gang,
   deretter en tidel så lenge cachen lever (fem minutter, fornyet ved bruk).
2. **Variabel blokk**, uten merke. Tilspisset Nathalie, hvilken side brukeren
   står på, minnet om brukeren og oppslaget i Renates kursinnhold.

**Rekkefølgen er hele poenget.** Anthropic buffrer et prefiks, altså alt fra
starten fram til merket, og treffer bare når prefikset er tegn for tegn likt
forrige gang. Flyttes noe variabelt inn i den faste blokken, bommer cachen ved
hvert kall og hele gevinsten forsvinner. Grensen for at noe buffres i det hele
tatt er 1 024 tokens på Sonnet 5; den faste blokken ligger godt over.

Målt effekt per svar: inndata faller fra $0,0083 til $0,0034, altså **51
prosent billigere per svar**. Ingen endring i hva Nathalie svarer.

Regnestykket i `registry.js` teller bufrede tokens for seg, så
`/ai-kostnader` fortsatt viser sannheten: `cacheReadTokens` prises til 0,1
ganger vanlig inndata, `cacheWriteTokens` til 1,25 ganger. Uten det ville
cachede kall sett billigere ut enn de er.

### `functions/api/ai-core/usage.js`

`GET /api/ai-core/usage?month=2026-08`. Kun for eier. Summerer måneden per
app, bruker, leverandør, modell og innholdstype, og returnerer den sammen med
registerstatusen. Gjør ingen AI-kall og koster ingenting.

### `functions/_lib/ai-core/ratelimit.js` og `tier.js`

En dør stenger folk ute, en grense gjør det ikke. Nathalie AI ligger på 51
sider og er ofte det første møtet noen har med LME, så hun skal være åpen for
alle, også uten konto. Men "åpen for alle" kan ikke bety "uten tak".

`ratelimit.js` teller kall i et fast døgnvindu, med én KV-skriving per kall.
Den er alltid fail-open: svarer ikke KV, slipper brukeren gjennom. En
kostnadsgrense skal aldri kunne bli grunnen til at plattformen føles ødelagt.

`tier.js` avgjør hvilket nivå den som spør hører til, og hvor mange spørsmål
nivået gir per døgn:

| Nivå | Grense per døgn | Tilspisset Nathalie |
| --- | --- | --- |
| eier | ingen | ja |
| kurs (kjøpt signaturkurset) | 200 | ja |
| innlogget | 60 | nei |
| gjest | 20 | nei |

Alle tre grensene kan justeres uten kodeendring, via `NATHALIE_LIMIT_GUEST`,
`NATHALIE_LIMIT_USER` og `NATHALIE_LIMIT_COURSE`.

### Tilspisset Nathalie for kjøpere av signaturkurset

Kjøpere får en Nathalie som er spisset mot det kurset handler om, å skape noe
eget og få det solgt. Hun antar at den hun snakker med har bestemt seg, betalt
og vil ha konkret hjelp til å komme i mål, ikke en introduksjon til LME.

**To ting må gjøres før dette virker:**

1. **Sett `SIGNATURE_COURSE_IDS`** i Pages-innstillingene, en kommaseparert
   liste med kursets id slik den lagres i `purchases:<e-post>`. Er variabelen
   ikke satt, finnes "kurs"-nivået rett og slett ikke, og kjøpere behandles
   som vanlige innloggede brukere. Det er med vilje: da kan ingen bli
   feilaktig oppgradert av en gjetning, og ingen blir stengt ute.
2. **Les gjennom `SHARPENED_INSTRUCTIONS`** i `functions/nathalie-ai.js`.
   Teksten der er et utgangspunkt, ikke Renates egne ord, og bør gjøres til
   hennes og tilpasses det kurset faktisk lover.

### `functions/_lib/ai-core/guard.js`, vern mot dobbeltkall

Det dyreste som skjer er ikke en generering, men den samme genereringen to
ganger: et dobbelttrykk, en treg mobil som sender skjemaet på nytt, en "prøv
igjen" mens det første kallet fortsatt går. Hver av dem koster full pris og
gir nøyaktig samme svar.

Filen gir to nivåer, med vilje forskjellige:

| Nivå | Vindu | Nøkkel | Hva den stopper |
| --- | --- | --- | --- |
| Kort | 90 sekunder | fingeravtrykk av bruker og inndata | dobbelttrykket |
| Langt | 24 timer | `idempotencyKey` fra appen | uttrykkelig samme forsøk |

Det korte vinduet er valgt bevisst. En bevisst ny generering et minutt senere
er en helt legitim ting å ville gjøre, og skal ikke stoppes.

Tre tilstander: `new` (gå videre), `running` (et likt kall pågår, svar 409) og
`done` (vi har svaret fra sist, gi det tilbake gratis). Et mislykket kall
kaller `releaseCall` og kan prøves på nytt umiddelbart, ellers ville vernet
blitt en felle.

### `functions/_lib/ai-core/breaker.js`, strømbryter per leverandør

Når en leverandør er nede, er det verste vi kan gjøre å fortsette å kalle den.
Fire feil på rad setter leverandøren på pause i fem minutter, og ruteren går
rett til reserven i stedet.

Viktig detalj: `isProviderFault()` skiller mellom en leverandør som er nede og
et dårlig svar. Ugyldig JSON fra modellen, manglende nøkkel og 4xx teller
ikke. Ellers kunne ett dårlig prompt i én app satt Claude på pause for hele
plattformen. Bare tidsavbrudd, nettverksfeil, 429 og 5xx teller.

### `functions/_lib/ai-core/router.js`, primær og reserve

`pick(env, oppgave)` gir listen over modeller som bør prøves, i rekkefølge.
Modeller uten nøkkel faller ut, og det samme gjør leverandører med åpen
strømbryter. Er alt utilgjengelig, får kalleren likevel listen tilbake med
`degraded: true`: å prøve en leverandør som kanskje er nede er bedre enn å
nekte brukeren å prøve i det hele tatt.

Ruteren velger ikke noe nytt. Den beskriver rekkefølgen som allerede står i
koden, samlet ett sted, i `CHAINS`.

### `functions/_lib/ai-core/jobs.js`, felles jobbstatus

Én jobb, én id, én tilstand (`pending`, `running`, `done`, `failed`), uansett
hvilken app som startet genereringen. Erstatter ingenting i dag: rutene som
allerede poller fortsetter som før, og skriver i tillegg hit etter hvert som
de tas i bruk. Dette er grunnlaget den sammenhengende arbeidsflyten trenger
for å vise framdrift på tvers av apper.

### Første rute på vernet: `/api/videoflow/script`

Fase 4 er tatt i bruk av én rute først, slik planen sier. To ting sitter foran
det betalte kallet, og ingen av dem endrer den vanlige veien gjennom:

1. Strømbryteren sjekkes **før** kreditten trekkes. Er Anthropic nede, får
   brukeren beskjed uten å bli belastet.
2. Dobbeltkall-vernet gjør to trykk til én generering. Trykk nummer to får
   samme prosjekt tilbake, merket `reused: true`, i stedet for en ny regning.

Alt er fail-open. Svarer ikke KV, trer begge til side og kallet går som før.

### `functions/_lib/plans.js`, én kilde for priser

Nathalie AI oppga i lang tid 299, 499 og 699 kr som LMEs tre planer, til hver
eneste besøkende på 51 sider. Det var de gamle prisene, skrevet rett inn i
systemprompten hennes, og ingenting koblet dem til det som faktisk lå i
Stripe. Nå står prisene i denne filen, og prompten settes sammen fra den.

Tallene er lest fra Stripe 16. august 2026 og verifisert mot hvilken pris
hver levende betalingslenke faktisk peker på, ikke bare mot hvilke priser som
finnes. Det er en viktig forskjell: flere gamle priser ligger fortsatt aktive
ved siden av de nye, og VIP viste seg å være 999 kr, ikke 899.

Skal en pris endres, endres den her og i Stripe. `priceBlock(lang)` gir
prislisten som tekst på norsk eller engelsk, og den ber modellen uttrykkelig
om aldri å finne på en pris som ikke står i listen.

`FREE_TRIAL_DAYS` står på 0. Prompten påsto "7 dagers gratis prøveperiode",
og jeg fant ingen prøveperiode på de levende lenkene, men rakk ikke å lese
alle. Så lenge den står på 0, sier Nathalie ingenting om prøveperiode, som er
tryggere enn å love noe som kanskje ikke finnes.

### `functions/_lib/ai-core/knowledge.js`, Nathalie leser kursene

Nathalie visste mye om LME, men ingenting fra kursene. Hun kunne si at "Voks
på YouTube med AI" finnes, ikke hva som står i det. Det er forskjellen på en
assistent som kan brosjyren og en som kan produktet.

Indeksen bygges av Kursbygger-kursene i KV (upubliserte kurs holdes utenfor)
og kurssidene i akademiet, hentet som HTML og strippet til tekst. Ved hvert
spørsmål plukkes de fire avsnittene som ligner mest, og de legges inn i
systemprompten sammen med hvilket kurs de kommer fra.

Søket er ordbasert med BM25-lignende vekting, ikke vektorsøk. Innholdet er
noen hundre avsnitt, og vektorsøk ville krevd en ny binding, en
innbyggingsmodell og en kostnad per spørsmål for en gevinst som ikke merkes
på denne størrelsen. Skal det byttes senere, er det bare `searchIndex()` som
må skiftes ut.

To ting er med vilje:

- **Er ingenting relevant nok, legges ingenting inn.** Terskelen hindrer at
  Nathalie blir dyttet mot et tilfeldig kursavsnitt når spørsmålet handler om
  noe helt annet.
- **Alt er fail-open.** Er indeksen ikke bygget, eller svarer ikke KV, går
  svaret uendret videre. Kunnskap er et pluss, ikke en forutsetning.

Bygges på nytt fra knappen på `/ai-kostnader`, eller med
`POST /api/ai-core/knowledge`. Gjør det når du har endret eller lagt til et
kurs. `GET /api/ai-core/knowledge?q=...` viser hva hun ville funnet på et gitt
spørsmål, som er den raskeste måten å se om indeksen er god nok.

### `functions/_lib/ai-core/prices.js`, hva en generering koster brukeren

Sidene skal kunne si "å lage videoen koster 1 video-kreditt (ca. 24 kr)" uten
at tallet skrives inn på hver side. Grunnen står i filen: prisene ble skrevet
inn for hånd én gang før, i systemprompten til Nathalie, og da sto det gamle
priser på 51 sider.

Filen beskriver **dagens** priser, altså det som faktisk trekkes mens de fire
valutaene fortsatt finnes. Kronetallene er hentet fra det kredittpakkene
selges for, ikke fra leverandørkostnad, siden det er prisen kunden har betalt.

`PLANLAGT` nederst i filen holder den felles valutaen som er besluttet men
ikke tatt i bruk: 1 kreditt = 20 øre, bilde 14, tekst 2, stemme 31 per tusen
tegn, **video 150**. Video står til 150 og ikke 120 fordi 120 var regnet på
Higgsfields årspris, og Renate kan ikke binde seg årlig før firmaet har
inntekt. På månedlig betaling koster en video omtrent det dobbelte.

En egen test slår fast at `PLANLAGT` ikke er tatt i bruk noe sted ennå.

Vises via `/api/ai-core/prices` (åpen, det er butikkvinduet) og
`js/lme-price.js`. Å legge en pris på en side er da ett attributt:

```html
<span data-lme-price="reel-video"
      data-lme-price-mal="Å lage videoen koster {pris}."
      data-lme-price-mal-en="Making the video costs {pris}."></span>
```

Bygger siden kort etter lasting, kall `window.lmePriceRefresh()`. Feiler
oppslaget, står feltet tomt i stedet for at det står feil pris.

### `functions/_lib/ai-core/payg.js`, fortsett forbi grensen

Etter mønster fra NexLev, som Renate testet 16. august 2026. Kvoten i planen
er veggen. Kunden kan selv velge å fortsette forbi den med forhåndskjøpt
kreditt. Renate ligger aldri ute med noe, fordi kreditten er betalt på
forhånd.

**Forskjellen fra NexLev:** hos dem trekkes kortet når du går forbi grensen,
og derfor MÅ det være avslått som standard. Hos LME er kreditten kjøpt på
forhånd, så det finnes ingen overraskende trekk. Bryteren er derfor til for
det motsatte: å beskytte saldoen, slik at 25 videoer kjøpt til et bestemt
prosjekt ikke blir spist opp av tilfeldige testbilder.

Reglene, i den rekkefølgen de gjelder:

1. **Avslått som standard.** Ingen kreditt brukes uten at kunden har valgt det.
2. **Kjøp av påfyll slår den på**, siden det er grunnen til at kunden kjøpte.
3. **Har kunden selv tatt et valg, står det.** `explicit` husker det, så et
   senere kjøp ikke opphever en bevisst avskruing. Dette ble oppdaget av at
   et testnavn lovet mer enn koden holdt.
4. **Alt føres i kvitteringen**: kjøp, forbruk, saldo etterpå, og hver gang
   bryteren endres. `payg-tx:<e-post>`, maks 200 linjer.
5. **Feiler genereringen, refunderes kreditten.** Det gjorde koden allerede.
6. **Startkreditt gis én gang**, `grantStarterOnce()` er idempotent.

Meldingen når kvoten er brukt opp og bryteren er av sier at kreditten er
spart, ikke oppbrukt, og ber ikke kunden kjøpe noe hun allerede har.

Vises via `/api/ai-core/payg` (GET for status og kvittering, POST for å slå
av og på). Wired inn i `enforceGeneration()` i `functions/_lib/access.js`.

### `/ai-kostnader`

Administrasjonssiden. Totaler øverst, deretter tabeller per app, bruker,
leverandør, modell og innholdstype, sortert med det dyreste først. Nederst en
oversikt over hvilke leverandører som har nøkkel i oppsettet (selve nøkkelen
vises aldri), og et driftspanel som viser hvilken modell som brukes til hver
oppgave, hva som står klart bak den, og om noen leverandør er satt på pause.

Tospråklig med `data-no` / `data-en` og samme `lme_lang`-nøkkel som resten av
plattformen. Playpen Sans på overskrifter, Sasson Montessori på all annen
tekst. Lenket fra et kort i `hero-cta-row` på `dashboard.html`, merket
`data-lme-when="owner"` så bare eieren ser det.

---

## Slik logger du et nytt AI-kall

```js
import { logUsage, anthropicUnits } from "../_lib/ai-core/usage.js";

const t0 = Date.now();
const res = await fetch(/* ... */);
const data = await res.json();

await logUsage(env, {
  app: "navnet-paa-appen",   // videoflow, mia-teo, autopilot, bookly ...
  task: "text",              // text | image | voice | video | transcribe
  modelId: "claude-sonnet-5", // id-en fra registry.js
  email: user.email,          // "" når kallet er anonymt
  units: anthropicUnits(data), // eller { images: 1 } / { chars: n } / { clips: 1 }
  ms: Date.now() - t0,
  status: res.ok ? "ok" : "error",
  error: res.ok ? "" : "claude_" + res.status,
});
```

Bruker du en modell som ikke står i `registry.js`, blir kallet fortsatt logget,
men uten kostnad, og det telles under "Uten kjent pris" på siden. Legg heller
modellen inn i registeret.

`trackUsage(env, entry, fn)` finnes som en innpakning som måler tiden, logger
både suksess og feil, og sender feilen videre uendret.

---

## Hvilke ruter som logger

Alle ruter som gjør et betalt AI-kall:

| App | Ruter |
| --- | --- |
| VideoFlow | manus, scenebilde, scenestemme, scenevideo, restyle, transkribering |
| Mia & Teo | historie, keyframe, klipp, stemme |
| Autopilot | `/api/ai/content`, `/api/ai/repurpose`, `/api/image`, `/api/reel-video`, `/api/youtube-video` |
| Video Studio | `/api/video-studio` |
| AI Headshot | `/api/headshot` |
| Builder | `/ai-generate` |
| Nathalie AI | `/nathalie-ai` |
| Innhold og tekst | `/api/content`, `/api/ai/faq`, `/api/ai/schema`, `/api/translate`, `/api/page-i18n`, `/api/film-script`, `/api/tts`, `/api/utfordring-feedback` |
| Blogg, Bookly, Podcast | `/api/blog`, `/api/bookly/*`, `/api/podcast/*` |

Eneste unntak er `/api/diag`, helsesjekken. Den gjør et bittelite testkall for
å se om nøklene virker, ikke en ekte generering, og står med vilje utenfor.

---

## Ting som ble endret utenfor AI Core

Fase 1 og 3 rørte fire ting utenfor den nye mappen:

1. **`/ai-generate` krever nå innlogging.** Ruten svarte tidligere på alle
   opphav uten sesjonssjekk, så hvem som helst som fant adressen kunne bruke
   plattformens Anthropic-nøkkel. LME Builder kaller alltid med en innlogget
   økt.
2. **`/api/ai/content` og `/api/ai/repurpose` krever nå innlogging.** Begge
   gjorde ekte, betalte AI-kall uten noen sesjonssjekk. Appene som bruker
   dem er innloggede flater. Merk at `/forklaringsvideo` også kaller
   `/api/ai/content`, og den siden lå som et vanlig verktøykort i LME Studio
   uten sperre, så den krever nå innlogging for å generere.
3. **`enforceGeneration()` i `functions/_lib/access.js` returnerer nå også
   e-posten** til den innloggede brukeren på ok-svar, slik at
   Autopilot-rutene kan knytte kostnaden til riktig konto uten et ekstra
   KV-oppslag. Tilgangslogikken er ellers uendret.
4. **Provider-funksjonene i `_lib/videoflow-providers.js` og
   `_lib/miateo-providers.js` tar et valgfritt siste `meta`-argument**
   `{ email }`. Det er bakoverkompatibelt: uten det logges kallet uten e-post.

Ingen eksisterende KV-nøkkel er endret, og ingen kredittsaldo er flyttet.

---

## Det som gjenstår

Fase 5 til 7 i `docs/ai-core-arkitektur.md`: det felles fil- og
prosjektbiblioteket med `handoff` mellom apper, migreringen av de fire
målappene, og til slutt den sammenhengende arbeidsflyten fra idé til
publisering.

Fase 4 er bygget, men bare tatt i bruk av `/api/videoflow/script`. De andre
betalte rutene kan legge på det samme vernet én om gangen, uten at noe annet
må endres.

### Oppryddingen i Stripe, gjort 16. august 2026

Ingen kunder ble rammet: det finnes null aktive abonnementer, det eneste som
noensinne er opprettet var en webhook-test.

**Gjort:**

1. **Seks kredittpakker døpt om** fra "LME Content Studio" til "LME
   Autopilot" (`prod_UwYQlSgMdK7TCE`, `prod_UwYQGpu9AsbkCW`,
   `prod_UwYQsKsbKIepzQ`, `prod_UwYQGmTvyCU1WV`, `prod_UwYQvzzQIBxWTZ`,
   `prod_UwYQrssZgCpy0V`). Navnet vises på kassesiden og kvitteringen, så
   dette var kundevendt.
2. **De tre gamle abonnementsproduktene er arkivert.**
   `prod_UTtEAkoZtrPA0r` og `prod_UTtE2cPsgHzX0x` ble arkivert nå.
   `prod_UTtEhohyPJdQHW` viste seg å ha vært arkivert fra før.
   Ingen av dem sto i `AUTOPILOT_PRODUCT_PLANS`, så en fornyelse på dem
   ville ikke gitt tilgang.
3. **Fem av seks duplikatpriser deaktivert:**
   `price_1TUvSiLax7B8uQzq6CpxJSum` ($49),
   `price_1TwdiqLax7B8uQzqWwk0pwA7` ($89),
   `price_1TwdioLax7B8uQzq00IRqkqs` (899 kr),
   `price_1TwdisLax7B8uQzqmS5N32K0` ($890),
   `price_1TwdisLax7B8uQzqmrRtsOnJ` (8990 kr).
   For hver av dem er det verifisert at ingen levende betalingslenke peker
   dit, ved å lese `line_items` på lenkene `/oppgrader` faktisk tilbyr.

**Står igjen:** `price_1TUvS3Lax7B8uQzqQcZAW8Dx` (499 kr, Proff) er fortsatt
aktiv ved siden av 549 kr. Deaktiveringen ble blokkert av sikkerhetsfilteret,
to ganger, mens de fem andre gikk gjennom. Den må settes inaktiv manuelt.

Bekreftet underveis: beskrivelsen på det arkiverte produktet
`prod_UTtEhohyPJdQHW` lovet "7-dagers gratis prøveperiode". Prøveperioden
hørte altså til de gamle Content Studio-planene, ikke til dagens Autopilot,
og det støtter at `FREE_TRIAL_DAYS` står på 0 i `functions/_lib/plans.js`.

To ting venter fortsatt på Renate:

- `SIGNATURE_COURSE_IDS` må settes i Cloudflare-innstillingene før den
  tilspissede Nathalie kan slå inn.
- `SHARPENED_INSTRUCTIONS` i `functions/nathalie-ai.js` er et utkast og bør
  bli hennes egne ord.

Og én beslutning er tatt, men ikke utført: de fire kredittvalutaene skal bli
én. Det er billigst å gjøre nå, mens ingen har saldo, men det tar borti
Stripe-webhooken og prissidene, så det gjøres ikke uten et eget ja.
