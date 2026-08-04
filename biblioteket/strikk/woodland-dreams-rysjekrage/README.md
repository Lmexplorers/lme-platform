# Woodland Dreams Rysjekrage (LME Woodland Dreams, strikkeserie)

Ferdig oppskrift: **`Woodland-Dreams-Rysjekrage-LME.pdf`** (norsk, 14 sider, A4) og
**`Woodland-Dreams-Rysjekrage-LME-EN.pdf`** (engelsk, 14 sider, A4).

Ett av seks tilbehørsstykker i den modulære strikkekolleksjonen LME Woodland
Dreams (basisbody + 6 tilbehørsdeler, pluss det heklede Woodland Fluffy
Skirt). Helt original LME-konstruksjon, ikke en kopi av noe eksisterende
mønster: en løs krage strikket flatt fram og tilbake, fra halskant til
rysjekant, som lukkes bak med én liten treknapp og en heklet løkke. Samme
feste som kolleksjonens blondekrage (bygges parallelt i søskenmappen
`woodland-dreams-blondekrage/`, ikke rørt herfra), men med en fyldigere,
rysjete kant i stedet for en blondekant, "mer romantisk" per Renates spec.

## Konstruksjon

Kragen strikkes i ett stykke, flatt fram og tilbake (siden den åpner bak),
i fire deler:

1. **Legg opp og halskant.** Legg opp langs halskanten, minus en liten
   bakåpning (2,5 cm, fast for alle størrelser, siden knapp og løkke ikke
   trenger å skaleres med barnets størrelse). Strikk en kort vrangbord
   (r1 vr1, 4 rader) for struktur.
2. **Glattstrikket felt.** Bytt til glattstrikk og strikk 6 rader rett ned,
   uten øking, for litt fall før rysjen.
3. **Doblingsraden (rysjen).** Én rettsiderad med tilslag (k1fb) i hver
   eneste maske dobler masketallet nøyaktig. Det er denne fordoblingen,
   ikke et mønster eller en tettere fasthet, som gir kragen den myke,
   rysjete fylden.
4. **Rysjekanten og avfelling.** 4 rader rillestrikk på det doblede
   masketallet (holder fasongen, ruller ikke), deretter løs avfelling.

Bakåpningen lukkes med én liten treknapp sydd på den ene kortenden, og en
heklet luftmaskeløkke (heklenål 3 mm, samme knapphull-konvensjon som
basisbodyens skritt- og skulderknapper) på den andre. Et alternativ med
strikket i-cord-løkke er nevnt som variant.

## Fasthet og gradering

22 masker = 10 cm, 30 rader = 10 cm, glattstrikk på pinne 4 mm, Sandnes
Garn Alpakka. Identisk fasthet med basisbodyen, brukt i alle beregninger.

Syv størrelser: 0-1, 1-3, 3-6, 6-9, 9-12, 12-18, 18-24 måneder, hentet
direkte fra basisbodyens `neck_circ_cm`-felt
(`../woodland-dreams-basisbody/sizes.json`). Alle masketall er reelle,
beregnede tall, ikke frihåndstall:

- Oppleggsomkrets = halsmål (fra basisbodyen) minus en fast bakåpning på
  2,5 cm.
- Legg opp-tall = oppleggsomkrets x fasthet (2,2 m/cm), avrundet til
  nærmeste **partall** (så vrangborden r1 vr1 går jevnt opp).
- Masker før dobling = legg opp-tallet (uendret gjennom halskant og
  glattstrikk-feltet, ingen øking eller felling der).
- Masker etter dobling = masker før dobling x 2 (doblingsraden med
  tilslag i hver maske).
- Radtallene (4 rader vrangbord, 6 rader glattstrikk, 1 doblingsrad,
  4 rader rillestrikk = 15 rader totalt) er **faste for alle størrelser**,
  et bevisst designvalg: kragens dybde (5,0 cm) skal ikke variere mye
  mellom størrelsene, det er omkretsen som graderes opp.

Se `grading_rysjekrage.py` (skriver `sizes.json`) for selve beregningen.
Skriptet inneholder interne konsistenssjekk (`assert`) som bekrefter:

1. Legg opp-tallet er alltid partall.
2. Masker før dobling = legg opp-tallet.
3. Masker etter dobling = masker før dobling x 2, nøyaktig.
4. Radtallene summerer riktig til totalen (15).
5. Det opplagte halsmålet (legg opp / fasthet + bakåpning) ligger innenfor
   1 cm av basisbodyens halsmål for samme størrelse.
6. Legg opp-tallet, dobling-tallet, ytterkanten og halsmålet øker strengt
   fra størrelse til størrelse (aldri likt eller mindre).
7. Dybden er lik for alle størrelser (bevisst, se over).

Alle sju sjekkene består (`python3 grading_rysjekrage.py` kjørt uten feil).

## Bygge PDF-ene på nytt

```bash
cd biblioteket/strikk/woodland-dreams-rysjekrage
python3 grading_rysjekrage.py     # regner ut og skriver sizes.json på nytt
python3 build_rysjekrage.py       # genererer rysjekrage_no.html / rysjekrage_en.html
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-Rysjekrage-LME.pdf rysjekrage_no.html
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-Rysjekrage-LME-EN.pdf rysjekrage_en.html
```

Bruker det delte byggesettet i `../../hekle/_shared/lme_pattern_kit.py`
(samme LME-stil som hele hekle- og strikk-kolleksjonen: Playpen Sans
overskrifter, Sasson Montessori brødtekst).

## Verifisering utført

1. `python3 -m py_compile build_rysjekrage.py` — kompilerer rent.
2. Begge PDF-ene generert, sidetall bekreftet like med PyMuPDF (`fitz`):
   NO 14 sider, EN 14 sider.
3. Diakritikk-sjekk kjørt på begge HTML-filene
   (`diacritic_check.py`): ingen treff utover den kjente falske positiven
   `'fram'` (som er korrekt norsk her, "fram og tilbake").
4. Ingen lange bindestreker (–/—) eller vinkel-anførselstegn («/»)
   funnet i noen av HTML-filene (unntatt det gjenbrukte, allerede
   etablerte «Woodland Dreams»-navnet i kolleksjonslisten, kopiert
   ordrett fra basisbodyens tekst).
5. Forsiden og tre konstruksjons-/tabellsider (del 1 legg opp, del 2
   doblingsraden, del 3 rysjekant/avfelling) samt størrelsestabellen,
   bakåpningssiden og sluttsiden rendret til PNG (dpi=100) og sett
   gjennom visuelt: ingen overflow, ingen avklipt tekst, fontene lastes
   riktig (Playpen Sans i overskrifter, Sasson Montessori i brødtekst).
6. To størrelser (6-9 mnd og 12-18 mnd) regnet ut for hånd i et separat
   Python-uttrykk, uavhengig av `grading_rysjekrage.py`, og sammenlignet
   mot tallene i den ferdige PDF-en: begge stemte eksakt (CO 48/52 m,
   rysj 96/104 m, ytterkant 43,6/47,3 cm, halsmål 24,3/26,1 cm).
7. `git status --short` bekreftet at kun
   `biblioteket/strikk/woodland-dreams-rysjekrage/` er lagt til, ingen
   andre filer eller mapper (inkludert `butikk/` og basisbody-mappen) er
   rørt.

Ikke koblet til butikken ennå, samme status som basisbodyen og resten av
kolleksjonen foreløpig.
