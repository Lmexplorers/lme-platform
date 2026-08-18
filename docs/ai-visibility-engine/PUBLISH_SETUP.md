# Auto-publisering — alt i Cloudflare (ingen mellomledd)

AI Visibility Engine publiserer artikler **direkte fra Cloudflare Worker-en**:
workeren rendrer en LME-stilet HTML-side og committer den rett til repoet via
GitHub Contents API. Cloudflare Pages deployer automatisk. Ingen Make, ingen
webhook, ingen tredjeparts-ledd.

```
/ai-visibility (🚀 Publiser)
        ▼
ai-visibility-worker.js  /ai/publish
   render LME-HTML + JSON-LD  →  GitHub Contents API (commit /blog/<slug>.html)
                              →  (valgfritt) MailerSend-varsel om ny artikkel
        ▼
Cloudflare Pages bygger og publiserer
```

## Oppsett

Legg disse som **Worker-secrets/variabler** (Cloudflare → Workers → din worker →
Settings → Variables):

| Variabel | Påkrevd | Verdi |
|----------|---------|-------|
| `ANTHROPIC_API_KEY` | ja | `sk-ant-...` (alt AI-innhold) |
| `GITHUB_TOKEN` | for publisering | fine-grained token, **Contents: Read & Write** på `Lmexplorers/lme-platform` |
| `GITHUB_REPO` | nei | default `Lmexplorers/lme-platform` |
| `GITHUB_BRANCH` | nei | default `main` (sett til en test-branch om du vil) |
| `MAILERSEND_API_KEY` | nei | plattformens e-postsystem (samme hemmelighet som `claude-mail.js` bruker); sender varsel når en artikkel publiseres |
| `NOTIFY_EMAIL` | nei | hvem som varsles, default `renate@lmexplorers.com` (sett gjerne din iCloud-adresse) |

Uten `GITHUB_TOKEN` returnerer `/ai/publish` bare den ferdige HTML-en
(ingenting committes), så du kan teste trygt.

## Slik virker det

1. På `/ai-visibility` → *Artikkel-generator* → generer → **🚀 Publiser**.
2. Workeren skriver `/blog/<slug>.html` (oppretter eller oppdaterer; håndterer
   `sha` automatisk ved oppdatering).
3. Cloudflare Pages deployer. Artikkelen er live på
   `https://lmexplorers.com/blog/<slug>`.
4. Er `MAILERSEND_API_KEY` satt, sendes et e-postvarsel om den nye artikkelen
   via MailerSend (plattformens e-postsystem) til `NOTIFY_EMAIL`.

## Pinterest (Fase 3)

Pinterest-pins krever et faktisk bilde, ikke bare prompten engine-en lager i
dag. Når Fase 3 genererer bildet (f.eks. via Cloudflare R2), kan workeren
utvides med et direkte Pinterest-kall på samme måte, fortsatt uten mellomledd.
