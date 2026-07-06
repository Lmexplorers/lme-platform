# NORWAY-bøttehatt, strikkeoppskrift (LME-stil)

Ferdig oppskrift: **`NORWAY-bottehatt-LME.pdf`** (12 sider, A4).

Rød bomullshatt med bølget brem. **NORWAY** i store hvite blokkbokstaver (9 x 11
ruter) rundt forsiden, og det norske flagget bak. Mønsteret er strikket inn med
flerfargestrikk (ikke maskesting). Passer barn, dame og herre. Fin heiahatt til
fotball-VM.

- **Garn:** DROPS Paris (100 % bomull), pinne 5.
- **Fonter (låst LME-stil):** Playpen Sans på overskrifter, Sasson Montessori på brødtekst.
- Bokstavene er 9 x 11 blokkbokstaver med streker minst 2 ruter tykke. Flagget har
  ubrutt blå korsarm (korrekt nordisk kors).

## Bygge PDF-en på nytt

```bash
python3 build_norway.py
chromium --headless --no-pdf-header-footer \
  --print-to-pdf=NORWAY-bottehatt-LME.pdf hatt_norway.html
```

Cover-fotoet leses fra en fast sti øverst i `build_norway.py` (`PHOTO`); bytt den
ved behov. Fotoet bakes inn i PDF-en, så PDF-en er selvstendig.
