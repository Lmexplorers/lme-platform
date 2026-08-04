# Felix' ballerinasko (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Felix-ballerinasko-LME.pdf`** (norsk, 17 sider, A4) og
**`Felix-ballerinasko-LME-EN.pdf`** (engelsk, 17 sider, A4).

Adaptert fra `../ellies-ballerinasko/` 4. august 2026, etter Renates
referansebilde av de ferdige, rustoransje skoene med kremhvit kant og et
hjerte brodert på sålen. Samme konstruksjon som Ellies sko (oval såle,
overdel med åpning for foten, T-stropp med to trygge lukkingsalternativer,
picotkant), men med Felix' egen identitet i stedet for Ellies:

- Et lite revehode med spisse, foldede ører (rustoransje utenpå, kremhvitt
  inni) sys fast på tåpartiet, i stedet for dådyransiktet.
- I stedet for Ellies sløyfe har Felix sin egen signaturdetalj: en liten,
  tofarget minihale (rustoransje som går over i kremhvitt) sydd fast bak på
  hælen av hver sko, tydelig synlig i referansebildet.
- Den matchende hårsløyfen er byttet ut med en matchende hårklype med samme
  tofargede minihale, i stedet for en sløyfeform.

Tallene i oppskriften følger samme flerstørrelses-konvensjon som Ellies
versjon: `prematur (0-3) 3-6 (6-9) 9-12`. Egen størrelsestabell med
fotlengde på side 4. To trygge lukkingsalternativer for T-stroppen er
beskrevet (uten knapp, eller med en myk heklet knapp), og sikkerhetssiden
fraråder harde plast-/metallknapper på de minste størrelsene.

Forsiden bruker `felix_ballerinasko_real.jpg`, Renates ekte produktbilde av
de ferdige skoene (konvertert fra PNG til JPEG, kvalitet 90), samme
konvensjon som `felix_vognlenke_real.jpg` i `../felix-vognlenke/`.

## Bygge PDF-ene på nytt

```bash
python3 build_felix_ballerinasko.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Felix-ballerinasko-LME.pdf ballerinasko_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Felix-ballerinasko-LME-EN.pdf ballerinasko_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
