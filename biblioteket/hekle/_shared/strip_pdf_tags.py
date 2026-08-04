# -*- coding: utf-8 -*-
"""
Fjerner den automatiske tilgjengelighets-tagge-strukturen (/StructTreeRoot,
/MarkInfo) som Chromiums print-to-pdf legger inn i hver PDF som standard.

Denne strukturen er ren ekstra-vekt for et heklet/strikket oppskrifts-PDF
(den brukes av skjermlesere, ikke av vanlig lesing), men kan bli
uforholdsmessig stor: for et 14-siders dokument utgjorde den over 800 av
1750 PDF-objekter og ca 30% av filstørrelsen. Mistanke: dette kan gjøre
PDF-en tung å parse for enkelte mobil-PDF-visere (rapportert som "hopper
tilbake til start" og "får ikke sett alle sidene" på telefon/Chrome).

Bruk:  python3 strip_pdf_tags.py <fil1.pdf> [fil2.pdf ...]
Skriver om filene i-place. Sidene, teksten og layouten er identisk etterpå,
kun tagge-strukturen er fjernet. Kjør ALLTID en visuell/sidetall-kontroll
etterpå, akkurat som etter enhver annen PDF-regenerering.
"""
import sys
import fitz


def strip_tags(path):
    d = fitz.open(path)
    before_xrefs = d.xref_length()
    cat_xref = d.pdf_catalog()
    d.xref_set_key(cat_xref, 'MarkInfo', 'null')
    d.xref_set_key(cat_xref, 'StructTreeRoot', 'null')
    tmp = path + '.tmp'
    d.save(tmp, garbage=4, deflate=True, clean=True)
    d.close()

    d2 = fitz.open(tmp)
    after_xrefs = d2.xref_length()
    n_pages = len(d2)
    d2.close()

    import os
    before_size = os.path.getsize(path)
    after_size = os.path.getsize(tmp)
    os.replace(tmp, path)
    print(f"{path}: {n_pages} sider, {before_xrefs}->{after_xrefs} objekter, "
          f"{before_size}->{after_size} bytes")


if __name__ == '__main__':
    for p in sys.argv[1:]:
        strip_tags(p)
