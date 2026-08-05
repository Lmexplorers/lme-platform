# Mollys rangle (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Mollys-rangle-LME.pdf`** (norsk, 13 sider, A4) og
**`Mollys-rangle-LME-EN.pdf`** (engelsk, 13 sider, A4).

Følger opp `../ellies-rangle/`, `../pip-rangle/` og `../felix-rangle/` med en
versjon for Molly. Et lite, forenklet lammehode i kremhvitt på en trering,
med to myke ører i ett lag (matcher Mollys egne slappe ører), en tett
løkkemasket ulltopp mellom ørene, en liten sløyfe over ulltoppen og en
smørgul volangkrage rundt halsen. Rangleboksen er trygt gjemt inni hodet.

Bygget etter samme mal som de andre ranglene, med Molly sitt eget
referansebilde (`molly_ref.jpg`, kopiert fra
`../molly-lam/molly_hero.jpg`) på forsiden, tydelig merket
"stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_molly_rangle.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Mollys-rangle-LME.pdf rangle_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Mollys-rangle-LME-EN.pdf rangle_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
