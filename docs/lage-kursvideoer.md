# Slik lager du kursvideoene til «Lær Norsk med Mia &amp; Teo»

To veier som **ikke** er avhengige av den knirkete Higgsfield-MCP-konnektoren.
Manus og AI-prompter til hver leksjon ligger i
[`laer-norsk-video-manus.md`](./laer-norsk-video-manus.md).

> 💡 Viktig om lengde: De fleste AI-videomodeller (inkl. Seedance) lager
> **4–15 sekunders klipp** om gangen. En ~40s leksjonsvideo lages derfor enklest
> som **3–4 korte klipp** som du setter sammen (eller del leksjonen i flere korte
> videoer — det funker fint for små barn).

---

## ✅ Vei A — Claude Code lokalt + Higgsfield CLI (anbefalt)

Her slipper du MCP/OAuth helt. Higgsfield-CLI-et har sin **egen** innlogging.

### 1. Installer Claude Code på maskinen din (om du ikke har det)
```bash
npm install -g @anthropic-ai/claude-code
```
(Krever Node.js. Se https://code.claude.com/docs hvis du vil ha annen metode.)

### 2. Hent prosjektet lokalt
```bash
git clone https://github.com/Lmexplorers/lme-platform.git
cd lme-platform
git checkout claude/dazzling-sagan-gCLsQ
```
Skill-en ligger allerede i `.claude/skills/` i repoet — den lastes automatisk.

### 3. Installer Higgsfield-CLI-et
```bash
curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh
```

### 4. Logg inn (én gang — egen innlogging, IKKE MCP)
```bash
higgsfield auth login
higgsfield account status   # skal vise at du er innlogget
```

### 5. Generer en video
**Enten** la Claude Code styre det: start `claude` i mappen og skriv f.eks.
*«Lag Farger-videoen fra docs/laer-norsk-video-manus.md med Seedance»* — skill-en
`higgsfield-generate` tar over.

**Eller** kjør CLI-et direkte. Finn først riktig modell-ID:
```bash
higgsfield model list --json | jq '.[] | select(.name|test("Seedance";"i"))'
```
Så generer (eksempel «Farger», bruk prompten fra manus-dokumentet):
```bash
higgsfield generate create seedance_2_0 \
  --prompt "Warm gentle Montessori kids animation, Mia and Teo show colors in Norwegian; a soft balloon appears in each color, the Norwegian color word appears large in that color (Rød, Blå, Gul, Grønn), English beneath. Soft pastel palette, no harsh sounds. 16:9." \
  --aspect_ratio 16:9 \
  --wait
```
Kommandoen skriver ut en **URL til den ferdige videoen** når den er klar.

### 6. Legg videoen inn i kurset
1. Last ned mp4-en, gi den et navn (f.eks. `laer-farger.mp4`).
2. Legg den i `videos/`.
3. I `laer-norsk.html`, finn `LESSONS` og endre riktig leksjon fra
   `video:null` → `video:'videos/laer-farger.mp4'`.
4. ```bash
   git add videos/laer-farger.mp4 laer-norsk.html
   git commit -m "Laer Norsk: legg inn Farger-video"
   git push
   ```

> ⚡ Snarvei: Hvis du allerede har denne web-økten åpen, kan du flytte den til
> din egen terminal med `claude --teleport` — da har du åpent nett lokalt.

---

## ✅ Vei B — AI-videoverktøyet du allerede bruker

Du laget jo den første videoen i et AI-verktøy. Bruk det samme — da slipper du alt
av CLI og innlogging.

### Steg
1. Åpne [`laer-norsk-video-manus.md`](./laer-norsk-video-manus.md).
2. Kopiér **master-stilprompten** (øverst) + **prompten for leksjonen** du vil lage.
3. Lim inn i verktøyet ditt. **Bruk samme karakter-referanse for Mia &amp; Teo** som
   i den første videoen, så de ser like ut.
4. Eksportér som **MP4, 1280×720 (16:9)**.
5. Følg «Legg videoen inn i kurset» (steg 6 over) — eller bare **send meg filen her**,
   så legger jeg den inn i kurset og pusher for deg.

### Rekkefølge å lage dem i
1. 🎨 Farger
2. 🔢 Tall og telling
3. 👪 Familien
4. 🍎 Mat og frukt

---

## Når du har én ferdig video
Send den til meg (eller push den), så kobler jeg den inn på riktig leksjon med en
gang. Vi tar gjerne **«Farger» først** som test, og vurderer stilen før vi lager resten. 🌸
