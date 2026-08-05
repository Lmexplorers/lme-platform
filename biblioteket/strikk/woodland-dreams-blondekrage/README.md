# Woodland Dreams Blondekrage (LME Woodland Dreams, strikkeserie)

Ferdig oppskrift: **`Woodland-Dreams-Blondekrage-LME.pdf`** (norsk, 14 sider, A4) og
**`Woodland-Dreams-Blondekrage-LME-EN.pdf`** (engelsk, 14 sider, A4).

Andre del av den modulære strikkekolleksjonen LME Woodland Dreams (basisbody +
6 tilbehørsdeler, pluss det heklede Woodland Fluffy Skirt). Helt original
LME-konstruksjon, ikke en kopi av noe eksisterende mønster: en løs krage som
**ikke** strikkes fast i basisbodyen, legges opp langs halskanten (minus en
liten åpning bak), strikkes flatt fram og tilbake, flares utover med én jevnt
fordelt økerad (øk1/M1), avsluttes med et enkelt 2-rads hullmønster (omslag +
r2sm) og en picot-avfelling, og lukkes bak med én liten treknapp og en heklet
kjedeløkke (samme prinsipp som knappeløkkene i basisbodyen).

## Fasthet og gradering

22 masker = 10 cm, 30 rader = 10 cm, glattstrikk på pinne 4 mm, Sandnes Garn
Alpakka. Samme fasthet som basisbodyen. Denne fastheten er brukt i alle
beregninger.

Syv størrelser: 0-1, 1-3, 3-6, 6-9, 9-12, 12-18, 18-24 måneder, hentet direkte
fra `neck_circ_cm`-feltet i basisbodyens `sizes.json`, slik at kragen passer
nøyaktig til bodyens halskant. Alle masketall er reelle, beregnede tall, ikke
frihåndstall. Utregningen ligger i `sizes.json` (produsert av et frittstående
kontrollskript, se historikk under) og brukes direkte av `build_blondekrage.py`:

- **Åpning bak**: konstant 2,5 cm trekkes fra halsmålet før oppleggingen.
- **Oppleggsmasker (halskant)**: `(halsmål_cm - 2,5) x 2,2 m/cm`, avrundet til
  nærmeste partall (nødvendig for at 2-maskers hullmønsteret skal gå opp).
- **Flareøkning**: antall M1-økninger = `round(oppleggsmasker x 0,25)`, justert
  med +1 øking dersom sluttmasketallet ellers ville blitt oddetall (hullmønsteret
  krever et partall). Selve fordelingen av økningene over økeraden bruker
  standardmetoden "jevnt fordelt": `base, ekstra = divmod(oppleggsmasker, økninger)`,
  slik at summen av alle rette-strekk + økninger stemmer nøyaktig med
  oppleggsmasketallet, verifisert med `assert sum(seg_lengths) == co_sts`.
- **Blondekant/picot**: sluttmasketallet etter flareøkingen er uendret gjennom
  hele hullmønsteret (hvert omslag legger til 1 maske, hver r2sm feller 1
  maske). Picot-avfellingen deler sluttmasketallet i repetisjoner av 4 masker
  (`divmod(final_sts, 4)`), med 0 eller 2 restmasker felt av vanlig til slutt,
  aldri en "tilpass siste repetisjon"-håndbølging.
- **Dybde**: konstant 14 rader (4 rillestrikk + 1 økerad + 3 glattstrikk + 6
  hullmønster) for alle størrelser, gir 4,7 cm dybde ved 30 rader/10 cm.

Interne konsistenssjekk (`assert`) i beregningsskriptet bekrefter, for hver
størrelse: at oppleggstallet er partall, at sluttmasketallet er partall og
minst 2 masker større enn oppleggstallet, at okerad-segmentene summerer
nøyaktig til oppleggsmasketallet, at picot-fordelingen summerer nøyaktig til
sluttmasketallet, og at både oppleggs- og sluttmasketall er strengt økende
fra én størrelse til neste.

**Uavhengig kryssjekk:** to tilfeldig valgte størrelser (3-6 mnd og 12-18 mnd)
ble regnet ut for hånd på nytt, i en egen, enklere funksjon (samme formel,
skrevet på nytt fra bunnen), og sammenlignet mot skriptets resultat:

- 3-6 mnd: CO 46, 12 økninger, 58 masker ved blondekant. Stemmer med tabellen
  i PDF-en (side 9-10).
- 12-18 mnd: CO 52, 14 økninger, 66 masker ved blondekant. Stemmer med
  tabellen i PDF-en (side 9-10).

## Konstruksjon, kort

1. Legg opp langs halskanten (halsmål minus 2,5 cm åpning bak), strikk 4
   rader rillestrikk for struktur.
2. Bytt til glattstrikk. Øk jevnt fordelt over én rad (øk1/M1), strikk så 3
   glattstrikk-rader rett fram.
3. Strikk hullmønsteret: *omslag, r2sm* på rettsiden, vrang alle masker på
   vrangsiden, gjentatt 3 ganger (6 rader).
4. Avfell langs hele ytterkanten med en picot-avfelling (BO 2, legg opp 2,
   BO 4, gjentatt).
5. Hekle en kjedeløkke (ca. 12-15 luftmasker, heklenål 3 mm) i den ene
   bakkanten, sy en liten treknapp på den andre.

## Bygge PDF-ene på nytt

```bash
python3 build_blondekrage.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-Blondekrage-LME.pdf blondekrage_no.html
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-Blondekrage-LME-EN.pdf blondekrage_en.html
```

Bruker det delte byggesettet i `../../hekle/_shared/lme_pattern_kit.py` (samme
LME-stil som hele hekle-kolleksjonen og basisbodyen). `fonts/` er kopiert inn
fra basisbody-mappen (samme Playpen Sans + Sasson Montessori-filer).

## Verifisering utført

1. `python3 -m py_compile build_blondekrage.py` - kompilerer rent.
2. Begge PDF-ene generert og sjekket med PyMuPDF (`fitz`): NO 14 sider, EN 14
   sider, sidetallene stemmer overens.
3. Diakritikk-sjekk (`diacritic_check.py`) kjørt på begge HTML-filene: ingen
   reelle funn, kun de kjente falske positivene `fram` (gyldig bokmålsord,
   forekommer flere ganger i konstruksjonstekst) og `far` (substreng i engelsk
   "far easier").
4. Forsiden og to konstruksjonssider (del 2: flareøkning, del 3: blondekant)
   rendret til PNG med `fitz` (dpi=100) og sett gjennom manuelt: layout er
   ikke ødelagt, ingen tekst er overlappende eller avkuttet, tabellene har
   plass til alle syv rader.
5. To størrelser (3-6 mnd og 12-18 mnd) regnet ut for hånd på nytt i en egen
   funksjon, uavhengig av hovedskriptet, og bekreftet like tall, se over.
6. `git status --short` bekreftet at kun `biblioteket/strikk/woodland-dreams-blondekrage/`
   er lagt til, ingen andre filer eller mapper er rørt (andre uspora mapper i
   samme commit-status tilhører annet, parallelt arbeid, ikke denne oppgaven).

Ikke koblet til butikken ennå, samme status som basisbodyen. Resten av
kolleksjonen (5 gjenstående tilbehørsdeler + Woodland Fluffy Skirt) bygges
videre i egne mapper under `biblioteket/`, og alle deler kobles til butikken
samlet når kolleksjonen er komplett.
