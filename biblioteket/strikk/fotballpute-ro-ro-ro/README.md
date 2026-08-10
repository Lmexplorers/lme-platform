# Fotballpute RO RO RO, strikkeoppskrift (LME-stil)

Ferdige oppskrifter: **`Fotballpute-RO-RO-RO-LME.pdf`** (norsk) og
**`Fotballpute-RO-RO-RO-LME-EN.pdf`** (engelsk), 12 sider, A4.

En myk turkis supporterpute med grønt fotballnett, grønne tribunetopper og "RO RO RO" strikket
rundt hele puten i lysegult/turkis. Mønsteret går rundt på rundpinne, slik at begge sider blir
like. Rekonstruert etter en originalpute strikket av Renates mamma, ut fra et ferdig bilde av
puten og en første utkast-oppskrift (laget av en annen chat-tjeneste, ikke i LME-stil).

- **Garn:** Reynolds Saucy (100 % mercerisert bomull), pinne 4,5 mm + Holly fra Rusta (100 % akryl, hvit).
- **Fonter (låst LME-stil):** Playpen Sans på overskrifter, Sasson Montessori på
  all brødtekst. Fontene ligger i `fonts/` og bakes inn i PDF-en ved bygging.

## Bygge PDF-ene på nytt

`build_fotballpute.py` genererer både `fotballpute_ro_no.html` og `fotballpute_ro_en.html`
(delt diagramdata og CSS, egne sidetekster per språk), som skrives ut til PDF med headless
Chromium. Referansebildet leses fra en fast sti i skriptet (`fotballpute_ref.jpg`, hentet fra
det opprinnelige oppskriftsutkastet).

```bash
python3 build_fotballpute.py
chromium --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Fotballpute-RO-RO-RO-LME.pdf fotballpute_ro_no.html
chromium --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Fotballpute-RO-RO-RO-LME-EN.pdf fotballpute_ro_en.html
```

## Status: til salgs (delvis koblet)

- Salgsside: `butikk/fotballpute-ro-strikk.html`, lenket med kort på `/butikk`. Pris satt til
  99 kr / $9, samme som RO-bøttehatten og de andre enkeltoppskriftene.
- Produktoppføring i `butikk/butikk-config.js` (id `fotballpute-ro-strikk`) er på plass, med
  PDF-ene lagt i `butikk/nedlasting/oppskrifter/`.
- **Mangler:** ekte Stripe-betalingslenker (én NOK, én USD). Kjøpsknappen på salgssiden og
  kortet i butikken peker foreløpig til `#`/produktsiden selv. Når betalingslenkene er
  opprettet i Stripe (redirect til `/butikk/takk.html?p=fotballpute-ro-strikk`), må:
  1. `data-no-href`/`data-en-href` og `href` på `.btn-buy` i `butikk/fotballpute-ro-strikk.html` oppdateres,
  2. samme lenker legges inn som kort-knapp i `butikk.html`,
  3. plink-ID-ene legges inn i `functions/_lib/pattern-links.js` for automatisk levering.
- Diagrammene er overført nøyaktig fra det opprinnelige oppskriftsutkastet (nederste og
  øverste RO-bord, fotballnett, tribunetopper), men er ikke kontrollstrikket på nytt av LME.
  Før salg: kontrollstrikk diagrammene og vei garnforbruket, se TIPS-boksen på siste side i PDF-en.
