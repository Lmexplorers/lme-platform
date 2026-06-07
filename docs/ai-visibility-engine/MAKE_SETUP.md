# Make.com — Auto-publisering av AI Visibility-artikler

Kobler **LME AI Visibility Engine** til Make.com slik at en generert artikkel
publiseres rett til repoet → Cloudflare Pages deployer den automatisk.

```
ai-visibility.html  ──(🚀 Publiser)──►  ai-visibility-worker.js  /ai/publish
        │                                        │
        │                            render LME-stilet HTML + JSON-LD
        │                                        ▼
        │                              POST {slug, lang, seoTitle, html}
        ▼                                        ▼
  AI Visibility Score                  Make webhook  ──►  GitHub Contents API
                                                          /blog/<slug>.html
                                                              ▼
                                                    Cloudflare Pages (live)
```

## Oppsett (3 steg)

### 1. Importer scenarioet
Make → **Scenarios** → *Create a new scenario* → ⋯-meny → **Import Blueprint** →
velg `docs/ai-visibility-engine/make-blueprint.json`.

Scenarioet inneholder en **Router** med tre grener:
- **Custom webhook** (trigger) — mottar `{slug, lang, seoTitle, title, summary, url, html}`
- **Gren 1 — GitHub**: skriver `/blog/<slug>.html` via Contents API (krever `html`)
- **Gren 2 — MailerLite**: oppretter et kampanje-**utkast** om artikkelen (krever `title`)
- **Gren 3 — Pinterest**: oppretter en pin (krever `imageUrl` — se note nedenfor)

### Tokens å bytte ut
| Gren | Plassholder | Hvor |
|------|-------------|------|
| GitHub | `YOUR_GITHUB_TOKEN` | fine-grained token, Contents: R/W |
| MailerLite | `YOUR_MAILERLITE_TOKEN`, `YOUR_MAILERLITE_GROUP_ID` | MailerLite → Integrations / Groups |
| Pinterest | `YOUR_PINTEREST_TOKEN`, `YOUR_PINTEREST_BOARD_ID` | Pinterest developer app / board |

> **Pinterest-grenen** krever en faktisk bilde-URL. Engine-en lager i dag en
> bilde-*prompt*, ikke et bilde, så grenen kjører først når **Fase 3** genererer
> bildet (Canva/Adobe MCP → R2) og sender `imageUrl` i payloaden. Inntil da
> hopper Make over grenen (filteret `imageUrl exist` er ikke oppfylt).

### 2. Koble webhook → worker
- Åpne webhook-modulen, opprett/bekreft webhooken, **kopier URL-en**.
- I Cloudflare Worker (`ai-visibility-worker.js`): legg URL-en som secret/var
  `MAKE_WEBHOOK_URL`. (Workeren POSTer automatisk dit ved publisering.)

### 3. Gi GitHub-tilgang
I HTTP-modulen, bytt `YOUR_GITHUB_TOKEN` med en fine-grained token
(scope **Contents: Read & Write** for `Lmexplorers/lme-platform`).

> Vil du heller gå via Pull Request? Bytt HTTP-modulen med GitHub-appens
> *Create a File*-modul mot en egen branch, og opprett PR i et neste steg.

Blueprintet skriver i dag til branchen
`claude/lme-ai-visibility-engine-hGkpL`. Endre `branch` til `main` når du er
klar for live-publisering.

## Test
1. Slå på scenarioet.
2. På `/ai-visibility` → *Artikkel-generator* → generer → **🚀 Publiser**.
3. Statuslinjen viser `✅ Sendt til Make`. Sjekk at `/blog/<slug>.html` dukker
   opp i repoet og deployes.

## Bygge det live i din Make-konto via MCP
Hvis du vil at jeg oppretter scenarioet direkte (i stedet for import), gi meg
**Make team-ID-en** (Make → Team settings → ID). Da kan jeg kjøre
`scenarios_create` mot riktig team og forhåndsutfylle GitHub-connection-en din.
