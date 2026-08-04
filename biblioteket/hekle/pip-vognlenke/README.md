# Pips vognlenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Pips-vognlenke-LME.pdf`** (norsk, 14 sider, A4) og
**`Pips-vognlenke-LME-EN.pdf`** (engelsk, 14 sider, A4).

Følger opp `../ellies-vognlenke/`, oppdatert 4. august 2026 etter Renates
referansebilder av profesjonelt stylede vognlenker, samme ombygging som
Ellies: bygget om fra sju flate motiver til en kjede av heklede kuler og
tre-mellomperler med Pip-medaljongen (nå med salviegrønn volangkrage) i
midten, en blomst og et blad på hver side, og to trering-rangler (trering
+ dinglende heklet kule). Festes i hver ende med en tre-kuleklips med
innkapslet fjærmekanisme (samme klipstype som smokkelenke-serien).
Pip-medaljongen har fortsatt sin egen miniatyr av piggstripen hans sydd
langs midtlinjen bak hodet, i tillegg til de to små mørkebrune ørene.

Samme sikkerhetsfokus som `../ellies-vognlenke/`: side 12 forklarer hvorfor
lengden holdes kort, med LME-anbefalingen (maks 35-40 cm mellom klipsene,
ingen del løsere enn 6-8 cm).

Bygget etter samme mal som Ellies vognlenke, med Pip sitt eget
referansebilde (`pip_ref.png`, kopiert fra `../pip-pinnsvin/pip_hero.png`)
på forsiden, tydelig merket "stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_pip_vognlenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pips-vognlenke-LME.pdf vognlenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pips-vognlenke-LME-EN.pdf vognlenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
