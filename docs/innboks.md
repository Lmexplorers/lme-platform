# LME Innboks

Alle kommentarene fra medlemmets egen Facebook-side og Instagram profesjonelle
konto i én innboks, med svar, liking, skjuling og sletting rett fra LME. Siden
ligger på `/innboks` og er en del av LME Studio.

## Hva medlemmet får

- Kommentarer fra Facebook og Instagram i én liste, nyeste først.
- Filter per konto, og "Bare ubesvarte" for å se det som faktisk venter.
- Svar publiseres rett på plattformen kommentaren kom fra.
- Lik (Facebook), skjul eller slett en kommentar.
- "Foreslå svar": Claude skriver et kort, vennlig svar på samme språk som
  kommentaren, som medlemmet kan redigere før det sendes.
- Alt er tospråklig (norsk og engelsk) med språkbytte øverst.

## Filer

| Fil | Hva den gjør |
| --- | --- |
| `innboks.html` | Selve appen (mobil først, samme utseende som Video Studio) |
| `functions/_lib/innboks.js` | Meta Graph API, lagring av tilkoblede kontoer, tilgangssjekk |
| `functions/api/innboks/[[path]].js` | Rutene: status, tilkobling, kommentarer, svar, lik, skjul, slett, forslag |

## Tilgang

Eier har alltid tilgang (samme regel som resten av plattformen). Ellers kreves
et aktivt medlemskap, samme gate som LME Studio. Ingen kreditt trekkes, og
Innboksen koster ingenting per svar. Forslag fra Claude er begrenset til 80 per
døgn per medlem som kostnadsvern, eier har ingen grense.

## Oppsett (gjøres én gang)

Innboksen snakker med Meta, og det krever en Meta-app for LME:

1. Lag en app på `developers.facebook.com`, type Business.
2. Legg til produktet Facebook-innlogging, og sett gyldig svaradresse
   (Valid OAuth Redirect URI) til `https://lmexplorers.com/api/innboks/callback`.
3. Be om tilgangene `pages_show_list`, `pages_read_engagement`,
   `pages_read_user_content`, `pages_manage_engagement`, `instagram_basic` og
   `instagram_manage_comments`. Disse må gjennom Metas app-gjennomgang før
   andre enn testbrukere kan koble til.
4. Lim inn App-ID og app-hemmeligheten på `/innboks` (bare eier ser feltene),
   eller sett dem som miljøvariabler på Pages-prosjektet: `META_APP_ID` og
   `META_APP_SECRET`.

Valgfrie miljøvariabler:

- `META_REDIRECT_URI`: fast svaradresse, hvis siden nås fra flere domener.
- `META_GRAPH_VERSION`: Graph-versjon, standard `v23.0`. Meta pensjonerer
  versjoner etter cirka to år, og da byttes den her uten ny utrulling.

Før app-gjennomgangen er ferdig, kan Renate og andre som står som testbrukere
i Meta-appen bruke Innboksen som vanlig. Alle andre får en rolig beskjed om at
Innboksen ikke er satt opp ennå.

## Lagring i KV (`BUILDER_KV`)

| Nøkkel | Innhold |
| --- | --- |
| `cfg:meta_app` | `{ appId, appSecret }` (satt av eier, alternativ til miljøvariabler) |
| `inbox:<e-post>` | Tilkoblede kontoer med tilgangsnøkler fra Meta |
| `inboxstate:<tilfeldig>` | Kobler et tilkoblingsforsøk til riktig e-post, lever i 10 minutter |
| `inboxc:<e-post>:<konto>` | Mellomlagrede kommentarer, lever i 60 sekunder |

Tilgangsnøklene sendes aldri til nettleseren. Medlemmet kan koble fra når som
helst, og da slettes `inbox:<e-post>` med én gang.

## Slik henter den kommentarer

- **Facebook:** sidens egne innlegg (`/{side}/published_posts`) med
  kommentarene under hvert innlegg, og medlemmets egne svar nestet under.
- **Instagram:** kontoens medier (`/{konto}/media`) med kommentarer og svar.

Svar går til `/{kommentar}/comments` på Facebook og `/{kommentar}/replies` på
Instagram. Liking finnes bare på Facebook, Instagram har ikke noe API for å
like en kommentar, så knappen vises ikke der.

## Begrensninger, verdt å vite

- Innboksen krever en Facebook-side, ikke en vanlig profil, og en Instagram
  profesjonell konto som er koblet til den siden.
- Instagram viser ikke kommentarer på innlegg fra før kontoen ble profesjonell.
- Kommentarer på annonser og på andres innlegg er ikke med, bare medlemmets
  egne innlegg.
- Listen henter de 10 nyeste innleggene per konto, med inntil 25 kommentarer
  på hvert. Det dekker den daglige oppfølgingen uten å tømme Metas timegrense.
