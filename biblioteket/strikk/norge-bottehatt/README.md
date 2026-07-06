# Norge-bøttehatt, strikkeoppskrift (LME-stil)

Ferdig oppskrift: **`Norge-bottehatt-LME.pdf`** (11 sider, A4).

Rød bomullshatt med bølget brem, "Norge" og flagget foran, "Ro" med to
bølgeskvulp bak. Passer barn, dame og herre. Skrevet så enkelt at en 10-åring
kan følge den, med mønsterdiagram og steg for steg-illustrasjoner.

- **Garn:** DROPS Paris (100 % bomull), pinne 5.
- **Fonter (låst LME-stil):** Playpen Sans på overskrifter, Sasson Montessori på
  all brødtekst. Fontene ligger i `fonts/` og bakes inn i PDF-en ved bygging.

## Bygge PDF-en på nytt

`build_hatt.py` genererer `hatt.html`, som skrives ut til PDF med headless
Chromium. Produktbildet (fire foto av hatten) leses fra en fast sti i skriptet;
bytt `PHOTO`-stien øverst i skriptet hvis du kjører det på nytt.

```bash
python3 build_hatt.py
chromium --headless --no-pdf-header-footer \
  --print-to-pdf=Norge-bottehatt-LME.pdf hatt.html
```
