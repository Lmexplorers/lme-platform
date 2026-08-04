# Olivers rangle (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Olivers-rangle-LME.pdf`** (norsk, 13 sider, A4) og
**`Olivers-rangle-LME-EN.pdf`** (engelsk, 13 sider, A4).

Følger opp `../ellies-rangle/`, `../pip-rangle/`, `../felix-rangle/`,
`../molly-rangle/` og `../luna-rangle/` med en versjon for Oliver, den
siste av de fem nye ranglene. Et lite, forenklet bamsehode i varmt lyst
brunt på en trering, med enkle runde ører og en lyseblå volangkrage rundt
halsen, akkurat som Olivers eneste pynt på ham selv. Ingen sløyfe, siden
Oliver aldri har hatt en, bare den rolige, runde bamseformen i miniatyr.
Rangleboksen er trygt gjemt inni hodet.

Bygget etter samme mal som de andre ranglene, med Oliver sitt eget
referansebilde (`oliver_ref.jpg`, kopiert fra
`../oliver-bjorn/oliver_hero.jpg`) på forsiden, tydelig merket
"stiluttrykk-referanse". Kolleksjonslisten på siste side er nå 20 elementer
og hekles derfor i to spalter, for å unngå at siden blir for høy.

## Bygge PDF-ene på nytt

```bash
python3 build_oliver_rangle.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Olivers-rangle-LME.pdf rangle_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Olivers-rangle-LME-EN.pdf rangle_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
