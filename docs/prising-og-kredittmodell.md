# Prising og kredittmodell for LME

Sist oppdatert 26. august 2026.

## Hva dette dokumentet er

Renate hentet inn en anbefaling fra ChatGPT om hvordan LME Autopilot og de
øvrige appene bør prises, og ba om at den ble lagt ved her. Dokumentet har tre
deler, og de må ikke blandes:

1. **Anbefalingen**, slik den ble gitt. Den er et råd, ikke en beslutning.
2. **Det jeg har verifisert** mot koden og mot Stripe.
3. **Det som ikke er avklart**, og som må avgjøres før noe bygges.

Markedstallene i anbefalingen (Buffer, Metricool, Predis, Canva) er **ikke
kontrollert av meg**. Behandle dem som referanse, ikke som fakta, og sjekk dem
mot leverandørenes egne prissider før de brukes i markedsføring.

## 1. Anbefalingen

### Prisene beholdes

| Plan | Månedlig | Årlig | Passer for |
| --- | --- | --- | --- |
| Start | 199 kr | 1 990 kr | Nybegynnere og lett bruk |
| Proff | 549 kr | 5 490 kr | Aktive skapere og små bedrifter |
| VIP | 999 kr | 9 990 kr | Hyppig produksjon og full automatisering |

Årsprisen gir omtrent to måneder gratis, altså rundt 17 % rabatt. **Alle tre
planene bør kunne velges månedlig eller årlig**, ikke bare VIP.

### Grunnprinsippet

Skill tydelig mellom tilgang til programvaren og forbruk av AI. Markedet gjør
det slik: abonnement gir tilgang, en begrenset AI-mengde følger med, og kunden
kan kjøpe mer.

### Innhold per plan

- **Start:** én merkevare, tekst, hooks, captions, SEO og innholdsplan, enkel
  kalender, begrenset autopublisering, liten AI-kvote, ingen eller svært
  begrenset video.
- **Proff:** flere kanaler og merkevarer, mer automatisering, bilder inkludert,
  en mindre mengde video, større AI-kvote, flere LME-verktøy.
- **VIP:** alle funksjoner, større felles kvote, bilde og video, flere
  merkevarer, mer autopublisering, prioritert generering, hele eller store
  deler av appsamlingen.

Skriv aldri "ubegrenset generering", heller ikke på VIP. Bruk en konkret grense
eller en tydelig fair use-grense.

### Kostnadstak

Sett først hvor stor del av hver betaling som maksimalt kan gå til API-kostnad.
Utgangspunktet i anbefalingen er 20 til 25 % av inntekten etter merverdiavgift.
Stripe, drift og lagring kommer i tillegg.

| Plan | Pris | Etter mva (25 %) | AI-pott ved 25 % |
| --- | --- | --- | --- |
| Start | 199 kr | ca. 159 kr | ca. 40 kr |
| Proff | 549 kr | ca. 439 kr | ca. 110 kr |
| VIP | 999 kr | ca. 799 kr | ca. 200 kr |

Se punkt 3: mva-forutsetningen her er ikke avklart for LME.

Generering regnes om til LME-kreditter, og kredittforbruket må kunne endres
administrativt når en leverandør endrer prisene sine. Kunden ser bare
"denne genereringen bruker 40 kreditter, og du har 280 igjen", aldri API-prisen.

Kredittene nullstilles månedlig. Kreditter kjøpt i tillegg kan vare lenger, for
eksempel 6 til 12 måneder, men det må vurderes mot reglene i appbutikkene.

### Livstidstilgang

Selg aldri livstid som inkluderer nye AI-kreditter hver måned. Da selges en evig
kostnad for et engangsbeløp, og det blir spesielt farlig hvis kunden bruker mye
video.

En tryggere modell er livstidstilgang til selve programvaren, med en
engangspakke kreditter ved kjøp, og påfyll kjøpt ved behov. En tidsbegrenset
grunnleggerutgave til de første 25 eller 50 kundene kan fungere, så lenge det er
helt tydelig at AI-forbruk kommer i tillegg.

### De øvrige appene

Ikke lag tre abonnementer for hver av 16 apper. Bruk én LME-konto, én felles
kredittsaldo og noen få tilgangsnivåer: Start, Proff, VIP, kjøp av enkeltapp,
og eventuelt livstid til appsamlingen med AI kjøpt separat.

Del appene i to grupper. De uten løpende kostnad (kalkulatorer, planleggere,
maler, enkle redigeringsverktøy) kan inngå i abonnementet. De med løpende
AI-kostnad (bilde, video, stemme, Nathalie AI, tung tekstproduksjon, AI-analyse)
må trekke kreditter.

### App Store og Google Play

