# Woodland Dreams Kort Vest (LME Woodland Dreams, strikkeserie)

Ferdig oppskrift: **`Woodland-Dreams-Kort-Vest-LME.pdf`** (norsk, 16 sider, A4) og
**`Woodland-Dreams-Kort-Vest-LME-EN.pdf`** (engelsk, 16 sider, A4).

Tredje del av den modulære strikkekolleksjonen LME Woodland Dreams (basisbody
+ 6 tilbehørsdeler, pluss det heklede Woodland Fluffy Skirt). Helt original
LME-konstruksjon, ikke en kopi av noe eksisterende mønster: en kort, åpen
vest med treknapper foran, strikket for å tas utenpå Woodland Dreams-
basisbodyen, i en av kolleksjonens fargerike tilbehørsfarger.

## Konstruksjon, kort

Enklere enn bodyens raglankonstruksjon, siden vesten ikke har ermer:

1. Legg opp flatt i halsen (aldri i rundt, fronten er åpen hele veien
   gjennom hele plagget). Strikk 4 rader matstrikk.
2. Sett to maskemarkører (ikke fire som på bodyen, siden det ikke er noen
   ermer å avsette raglanlinjer til): én mellom front-venstre og bak, én
   mellom bak og front-høyre.
3. Øk langs de to skulderlinjene til bæremålet er nådd (annenhver rad, 2 m
   før og 2 m etter hver markør, 8 m totalt pr økerad). Front-venstre og
   front-høyre øker bare langs sin indre kant (den ytre fremkanten holder
   seg rett, siden knappekanten skal sys/tas opp der), bak øker langs
   begge kantene.
4. Del til tre deler ved ermehullet: fell av noen få masker på hver side
   (delt likt mellom front- og bak-delen), fortsett front-venstre, bak og
   front-høyre som tre atskilte deler.
5. Strikk hver del rett ned til leggen, avslutt alle tre med samme antall
   rader matstrikk.
6. Sy sammen skuldrene. Ta opp og strikk matstrikk-kant rundt begge
   ermehullene. Ta opp og strikk knappekant med knapphull langs den ene
   fremkanten, ren matstrikk-kant langs den andre. Sy på knappene.

## Hvorfor "2 skulderlinjer, ikke 4 raglanlinjer"

Bodyen bruker fire raglanlinjer fordi den har to ermer som skal vokse ut fra
bæret. Vesten har ingen ermer, bare et hull der armen stikker gjennom, så
det er bare to linjer å øke langs (front-bak på hver side), ikke fire. Med
bare to linjer må hver linje øke raskere for å nå samme bæremål på et
sammenlignbart antall rader, derfor økes det med 2 masker (ikke 1) på hver
side av hver markør pr økerad, se side 9 i oppskriften.

## Fasthet

22 masker = 10 cm, 30 omganger/rader = 10 cm, glattstrikk på pinne 4 mm,
Sandnes Garn Alpakka, samme fasthet som basisbodyen. Denne fastheten er
brukt i alle beregninger.

## Gradering, metode og reelle tall

Syv størrelser, samme som bodyen: 0-1, 1-3, 3-6, 6-9, 9-12, 12-18,
18-24 måneder. Alle masketall og radtall er reelle, beregnede tall, ikke
frihåndstall. Beregningen ligger i **`grading.py`**, som leser bodyens egen
verifiserte `sizes.json` og skriver `sizes_vest.json` med interne
`assert`-sjekk. Kjør på nytt med:

```bash
python3 grading.py
```

### Ekstra vidde (brystmål)

Vesten skal gå utenpå bodyen (som allerede har sin egen romslighet), pluss
et tynt lag under. Jeg har derfor lagt til **3 cm ekstra vidde** utover
bodyens egen `chest_cm` per størrelse:

```
vest_chest_target_cm = chest_cm (fra basisbodyens sizes.json) + 3,0 cm
```

Dette rundes til nærmeste multiplum av 4 masker (`total_sts_hem`), slik at
bak (halvparten) og hver front (fjerdedel) alltid blir hele tall:
`front_each*2 + back_sts = total_sts_hem` for alle 7 størrelser (verifisert
med `assert`). Den ferdige brystvidden som vises i størrelsestabellen
(`vest_chest_finished_cm = total_sts_hem / fasthet`) er det tallet som
faktisk kommer ut av de avrundede maskene, ikke det urundede måltallet,
for å være ærlig om hva plagget faktisk blir (49,1-65,5 cm over de 7
størrelsene, strengt økende).

