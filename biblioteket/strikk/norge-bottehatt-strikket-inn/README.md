# Norge-bøttehatt, mønster strikket inn (LME-stil)

Ferdig oppskrift: **`Norge-bottehatt-LME-strikket-inn.pdf`** (12 sider, A4).

Samme hatt som `../norge-bottehatt/`, men her er "Norge", flagget, "Ro" og bølgene
**strikket inn med flerfargestrikk** (to farger på omgangen, med flott på baksiden)
i stedet for brodert på med maskesting.

Forskjeller fra maskesting-utgaven:
- Egen teknikk-side: "Slik strikker du inn mønster" (flott, forsiden/baksiden, feste lange flott).
- Mønsteret strikkes inn i et mønsterbånd midt på hoveddelen, ikke brodert til slutt.
- Vanskelighetsgrad hevet til "litt øvet". Flagget (tre farger) er det vanskeligste.
- Diagrammene er de samme; leses nedenfra og opp, fra høyre mot venstre (rundstrikk).

- **Garn:** DROPS Paris (100 % bomull), pinne 5.
- **Fonter (låst LME-stil):** Playpen Sans på overskrifter, Sasson Montessori på brødtekst.

## Bygge PDF-en på nytt

```bash
python3 build_hatt_knit.py
chromium --headless --no-pdf-header-footer \
  --print-to-pdf=Norge-bottehatt-LME-strikket-inn.pdf hatt_knit.html
```

Produktbildet leses fra en fast sti øverst i skriptet (`PHOTO`); bytt den ved behov.
