# Lær Norsk med Mia &amp; Teo — videomanus &amp; AI-prompter

Klare manus og AI-video-prompter for kursvideoene. Bygget i **samme stil og format**
som den eksisterende videoen (`videos/laer-norsk.mp4`): **1280×720 (landskap 16:9),
ca. 40 sekunder, rolig og trygg Montessori-tone, ingen skarpe lyder eller farger.**

> Lim master-prompten + leksjonsmanuset inn i AI-videoverktøyet ditt (Sora, Runway,
> Pika, Kling, Higgsfield el.l.). Bruk samme **karakter-referanse** for Mia &amp; Teo i
> alle videoene, slik at de ser like ut fra leksjon til leksjon.

Når en video er ferdig: legg filen i `videos/` (f.eks. `videos/laer-tall.mp4`) og sett
`video:'videos/laer-tall.mp4'` på riktig leksjon i `laer-norsk.html` (feltet `LESSONS`).

---

## 🎨 Master-stilprompt (lim inn øverst i alle)

```
Style: warm, gentle Montessori children's educational animation. Two friendly
recurring characters, Mia (a curious little girl) and Teo (a kind little boy),
[BRUK DIN EGEN KARAKTER-REFERANSE HER så de ser like ut i alle videoer].
Soft pastel color palette (rose pink, cream, soft green, sky blue), rounded
shapes, hand-drawn storybook feel. Calm pacing, no harsh sounds, no flashing.
Aspect ratio 16:9, 1280x720. Length ~40 seconds. Gentle background music, very
soft. A warm, clear narrator voice. On-screen the target Norwegian word appears
in large rounded friendly text, with the English word smaller beneath it.
Audience: toddlers and preschoolers. Tone: safe, cozy, encouraging.
```

**Fast oppskrift per video (gjenta for hvert ord):**
1. Mia eller Teo peker på tingen → 2. ordet sies tydelig på norsk → 3. ordet vises
stort på skjermen (norsk + engelsk under) → 4. kort, glad pause.

---

## Leksjon 2 — 🔢 Tall og telling (1–10)

**Mål-ord:** En, To, Tre, Fire, Fem, Seks, Sju, Åtte, Ni, Ti
**Filnavn:** `videos/laer-tall.mp4`

**Manus (~40s):**
- **0:00–0:05** Mia og Teo vinker. Tekst: «Tall med Mia &amp; Teo». Forteller: *«Hei! Skal vi telle sammen?» / "Hi! Let's count together!"*
- **0:05–0:33** For hvert tall 1→10: vis tilsvarende antall søte objekter (1 eple, 2 baller, 3 blomster …). Forteller sier tallet på norsk, så vises tallet stort.
  - «En» (1) 🍎 · «To» (2) ⚽⚽ · «Tre» (3) 🌸🌸🌸 · «Fire» (4) · «Fem» (5) · «Seks» (6) · «Sju» (7) · «Åtte» (8) · «Ni» (9) · «Ti» (10)
- **0:33–0:40** Mia og Teo klapper. Forteller: *«Bra jobba! Vi telte til ti!» / "Well done! We counted to ten!"*

**AI-prompt (etter master):**
```
Mia and Teo count from one to ten in Norwegian. For each number, show that many
cute soft objects appearing one by one, then the Norwegian number word large on
screen (En, To, Tre, Fire, Fem, Seks, Sju, Åtte, Ni, Ti) with the English number
small beneath. Gentle counting, happy clapping at the end.
```

---

## Leksjon 3 — 🎨 Farger (Colors)

**Mål-ord:** Rød, Blå, Gul, Grønn, Oransje, Lilla, Rosa, Brun, Svart, Hvit
**Filnavn:** `videos/laer-farger.mp4`

