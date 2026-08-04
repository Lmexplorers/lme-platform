# Woodland Dreams Smekke (LME Woodland Dreams, strikkeserie)

Ferdig oppskrift: **`Woodland-Dreams-Smekke-LME.pdf`** (norsk, 14 sider, A4) og
**`Woodland-Dreams-Smekke-LME-EN.pdf`** (engelsk, 14 sider, A4).

Fjerde del av den modulære strikkekolleksjonen LME Woodland Dreams
(basisbody + 6 tilbehørsdeler, pluss det heklede Woodland Fluffy Skirt).
Helt original LME-konstruksjon, ikke en kopi av noe eksisterende mønster:
en myk, avrundet, trapesformet smekk strikket flatt, ovenfra og ned, med
rettstrikk-kant hele veien rundt, og med valg mellom to lukkinger
(i-cord-bånd som knytes i sløyfe, eller knapp og løkke).

## Fasthet

22 masker = 10 cm, 30 rader = 10 cm, glattstrikk på pinne 4 mm,
Sandnes Garn Alpakka. Samme fasthet som Woodland Dreams basisbody. Denne
fastheten er brukt i alle beregninger.

## Konstruksjon

Smekken strikkes **flatt** (fram og tilbake, aldri rundt), i fire deler:

1. **Øverste kant.** Legg opp ved halskanten. De ytterste 3 maskene på
   hver side strikkes i rettstrikk gjennom HELE plagget (også gjennom
   øknings- og feltingsseksjonene), det er dette som gir den flate,
   ikke-rullende kanten rundt hele smekken. Strikk 4 rader rett før
   økingen begynner.
2. **Øking til bredeste punkt.** Bytt til glattstrikk over midtpartiet
   (kantmaskene forblir rettstrikk). Øk 1 maske rett innenfor kanten på
   hver side, HVER rad (både rett- og vrangsiden), til bredeste punkt er
   nådd. Dette gir en jevn, diagonal kantlinje uten trappetrinn.
3. **Rett strikking og hjørneavrunding.** Strikk rett fram uten øking i
   et gitt antall rader, fell så 1 maske rett innenfor kanten på hver
   side, hver rad, i 4 rader, for å runde av de to nedre hjørnene i
   stedet for skarpe vinkler. Strikk til slutt 4 rader rett (rettstrikk)
   for en bunnkant, og fell av alle masker rett.
4. **Lukking.** To alternativer, begge beskrevet i oppskriften:
   - **I-cord-bånd:** ta opp 3 masker i hvert øvre hjørne, strikk i-cord
     til anbefalt lengde for størrelsen, knytes i sløyfe bak i nakken.
   - **Knapp og løkke:** hekle en liten løkke (~2,5 cm) i det ene
     hjørnet, sy fast én liten treknapp i det andre. Samme løkkestørrelse
     for alle størrelser (tilpasset knappen, ikke barnet).

## Sizing-metode (hvordan tallene er beregnet)

Alle masketall/radtall er reelle, beregnede tall, ikke frihåndstall.
Utregningen ligger i **`calc_sizes.py`**, som leser `neck_circ_cm` og
`chest_cm` for alle 7 størrelser direkte fra basisbodyens
`../woodland-dreams-basisbody/sizes.json` (samme fasthet, samme
størrelsesserie), og skriver en fullstendig `sizes.json` for smekken i
denne mappen. `build_smekke.py` leser så `sizes.json` og setter tallene
inn i tabellene i selve oppskriften, de skrives aldri inn for hånd.

Forholdstall brukt (forklart og begrunnet i `calc_sizes.py`):

- **Øverste oppleggskant** = 45 % av halsomkretsen (`neck_circ_cm`),
  fordi smekken bare skal dekke den fremre halskanten, ikke gå hele
  veien rundt, resten av halsen tas av knyte-/knappeløsningen.
- **Bredeste punkt** = 60 % av brystomkretsen (`chest_cm`), innenfor det
  spesifiserte 55-65 %-intervallet, smekken skal dekke brystpartiet
  foran uten å gå helt rundt kroppen.
- **Ferdig lengde** = 42 % av brystomkretsen, en rimelig, gradert lengde
  for en smekk sett opp mot brystvidden.
