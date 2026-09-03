# Jordbærdrøm (LME strikkekolleksjon, prematur og nyfødt)

Fem strikkeoppskrifter for de aller minste, med innstrikkede jordbærblad og
frø. Ferdige PDF-er, norsk og engelsk, A4:

| Plagg | Norsk | Engelsk | Sider |
|---|---|---|---|
| Kjole | `LME-Jordbaerdrom-Kjole.pdf` | `-EN.pdf` | 14 |
| Romper med skjørt | `LME-Jordbaerdrom-Romper.pdf` | `-EN.pdf` | 14 |
| Genser og skjørt | `LME-Jordbaerdrom-Genser-og-skjort.pdf` | `-EN.pdf` | 15 |
| Votter | `LME-Jordbaerdrom-Votter.pdf` | `-EN.pdf` | 12 |
| Tøfler | `LME-Jordbaerdrom-Tofler.pdf` | `-EN.pdf` | 12 |

Alle merket **Teststrikkversjon 1.0**. Teststrikkerne melder seg på
https://lmexplorers.com/teststrikk, som er lenket fra et kort på dashbordet.

## Hva som ble gjort

Utgangspunktet var fem PDF-er i **én** størrelse (prematur / liten nyfødt),
laget med ChatGPT og aldri strikket av noen. De ga konstruksjonen og stilen:
det runde bærestykket delt i 8 felt, bladrapporten, frøene, picotkanten.

De ga derimot ikke tall det gikk an å stole på. Flere av dem gikk rett og
slett ikke opp (se listen lenger nede). **Alle masketall er derfor regnet ut
på nytt her**, fra barnas mål og strikkefastheten, ikke overtatt fra PDF-ene.
Denne mappen er kildefilene som mangler, og oppskriftene er gradert til
**fem størrelser: 32, 38, 44, 50 og 56**.

Str 50 er det minste som selges i vanlige butikker, og var altfor stort for
barnet oppskriftene først skulle brukes til. Derfor går kolleksjonen ned til
str 32, som passer et barn på rundt ett kilo.

Størrelse 32 lander på de samme tallene som sto i PDF-en (88 masker i
bærestykket, 60 i bolen, 48 i halsen), men her fordi de er riktige for
størrelsen, ikke fordi PDF-en sa det: 4,6 cm romslighet over brystet, en hals
som strekker til ca. 29 cm over et hode på 25 til 27 cm, og et bærestykke på
7,5 cm mot en skulderhøyde på 6 til 7 cm.

**Ingenting i kolleksjonen er strikket ennå.** Det er hele poenget med
teststrikken, og det står rett ut på teststrikksiden i hvert hefte.

## Fasthet og gradering

21 masker og 28 omganger glattstrikk = 10 x 10 cm, pinne 4 mm, DROPS Merino
Extra Fine. Samme fasthet som PDF-ene oppga, beholdt fordi den passer garnet
og pinnen, og brukt i alle beregninger.

**Bindingen som styrer alt: bladrapporten er 8 masker.** Mønsteret går rundt
hele bærestykket, så masketallet der må være delelig med 8 i hver eneste
størrelse. Halsen deles i 8 felt, og hver økeomgang legger til nøyaktig 8
masker, så halsoppligget må også være delelig med 8. Bærestykket vokser
derfor i sprang på 8 masker, ikke helt jevnt.

Delingen til bol og ermer er derimot fri. Der graderes bolen raskere enn
ermene i de største størrelsene, så brystvidden følger barnets mål og ikke
rapporten:

| Str | Hals | Økeomg. | Bærestykke | Rapporter | Bol | Ferdig bryst | Romslighet |
|---|---|---|---|---|---|---|---|
| 32 | 48 | 5 | 88 | 11 | 60 | 28,6 cm | 4,6 cm |
| 38 | 48 | 7 | 104 | 13 | 68 | 32,4 cm | 5,4 cm |
| 44 | 56 | 8 | 120 | 15 | 76 | 36,2 cm | 6,2 cm |
| 50 | 56 | 10 | 136 | 17 | 84 | 40,0 cm | 7,0 cm |
| 56 | 64 | 11 | 152 | 19 | 92 | 43,8 cm | 7,8 cm |

Halsen har bare 48, 56 og 64 masker å velge mellom (sprang på 3,8 cm), og
holdes derfor på samme masketall over to størrelser om gangen, mens antall
økeomganger tar resten av veksten. Halsen **må** vokse: genseren har ingen
åpning i nakken og skal over hodet, og hodet vokser raskere enn brystet.

**Votter og tøfler har færre størrelser.** Samme binding slår ut motsatt vei
på de små delene: en bladrapport er ca. 3,8 cm i omkrets, og en babyhånd
vokser mindre enn det fra prematur til to måneder. Fem vottestørrelser ville
vært fem navn på to reelle mål. Vottene har derfor 2 størrelser og tøflene 3,
og hver av dem dekker et oppgitt spenn av plaggstørrelsene.

Alle tall står i `sizes.json` og beregnes av `grading_jordbaerdrom.py`, som
har interne konsistenssjekk (`assert`): bladrapporten må gå opp, delingen må
summere til bærestykket, mansjetten må være et partall til ribben, skjørtet
må være videre enn livet det henger fra, romsligheten må ligge mellom 3,5 og
8,5 cm, og alt som skal vokse med størrelsen må faktisk vokse. Slår én av dem
feil, stopper byggingen der og ikke i en oppskrift noen strikker etter.

