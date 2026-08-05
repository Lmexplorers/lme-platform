# Woodland Dreams Peter Pan-krage (LME Woodland Dreams, strikkeserie)

Ferdig oppskrift: **`Woodland-Dreams-Peter-Pan-Krage-LME.pdf`** (norsk, 15 sider, A4)
og **`Woodland-Dreams-Peter-Pan-Krage-LME-EN.pdf`** (engelsk, 15 sider, A4).

Tredje del av den modulære strikkekolleksjonen LME Woodland Dreams (basisbody
+ 6 tilbehørsdeler, pluss det heklede Woodland Fluffy Skirt). Helt original
LME-konstruksjon, ikke en kopi av noe eksisterende mønster: en løs, avrundet
Peter Pan-krage som festes bak med en liten treknapp og en heklet
luftmaskeløkke.

## Konstruksjon

Kragen strikkes flatt, i to identiske halvdeler, **sidelengs**: radene følger
halskanten (fra bakhalskant mot midt front), og antall masker på hver rad er
kragens **dybde** i akkurat det punktet, ikke lengden langs halsen. Det er
denne veksten og nedgangen i masketall (ikke i radtall) som lager den
avrundede, flate Peter Pan-fasongen med de to karakteristiske flikene:

1. **Legg opp og øk**: legg opp 3 masker (likt for alle størrelser) ved
   bakhalskanten. Strikk flatt. Rad 1 vanlig, deretter gjentas et økefelt:
   øk 1 maske ved ytterkanten annenhver rad (halskant-siden holdes rett hele
   veien), til bredeste punkt (ved skulderen) er nådd.
2. **Bredeste punkt og felling**: strikk noen rader rett fram uten
   forandring, fell så symmetrisk (speilvendt av økefeltet) ned igjen mot
   midt front, til bare 3 masker gjenstår. Fell av.
3. **Andre halvdel**: strikk en identisk halvdel til, sy de to sammen midt
   front med en tett søm (madrassøm).
4. **Kant rundt ytterkanten**: ta opp 1 maske pr rad langs hele ytterkanten
   (begge halvdeler), strikk en garterstrikk-kant (5 rader, flat og
   krøller ikke), fell av løst.
5. **Lukking bak**: sy en liten treknapp på den ene bakhalskanten, hekle en
   luftmaskeløkke (heklenål 3 mm) på den andre. De to bakhalskantene sys
   ikke sammen, kragen er løs og ligger over skuldrene, ikke tettsittende
   rundt halsen.

## Fasthet og gradering

22 masker = 10 cm, 30 rader = 10 cm, glattstrikk på pinne 4 mm, Sandnes Garn
Alpakka, samme fasthet som basisbodyen. Denne fastheten er brukt i alle
beregninger.

Syv størrelser: 0-1, 1-3, 3-6, 6-9, 9-12, 12-18, 18-24 måneder, hentet fra
basisbodyens `neck_circ_cm`-felt (21-27 cm) i
`../woodland-dreams-basisbody/sizes.json`. Alle masketall er reelle,
beregnede tall fra `grading.py`, ikke frihåndstall:

- **Rader pr halvdel** = (halv halsomkrets i cm) x radfasthet (3,0 rader/cm),
  avrundet. Dette er lengden radene "beveger seg langs", fra bakhalskant til
  midt front.
- **Maksimal kragedybde** = 4,5 cm ved minste størrelse, + 0,18 cm ekstra pr
  ekstra cm halsomkrets (en enkel, eksplisitt lineær formel, ikke frihåndstall
  pr størrelse), konvertert til masker med maskefastheten (2,2 m/cm).
- **Antall økinger** = maks. dybde i masker minus oppleggsmasker (3). Hver
  øking bruker 2 rader (økerad + rad uten forandring). Fellefeltet er
  identisk, speilvendt.
- **Rader rett fram ved bredeste punkt** = radene pr halvdel minus
  legg-opp-raden og alle øke-/fellerader. Dette tallet må være minst 1 for at
  graderingen skal gå opp, verifisert med `assert` for alle 7 størrelser.
- **Masker tatt opp til kanten** = 1 maske pr rad (1:1 mot radtallet pr
  halvdel), en vanlig tommelfingerregel for oppplukking langs en strikket
  radkant.
