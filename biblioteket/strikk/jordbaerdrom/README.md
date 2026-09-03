# Jordbærdrøm (LME strikkekolleksjon, str 44 til 92)

Fem strikkeoppskrifter med innstrikkede jordbærblad og frø, gradert fra
liten nyfødt til to år. Ferdige PDF-er, norsk og engelsk, A4:

| Plagg | Norsk | Engelsk | Sider |
|---|---|---|---|
| Kjole | `LME-Jordbaerdrom-Kjole.pdf` | `-EN.pdf` | 15 |
| Romper med skjørt | `LME-Jordbaerdrom-Romper.pdf` | `-EN.pdf` | 15 |
| Genser og skjørt | `LME-Jordbaerdrom-Genser-og-skjort.pdf` | `-EN.pdf` | 16 |
| Votter | `LME-Jordbaerdrom-Votter.pdf` | `-EN.pdf` | 12 |
| Tøfler | `LME-Jordbaerdrom-Tofler.pdf` | `-EN.pdf` | 12 |

Alle merket **Teststrikkversjon 1.0**. Teststrikkerne melder seg på
https://lmexplorers.com/teststrikk, som er lenket fra et kort på dashbordet.

## Hva som ble gjort

Utgangspunktet var fem PDF-er i **én** størrelse, laget med ChatGPT og aldri
strikket av noen. De ga konstruksjonen og stilen: det runde bærestykket delt
i 8 felt, bladrapporten, frøene, picotkanten.

De ga derimot ikke tall det gikk an å stole på. Flere av dem gikk rett og
slett ikke opp (se listen lenger nede). **Alle masketall er derfor regnet ut
på nytt her**, fra barnas mål og strikkefastheten, ikke overtatt fra PDF-ene.
Denne mappen er kildefilene som mangler.

Kolleksjonen er gradert i **ni størrelser: 44, 50, 56, 62, 68, 74, 80, 86 og
92**, altså fra liten nyfødt til to år. Str 44 er den minste som lages til
premature og små nyfødte, og str 92 svarer til to år.

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

| Str | Passer til | Hals | Hals cm | Hode | Andel | Økeomg. | Jevne omg. | Bærestykke | Bol | Ferdig bryst | Romslighet |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 44 | liten nyfødt / prematur | 56 | 26,7 cm | 32 cm | 83 % | 7 | 3 | 112 | 80 | 38,1 cm | 6,1 cm |
| 50 | nyfødt, 0-1 mnd | 64 | 30,5 cm | 35 cm | 87 % | 8 | 5 | 128 | 88 | 41,9 cm | 6,9 cm |
| 56 | 1-2 mnd | 64 | 30,5 cm | 38 cm | 80 % | 9 | 5 | 136 | 92 | 43,8 cm | 5,8 cm |
| 62 | 2-4 mnd | 72 | 34,3 cm | 41 cm | 84 % | 10 | 5 | 152 | 100 | 47,6 cm | 6,6 cm |
| 68 | 4-6 mnd | 72 | 34,3 cm | 43 cm | 80 % | 11 | 5 | 160 | 104 | 49,5 cm | 6,5 cm |
| 74 | 6-9 mnd | 80 | 38,1 cm | 45 cm | 85 % | 11 | 6 | 168 | 108 | 51,4 cm | 6,4 cm |
| 80 | 9-12 mnd | 80 | 38,1 cm | 46 cm | 83 % | 12 | 6 | 176 | 112 | 53,3 cm | 6,3 cm |
| 86 | 12-18 mnd | 80 | 38,1 cm | 47 cm | 81 % | 13 | 5 | 184 | 116 | 55,2 cm | 6,2 cm |
| 92 | 18-24 mnd, 2 år | 88 | 41,9 cm | 48 cm | 87 % | 13 | 6 | 192 | 120 | 57,1 cm | 6,1 cm |

**Halsen er regnet fra hodet, ikke gjettet.** Genseren har ingen åpning i
nakken, så halsen må gå over hodet og likevel ligge pent etterpå.
Tommelfingerregelen i strikking er at en ribbehals, avslappet, skal være ca.
80 til 85 % av hodeomkretsen: ribben strekker resten når plagget tres på, og
trekker seg sammen igjen etterpå. Kolonnene «Hode» og «Andel» over viser
dette, og `grading_jordbaerdrom.py` har en `assert` som stopper byggingen
hvis andelen faller utenfor 78 til 90 %.

