# LME Sosialplanlegger

Planlegg innlegg, følg opp kommentarer og la automatiseringen svare, på
medlemmets egen Facebook-side og Instagram profesjonelle konto. Siden ligger
på `/planlegger` og er en del av LME Studio. Gamle `/innboks` sendes hit.

## Fire faner, én tilkobling

### 1. Planlegger
Medlemmet skriver innlegget, velger hvilke kontoer det skal ut på, legger ved
et bilde og setter tidspunkt. Innlegget legges i kø og publiseres av seg selv.
"Publiser nå" går rett ut. Køen viser status per innlegg, og hva som eventuelt
feilet på hvilken konto.

- Facebook: tekst alene, eller bilde med tekst.
- Instagram: krever alltid et bilde. Det sies fra med en gang, ikke først når
  innlegget skulle publiseres.
- Bilder lastes opp via `/api/image` og får en offentlig URL, som Instagram
  krever for å kunne hente bildet. URL-en lever i 30 dager, så planlegg
  innlegg innenfor det.

### 2. Kommentarer
Alle kommentarer fra begge plattformer i én liste, nyeste først, med filter
per konto og "Bare ubesvarte". Svar publiseres rett på plattformen kommentaren
kom fra. Lik (kun Facebook), skjul og slett. "Foreslå svar" lar Claude skrive
et kort svar på samme språk som kommentaren.

### 3. Automatisering (ManyChat-stil)
Regler som kjøres automatisk hvert kvarter, og som kan kjøres manuelt med
"Kjør nå". Én regel består av:

| Felt | Betydning |
| --- | --- |
| Aktiv | av/på uten å slette regelen |
| Kontoer | tomt betyr alle tilkoblede kontoer |
| Nøkkelord | tomt betyr alle nye kommentarer |
| Offentlig svar | svaret som legges under kommentaren |
| DM | meldingen som sendes privat til den som kommenterte |
| Lenke i DM | legges til på slutten av DM-en |

Hver kommentar behandles bare én gang (`sseen:<e-post>`), og kommentarer
medlemmet allerede har svart på hoppes over, så ingen får dobbeltsvar.

### 4. Statistikk
Tallene for hver konto: følgere, og de siste 12 innleggene med likerklikk,
kommentarer, delinger (Facebook), lagringer (Instagram), rekkevidde og en
samlet engasjementssum. Beste innlegg løftes fram, og hvert innlegg får en
liten stolpe som viser hvordan det gjorde det mot de andre.

Rekkevidde og lagringer krever egne insights-tilganger fra Meta. Derfor spør
koden først med de feltene, og prøver på nytt uten dem hvis Meta klager. Blir
tilgangene avslått i app-gjennomgangen, virker fanen fortsatt: den viser
likerklikk, kommentarer og delinger, og sier fra om at rekkevidde kommer når
tilgangen er godkjent. Tallene mellomlagres i fem minutter.

## Delt med LME Autopilot

Autopilot (eget prosjekt, `lme-content-studio`) publiserer gjennom den samme
koblingen. Appene deler KV-navnerom, så `social:<e-post>` og `img:<id>` er de
samme postene begge steder:

- Autopilot leser de tilkoblede kontoene og publiserer rett til Meta i
  `functions/_lib/meta-publish.js`.
- Planlagte innlegg fra Autopilot legges i `splan:<e-post>:<id>`, altså den
  samme køen denne bakgrunnsjobben tømmer. Derfor tar `publishTo` nå også
  `videoUrl` og `kind` (post, story, reel), slik at reels fra Autopilot går ut
  av seg selv. Planleggerens egne innlegg sender bare `imageUrl`, og oppfører
  seg nøyaktig som før.

Grunnen: Autopilot krevde tidligere at hver kunde kjøpte et Blotato-abonnement
for å få autopublisering. Da var appen ingen autopilot for den som ikke gjorde
det. Blotato er nå bare veien til TikTok og de andre.

## Filer

| Fil | Hva den gjør |
| --- | --- |
| `planlegger.html` | Selve appen, tre faner, mobil først |
| `functions/_lib/social.js` | Meta Graph API, tilkoblede kontoer, publisering, regler |
| `functions/api/social/[[path]].js` | Alle rutene |
| `functions/api/cron/social.js` | Publiserer modne innlegg og kjører reglene |
| `.github/workflows/social-planner.yml` | Kaller cron-endepunktet hvert kvarter |

