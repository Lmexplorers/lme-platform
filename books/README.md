# Bøker (eventyr med bilde + tekst + lyd / lydbok)

Hver bok = én mappe med en `pages.json` og asset-mapper. Bok-leseren i
`mia-og-teo.html` laster `books/<id>/pages.json` og viser én side om gangen,
med 🎧 lydbok-modus som spiller lyden og blar automatisk videre.

## Mappestruktur

```
books/
  pinnsvin/
    pages.json
    img/      s01.webp, s02.webp, …   (én per side, 16:9, helst webp)
    lyd/no/   s01.mp3, s02.mp3, …     (norsk fortellerstemme)
    lyd/en/   s01.mp3, …              (engelsk – valgfritt)
```

## pages.json

```json
{
  "titleNo": "Pinnsvinet i hagen",
  "titleEn": "The hedgehog in the garden",
  "pages": [
    { "img": "img/s01.webp",
      "no": "Norsk tekst for siden …",
      "en": "English text for the page …",
      "audioNo": "lyd/no/s01.mp3",
      "audioEn": "lyd/en/s01.mp3" }
  ]
}
```

Per side:
- `img` – bildet (eller `video` + `poster` for en video-side / forside).
- `no` / `en` – teksten på hvert språk (følger språkbryteren i appen).
- `audioNo` / `audioEn` – fortellerstemme (valgfritt; uten lyd er 🎧 av).

Stier kan være bok-relative (`img/s01.webp`) – da legger leseren `books/<id>/`
foran automatisk. Stier som starter med `images/`, `videos/`, `books/`, `/`
eller `http` brukes som de er (nyttig for gjenbruk av eksisterende assets).

## Legge inn en ny/oppdatert bok (zip fra Manus)

1. Pakk ut zip-en.
2. Legg bilder i `books/<id>/img/`, lyd i `books/<id>/lyd/no/` (og `/en/`).
3. Skriv/oppdater `books/<id>/pages.json` med de 30 sidene.
4. I `mia-og-teo.html`: gi eventyr-flisen `data-book="<id>"` (pinnsvin er
   allerede koblet). Ferdig — leseren tar resten.

Halvferdige bøker funker fint: legg inn de sidene du har, så vokser boka
etterhvert.