## Feil i PDF-ene som er rettet

Disse er verdt å lese som en påminnelse om hva et ukontrollert utkast kan
inneholde. Alle fire så riktige ut i en pen PDF.

- **Armhullskanten.** PDF-en sa "plukk opp ca. 42 masker rundt hvert
  armhull", men armhullet har bare 16 hvilende masker pluss 2 lagt opp under
  armen. 42 er ikke mulig. Kanten er nå regnet ut: hvilende masker +
  maskene under armen + 1 i hvert hjørne, altså 20 masker i str 32 og opp til
  36 i str 56, alltid et partall siden kanten strikkes i vridd ribb.
- **Kjolens skjørtelengde** sto som 16 cm i måltabellen og 15 cm i selve
  arbeidsbeskrivelsen, i samme PDF. Nå ett tall, hentet fra `sizes.json`.
- **Skjørtets linning** la først opp 60 masker, økte til 64 for at
  bladrapporten skulle gå opp, og felte tilbake til 60 etterpå. Linningen
  legges nå opp direkte på et masketall som er delelig med 8, så både
  økingen og fellingen er borte.
- **Halsen på genseren** var 48 masker uansett størrelse. Det er trangt selv
  på det minste barnet, og umulig på str 56. Halsen graderes nå, og
  oppskriften nevner et valgfritt knapphull for de to største størrelsene.

## Diagrammene

Blad- og frødiagrammet tegnes som SVG rett i `_jordbaer_felles.py`, ikke som
bildefiler. Da kan de ikke komme i utakt med masketallene, de skalerer skarpt
i PDF-en, og de veier ingenting.

Bladet er 8 masker x 10 omganger og leses nedenfra og opp, selv om plagget
strikkes ovenfra og ned: diagrammet er snudd, så bladene peker nedover på det
ferdige plagget. Lengste trådsprang bak arbeidet er 3 masker, med vilje.
Lange løse tråder på innsiden er ubehagelige mot sart hud og noe små fingre
kan sette seg fast i.

## Filene

| Fil | Hva den gjør |
|---|---|
| `grading_jordbaerdrom.py` | regner ut alle masketall, skriver `sizes.json` |
| `sizes.json` | de verifiserte tallene, lest av alle fem byggeskriptene |
| `_jordbaer_felles.py` | diagrammer, felles sider, farger, språkhjelper |
| `build_kjole.py` og de fire andre | ett hefte hver, norsk og engelsk HTML |
| `verifiser.py` | kontrollerer de ferdige PDF-ene |

## Bygge alt på nytt

```bash
python3 grading_jordbaerdrom.py     # kun ved endring i tall eller størrelser
for b in kjole romper genser_skjort votter tofler; do python3 build_$b.py; done

CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
for f in kjole:Kjole romper:Romper genser_skjort:Genser-og-skjort \
         votter:Votter tofler:Tofler; do
  src=${f%%:*}; navn=${f##*:}
  "$CHROME" --headless --no-sandbox --no-pdf-header-footer \
    --print-to-pdf="LME-Jordbaerdrom-$navn.pdf" ${src}_no.html
  "$CHROME" --headless --no-sandbox --no-pdf-header-footer \
    --print-to-pdf="LME-Jordbaerdrom-$navn-EN.pdf" ${src}_en.html
done

python3 ../../hekle/_shared/strip_pdf_tags.py *.pdf
python3 verifiser.py                # MÅ kjøres, se under
```

`verifiser.py` er ikke valgfri. Sidemalen har `overflow:hidden`, så en side
med for mye innhold blir rett og slett klippet, uten at noe feiler og uten at
det synes på en rask gjennomlesing. En setning som forsvinner mellom HTML-en
og PDF-en er den farligste feilen i et oppskriftshefte. Skriptet sammenligner
derfor hver PDF-side med den tilsvarende HTML-siden ord for ord, kontrollerer
at masketallene stemmer med `sizes.json`, og at skrivestilreglene i CLAUDE.md
er fulgt. Den fanget faktisk dette under byggingen: teststrikksiden mistet
avslutningsnotatet i alle ti heftene før måleskjemaet ble satt i to spalter.

Bruker det delte LME-byggesettet i `../../hekle/_shared/lme_pattern_kit.py`,
samme stil som Woodland Dreams-serien.

## Videre

Kolleksjonen er ikke koblet til butikken ennå, med vilje: den skal
teststrikkes, vaskes, måles og teknisk kontrolleres i alle fem størrelser
først. Et utkast laget av en språkmodell, gradert og rettet av en annen, er
fortsatt et utkast til noen har strikket etter det.

Teststrikkerne blir også bedt om å si fra hvis mønsteret minner dem om en
oppskrift de har sett før. Konstruksjonen kom fra en språkmodell, og da er
det verdt å ha øyne på det før noe selges. Når målene fra teststrikkerne er inne, oppdateres `sizes.json`,
alt bygges på nytt, «Teststrikkversjon 1.0» fjernes fra forsiden, og
oppskriftene kan legges ut for salg.
