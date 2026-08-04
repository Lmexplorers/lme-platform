# Ellies vognlenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Ellies-vognlenke-LME.pdf`** (norsk, 15 sider, A4) og
**`Ellies-vognlenke-LME-EN.pdf`** (engelsk, 15 sider, A4).

Fjerde oppskrift i **LME Baby Collection "Woodland Dreams"**.

Oppdatert 4. august 2026 etter Renates referansebilder av profesjonelt
stylede vognlenker: bygget fullstendig om fra sju flate motiver (sky, sol,
blad, blomst, stjerne, sommerfugl) til en kjede av heklede kuler og
tre-mellomperler med Ellie-medaljongen (nå med pudderrosa volangkrage) i
midten, en blomst og et blad på hver side, og to trering-rangler (trering
+ dinglende heklet kule) barnet kan gripe etter. Festes i hver ende med en
tre-kuleklips med innkapslet fjærmekanisme (samme klipstype som
smokkelenke-serien), i stedet for det tidligere valget mellom treklips,
plastklips eller trering.

Samme sikkerhetsfokus som `../ellies-smokkelenke/` og `../ellies-rangle/`:
side 13 forklarer hvorfor lengden holdes kort (generelt EN 71-prinsipp om at
snorer/kjeder for barn under 36 måneder skal være så korte som praktisk
mulig), med en tydelig LME-anbefaling (maks 35-40 cm mellom klipsene, ingen
del løsere enn 6-8 cm), IKKE en påstått eksakt regelsitat, pluss en
gjentatt oppfordring om å sjekke ferdig produkt mot gjeldende lokale krav.

- **Garn:** samme Bystrikk Merino + rester som resten av kolleksjonen.
- **Fotoveiledning og QR-kode-plassholder:** samme mal som de andre
  tilbehørsoppskriftene.

## Bygge PDF-ene på nytt

```bash
python3 build_vognlenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-vognlenke-LME.pdf vognlenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-vognlenke-LME-EN.pdf vognlenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Ferdige kopier til nedlasting i butikken ligger i
`butikk/nedlasting/oppskrifter/ellies-vognlenke.pdf` og
`ellies-vognlenke-en.pdf`.
