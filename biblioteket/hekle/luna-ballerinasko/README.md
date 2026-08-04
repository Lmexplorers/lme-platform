# Lunas ballerinasko (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Lunas-ballerinasko-LME.pdf`** (norsk, 17 sider, A4) og
**`Lunas-ballerinasko-LME-EN.pdf`** (engelsk, 17 sider, A4).

Følger opp `../ellies-ballerinasko/`, tilpasset Luna, den lille kaninen, 4. august
2026, etter Renates referansebilde av profesjonelt stylede kanin-ballerinasko.
Klassiske babyballerinaer med rund tå, T-stropp, kant og et hjerte brodert på
sålen, i fem størrelser (prematur, 0-3, 3-6, 6-9, 9-12 måneder), pluss en
matchende hårsløyfe, samme konstruksjon som Ellies versjon.

Kaninansiktet på tåpartiet erstatter Ellies dådyransikt: lange, avlange ører i
to lag (yttersiden varmt grått, innersiden kremhvitt), sydd sammen med
heftesting slik at en grå kant vises rundt, med den øverste tredjedelen av
hvert øre stikkende opp over skoens overkant, akkurat som i referansebildet.
Fargepaletten er Lunas egne farger: varmt grått for selve skoen, rosa for
sløyfen, kanten og knappen, og kremhvitt for ørenes innerside og
kaninansiktets snuteflekk, i stedet for Ellies krem/pudderrosa/lys brunt.
Referansebildet viste også tydelige, tynne brune øyenbryn på kaninansiktet,
et lite ekstra broderidetalj som er lagt til i beskrivelsen av ansiktet.

Tallene i oppskriften følger samme flerstørrelses-konvensjon som
`../ro-bottehatt/` og de andre eldre LME-oppskriftene: `prematur (0-3) 3-6
(6-9) 9-12`. Egen størrelsestabell med fotlengde på side 4.

To trygge lukkingsalternativer for T-stroppen er beskrevet (uten knapp, eller
med en myk heklet knapp i rosa, som i referansebildet), og sikkerhetssiden
fraråder harde plast-/metallknapper på de minste størrelsene.

Forsiden bruker `luna_ballerinasko_real.jpg`, det faktiske referansebildet av
skoene (konvertert fra PNG til JPEG, kvalitet 90), tydelig merket
"stiluttrykk-referanse", samme mønster som Ellies versjon.

## Bygge PDF-ene på nytt

```bash
python3 build_luna_ballerinasko.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Lunas-ballerinasko-LME.pdf ballerinasko_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Lunas-ballerinasko-LME-EN.pdf ballerinasko_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