Halsoppligget må i tillegg være delelig med 8, siden halsen deles i 8 felt.
Tallene er derfor det multiplumet av 8 som lander innenfor spennet.

**Bærestykkets dybde styres av et eget mål, ikke av økingene.** Der halsen
hopper opp et trinn, blir det færre økeomganger igjen til å nå samme
bærestykke, og uten et eget dybdemål ville bærestykket stått stille akkurat
der barnet ble større. Differansen fylles med jevne omganger uten økinger,
rett før bladpartiet. Det er kolonnen «Jevne omg.» over.

**Bindingen løses med et søk, ikke på frihånd.** Bærestykket er 2 x forstykke
+ 2 x erme, så kravet om delelighet med 8 betyr at forstykke + erme må være
delelig med 4. Over ni størrelser går det ikke an å treffe alle brystmål
innenfor den bindingen ved å gjette. `finn_par()` i graderingsskriptet søker
derfor etter det paret som ligger nærmest målene og samtidig oppfyller alle
kravene.

**Votter og tøfler har færre størrelser.** Samme binding slår ut motsatt vei
på de små delene: en bladrapport er ca. 3,8 cm i omkrets, mens en hånd eller
fot vokser langt mindre enn det mellom to nabostørrelser. Vottene har derfor
2 størrelser og tøflene 4, og hver av dem dekker et oppgitt spenn av
plaggstørrelsene.

**Vottene stopper ved str 74**, ikke fordi masketallet stopper, men fordi de
er uten tommel. Det er riktig på en baby, men et barn på over ett år vil ha
tommel, og en tommelløs vott blir da mer til hinder enn til hjelp.

Alle tall står i `sizes.json` og beregnes av `grading_jordbaerdrom.py`, som
har interne konsistenssjekk (`assert`): bladrapporten må gå opp, delingen må
summere til bærestykket, mansjetten må være et partall til ribben, skjørtet
må være videre enn livet det henger fra, romsligheten må ligge mellom 3,5 og
8,5 cm, og alt som skal vokse med størrelsen må faktisk vokse. Slår én av dem
feil, stopper byggingen der og ikke i en oppskrift noen strikker etter.

## Feil i PDF-ene som er rettet

Disse er verdt å lese som en påminnelse om hva et ukontrollert utkast kan
inneholde. Alle så riktige ut i en pen PDF.

- **Armhullskanten.** PDF-en sa "plukk opp ca. 42 masker rundt hvert
  armhull", men armhullet har bare 16 hvilende masker pluss 2 lagt opp under
  armen. 42 er ikke mulig. Kanten er nå regnet ut: hvilende masker +
  maskene under armen + 1 i hvert hjørne, altså 22 masker i str 44
  og opp til 42 i str 92, alltid et partall siden kanten strikkes i
  vridd ribb.
- **Kjolens skjørtelengde** sto som 16 cm i måltabellen og 15 cm i selve
  arbeidsbeskrivelsen, i samme PDF. Nå ett tall, hentet fra `sizes.json`.
- **Skjørtets linning** la først opp 60 masker, økte til 64 for at
  bladrapporten skulle gå opp, og felte tilbake til 60 etterpå. Linningen
  legges nå opp direkte på et masketall som er delelig med 8, så både
  økingen og fellingen er borte.
- **Halsen var 48 masker i alle størrelser**, arvet uendret fra utkastet.
  48 masker er 22,9 cm, altså 65 % av et nyfødt hode på 35 cm. Det er
  altfor trangt for en genser uten åpning i nakken.

  Første forsøk på å rette dette var feil vei: jeg beholdt de 48 maskene,
  konkluderte med at halsen ikke gikk over hodet, og la til en knappåpning i
  genseren. Renate sa fra at gensere uten knapp selvsagt finnes, og hun har
  rett. Feilen var ikke at genseren manglet knapp, men at ingen hadde regnet
  halsen mot hodet.

  Halsen er nå dimensjonert fra hodeomkretsen (56 til 88 masker, 80 til 87 %
  av hodet), genseren strikkes rundt fra første omgang uten åpning, og
  oppskriften ber uttrykkelig om en elastisk oppleggingskant. Kjolen og
  romperen beholder sin lille knappåpning bak, slik utkastet hadde den. Der
  er den ikke nødvendig lenger, men den gjør det lettere å få plagget på en
  bløt baby.

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
