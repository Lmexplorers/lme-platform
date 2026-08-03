# Ellies aktivitetsleke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Ellies-aktivitetsleke-LME.pdf`** (norsk, 20 sider, A4) og
**`Ellies-aktivitetsleke-LME-EN.pdf`** (engelsk, 20 sider, A4).

Sjette og mest omfattende oppskrift i **LME Baby Collection "Woodland
Dreams"**. En stor aktivitetsring, ca. 16-18 cm i diameter, med et
babysikkert speil, Ellie, blad, blomst, sky, stjerne, måne, regnbue og
kuler, pluss sensoriske teknikker (boblemasker, ribb, popcornmasker) og
valgfrie tilleggseffekter (knitrelyd, bjelle, tekstilbånd).

Gjenbruker bevisst blad-, blomst-, sky- og stjernemotivene fra
`../ellies-vognlenke/` og kule-motivet fra `../ellies-smokkelenke/`, slik at
kolleksjonen henger sammen visuelt og barnet kjenner igjen formene på tvers
av produktene.

**Sikkerhet er spesielt viktig her**, siden dette er oppskriften med flest
påsydde smådeler i hele kolleksjonen. Speilet (kun babysikkert
akryl/plast, aldri glass) og en eventuell bjelle/knitrefolie skal alltid
sys inn i en helt lukket lomme. Side 18 av 20 er viet sikkerhet i sin
helhet.

## Bygge PDF-ene på nytt

```bash
python3 build_aktivitetsleke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-aktivitetsleke-LME.pdf aktivitetsleke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-aktivitetsleke-LME-EN.pdf aktivitetsleke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Ferdige kopier til nedlasting i butikken ligger i
`butikk/nedlasting/oppskrifter/ellies-aktivitetsleke.pdf` og
`ellies-aktivitetsleke-en.pdf`.
