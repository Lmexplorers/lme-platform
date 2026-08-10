# Fotballpute RO RO RO, strikkeoppskrift (LME-stil)

Ferdig oppskrift: **`Fotballpute-RO-RO-RO-LME.pdf`** (12 sider, A4).

En myk turkis supporterpute med grønt fotballnett, grønne tribunetopper og "RO RO RO" strikket
rundt hele puten i lysegult/turkis. Mønsteret går rundt på rundpinne, slik at begge sider blir
like. Rekonstruert etter en originalpute strikket av Renates mamma, ut fra et ferdig bilde av
puten og en første utkast-oppskrift (laget av en annen chat-tjeneste, ikke i LME-stil).

- **Garn:** Reynolds Saucy (100 % mercerisert bomull), pinne 4,5 mm + Holly fra Rusta (100 % akryl, hvit).
- **Fonter (låst LME-stil):** Playpen Sans på overskrifter, Sasson Montessori på
  all brødtekst. Fontene ligger i `fonts/` og bakes inn i PDF-en ved bygging.

## Bygge PDF-en på nytt

`build_fotballpute.py` genererer `fotballpute_ro.html`, som skrives ut til PDF med headless
Chromium. Referansebildet leses fra en fast sti i skriptet (`fotballpute_ref.jpg`, hentet fra
det opprinnelige oppskriftsutkastet).

```bash
python3 build_fotballpute.py
chromium --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Fotballpute-RO-RO-RO-LME.pdf fotballpute_ro.html
```

## Status

Ikke koblet til butikken ennå. Diagrammene er overført nøyaktig fra det opprinnelige
oppskriftsutkastet (nederste og øverste RO-bord, fotballnett, tribunetopper), men er ikke
kontrollstrikket på nytt av LME. Før salg: kontrollstrikk diagrammene og vei garnforbruket,
se TIPS-boksen på siste side i PDF-en.