Det var riktig å fjerne priser og kjøpsknapper fra appen, men innlogging alene
er ikke automatisk godkjent hos Apple. Argumentet må føres i "Notes for Review",
med testbruker, og med en tydelig forklaring på at abonnementet administreres på
nettplattformen, at appen ikke inneholder kjøpsknapper, at den ikke oppfordrer
til kjøp utenfor appen, og at eksisterende kunder logger inn for å bruke
tjenesten på mobil.

Google har egne regler for eksterne betalinger og gebyrer som varierer etter
land og program. Ikke anta at fravær av priser i appen løser alt.

## 2. Det jeg har verifisert

**Prisene stemmer overalt.** 199, 549 og 999 kr, og 9 990 kr årlig, i både
kroner og dollar. Sjekket mot Stripe, `plans.js`, `/oppgrader` og appens egen
prismodul 26. august 2026.

**Kredittabellen finnes allerede,** i `functions/_lib/ai-core/prices.js` under
`PLANLAGT`. Den er besluttet, men ikke koblet til noe:

| | Kreditter | Kostnad for Renate |
| --- | --- | --- |
| Tekst | 2 | 0,12 kr |
| Bilde | 14 | 0,85 kr |
| Video | 150 | 9 kr |
| Stemme | 31 per 1 000 tegn | 1,90 kr |

1 kreditt er 20 øre, og prisene er satt til 3,3 ganger leverandørkostnaden.
Påfyllspakkene er også prissatt: 500 kreditter for 99 kr, 1 500 for 279 kr og
4 000 for 690 kr. Anbefalingen om felles kreditter bygger altså på noe som
allerede er tenkt ut, ikke på noe nytt.

**Årlig finnes bare for VIP.** `/oppgrader` viser årsprisene for alle tre, men
det er bare opprettet betalingslenker for VIP årlig. Koden er forsvarlig
skrevet: `annualCapable` sjekker om planen faktisk har en årslenke, så Start og
Proff blir stående på månedspris når bryteren slås om. **Ingen blir
feilbelastet.** Men bryteren ser ødelagt ut for to av tre planer, og
årsbetaling går tapt på nettopp de planene folk flest kjøper. Anbefalingen om
årlig på alle tre er derfor konkret og verdt å gjøre.

**Video følger ikke med i noen plan,** bestemt 26. august 2026. Både appen og
plattformen er rettet slik at ingen av dem lover video. Se `purchase-links.js`
og `PLAN_CAPS` i appens `generate.js`.

## 3. Det som ikke er avklart

**Mva.** Anbefalingens tabell trekker fra 25 % mva på alle priser. Mva-plikt
inntrer først når omsetningen passerer 50 000 kr på tolv måneder, og LME hadde
ingen kunder da dette ble skrevet. Er ikke LME registrert, er 199 kr faktisk
199 kr, og marginene er 25 % bedre enn tabellen viser. Dette endrer hvert tall i
kostnadstaket, og bør avklares med regnskapsfører. Det avgjør også om prisene
bør settes med mva inkludert fra start, så de slipper å økes senere.

**9 990 kr betyr to ting.** Anbefalingen foreslår livstid til 9 990 kr, men det
er allerede prisen på VIP årlig. Da velger ingen VIP årlig. Skal livstid
finnes, må den ligge tydelig over, eller VIP årlig må ned.

**Får en betalende kunde noe i det hele tatt?** Det finnes to KV-lagre på
Cloudflare-kontoen: `lme-cs-accounts` og `lme-builder`. Betalingswebhooken
skriver til `BUILDER_KV`, appen leser `ACCOUNTS_KV`. Peker de på hvert sitt
lager, ser appen aldri abonnementet. `/api/kv-sjekk` i appen svarer på dette.
Dette må avklares før noe bygges oppå, ellers gjør vi bare feilen større.

## 4. Rekkefølge

Svarene på anbefalingens hovedspørsmål, om de fire kredittvalutaene skal bli
én, er skrevet ned i `docs/ai-core-arkitektur.md`, del 8. Kort sagt: ja, og det
bør gjøres mens LME ennå ikke har betalende kunder.


1. Avklar KV-koblingen. Uten den vet vi ikke om et kjøp gir tilgang.
2. Opprett årspriser og betalingslenker for Start og Proff, og legg dem i
   `AUTOPILOT_PAYMENT_LINKS`. Krever at Stripe-tilkoblingen er på plass.
3. Avklar mva-spørsmålet, siden det endrer alle kostnadstallene.
4. Bygg kredittsystemet: kredittall per plan, trekk ved generering, salg av
   påfyllspakker. Tallene godkjennes før koden skrives.
5. Ta livstid og appsamlingen etterpå, som egne beslutninger.
