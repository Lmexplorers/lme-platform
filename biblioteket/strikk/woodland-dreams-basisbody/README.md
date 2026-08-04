# Woodland Dreams Basisbody (LME Woodland Dreams, strikkeserie)

Ferdig oppskrift: **`Woodland-Dreams-Basisbody-LME.pdf`** (norsk, 16 sider, A4) og
**`Woodland-Dreams-Basisbody-LME-EN.pdf`** (engelsk, 16 sider, A4).

Første del av den nye modulære strikkekolleksjonen LME Woodland Dreams
(basisbody + 6 tilbehørsdeler, pluss det heklede Woodland Fluffy Skirt).
Helt original LME-konstruksjon, ikke en kopi av noe eksisterende mønster:
topp-ned raglan, rund hals, glattstrikk, ribb i hals/mansjett/legg, knapper
i skrittet for bleiebytte, og skulderåpning med knapper på de tre minste
størrelsene (0-1, 1-3, 3-6 måneder) siden halsen ikke er stor nok i seg
selv der.

## Fasthet og gradering

22 masker = 10 cm, 30 omganger = 10 cm, glattstrikk på pinne 4 mm,
Sandnes Garn Alpakka. Denne fastheten er brukt i alle beregninger.

Syv størrelser: 0-1, 1-3, 3-6, 6-9, 9-12, 12-18, 18-24 måneder. Alle
masketall er reelle, beregnede tall, ikke frihåndstall:

- Ferdig brystvidde beregnet fra standard babymål + 6 cm romslighet.
- Bæremaskene ved overarm = front + bak + 2 x erme (4 raglanlinjer, ingen
  ekstra sømmasker), avrundet slik at fasthet x omkrets stemmer og at
  hver størrelse er strengt større enn forrige.
- Halsoppleggingen beregnes fra halsmål x fasthet x 0,82 (vrangbordens
  sammentrekning), avrundet ned til nærmeste tall som gir et helt antall
  økeomganger (8 masker/omgang) fram til bæremålet.
- Startfordelingen ved oppleggingen (front/bak/erme FØR raglanøkingen) er
  regnet tilbake fra bæremaskene minus økingen, ikke antatt. Ermet starter
  på bare 0-1 maske ved de minste størrelsene, helt vanlig i topp-ned
  raglan for baby, og vokser til full bredde gjennom økeomgangene.

Se `sizes.json` for de fulle, verifiserte tallene per størrelse
(halsoppligg, økeomganger, front/bak/erme ved bæremål og ved start,
kroppsmasker og ermemasker etter deling, omgangstall for kropp/erme/ribb).
Genereringsskriptet inneholder interne konsistenssjekk (`assert`) som
bekrefter at halsoppligg + økinger = bæremasker, at kroppen etter deling
stemmer med front+bak+nye masker under armene, osv., slik at tallene i
selve PDF-en aldri kan komme i utakt med hverandre.

**To regnefeil ble funnet og rettet før dette ble skrevet ferdig:** en
tidlig versjon regnet med fire "usynlige sømmasker" i bæret som aldri ble
fordelt til erme eller kropp ved delingen (ga feil kroppsmasketall), og
markørposisjonene i halskant-eksemplene brukte de FERDIGE bæremaskene i
stedet for start-fordelingen ved selve oppleggingen. Begge er rettet og
verifisert på nytt (sidetall uendret: 16/16, alle interne
konsistenssjekk består).

## Konstruksjon, kort

1. Legg opp i halsen (flatt m/skulderåpning på de tre minste
   størrelsene, rundt uten åpning på de fire største).
2. Øk 8 masker/omgang (2 v hver av 4 raglanlinjer, annenhver omgang) til
   bæremålet er nådd.
3. Del til erme og kropp, legg opp 2 nye masker under hver arm.
4. Kroppen ned til skrittet i glattstrikk, avslutt med ribb og en
   knappesplitt (3 treknapper) midt front.
5. Ermene ned til mansjetten i glattstrikk, avslutt med ribb.
6. Skulderåpning (2 treknapper) på de tre minste størrelsene.

## Bygge PDF-ene på nytt

```bash
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
Woodland Fluffy Skirt) bygges videre i egne mapper under `biblioteket/`,
og alle deler kobles til butikken samlet når kolleksjonen er komplett.
