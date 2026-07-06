# RO-bøttehatt, hekleoppskrift (LME-stil)

Ferdig oppskrift: **`RO-hekleoppskrift-LME.pdf`** (10 sider, A4).

Hvit bomullshatt heklet i spiral med fastmasker. Foran står "RO" og det norske
flagget i blått, bak er to blå bølgeskvulp. Bremmen er heklet i solid blått med
bølget kant. Motivene hekles rett inn med tapestry-heikling, ikke brodert på.
Passer voksen (hodeomkrets 54 til 57 cm), med mønsterdiagram og steg for steg.

- **Garn:** DROPS Paris (100 % bomull), heklenål 5 mm.
- **Fonter (låst LME-stil):** Playpen Sans på overskrifter, Sasson Montessori på
  all brødtekst. Fontene ligger i `fonts/` og bakes inn i PDF-en ved bygging.

## Bygge PDF-en på nytt

`build_hekle_ro.py` genererer `hekle_ro.html`, som skrives ut til PDF med
headless Chromium.

```bash
python3 build_hekle_ro.py
chromium --headless --no-pdf-header-footer \
  --print-to-pdf=RO-hekleoppskrift-LME.pdf hekle_ro.html
```
