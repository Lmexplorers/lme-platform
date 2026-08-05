# Woodland Dreams Basisbody (LME Woodland Dreams, strikkeserie)

Ferdig oppskrift: **`Woodland-Dreams-Basisbody-LME.pdf`** (norsk, 17 sider, A4) og
**`Woodland-Dreams-Basisbody-LME-EN.pdf`** (engelsk, 17 sider, A4).

Første del av den modulære strikkekolleksjonen LME Woodland Dreams
(basisbody + 6 tilbehørsdeler, pluss det heklede Woodland Fluffy Skirt).
Helt original LME-konstruksjon, ikke en kopi av noe eksisterende mønster
eller oppskrift.

## v2, redesignet

Den første versjonen hadde lange raglanermer og ribb i hals/mansjett/legg,
og ble avvist av Renate ("langt fra det jeg ba om") til fordel for en
lettere, enklere body. Nåværende versjon (denne):

- **Ingen ribb noe sted.** Kun glattstrikk, med en myk **i-cord-avfelling**
  ved alle åpne kanter (beinåpning, ermekant, halskant), forklart én gang
  på sin egen side og gjenbrukt tre steder.
- **Korte, innebygde erme** (ikke lange, ikke løse stropper), fra 4,0 cm
  (0-1 mnd) til 7,0 cm (18-24 mnd), strikket rett i forlengelsen av
  raglanbæret.
- **Skulderåpning med knapper på ALLE 7 størrelser** (ikke bare de 3
  minste som i v1), siden i-cord-kanten ikke strekker seg som ribb ville
  gjort, og halsen derfor trenger en flat åpning uansett størrelse.

Et referansebilde og en referanseoppskrift Renate sendte (Mari Johansens
"Lille Sukkerspinn", en opphavsrettsbeskyttet, kommersiell oppskrift) ble
brukt **kun til å forstå stilen/silhuetten** (lett body, korte erme,
smekk med knapper), ikke kopiert. Konstruksjonen, alle masketall og all
tekst under er egen, uavhengig LME-beregning og -formulering, samme
avtale som resten av kolleksjonen (se Fluffy Skirt-README for samme
opphavsretts-avklaring tidligere i prosjektet).

## Fasthet og gradering

22 masker = 10 cm, 30 omganger = 10 cm, glattstrikk på pinne 4 mm,
Sandnes Garn Alpakka. Denne fastheten er brukt i alle beregninger.

Syv størrelser: 0-1, 1-3, 3-6, 6-9, 9-12, 12-18, 18-24 måneder. Brystvidde,
halsmål og kroppslengde er **uendret fra v1**, med vilje: seks av
tilbehørsdelene (blondekrage, rysjekrage, Peter Pan-krage, smekke,
i-cord-seler, kort vest) leser `chest_cm`/`neck_circ_cm`/`body_length_cm`/
`sleeve_after_divide` direkte fra denne `sizes.json`, og er verifisert
fortsatt kompatible (alle seks bygget om på nytt mot v2-tallene, sidetall
og alle interne konsistenssjekk uendret).

Alle masketall er reelle, beregnede tall, ikke frihåndstall:

- Ferdig brystvidde beregnet fra standard babymål + 6 cm romslighet, som
  før.
- Bæremaskene ved overarm = front + bak + 2 x erme (4 raglanlinjer, ingen
  ekstra sømmasker), som før.
- Halsoppleggingen beregnes nå **direkte fra halsmål x fasthet, uten
  sammentrekningsfaktor** (den gamle 0,82-faktoren fantes bare for å
  kompensere for ribbens strekk, og gir ingen mening uten ribb).
- **Matematisk begrensning oppdaget og løst under omregningen:** hver
  størrelse øker bæret med bare 6 masker (S øker med 1, x6), men hver
  raglan-økeomgang legger til 8 masker. Skulle antall økeomganger økt
  jevnt med størrelsen, ville halsoppligget MÅTTE synke for enkelte
  størrelser et sted i gradering (umulig i praksis). Løsningen (standard i
  raglan-gradering): antall økeomganger holdes fast (`grading_basisbody.py`
  velger automatisk det laveste tallet som funker for alle 7 størrelsene),
  og halsoppligget bærer resten av størrelsesveksten alene. Verifisert med
  et eksplisitt `assert` som krever strengt økende halsoppligg og
  ermelengde på tvers av alle 7 størrelsene.
- Startfordelingen ved oppleggingen (front/bak/erme FØR raglanøkingen) er
  fortsatt regnet tilbake fra bæremaskene minus økingen, ikke antatt.

Se `sizes.json` for de fulle, verifiserte tallene per størrelse.
`grading_basisbody.py` inneholder interne konsistenssjekk (`assert`) som
bekrefter alt dette, slik at tallene i selve PDF-en aldri kan komme i
utakt med hverandre.

## Konstruksjon, kort

1. Legg opp flatt i halsen på ALLE størrelser, med skulderåpning ved
   venstre skulder (lukkes med 2 knapper).
2. Øk 8 masker/omgang (2 v hver av 4 raglanlinjer, annenhver omgang) til
   bæremålet er nådd. Fast antall økeomganger for alle størrelser, se over.
3. Del til erme og kropp, legg opp 2 nye masker under hver arm.
4. Kroppen ned til skrittet i glattstrikk, avslutt med i-cord-avfelling
   og en knappesplitt (3 treknapper) midt front.
5. De korte ermene i glattstrikk, avslutt med i-cord-avfelling.
6. Til slutt: ta opp masker langs hele halskanten og avslutt med samme
   i-cord-avfelling.

## Bygge PDF-ene på nytt

```bash
python3 grading_basisbody.py   # skriver sizes.json på nytt (kun ved tallendringer)
python3 build_basisbody.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-Basisbody-LME.pdf basisbody_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-Basisbody-LME-EN.pdf basisbody_en.html
```

Bruker det delte byggesettet i `../../hekle/_shared/lme_pattern_kit.py`
(samme LME-stil som hele hekle-kolleksjonen).

Ikke koblet til butikken ennå. Resten av kolleksjonen (6 tilbehørsdeler +
Woodland Fluffy Skirt) er bygget i egne mapper under `biblioteket/`, og
alle deler kobles til butikken samlet når kolleksjonen er komplett og
Renate har fått laget/fotografert de fysiske plaggene.