### Lengde ("kort vest" skal tydelig være kortere enn bodyen)

```
vest_length_cm = 55 % av body_length_cm (bodyens hals-til-skritt-lengde)
```

55 % gir en vest som stopper godt over skrittet (tydelig kortere enn hele
bodyen, akkurat som navnet «kort vest» tilsier), men som samtidig har nok
lengde til et ordentlig rett stykke under armene, ikke bare et bæreparti.
Jeg prøvde først et lavere forhold (46 %), men da spiste skulderøkingen
alene opp 60-74 % av hele vestens lengde på de minste størrelsene, og det
rette stykket under armene ble urealistisk kort (helt ned i 3 rader/1 cm
glattstrikk på 0-1 mnd, se "Feil jeg fant og rettet" under). 55 % gir et
mye triveligere forhold: skulderøkingen utgjør 46-62 % av total lengde
(mest på de minste, minst på de største, siden de trenger relativt mindre
breddevekst), med minst 10 rader (3,3 cm) rett glattstrikk under armene på
alle størrelser før leggkanten.

### Ermehull, sett opp mot bodyens egen ermeomkrets

Ermehullet (antall avfelte masker på hver side) skal romme bodyens egen
sleeve som går under, uten å bli unødvendig stort (det er en åpning, ikke
et rør). Jeg brukte:

```
armhole_sts = nærmeste partall av (sleeve_after_divide_cm * 0,6 * fasthet)
```

der `sleeve_after_divide` er hentet direkte fra basisbodyens `sizes.json`
(bodyens egen ermeomkrets rett under armen). Dette gir et ermehull på
57-64 % av bodyens ermeomkrets over alle 7 størrelser (se kontrolltabellen
i `grading.py`, `assert 0,45 <= ratio <= 0,8`), verken absurd stramt eller
altfor løst.

### Halsoppligg og skulderøking, regnet tilbake fra bæremålet

Akkurat som bodyens README beskriver at bodyens startfordeling måtte regnes
tilbake fra de ferdige bæremaskene, gjør jeg det samme her: jeg regner
IKKE et halsoppligg og legger til øking oppå, jeg regner et ønsket antall
økerader `N` fra differansen mellom bæremålet (etter deling til ermehull)
og et anslått halsoppligg, og lar selve halsoppligget (`neck_co`,
`front_each_co`, `back_neck_co`) falle ut som det som gjenstår:

```
target = front_each*2 + back_sts + 2*armhole_sts   (bæremål rett før deling)
rf_final = front_each + armhole_sts/2               (front-del rett før deling)
back_final = back_sts + armhole_sts                 (bak-del rett før deling)

vest_neck_sts_est = (neck_circ_cm + 1 cm ekstra luft) * fasthet
N = avrundet( (target - vest_neck_sts_est) / 8 )     (8 m/økerad, 2 linjer x 2m x 2 sider)

front_each_co = rf_final - 2N
back_neck_co  = back_final - 4N
neck_co       = 2*front_each_co + back_neck_co
```

Dette garanterer, ved konstruksjon (ikke ved tilfeldighet), at
`front_each_co*2 + N*4 = rf_final` osv. summerer riktig helt opp til
bæremålet, se `assert`-linjene i `grading.py`. `neck_co` er derfor et
resultat av utregningen, ikke et selvstendig valgt tall, og svinger litt
størrelse for størrelse (44, 52, 56, 52, 56, 56, 64 masker), akkurat slik
bodyens eget `neck_co` også svinger ujevnt (38, 36, 42, 40, 46, 44, 50 i
`../woodland-dreams-basisbody/sizes.json`). Det er forventet og i tråd med
husstilen: de tallene som MÅ øke strengt størrelse for størrelse (brystvidde,
front/bak-masker, lengde) gjør det, mens interne mellomtall som halsoppligg
kan svinge litt på grunn av avrunding, uten at det påvirker sluttresultatet.

### Tall som er strengt økende (verifisert med `assert` i `grading.py`)

`total_sts_hem`, `front_each`, `back_sts`, `vest_chest_finished_cm`,
`vest_length_cm`, `rows_total`, `neck_circ_cm`, `vest_neck_cm` (den viste,
tiltenkte målverdien i størrelsestabellen).

### Tall som aldri blir mindre, men kan gjenta seg (dokumentert, matcher
bodyens presedens for `start_sleeve`/`neck_co`)

