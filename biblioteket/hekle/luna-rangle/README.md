# Lunas rangle (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Lunas-rangle-LME.pdf`** (norsk, 13 sider, A4) og
**`Lunas-rangle-LME-EN.pdf`** (engelsk, 13 sider, A4).

Følger opp `../ellies-rangle/`, `../pip-rangle/`, `../felix-rangle/` og
`../molly-rangle/` med en versjon for Luna. Et lite, forenklet kaninhode i
varmt grått på en trering, med to små, avlange ører som en miniatyr av
Lunas egne lange ører, en rosa sløyfe mellom ørene og en matchende rosa
volangkrage rundt halsen. Rangleboksen er trygt gjemt inni hodet.

Bygget etter samme mal som de andre ranglene, med Luna sitt eget
referansebilde (`luna_ref.jpg`, kopiert fra
`../luna-kanin/luna_hero.jpg`) på forsiden, tydelig merket
"stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_luna_rangle.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Lunas-rangle-LME.pdf rangle_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Lunas-rangle-LME-EN.pdf rangle_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
