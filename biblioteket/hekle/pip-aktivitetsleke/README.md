# Pips aktivitetsleke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Pips-aktivitetsleke-LME.pdf`** (norsk, 21 sider, A4) og
**`Pips-aktivitetsleke-LME-EN.pdf`** (engelsk, 21 sider, A4).

Følger opp `../ellies-aktivitetsleke/`, samme myke aktivitetskube, ca.
11-12 cm per side, med samme grunnkonstruksjon (seks grunnkvadrater med
kantfarge, sydd sammen til en kube rundt skumkvadrater, topphåndtak med
perler, to hjørneringer med perledusker).

**Sidene på kuben følger Renates faktiske referansebilde
(`pip_aktivitetsleke_real.jpg`) og avviker derfor bevisst fra Ellies
kube i antall og innhold:**

- Ellies kube har fem pyntede sider og én helt enkel, udekorert bunn.
  Referansebildet av Pips kube viser derimot **seks tydelig pyntede
  sider, ingen enkel bunn**, så Pips oppskrift har seks motiv-sider i
  stedet for fem.
- **Pip-siden** (front): Pip med piggstripe og salviegrønn volangkrage,
  i stedet for Ellie med sløyfe.
- **Stjerne-siden**: en egen, ny side med kun en stor, smilende
  pudderrosa stjerne og noen bittesmå stjerner rundt, en tydelig egen
  side i referansebildet. Dette finnes ikke som egen side i Ellies kube
  (der er stjernen kun ett av fire småmotiv på formsiden), og er derfor
  den ene ekstra siden som gjør at Pips oppskrift blir 21 sider mot
  Ellies 20.
- **Detaljsiden** (erstatter Ellies "form-siden" med hjerte/stjerne/sirkel/
  trekant): referansebildet viser i stedet et hjerte, et blad, et lite
  speil og en sky sammen på én side, så detaljsiden bruker akkurat disse
  fire motivene.
- **Speil-siden**: et større speil med en salviegrønn, tagget/blomsterlignende
  ramme (tydelig synlig i referansebildet), i stedet for Ellies mindre
  speil i en pudderrosa blomsterramme.
- **Lomme-siden**: miniatyr-Pip som titter opp av en salviegrønn lomme,
  med en liten blomst ved siden av, samme oppbygning som Ellies
  lomme-side.
- **Knitre-siden**: en sky med knitrefolie inni, som på Ellies kube, men
  med noen bittesmå stjerner brodert rundt, etter referansebildet.

Sikkerhetsfokuset er identisk med `../ellies-aktivitetsleke/`: speilet og
knitrefolien skal alltid være helt innsydd (aldri løst i fyllet), og
hjørneringenes perledusker skal aldri overstige ca. 6-8 cm. Siden med
sikkerhet i sin helhet er side 19 av 21 (mot side 18 av 20 hos Ellie,
forskjøvet på grunn av den ekstra stjerne-siden).

## Bygge PDF-ene på nytt

```bash
python3 build_pip_aktivitetsleke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pips-aktivitetsleke-LME.pdf aktivitetsleke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pips-aktivitetsleke-LME-EN.pdf aktivitetsleke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