- Masketall rundes til nærmeste **partall** (symmetrisk øking/felling på
  begge sider av senterlinjen).
- Øking/felling skjer 1 maske innenfor kanten på hver side, **hver
  rad** (ikke annenhver), for å holde antall rader i øknings-/
  feltingsseksjonene proporsjonalt lavt sammenlignet med den rette
  strikkingen, slik at formen leser som en smekk (bred, flat midtdel)
  og ikke en spiss trekant.

Interne `assert`-kontroller i `calc_sizes.py` bekrefter blant annet at:

- oppleggingen + 2 x antall økerader = masketall ved bredeste punkt,
- masketall ved bredeste punkt minus 2 x antall hjørneavrundingsrader =
  masketall etter avrunding,
- summen av alle radseksjoner (øverste kant + øking + rett strikking +
  hjørneavrunding + nederste kant) = totalt antall rader,
- bredden ved bredeste punkt havner mellom 50-68 % av brystomkretsen
  (kontroll opp mot 55-65 %-kravet, med litt slingringsmonn for
  avrunding),
- de størrelsesbærende tallene (masker ved bredeste punkt, masker etter
  avrunding, totalt antall rader, ferdig lengde, garnforbruk) øker
  **strengt** fra størrelse til størrelse,
- den øverste oppleggingen og den anbefalte i-cord-lengden tillates å
  gjenta seg mellom to naboer (avrunding til partall/hele cm, akkurat
  som `neck_co` i basisbodyen ikke er strengt stigende hvert eneste
  steg), men aldri synker.

Kjør `python3 calc_sizes.py` for å regenerere `sizes.json` og se alle
tallene skrevet ut per størrelse.

## Bygge PDF-ene på nytt

```bash
python3 calc_sizes.py      # regenererer sizes.json (kun nødvendig ved endrede forholdstall)
python3 build_smekke.py    # genererer smekke_no.html og smekke_en.html
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-Smekke-LME.pdf smekke_no.html
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-Smekke-LME-EN.pdf smekke_en.html
```

Bruker det delte byggesettet i `../../hekle/_shared/lme_pattern_kit.py`
(samme LME-stil som hele hekle- og strikke-kolleksjonen: Playpen Sans i
overskrifter, Sasson Montessori i brødtekst).

## Verifisering utført

- `python3 -m py_compile build_smekke.py` kompilerer rent.
- Begge PDF-ene genereres og har **like mange sider** (14/14), sjekket
  med PyMuPDF (`fitz`).
- Diakritikk-sjekk (`diacritic_check.py`) kjørt på begge HTML-filene:
  ingen reelle treff, kun det kjente falske positivet `'fram'`.
- Forsiden, øknings-tabellsiden (del 2), rett strikking/avrunding-siden
  (del 3), lukking-siden og sikkerhetssiden ble rendret til PNG (dpi=100)
  via `fitz` og sett gjennom visuelt: ingen overlappende eller avkuttet
  tekst, tabeller ser ryddige ut i begge språk.
- To størrelser (0-1 mnd og 12-18 mnd) er regnet ut for hånd uavhengig av
  koden og stemmer nøyaktig med tallene som står i PDF-en:
  - 0-1 mnd: legg opp 22, øk i 20 rader til 62 masker (28,2 cm), rett
    strikking 26 rader, hjørneavrunding 4 rader til 54 masker, ferdig
    lengde 19,5 cm, i-cord-bånd 12 cm.
  - 12-18 mnd: legg opp 26, øk i 27 rader til 80 masker (36,4 cm), rett
    strikking 37 rader, hjørneavrunding 4 rader til 72 masker, ferdig
    lengde 25,2 cm, i-cord-bånd 14 cm.
- `git status --short` bekrefter at kun `biblioteket/strikk/woodland-dreams-smekke/`
  er berørt av dette arbeidet (andre agenters søsken-mapper for de andre
  tilbehørsdelene vises som egne uberørte, utrackede mapper).

Ikke koblet til butikken ennå, akkurat som basisbodyen. Resten av
kolleksjonen bygges videre i egne mapper under `biblioteket/`, og alle
delene kobles til butikken samlet når kolleksjonen er komplett.