- **Garnforbruk** er kalibrert mot basisbodyens eget, allerede oppgitte
  garnforbruk for 0-1 mnd (90-100 g), ikke et oppdiktet tall: skriptet regner
  ut bodyens totale "maskerader" (masker x rader, summert over bæreparti,
  kropp og begge ermer) fra `sizes.json`, deler bodyens garnforbruk på det,
  og bruker samme gram-pr-1000-maskerader-rate på kragens egne maskerader.

Se `grading.py` for hele beregningen og `sizes_collar.json` for de fulle,
verifiserte tallene per størrelse. Skriptet inneholder interne
konsistenssjekker (`assert`) som bekrefter:

- at en rad-for-rad-simulering av økefelt + rette rader + fellefelt gir
  akkurat det samme sluttmasketallet (3) og det samme totale radtallet som de
  uavhengig beregnede tallene (dette fanget faktisk en avrundingsfeil på 1
  rad under utviklingen, se under),
- at halsomkretsen som de to halvdelene til sammen dekker (radtall pr halvdel
  / radfasthet x 2) ligger innenfor 0,6 cm av bodyens egen `neck_circ_cm`,
- at halsomkrets, radtall pr halvdel, maks. kragedybde (i cm) og ferdig
  kragedybde alle øker strengt fra størrelse til størrelse,
- at garnforbruket ikke synker fra størrelse til størrelse.

**Én regnefeil ble funnet og rettet før dette ble skrevet ferdig:** den
første versjonen av rad-for-rad-simuleringen kom ut med ett radtall for mye
sammenlignet med det uavhengig beregnede radtallet pr halvdel, fordi
legg-opp-raden (rad 1, strikket vanlig før selve økefeltet starter) ikke var
trukket fra i formelen for "rader rett fram ved bredeste punkt". Rettet ved å
trekke 1 fra i formelen, verifisert på nytt med simuleringen (alle 7
størrelser består `assert`-sjekken).

## Verifisering utført

1. `python3 -m py_compile build_peter_pan_krage.py` - kompilerer rent.
2. Begge PDF-ene generert og sjekket med PyMuPDF (`fitz`): 15 sider norsk,
   15 sider engelsk, sidetallene stemmer overens.
3. Diakritikk-sjekk (`diacritic_check.py`) kjørt på begge HTML-filene. Første
   kjøring avdekket at store deler av den norske teksten manglet æ/ø/å (var
   skrevet med ASCII-erstatninger som "storrelse", "pa", "lost", "trad" osv.)
   - hele skriptet ble skrevet om med korrekt norsk tegnsetting, og
   sjekken kjørt på nytt til den kun ga treff på det kjente
   falsk-positiv-ordet `fram` (og `var` som CSS `var(--font-head)`, ikke
   norsk tekst).
4. Forsiden og to konstruksjons-/tabellsider (side 8 og 9) rendret til PNG
   med `fitz` (dpi=100) og sett gjennom manuelt: layout er ikke brutt, ingen
   tekst er avkuttet eller overlapper.
5. Tallene for 9-12 mnd og 18-24 mnd regnet ut for hånd på nytt (uavhengig av
   `grading.py`) og sammenlignet mot `sizes_collar.json`: alle verdier
   (radtall pr halvdel, maks. dybde i cm og masker, antall økinger, rader
   rett fram, ferdig kragedybde) stemte eksakt.
6. `git status --short` bekrefter at kun
   `biblioteket/strikk/woodland-dreams-peter-pan-krage/` er rørt, ingen andre
   filer eller mapper i repoet er endret.

## Bygge PDF-ene på nytt

```bash
cd biblioteket/strikk/woodland-dreams-peter-pan-krage
python3 grading.py                     # skriver sizes_collar.json på nytt
python3 build_peter_pan_krage.py       # genererer peter_pan_krage_no.html og _en.html
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-Peter-Pan-Krage-LME.pdf peter_pan_krage_no.html
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-Peter-Pan-Krage-LME-EN.pdf peter_pan_krage_en.html
```

Bruker det delte byggesettet i `../../hekle/_shared/lme_pattern_kit.py`
(samme LME-stil som hele hekle-/strikk-kolleksjonen).

Ikke koblet til butikken ennå, og basisbody-mappen er ikke rørt. Resten av
kolleksjonen (5 andre tilbehørsdeler + Woodland Fluffy Skirt) bygges videre i
egne mapper under `biblioteket/`, og alle deler kobles til butikken samlet
når kolleksjonen er komplett.
