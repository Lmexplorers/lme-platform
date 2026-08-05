# Mollys vognlenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Mollys-vognlenke-LME.pdf`** (norsk, 14 sider, A4) og
**`Mollys-vognlenke-LME-EN.pdf`** (engelsk, 14 sider, A4).

Følger opp `../ellies-vognlenke/`, `../pip-vognlenke/` og
`../felix-vognlenke/`, oppdatert 4. august 2026 etter Renates
referansebilder av profesjonelt stylede vognlenker, samme ombygging som
de andre: bygget om fra sju flate motiver til en kjede av heklede kuler
og tre-mellomperler med Molly-medaljongen (nå med smørgul volangkrage) i
midten, en blomst og et blad på hver side, og to trering-rangler (trering
+ dinglende heklet kule). Festes i hver ende med en tre-kuleklips med
innkapslet fjærmekanisme (samme klipstype som smokkelenke-serien).
Molly-medaljongen har fortsatt myke ører, en tett løkkemasket mini
ulltopp og en liten smørgul sløyfe oppå, samme signaturuttrykk som resten
av Mollys oppskrifter.

Samme sikkerhetsfokus som `../ellies-vognlenke/`: side 12 forklarer hvorfor
lengden holdes kort, med LME-anbefalingen (maks 35-40 cm mellom klipsene,
ingen del løsere enn 6-8 cm), pluss en påminnelse om å sjekke løkkemaskene
i ulltoppen jevnlig.

Bygget etter samme mal som de andre vognlenkene, med Molly sitt eget
referansebilde (`molly_ref.jpg`, kopiert fra `../molly-lam/molly_hero.jpg`)
på forsiden, tydelig merket "stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_molly_vognlenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Mollys-vognlenke-LME.pdf vognlenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Mollys-vognlenke-LME-EN.pdf vognlenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
