# Slå på ekte sanntids-chat (WebSocket)

Gruppe-chatten fungerer allerede i «nær-live»-modus uten noe oppsett: den
henter nye meldinger hvert par sekund via `/api/group/...` på det vanlige
Pages-bygget. Dette dokumentet er for å oppgradere til **ekte sanntids-chat**
med WebSocket og Cloudflare Durable Objects.

Durable Objects kan ikke ligge i Pages-bygget, så chatten deployes som en
egen liten Worker (`workers/lme-chat`) og rutes på samme domene som siden.
Det er et engangsoppsett.

## 1. Finn KV-namespace-id-en

Chatten bruker det samme KV-lageret som resten av LME (`BUILDER_KV`), så
innlogging og medlemskap gjenbrukes.

```bash
npx wrangler kv namespace list
```

Kopier `id`-en til namespacet som i dag er bundet som `BUILDER_KV` på
Pages-prosjektet, og lim den inn i `workers/lme-chat/wrangler.toml` der det
står `DIN_BUILDER_KV_NAMESPACE_ID`.

## 2. Deploy chat-workeren

```bash
cd workers/lme-chat
npx wrangler deploy
```

Dette oppretter Durable Object-klassen `ChatRoom` (migrasjon `v1`) og ruter
workeren på `lmexplorers.com/api/chat-ws/*`. Ruten gjør at innloggings-
cookien `lme_sess` følger med WebSocket-forespørselen, slik at workeren kan
sjekke at brukeren er innlogget og er Inner Circle-medlem før den slipper
noen inn i rommet.

> Merk: ruten krever at `lmexplorers.com` er en sone i samme Cloudflare-konto.
> I dashbordet kan du eventuelt sette ruten manuelt under
> **Workers & Pages → lme-chat → Settings → Domains & Routes**.

## 3. Slå på live-modus i frontend

Gruppesidene laster `/js/lme-chat.js`. Den bruker WebSocket når disse er satt
(ellers faller den automatisk tilbake til polling). Legg inn rett før
`<script src="/js/lme-chat.js...">` på hver `grupper/<id>/index.html`:

```html
<script>
  window.LME_CHAT_LIVE = true;
  window.LME_CHAT_WS_PATH = "/api/chat-ws";
</script>
```

(De fem sidene ligger i `grupper/3-6`, `grupper/6-9`, `grupper/9-12`,
`grupper/voksen` og `grupper/inner-circle`.)

Push til `main` som vanlig. Nå kobler sidene seg til WebSocket. Hvis workeren
av en eller annen grunn ikke svarer, går klienten tilbake til polling helt av
seg selv, så chatten slutter aldri å virke.

## Hvordan det henger sammen

- **Innlogging + medlemskap:** `/api/auth` (uendret). Workeren leser samme
  `sess:<sid>` og `user:<e-post>` fra KV.
- **Lagring:** Durable Object-en holder rommet i minne og i sin egen storage,
  og skriver hver melding gjennom til `gchat:<id>` i KV. Dermed ser også
  polling-klienter (og historikken) det samme.
- **Fallback:** Uten dette oppsettet, eller ved feil, brukes polling mot
  `/api/group/<id>/messages`. Begge deler skriver til samme KV-nøkkel.
