# Woodland Fluffy Skirt (LME Woodland Dreams, heklet del)

Ferdig oppskrift: **`Woodland-Fluffy-Skirt-LME.pdf`** (norsk, 14 sider, A4) og
**`Woodland-Fluffy-Skirt-LME-EN.pdf`** (engelsk, 14 sider, A4).

Den heklede delen av den modulære kolleksjonen LME Woodland Dreams (sammen
med den strikkede Basisbodyen og seks tilbehørsdeler). Helt original
LME-konstruksjon, ikke en kopi av noe eksisterende mønster, inspirert av
et lett, fluffy volangskjørt men tegnet og gradert fra bunnen av.

## Fasthet og gradering

20 staver = 10 cm, 30 omganger = 15 cm, heklenål 4 mm, Sandnes Garn
Alpakka. Denne fastheten er brukt i alle beregninger.

Seksten størrelser: Prematur, Nyfødt, 0-3, 3-6, 6-9, 9-12 måneder, 1-2,
2-3, 3-4, 4-5, 5-6, 6-8, 8-10, 10-12, 12-14, 14-16 år. Alle masketall er
reelle, beregnede tall:

- Midjemål (barnets faktiske mål) hentet fra standard barnestørrelser,
  jevnt økende fra 32 cm (prematur) til 70 cm (14-16 år).
- Linningens masketall = midjemål x 0,92 (elastikken skal strekke den ut)
  x fasthet, avrundet ned til nærmeste multiplum av 4 (fire jevnt
  fordelte økepunkter i A-kroppen), og justert opp om nødvendig for å
  være strengt større enn forrige størrelse.
- A-kroppens sluttmasketall = linningmasker x 1,55, avrundet til nærmeste
  faktiske resultat av et helt antall økeomganger (4 masker økt pr
  omgang), ikke bare avrundet i løse luften.
- Volangens masketall = A-kroppens sluttmasketall x 2,6 (multipliserings-
  faktoren for et luftig, fluffy fall), avrundet til nærmeste multiplum
  av 4.
- Omgangstall (linning/kropp/volang) fordelt fra skjørtlengde x fasthet,
  med kontroll på at antall økeomganger aldri overstiger antall
  tilgjengelige omganger i kroppsdelen.

Se `sizes.json` for de fulle, verifiserte tallene per størrelse.
Genereringsskriptet (`grading.py`, kopiert til scratchpad under
byggingen) inneholder interne konsistenssjekk (`assert`) som bekrefter at
alle 16 størrelsenes maskeltall er strengt økende og innbyrdes
konsistente, før tallene noensinne når selve PDF-en.

## Konstruksjon, kort

1. **Linningen**: en fast fm-kanal for elastikken, litt trangere enn
   midjemålet.
2. **A-kroppen**: staver i jevne omganger, med spredte økeomganger (4
   økepunkter pr omgang) som gir den lette A-fasongen.
3. **Volangen**: maskene multipliseres kraftig over én omgang (ca. 2,6x),
   deretter noen omganger vanlig stav på det store masketallet, for et
   luftig fall uten tyngde.
4. **Avslutningskanten**: en enkel picot-kant.

Laget for å passe perfekt sammen med Woodland Dreams Basisbody (samme
garn og fargepalett, midjemålene i størrelsestabellen kan sjekkes mot
Basisbodyens egen størrelsestabell for et matchende sett).

## Bygge PDF-ene på nytt

```bash
python3 build_fluffy_skirt.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Woodland-Fluffy-Skirt-LME.pdf fluffy_skirt_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Woodland-Fluffy-Skirt-LME-EN.pdf fluffy_skirt_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py` (samme LME-
stil som hele hekle-kolleksjonen).

Ikke koblet til butikken ennå. Resten av kolleksjonen (Basisbody + 6
tilbehørsdeler) bygges/verifiseres parallelt, og alle delene kobles til
butikken samlet når kolleksjonen er komplett.
