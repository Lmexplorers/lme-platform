# Lunas smokkelenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Lunas-smokkelenke-LME.pdf`** (norsk, 14 sider, A4) og
**`Lunas-smokkelenke-LME-EN.pdf`** (engelsk, 14 sider, A4).

Følger opp `../ellies-smokkelenke/`, `../pip-smokkelenke/`,
`../felix-smokkelenke/` og `../molly-smokkelenke/` med en versjon for
Luna. Et lite, forenklet kaninhode i varmt grått, med to små, avlange
mini-ører (en miniatyr av Lunas signatur, de ekstra lange ørene) og en
rosa sløyfe mellom ørene. Tres sammen med heklede kuler til en
smokkelenke, maks 22 cm som resten av kolleksjonen.

Bygget etter samme mal som de andre smokkelenkene, med Luna sitt eget
referansebilde (`luna_face_ref.jpg`, kopiert fra
`../luna-kanin/luna_face.jpg`) på forsiden og i ansikts-seksjonen, tydelig
merket "stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_luna_smokkelenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Lunas-smokkelenke-LME.pdf smokkelenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Lunas-smokkelenke-LME-EN.pdf smokkelenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
