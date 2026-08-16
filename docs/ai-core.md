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

### `/ai-kostnader`

Administrasjonssiden. Totaler øverst, deretter tabeller per app, bruker,
leverandør, modell og innholdstype, sortert med det dyreste først. Nederst en
oversikt over hvilke leverandører som har nøkkel i oppsettet (selve nøkkelen
vises aldri).

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

Fase 4 til 7 i `docs/ai-core-arkitektur.md`: ruteren med
reservemodell og dobbeltkall-vern, det felles filbiblioteket, migreringen av
de fire målappene, og til slutt den sammenhengende arbeidsflyten fra idé til
publisering.
