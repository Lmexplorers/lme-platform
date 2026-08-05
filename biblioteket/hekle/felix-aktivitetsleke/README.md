# Felix' aktivitetsleke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Felix-aktivitetsleke-LME.pdf`** (norsk, 20 sider, A4) og
**`Felix-aktivitetsleke-LME-EN.pdf`** (engelsk, 20 sider, A4).

Adaptert fra `../ellies-aktivitetsleke/` 4. august 2026, etter Renates
referansebilde av den ferdige kuben. Samme grunnkonstruksjon som Ellies kube
(seks like grunnkvadrater, motiver heklet på hvert sitt panel, sydd sammen
til en kube med skumkvadrater inni, perlekant-håndtak på toppen, to
treringer og perledusker i hjørnene), men med to viktige forskjeller fra
Ellies versjon, begge bekreftet i referansebildet:

- **Kanten rundt hver side er salviegrønn**, ikke lyst brunt som på Ellies
  kube. (Rettet 4. august 2026: et tidligere referansebilde viste feilaktig
  lys himmelblå kant, Renate lastet opp et riktigere bilde som viser at
  fargen faktisk er salviegrønn, samme farge som Felix' volangkrage.)
- **Alle seks sidene er pyntet**, det finnes ingen enkel, upyntet bunnside.
  Referansebildet viser tydelig seks ulike, ferdig pyntede sider: Felix selv
  med salviegrønn volangkrage (ingen sløyfe), en egen stjerne-side med en
  stor pudderrosa stjerne, en form-side med fire mini-motiver (hjerte, blad,
  lite speil, liten sky), en større speil-side med salviegrønn takket ramme,
  en lomme-side med Felix som titter opp av en salviegrønn lomme med en liten
  hvit blomst, og en knitre-side med en stor, søvnig sky med stjerner og et
  hjerte rundt. Oppskriftens "Del 4: Stjerne-siden" og fordelingen av
  motiver på "Del 5: Form-siden" er derfor lagt om sammenlignet med Ellies
  struktur (hjerte/stjerne/sirkel/trekant), for å stemme med hva som faktisk
  vises på Felix' produktbilde.

Felix bærer ikke sløyfe noe sted i kolleksjonen hans. I stedet for
volangkragens sløyfe (som på Ellie-siden) hekles en liten, tofarget minihale
og sys fast øverst på baksiden av Felix-panelet, rett bak der hodet festes,
slik at den er skjult bak hodet akkurat som halen hans er skjult bak kroppen
hans, en tilpasning siden en fullt synlig hale ikke ville vist seg på et
rett forfra-bilde av panelet.

Samme sikkerhetsfokus som `../ellies-aktivitetsleke/`: speilet og
knitrefolien skal alltid være helt innsydd, aldri løse, og
hjørneringenes perledusker skal aldri overstige ca. 6-8 cm. Side 18 av 20
er viet sikkerhet i sin helhet.

Forsiden bruker `felix_aktivitetsleke_real.jpg`, Renates ekte produktbilde
av den ferdige kuben (konvertert fra PNG til JPEG, kvalitet 90).

## Bygge PDF-ene på nytt

```bash
python3 build_felix_aktivitetsleke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Felix-aktivitetsleke-LME.pdf aktivitetsleke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Felix-aktivitetsleke-LME-EN.pdf aktivitetsleke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Lagt til i butikken (`/butikk/felix-aktivitetsleke`) 4. august 2026.
