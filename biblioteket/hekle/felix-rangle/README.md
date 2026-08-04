# Felix' rangle (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Felix-rangle-LME.pdf`** (norsk, 13 sider, A4) og
**`Felix-rangle-LME-EN.pdf`** (engelsk, 13 sider, A4).

Følger opp `../ellies-rangle/` og `../pip-rangle/` med en versjon for
Felix. Et lite, forenklet revehode i rustoransje på en trering, med to
små todelte og foldede ører (spisse, som Felix sine egne), en salviegrønn
volangkrage rundt halsen og en miniatyr av signaturdelen hans: en liten
tofarget "minihale"-kule i stedet for sløyfe. Rangleboksen er trygt gjemt
inni hodet.

Bygget etter samme mal som de andre ranglene, med Felix sitt eget
referansebilde (`felix_ref.jpg`, kopiert fra
`../felix-rev/felix_hero.jpg`) på forsiden, tydelig merket
"stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_felix_rangle.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Felix-rangle-LME.pdf rangle_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Felix-rangle-LME-EN.pdf rangle_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
