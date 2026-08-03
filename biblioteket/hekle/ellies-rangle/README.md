# Ellies rangle (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Ellies-rangle-LME.pdf`** (norsk, 14 sider, A4) og
**`Ellies-rangle-LME-EN.pdf`** (engelsk, 14 sider, A4).

Tredje oppskrift i **LME Baby Collection "Woodland Dreams"**. Et lite
dådyrhode (miniatyrutgave av Ellie) på en trering, ca. 13 til 15 cm høyt, med
en rangleboks trygt gjemt inni hodet.

Samme sikkerhetsfokus som `../ellies-smokkelenke/`: en egen side minner om at
rangleboksen aldri må kunne tas ut, og at ferdig produkt må kontrolleres mot
gjeldende lokale krav før salg.

- **Garn:** samme Bystrikk Merino som resten av kolleksjonen.
- **Fotoveiledning og QR-kode-plassholder:** samme mal som smokkelenken.
- Forsidebildet bruker Ellie-hovedfigurens eget produktfoto som
  stiluttrykk-referanse (tydelig merket i bildeteksten), siden rangelen selv
  ikke er heklet og fotografert ennå.

## Bygge PDF-ene på nytt

```bash
python3 build_rangle.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-rangle-LME.pdf rangle_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-rangle-LME-EN.pdf rangle_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Ferdige kopier til nedlasting i butikken ligger i
`butikk/nedlasting/oppskrifter/ellies-rangle.pdf` og `ellies-rangle-en.pdf`.
