# Pips rangle (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Pips-rangle-LME.pdf`** (norsk, 14 sider, A4) og
**`Pips-rangle-LME-EN.pdf`** (engelsk, 14 sider, A4).

Følger opp `../ellies-rangle/` med en versjon for Pip. Et lite,
forenklet pinnsvinhode i kremhvitt på en trering, med to små todelte ører,
en salviegrønn volangkrage rundt halsen og en miniatyr av Pips
signaturdel: en kort løkkemasket piggstripe langs midtlinjen, i stedet for
sløyfe. Rangleboksen er trygt gjemt inni hodet.

Bygget etter samme mal som `../ellies-rangle/` (samme struktur og
sikkerhetsside), med Pip sitt eget referansebilde
(`pip_ref.png`, kopiert fra `../pip-pinnsvin/pip_hero.png`) på forsiden,
tydelig merket "stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_pip_rangle.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pips-rangle-LME.pdf rangle_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pips-rangle-LME-EN.pdf rangle_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
