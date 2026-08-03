# Ellies rangle (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Ellies-rangle-LME.pdf`** (norsk, 14 sider, A4) og
**`Ellies-rangle-LME-EN.pdf`** (engelsk, 14 sider, A4).

Tredje oppskrift i **LME Baby Collection "Woodland Dreams"**. Et lite
dådyrhode (miniatyrutgave av Ellie) på en trering, ca. 13 til 15 cm høyt, med
sløyfe, volangkrage rundt halsen og en rangleboks trygt gjemt inni hodet.
Sløyfen og kragen erstattet de tidligere valgfrie "hornene" 3. august 2026,
etter Renates referansebilde, slik at produktbildet i butikken stemmer med
oppskriften.

Samme sikkerhetsfokus som `../ellies-smokkelenke/`: en egen side minner om at
rangleboksen aldri må kunne tas ut, og at ferdig produkt må kontrolleres mot
gjeldende lokale krav før salg.

- **Garn:** samme Bystrikk Merino som resten av kolleksjonen, pluss en liten
  rest av pudderrosa til sløyfen og kragen.
- **Fotoveiledning og QR-kode-plassholder:** samme mal som smokkelenken.
- Forsidebildet er et beskjært utsnitt av Renates eget referansebilde for
  rangelen (tydelig merket "stiluttrykk-referanse" i bildeteksten), siden
  rangelen selv ikke er heklet og fotografert ennå.

Rettet 3. august 2026: forsiden viste feilaktig et generisk Ellie-bilde
merket "ikke selve rangelen". Byttet til `rangle_ref.jpg`, det faktiske
rangel-referansebildet som allerede brukes i butikken.

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
