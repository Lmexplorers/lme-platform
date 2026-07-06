# RO-bøttehatt, strikkeoppskrift (LME-stil)

Ferdig oppskrift: **`RO-bottehatt-LME.pdf`** (12 sider, A4).

Hvit bomullshatt med solid blå brem og bølget kant. Foran står "RO" og det
norske flagget i blått, bak er to blå bølgeskvulp. Motivene er strikket rett inn
med flerfargestrikk, ikke brodert på. Passer barn, dame og herre, med
mønsterdiagram og steg for steg-illustrasjoner.

- **Garn:** DROPS Paris (100 % bomull), pinne 5.
- **Fonter (låst LME-stil):** Playpen Sans på overskrifter, Sasson Montessori på
  all brødtekst. Fontene ligger i `fonts/` og bakes inn i PDF-en ved bygging.

## Bygge PDF-en på nytt

`build_ro.py` genererer `hatt_ro.html`, som skrives ut til PDF med headless
Chromium. Produktbildet leses fra en fast sti i skriptet; bytt `PHOTO`-stien
øverst i skriptet hvis du kjører det på nytt.

```bash
python3 build_ro.py
chromium --headless --no-pdf-header-footer \
  --print-to-pdf=RO-bottehatt-LME.pdf hatt_ro.html
```