**Manus (~40s):**
- **0:00–0:05** Mia holder en malerkost. Tekst: «Farger med Mia &amp; Teo».
- **0:05–0:34** En såpeboble / ballong / blomst dukker opp i hver farge. Forteller sier fargen på norsk, ordet vises stort i den fargen.
  - Rød 🔴 · Blå 🔵 · Gul 🟡 · Grønn 🟢 · Oransje 🟠 · Lilla 🟣 · Rosa 🌸 · Brun 🟤 · Svart ⚫ · Hvit ⚪
- **0:34–0:40** En liten regnbue tegnes. Forteller: *«Så mange fine farger!» / "So many lovely colors!"*

**AI-prompt (etter master):**
```
Mia and Teo show colors in Norwegian. A soft balloon or bubble appears in each
color; narrator says the Norwegian color word, which appears large on screen in
that exact color (Rød, Blå, Gul, Grønn, Oransje, Lilla, Rosa, Brun, Svart, Hvit)
with English beneath. Ends with a gentle rainbow.
```

---

## Leksjon 4 — 👪 Familien (The family)

**Mål-ord:** Mamma, Pappa, Baby, Jente, Gutt, Bestemor, Bestefar, Familie
**Filnavn:** `videos/laer-familie.mp4`

**Manus (~40s):**
- **0:00–0:05** Mia og Teo foran et koselig hus. Tekst: «Familien».
- **0:05–0:33** Hvert familiemedlem kommer smilende ut og vinker. Forteller sier ordet på norsk, ordet vises stort.
  - Mamma 👩 · Pappa 👨 · Baby 👶 · Jente 👧 · Gutt 👦 · Bestemor 👵 · Bestefar 👴 · (alle sammen =) Familie 👪
- **0:33–0:40** Hele familien klemmer. Forteller: *«Dette er familien — glad i deg!» / "This is the family — love you!"*

**AI-prompt (etter master):**
```
Mia and Teo introduce family members in Norwegian. Each member walks out of a
cozy house, smiling and waving; narrator says the Norwegian word which appears
large on screen with English beneath (Mamma, Pappa, Baby, Jente, Gutt, Bestemor,
Bestefar, Familie). Ends with a warm family hug.
```

---

## Leksjon 5 — 🍎 Mat og frukt (Food &amp; fruit)

**Mål-ord:** Eple, Banan, Jordbær, Drue, Brød, Ost, Melk, Egg, Gulrot, Vann
**Filnavn:** `videos/laer-mat.mp4`

**Manus (~40s):**
- **0:00–0:05** Mia og Teo ved et lite bord / piknikteppe. Tekst: «Mat og frukt».
- **0:05–0:34** Hver matvare legges på tallerkenen. Forteller sier ordet på norsk, ordet vises stort.
  - Eple 🍎 · Banan 🍌 · Jordbær 🍓 · Drue 🍇 · Brød 🍞 · Ost 🧀 · Melk 🥛 · Egg 🥚 · Gulrot 🥕 · Vann 💧
- **0:34–0:40** De tar en matbit sammen. Forteller: *«Mmm, så godt!» / "Mmm, yummy!"*

**AI-prompt (etter master):**
```
Mia and Teo have a little picnic and name food in Norwegian. Each item is placed
on a plate; narrator says the Norwegian word which appears large on screen with
English beneath (Eple, Banan, Jordbær, Drue, Brød, Ost, Melk, Egg, Gulrot, Vann).
Ends with them happily taking a bite.
```

---

## ✅ Slik kobler du en ny video inn i kurset

1. Eksporter videoen som **MP4, 1280×720**.
2. Legg den i `videos/` med navnet over (f.eks. `videos/laer-farger.mp4`).
3. I `laer-norsk.html`, finn `LESSONS`-listen og endre riktig leksjon fra
   `video:null` til f.eks. `video:'videos/laer-farger.mp4'`.
4. Commit + push — videoen vises automatisk i leksjonens video-steg.

> Tips: Hold hver fil under ~25 MB om mulig (som de eksisterende). Større filer
> fungerer i git, men lastes tregere for barna.
