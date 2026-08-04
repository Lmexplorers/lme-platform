# Lunas vognlenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Lunas-vognlenke-LME.pdf`** (norsk, 15 sider, A4) og
**`Lunas-vognlenke-LME-EN.pdf`** (engelsk, 15 sider, A4).

Følger opp `../ellies-vognlenke/`, `../pip-vognlenke/`,
`../felix-vognlenke/` og `../molly-vognlenke/`, oppdatert 4. august 2026
etter Renates referansebilder av profesjonelt stylede vognlenker, samme
ombygging som de andre: bygget om fra sju flate motiver til en kjede av
heklede kuler og tre-mellomperler med Luna-medaljongen (nå med rosa
volangkrage) i midten, en blomst og et blad på hver side, og to
trering-rangler (trering + dinglende heklet kule). Festes i hver ende med
en tre-kuleklips med innkapslet fjærmekanisme (samme klipstype som
smokkelenke-serien). Luna-medaljongen har fortsatt avlange miniatyrører i
stedet for runde, en miniatyr av signaturuttrykket hennes.

Samme sikkerhetsfokus som `../ellies-vognlenke/`: side 13 forklarer hvorfor
lengden holdes kort, med LME-anbefalingen (maks 35-40 cm mellom klipsene,
ingen del løsere enn 6-8 cm).

Bygget etter samme mal som de andre vognlenkene, med Luna sitt eget
referansebilde (`luna_ref.jpg`, kopiert fra `../luna-kanin/luna_hero.jpg`)
på forsiden, tydelig merket "stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_luna_vognlenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Lunas-vognlenke-LME.pdf vognlenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Lunas-vognlenke-LME-EN.pdf vognlenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
