# Ellies ballerinasko (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Ellies-ballerinasko-LME.pdf`** (norsk, 17 sider, A4) og
**`Ellies-ballerinasko-LME-EN.pdf`** (engelsk, 17 sider, A4).

Femte oppskrift i **LME Baby Collection "Woodland Dreams"**. Klassiske
babyballerinaer med rund tå, et lite dådyransikt med ører og sløyfe på
tåpartiet, T-stropp, picotkant og et hjerte brodert på sålen, i fem
størrelser (prematur, 0-3, 3-6, 6-9, 9-12 måneder), pluss en matchende
hårsløyfe. Dådyransiktet og hjertet ble lagt til 3. august 2026, etter
Renates referansebilde, slik at produktbildet i butikken stemmer med
oppskriften.

Tallene i oppskriften følger samme flerstørrelses-konvensjon som
`../ro-bottehatt/` og de andre eldre LME-oppskriftene: `prematur (0-3) 3-6
(6-9) 9-12`. Egen størrelsestabell med fotlengde på side 4.

To trygge lukkingsalternativer for T-stroppen er beskrevet (uten knapp, eller
med en myk heklet knapp), og sikkerhetssiden fraråder harde plast-/metallknapper
på de minste størrelsene.

Rettet 3. august 2026: forsiden viste feilaktig et generisk Ellie-bilde
merket "ikke selve skoene". Byttet til `ballerinasko_ref.jpg`, det
faktiske sko-referansebildet som allerede brukes i butikken.

Oppdatert 4. august 2026 (Renate): fjernet "Fotoveiledning"-siden, siden
oppskriften er salgsklar og ligger live i butikken. Ekte bilder legges inn
i en egen seksjon den dagen de faktisk finnes, ikke som tomme
plassholdere før det.

## Bygge PDF-ene på nytt

```bash
python3 build_ballerinasko.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-ballerinasko-LME.pdf ballerinasko_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-ballerinasko-LME-EN.pdf ballerinasko_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Ferdige kopier til nedlasting i butikken ligger i
`butikk/nedlasting/oppskrifter/ellies-ballerinasko.pdf` og
`ellies-ballerinasko-en.pdf`.