## Tilgang

Eier har alltid tilgang (samme regel som resten av plattformen). Ellers kreves
et aktivt medlemskap, samme gate som LME Studio. Ingen kreditt trekkes.
Forslag fra Claude er begrenset til 80 per døgn per medlem som kostnadsvern
(eier har ingen grense), og forbruket logges til `/ai-kostnader` som appen
`planlegger`. Manuell kjøring av automatiseringen er begrenset til 20 i timen
per medlem, så Metas timegrense ikke tømmes med noen raske trykk.

## Oppsett (gjøres én gang)

1. Lag en app på `developers.facebook.com`, type Business.
2. Legg til produktet Facebook-innlogging, og sett gyldig svaradresse
   (Valid OAuth Redirect URI) til `https://lmexplorers.com/api/social/callback`.
3. Be om disse tilgangene, og send dem gjennom Metas app-gjennomgang:
   `pages_show_list`, `pages_read_engagement`, `pages_read_user_content`,
   `pages_manage_engagement`, `pages_manage_posts`, `pages_messaging`,
   `read_insights`, `instagram_basic`, `instagram_manage_comments`,
   `instagram_content_publish`, `instagram_manage_messages`,
   `instagram_manage_insights`.
   De to insights-tilgangene gjelder bare statistikkfanen. Blir de avslått,
   fungerer alt annet som før.
4. Lim inn App-ID og app-hemmeligheten på `/planlegger` (bare eier ser
   feltene), eller sett dem som miljøvariabler på Pages-prosjektet:
   `META_APP_ID` og `META_APP_SECRET`.
5. Legg repo-hemmeligheten `SOCIAL_CRON_TOKEN` i GitHub hvis cron-endepunktet
   skal beskyttes, og sett samme verdi som miljøvariabel i Pages.

Valgfrie miljøvariabler:

- `META_REDIRECT_URI`: fast svaradresse, hvis siden nås fra flere domener.
- `META_GRAPH_VERSION`: Graph-versjon, standard `v23.0`. Meta pensjonerer
  versjoner etter cirka to år, og da byttes den her uten ny utrulling.

Før app-gjennomgangen er ferdig kan eier og andre testbrukere i Meta-appen
bruke alt som vanlig. Alle andre får en rolig beskjed om at planleggeren ikke
er satt opp ennå.

## Lagring i KV (`BUILDER_KV`)

| Nøkkel | Innhold |
| --- | --- |
| `cfg:meta_app` | `{ appId, appSecret }` (satt av eier) |
| `social:<e-post>` | Tilkoblede kontoer med tilgangsnøkler fra Meta |
| `socialstate:<tilfeldig>` | Kobler et tilkoblingsforsøk til riktig e-post, 10 minutter |
| `socialc:<e-post>:<konto>` | Mellomlagrede kommentarer, 60 sekunder |
| `socials:<e-post>:<konto>` | Mellomlagret statistikk, 5 minutter |
| `splan:<e-post>:<id>` | Ett planlagt innlegg. Publiserte og feilede ryddes bort etter 60 dager |
| `srule:<e-post>` | Automatiseringsreglene |
| `sseen:<e-post>` | Kommentarer automatiseringen alt har svart på (de siste 800) |

Tilgangsnøklene sendes aldri til nettleseren. Kobler medlemmet fra, slettes
`social:<e-post>` med én gang.

## Bakgrunnsjobben

`GET /api/cron/social` gjør to ting per runde: publiserer opptil 25 modne
innlegg, og kjører automatiseringen for opptil 25 medlemmer. Blir det flere,
tas resten neste runde et kvarter senere. Jobben kan kjøres manuelt fra
Actions-fanen i GitHub.

## Begrensninger, verdt å vite

- Krever en Facebook-side, ikke en vanlig profil, og en Instagram profesjonell
  konto koblet til den siden.
- Instagram krever bilde på alle innlegg. Video, karusell, reels og stories er
  ikke med i denne versjonen.
- Meta tillater bare DM som svar på en kommentar innenfor et døgn etter at
  kommentaren ble skrevet. Automatiseringen kjører hvert kvarter, så det er
  sjelden et problem, men en DM til en gammel kommentar vil bli avvist.
- Kommentarlisten henter de 10 nyeste innleggene per konto, med inntil 25
  kommentarer på hvert.
- "Social listening" (å lytte etter omtaler andre steder) er ikke med.
