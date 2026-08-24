# Ellie, det lille dådyret (amigurumi, LME-stil)

Ferdig oppskrift: **`Ellie-hekleoppskrift-LME.pdf`** (norsk, 17 sider, A4) og
**`Ellie-hekleoppskrift-LME-EN.pdf`** (engelsk, 17 sider, A4).

Første oppskrift i **LME Baby Collection "Woodland Dreams"**: et helt originalt
LME-design, ikke en kopi eller nær etterligning av Bambi eller andre kjente
figurer. Ferdig størrelse ca. 18 til 20 cm sittende.

Ni deler hekles hver for seg og sys sammen til slutt: hodet, de to
kinnflekkene, snuten, ørene (x2), kroppen, magepanelet, armene (x2), bena
(x2, med mørk klov), halen, ryggprikkene og en avtakbar sløyfe. Ingen deler
limes.

- **Garn:** Bystrikk Merino (brun/mørkebrun) + DROPS Cotton Merino (naturhvit),
  med litt pudderrosa til sløyfen. Forslag til alternativt garn står i
  oppskriften.
- **Heklenål:** 3,5 eller 4 mm, avhengig av heklefasthet.
- **Øyne:** to versjoner, 16 mm sikkerhetsøyne (fra 3 år) eller broderte øyne
  (babyvennlig).
- **Fonter (låst LME-stil):** Playpen Sans på overskrifter, Sasson Montessori
  på brødtekst.

## Oppdatert 24. august 2026: to kinnflekker i stedet for ett ansiktsfelt

Samme feil som ble oppdaget og rettet på Ellies smokkelenke fantes også her,
i selve hoved-oppskriften: hodet brukte ett stort, rundt "ansiktsfelt" som
sys på som én sammenhengende ring/maske. Referansebildet av Ellie viser
tydelig noe annet: to atskilte, ovale kremhvite kinnflekker, én under hvert
øye, som møtes nede ved snuten, med synlig brunt både mellom flekkene
(nedover neseryggen) og utenfor dem.

Rettet på samme måte som smokkelenken: ett rundt-hekla felt (`ansiktsfelt_rows`,
6 omganger til 36 masker) erstattet med to mindre, separate flekker (`hekle 2`,
4 omganger til 24 masker hver), sydd på hver sin side av hodet med den ene
kanten inn mot midten. Øyeplassering, ansikts-illustrasjonen (SVG på siden om
ansiktet) og materiallisten er alle oppdatert til å matche. Snuten er
uendret, men sys nå fast midt mellom de to nye flekkene i stedet for "midt
nederst i ansiktsfeltet".

**I samme slengen:** oppdaget at denne oppskriften aldri fikk den
platform-wide PDF-bakgrunnsfiksen fra tidligere i august (den har sin egen,
frittstående CSS, ikke det delte byggesettet i `_shared/lme_pattern_kit.py`).
Samme fiks er nå påført direkte i `build_ellie.py`: den tunge
`repeating-linear-gradient()`-bakgrunnen erstattet med en liten,
base64-embedded PNG-flis, og `box-shadow` fjernet fra alle kort/knapper/bilder
(samme rasteriseringsproblem som andre steder på plattformen). PDF-objekttall
falt fra ca. 1540 til ca. 210 per fil, uten synlig kvalitetstap og med
uendret sidetall.

## Bygge PDF-ene på nytt

```bash
python3 build_ellie.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome   # eller annen chromium
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellie-hekleoppskrift-LME.pdf ellie_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellie-hekleoppskrift-LME-EN.pdf ellie_en.html
```

Skriptet genererer begge språkversjoner (`ellie_no.html` / `ellie_en.html`) fra
samme kilde. Produktbildene (`ellie_hero.png`, `ellie_back.png`,
`ellie_face.png`) ligger i denne mappen, ikke på en ekstern sti.

Ferdige kopier til nedlasting i butikken ligger i
`butikk/nedlasting/oppskrifter/ellie-hekle.pdf` og `ellie-hekle-en.pdf`.

## Videre kolleksjon

Samme uttrykk, garnvalg og fargepalett er videreført i fem egne oppskrifter,
alle bygget og lagt i butikken (se `../ellies-smokkelenke/`,
`../ellies-rangle/`, `../ellies-vognlenke/`, `../ellies-ballerinasko/` og
`../ellies-aktivitetsleke/`):

- Ellies smokkelenke
- Ellies rangle
- Ellies vognlenke
- Ellies ballerinasko med sløyfe
- Ellies aktivitetsleke, med speil, blader og ulike teksturer

Kjøpsknappene på produktsidene deres viser fortsatt "Kommer snart" til en
ekte Stripe-betalingslenke er satt opp for hver av dem (se README i hver
mappe og `butikk/butikk-config.js`).
