/**
 * To ekte, allerede solgte produkter flyttet inn i LME Læringsverksted fra
 * butikken (butikk/tidslinje.html og butikk/plansjer.html), på Renates
 * ønske. Tekst, priser og Stripe-betalingslenker er hentet ordrett/1:1 fra
 * de eksisterende butikksidene, ikke funnet på. Fillevering skjer fortsatt
 * via den eksisterende /butikk/takk.html?p=<id>-siden (samme som butikken
 * alltid har brukt), IKKE via LAERINGSVERKSTED_PAYMENT_LINKS, siden vi ikke
 * har de faktiske Stripe plink_-API-ID-ene (kun de offentlige
 * buy.stripe.com-lenkene) — se hjelpeteksten i /laeringsverksted-bygger for
 * hvordan man kobler det på senere om ønskelig.
 *
 * Brukt av functions/api/seed-laeringsverksted.js.
 */

export const LIVETS_TIDSLINJE = {
  slug: "livets-tidslinje",
  published: true,
  featured: true,
  title: { no: "Livets Tidslinje, komplett pakke", en: "Timeline of Life, Complete Package" },
  subtitle: {
    no: "Montessorimateriell · 3–9 år · digital nedlasting",
    en: "Montessori material · Ages 3-9 · digital download",
  },
  description: {
    no: "Fortell historien om livet på jorden, fra de første cellene til mennesket. En komplett Montessoripakke med egne akvarellillustrasjoner, klar til utskrift og bruk samme dag.",
    en: "Tell the story of life on Earth, from the first cells to human beings. A complete Montessori package with original watercolour illustrations, ready to print and use the same day.",
  },
  cover: "https://lmexplorers.com/images/tidslinje-cover.jpg",
  gallery: [],
  audience: ["foreldre", "montessoripedagog", "pedagog", "hjemme"],
  ageBands: ["m3-6", "m6-9"],
  direction: "montessori",
  subjects: ["naturfag", "historie", "kultur", "zoologi"],
  resourceType: ["tidslinje", "begrepskort", "larerveiledning"],
  competencyGoals: [],
  contains: [
    { no: "Ferdig tidslinje: hele livets tidslinje med alle epoker, illustrasjoner og forklaringer, klar til å henge opp.", en: "Finished timeline: the complete timeline of life with all eras, illustrations and explanations, ready to hang up." },
    { no: "Tom tidslinje: samme tidslinje uten kort og navn, så barnet kan bygge livets historie selv.", en: "Blank timeline: the same timeline without cards and names, so the child can build the story of life themselves." },
    { no: "55 bildekort: akvarellkort med dyrene og plantene fra tidslinjen, til sortering, matching og samtale.", en: "55 picture cards: watercolour cards with the animals and plants from the timeline, for sorting, matching and conversation." },
    { no: "Navnekort til alle bildekortene, i tråd med trestegsleksjonen.", en: "Name cards for all the picture cards, in line with the three-period lesson." },
    { no: "Lærerveiledning: slik presenterer du tidslinjen steg for steg, med forslag til oppfølgingsarbeid.", en: "Teacher's guide: how to present the timeline step by step, with suggestions for follow-up work." },
  ],
  pageCount: 0,
  language: ["nb", "en"],
  fileFormat: ["pdf"],
  editable: false,
  usageTips: {},
  prep: {},
  differentiation: {},
  montessoriArea: {
    area: { no: "Kosmisk utdanning: livets historie", en: "Cosmic education: the history of life" },
    presentation: {},
    prerequisites: {},
    directPurpose: {},
    indirectPurpose: {},
    controlOfError: {},
    extension: {},
  },
  license: "privat",
  priceType: "betalt",
  price: { no: "499 kr", en: "$49" },
  memberPrice: {},
  buyUrl: "https://buy.stripe.com/28EeVea8dcnB2TP2WX9R60p",
  fileUrl: "https://lmexplorers.com/butikk/takk.html?p=tidslinje",
  licenseOptions: [],
  bundle: false,
  bundleItems: [],
  related: ["plansjer-og-kortsett"],
  bookly: { type: "", category: "", topic: "", age: "", plan: "", fag: "", alder: "" },
  stats: { views: 0, downloads: 0, favorites: 0 },
};

export const PLANSJER_OG_KORTSETT = {
  slug: "plansjer-og-kortsett",
  published: true,
  featured: false,
  title: { no: "Plansjer og kortsett, forhistoriske dyr", en: "Posters and Card Sets, Prehistoric Animals" },
  subtitle: {
    no: "LME Cosmic · Montessorimateriell · 3–9 år · digital nedlasting",
    en: "LME Cosmic · Montessori material · Ages 3-9 · digital download",
  },
  description: {
    no: "LME Cosmic: 10 A3-plansjer som viser størrelsesforholdet mellom barnet og det forhistoriske dyret, med tekstkort og brukerveiledning. PDF-nedlasting til utskrift, klart til bruk samme dag.",
    en: "LME Cosmic: 10 A3 posters showing the size relation between the child and the prehistoric animal, with text cards and a user guide. Printable PDF download, ready to use the same day.",
  },
  cover: "https://lmexplorers.com/images/plansjer/hero-plansjer.jpg",
  gallery: [],
  audience: ["foreldre", "montessoripedagog", "pedagog", "hjemme"],
  ageBands: ["m3-6", "m6-9"],
  direction: "montessori",
  subjects: ["naturfag", "historie", "zoologi", "kultur"],
  resourceType: ["plakat", "begrepskort", "larerveiledning"],
  competencyGoals: [],
  contains: [
    { no: "10 A3-plansjer: hver plansje viser størrelsesforholdet mellom barnet og det forhistoriske dyret. Skriv ut på A3-papir for full effekt.", en: "10 A3 posters: each poster shows the size relation between the child and the prehistoric animal. Print on A3 paper for full effect." },
    { no: "Tekstkort, navn: klassiske etikettkort til parring med plansjene.", en: "Text cards, names: classic label cards for matching with the posters." },
    { no: "Tekstkort, navn og type: kort med navn og dyretype (planteeter, rovdyr), for neste nivå i arbeidet.", en: "Text cards, name and type: cards with name and animal type (herbivore, predator), for the next level of work." },
    { no: "Tekstkort, fakta: navn, type og fakta-punkter om hvert dyr, tilpasset barn.", en: "Text cards, facts: name, type and fact points about each animal, adapted for children." },
    { no: "Brukerveiledning: slik presenterer du plansjene og kortene, steg for steg.", en: "User guide: how to present the posters and cards, step by step." },
  ],
  pageCount: 0,
  language: ["nb", "en"],
  fileFormat: ["pdf"],
  editable: false,
  usageTips: {},
  prep: {},
  differentiation: {},
  montessoriArea: {
    area: { no: "Kosmisk utdanning: forhistoriske dyr", en: "Cosmic education: prehistoric animals" },
    presentation: {},
    prerequisites: {},
    directPurpose: {},
    indirectPurpose: {},
    controlOfError: {},
    extension: {},
  },
  license: "privat",
  priceType: "betalt",
  price: { no: "199 kr", en: "$19" },
  memberPrice: {},
  buyUrl: "https://buy.stripe.com/cNi28s2FL73hamh4119R60n",
  fileUrl: "https://lmexplorers.com/butikk/takk.html?p=plansjer",
  licenseOptions: [],
  bundle: false,
  bundleItems: [],
  related: ["livets-tidslinje"],
  bookly: { type: "", category: "", topic: "", age: "", plan: "", fag: "", alder: "" },
  stats: { views: 0, downloads: 0, favorites: 0 },
};
