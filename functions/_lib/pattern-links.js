/**
 * Oppskrift-kjøp (bøttehatt/skaut): Stripe-betalingslenke -> { produkt-id, språk }.
 * NOK-lenker = norsk, USD-lenker = engelsk. Delt kilde, brukes av både
 * oppskrift-webhooken (leveringsmail) og hovedwebhooken.
 */
export const PATTERN_LINKS = {
  // ro-strikk
  "plink_1TqKogLax7B8uQzq2xw0LSkj": { p: "ro-strikk", lang: "no" },
  "plink_1TqQJQLax7B8uQzqTYsUhiw6": { p: "ro-strikk", lang: "en" },
  // ro-hekle
  "plink_1TqKqMLax7B8uQzqqzdIpLFQ": { p: "ro-hekle", lang: "no" },
  "plink_1TqQJRLax7B8uQzqcH4uvgp1": { p: "ro-hekle", lang: "en" },
  // norway-strikk
  "plink_1TqKqNLax7B8uQzqoD0SH4Eu": { p: "norway-strikk", lang: "no" },
  "plink_1TqQJTLax7B8uQzqr0aWK1ZI": { p: "norway-strikk", lang: "en" },
  // norway-hekle
  "plink_1TqKqPLax7B8uQzqFThJKSO0": { p: "norway-hekle", lang: "no" },
  "plink_1TqQJULax7B8uQzqQEC8Ufr0": { p: "norway-hekle", lang: "en" },
  // norge-strikk (maskesting)
  "plink_1TqKqRLax7B8uQzqZ33h4h5J": { p: "norge-strikk", lang: "no" },
  "plink_1TqQJWLax7B8uQzqMybvRaX0": { p: "norge-strikk", lang: "en" },
  // norge-blokk
  "plink_1TqKqSLax7B8uQzqI6IBFKx2": { p: "norge-blokk", lang: "no" },
  "plink_1TqQJYLax7B8uQzqmY39qwMJ": { p: "norge-blokk", lang: "en" },
  // norge-innstrikket
  "plink_1TqKqULax7B8uQzqKE7t9KhT": { p: "norge-innstrikket", lang: "no" },
  "plink_1TqQJZLax7B8uQzqfnPEL2iV": { p: "norge-innstrikket", lang: "en" },
  // norge-rune
  "plink_1Tv4bQLax7B8uQzq4ghj2ZQD": { p: "norge-rune", lang: "no" },
  "plink_1Tv4baLax7B8uQzq692btr6j": { p: "norge-rune", lang: "en" },
  // norge-hekle
  "plink_1TqKqWLax7B8uQzq3zOum7nH": { p: "norge-hekle", lang: "no" },
  "plink_1TqQJbLax7B8uQzqIRUPmFMG": { p: "norge-hekle", lang: "en" },
  // norge-skaut (strikk)
  "plink_1TqKqYLax7B8uQzqYB906yIN": { p: "norge-skaut", lang: "no" },
  "plink_1TqQJcLax7B8uQzql7E8ODDo": { p: "norge-skaut", lang: "en" },
  // norge-skaut-hekle
  "plink_1TqR9WLax7B8uQzqmRsRLibH": { p: "norge-skaut-hekle", lang: "no" },
  "plink_1TqR9cLax7B8uQzqfJ5Gst5g": { p: "norge-skaut-hekle", lang: "en" },
  // norge-pakke
  "plink_1TqKqZLax7B8uQzq6QM3SDtw": { p: "norge-pakke", lang: "no" },
  "plink_1TqQJeLax7B8uQzqW0TTjWXK": { p: "norge-pakke", lang: "en" },
  // hekle-pakke (249)
  "plink_1TxlCHLax7B8uQzqptsW5CFG": { p: "hekle-pakke", lang: "no" },
  "plink_1TxlCILax7B8uQzqQF0Gx73q": { p: "hekle-pakke", lang: "en" },
  // strikk-pakke (299)
  "plink_1TxlerLax7B8uQzq3kWa07U1": { p: "strikk-pakke", lang: "no" },
  "plink_1TxletLax7B8uQzqylxXeWJL": { p: "strikk-pakke", lang: "en" },

  // Nye engelske lenker (tospråklig produktnavn i kassa: norsk · engelsk).
  "plink_1TxrRlLax7B8uQzqPpCoVfoO": { p: "ro-strikk", lang: "en" },
  "plink_1TxrRnLax7B8uQzqqrL5tVeg": { p: "ro-hekle", lang: "en" },
  "plink_1TxrRpLax7B8uQzqe7oMynMt": { p: "norway-strikk", lang: "en" },
  "plink_1TxrRrLax7B8uQzqrYnmcj3k": { p: "norway-hekle", lang: "en" },
  "plink_1TxrRsLax7B8uQzqKbcXPYtf": { p: "norge-strikk", lang: "en" },
  "plink_1TxrQWLax7B8uQzqV0F0wFWd": { p: "norge-blokk", lang: "en" },
  "plink_1TxrRuLax7B8uQzq4sfhppLa": { p: "norge-innstrikket", lang: "en" },
  "plink_1TxrRwLax7B8uQzqXGCZRLbA": { p: "norge-rune", lang: "en" },
  "plink_1TxrS2Lax7B8uQzqRcvpl8BH": { p: "norge-hekle", lang: "en" },
  "plink_1TxrS4Lax7B8uQzqIS6A7dXx": { p: "norge-skaut", lang: "en" },
  "plink_1TxrS5Lax7B8uQzqLzPCxlC6": { p: "norge-skaut-hekle", lang: "en" },
  "plink_1TxrS7Lax7B8uQzqGY8kviD5": { p: "norge-pakke", lang: "en" },
  "plink_1TxrS9Lax7B8uQzqIZL2EOrd": { p: "hekle-pakke", lang: "en" },
  "plink_1TxrSBLax7B8uQzqDA7jDjxK": { p: "strikk-pakke", lang: "en" },

  // Egen engelsk butikk (/shop): rene engelske produkter, engelsk-only kasse.
  "plink_1Txrq1Lax7B8uQzqjdWrx6Bl": { p: "ro-strikk", lang: "en" },
  "plink_1Txrq3Lax7B8uQzqYl8dOHJz": { p: "ro-hekle", lang: "en" },
  "plink_1Txrq5Lax7B8uQzqRWkOPQ07": { p: "norway-strikk", lang: "en" },
  "plink_1Txrq7Lax7B8uQzqo1iHeeXl": { p: "norway-hekle", lang: "en" },
  "plink_1Txrq9Lax7B8uQzqfS6xHMyB": { p: "norge-strikk", lang: "en" },
  "plink_1TxrqALax7B8uQzq74PYo73L": { p: "norge-blokk", lang: "en" },
  "plink_1TxrqCLax7B8uQzq53fOdLHy": { p: "norge-innstrikket", lang: "en" },
  "plink_1TxrqSLax7B8uQzq2sbB4c71": { p: "norge-rune", lang: "en" },
  "plink_1TxrqULax7B8uQzq52Cj0HbC": { p: "norge-hekle", lang: "en" },
  "plink_1TxrqWLax7B8uQzq6gLCuUFb": { p: "norge-skaut", lang: "en" },
  "plink_1TxrqXLax7B8uQzq2JYnJPzK": { p: "norge-skaut-hekle", lang: "en" },
  "plink_1TxrqZLax7B8uQzqkad1ruv4": { p: "norge-pakke", lang: "en" },
  "plink_1TxrqcLax7B8uQzqvG5N7UZ1": { p: "hekle-pakke", lang: "en" },
  "plink_1TxrqdLax7B8uQzqw2Dy9miq": { p: "strikk-pakke", lang: "en" },
};