`armhole_sts` (12, 12, 12, 14, 14, 14, 16), `inc_rows`/`N` (11, 11, 11, 13,
13, 14, 14), `yoke_rows_total` (26, 26, 26, 30, 30, 32, 32).

## Feil jeg fant og rettet under egen verifisering

**Én reell regnefeil ble funnet og rettet før dette ble skrevet ferdig:**
i første forsøk brukte jeg samme økehastighet som bodyens raglan (1 maske
før og 1 etter hver markør, annenhver rad = 4 m/økerad totalt over 2
linjer). Siden vesten bare har to skulderlinjer i stedet for fire
raglanlinjer, betydde det halvparten av bodyens økehastighet for å dekke en
sammenlignbar breddeøkning, og skulderøkingen alene kom ut på 42-58 rader
(14-19,3 cm), som var LENGER enn hele den tiltenkte vestlengden for 5 av 7
størrelser (altså et negativt antall rader igjen til selve leggen, en
konstruksjon som rett og slett ikke går opp). Jeg rettet dette ved å doble
økehastigheten (2 m før og 2 m etter hver markør pr økerad i stedet for 1,
se "Hvorfor 2 skulderlinjer" over), som ga en realistisk bæredybde på
7,3-9,3 cm. Deretter justerte jeg også lengdeforholdet fra 46 % til 55 % av
bodyens lengde (se "Lengde"-avsnittet over) for å gi et bedre forhold
mellom bæreparti og rett stykke under armene. Begge endringer er reflektert
i de endelige tallene i `sizes_vest.json`, og alle `assert`-sjekk i
`grading.py` består på nytt etter rettingen (16/16 sider i PDF-en uendret).

## Verifisering utført

1. `python3 -m py_compile build_kort_vest.py` - kompilerer rent.
2. `python3 grading.py` - alle interne konsistenssjekk (`assert`) består
   for alle 7 størrelser, skriver `sizes_vest.json`.
3. `python3 build_kort_vest.py` - genererer `kort_vest_no.html` og
   `kort_vest_en.html` uten feil, med lette sanity-sjekk (strengt økende
   brystvidde/lengde/radtall) ved lasting av `sizes_vest.json`.
4. Begge PDF-er generert med Chromium (`--print-to-pdf`) og talt med
   PyMuPDF (`fitz`): 16 sider norsk, 16 sider engelsk, samsvarer.
5. Diakritikk-sjekk kjørt på begge HTML-filene: kun kjent falsk positiv
   (`'fram'`, i "strikker fram og tilbake"), ingen reelle feil.
6. Forsiden og fire konstruksjons-/tabellsider (halskant, skulderøking,
   deling til ermehull, delene ned til leggen, ermehull-kant) rendret til
   PNG med `fitz` (dpi=100) og sett gjennom visuelt: ingen avkuttet tekst,
   ingen overlapp, alle tabelltall stemmer med `sizes_vest.json` og øker
   jevnt og pent størrelse for størrelse.
7. Tre størrelser (0-1, 6-9 og 18-24 måneder) regnet for hånd på nytt fra
   bunnen av, uavhengig av `grading.py` (egen utregning i denne README-en
   og et frittstående kontrollskript brukt underveis), og stemmer nøyaktig
   med tallene i `sizes_vest.json` og PDF-tabellene.
8. `git status --short` bekrefter at bare denne mappen
   (`biblioteket/strikk/woodland-dreams-kort-vest/`) er ny/endret av meg,
   ved siden av søsken-tilbehørsmapper andre agenter bygger samtidig i
   samme kolleksjon.

## Bygge PDF-ene på nytt

```bash
python3 grading.py            # regner og skriver sizes_vest.json på nytt
python3 build_kort_vest.py    # genererer kort_vest_no.html og kort_vest_en.html
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-Kort-Vest-LME.pdf kort_vest_no.html
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-Kort-Vest-LME-EN.pdf kort_vest_en.html
```

Bruker det delte byggesettet i `../../hekle/_shared/lme_pattern_kit.py`
(samme LME-stil som hele hekle- og strikke-kolleksjonen).

Ikke koblet til butikken ennå. Resten av kolleksjonen (5 gjenstående
tilbehørsdeler + Woodland Fluffy Skirt) bygges videre i egne mapper under
`biblioteket/`, og alle deler kobles til butikken samlet når kolleksjonen
er komplett.
