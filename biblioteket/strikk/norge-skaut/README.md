# Norge-skaut, strikkeoppskrift (LME-stil)

Ferdig oppskrift: **`Norge-skaut-LME.pdf`** (11 sider, A4).

Et rødt trekantskaut som passer til Norge-/NORWAY-hattene. Bølgekant rundt hele
skautet, flaggstriper og et norsk flagg, og to I-cord-snorer å knyte bak i nakken.
To størrelser: barn og voksen. Skrevet i enkelt nybegynner-språk (en 8-åring kan
følge den enkle varianten).

- **Enkel variant** for de yngste: hopp over det innstrikkede flagget, strikk bare
  den røde trekanten med den bølgete stripekanten. Da trengs aldri to farger på en gang.
- **Garn:** DROPS Paris (100 % bomull), pinne 5.
- **Fonter (låst LME-stil):** Playpen Sans på overskrifter, Sasson Montessori på brødtekst.

## Bygge PDF-en på nytt

```bash
python3 build_skaut.py
chromium --headless --no-pdf-header-footer \
  --print-to-pdf=Norge-skaut-LME.pdf skaut.html
```

Coveret og skissen er tegnet med SVG (ikke foto), så skriptet er selvstendig.
