/* =====================================================================
   LME Vault, salgstrakt · konfigurasjon (norsk + engelsk)
   ---------------------------------------------------------------------
   Trakten har to steg:
     salg.html  → salgsside for LME Vault (pris + kjøp)
     takk.html  → takkeside etter kjøp, med veien inn i hvelvet

   Selve malene ligger i /js/vault-data.js, én kilde som både salgssiden
   (smakebiten) og hvelvet (/academy/vault) leser fra.

   Slik kobler du på ekte betaling:
     Lag én betalingslenke i Stripe (engangsbeløp) og lim den inn i
     "checkoutUrl" under, én for norske kroner og én for dollar. La feltet
     stå tomt så lenge du bare vil forhåndsvise trakten, da hopper knappen
     rett til takkesiden uten betaling.
     Husk også å legge betalingslenke-ID-en (plink_…) inn i
     COURSE_PAYMENT_LINKS i functions/_lib/purchase-links.js med
     courseId "vault", ellers får ikke kjøperen tilgangslenken sin på e-post.

   Rediger bare verdiene under, lagre, og last siden på nytt.
   ===================================================================== */

window.LME_FUNNEL = {

  /* =================================================================
     NORSK
     ================================================================= */
  no: {
    brand: {
      navn: "Little Montessori Explorers",
      kortnavn: "LME",
      logo: "/images/lme-logo.png"
    },

    salg: {
      checkoutUrl: "https://buy.stripe.com/9B6eVebchfzN2TPdBB9R70X",   // Stripe: LME Vault 199 kr (tom = hopp rett til takkesiden)
      etterKjop: "takk.html",

      pris: {
        belop: 199,
        valuta: "kr",
        visningFor: "349 kr"           // ordinær pris (overstrøket). "" skjuler
      },

      merkelapp: "Grunnleggerpris",
      overskrift: "Ferdige Claude-maler for digitale produkter",
      underoverskrift:
        "LME Vault er samlingen min med tolv ferdige maler som gjør deg fra tom side " +
        "til ferdig produkt. Du kopierer malen, fyller inn ditt eget, og har noe du " +
        "kan gi bort eller selge samme dag.",

      hvaDuFaarTittel: "Dette ligger i hvelvet",
      hvaDuLaererTittel: "Slik bruker du det",
      hvaDuLaerer: [
        "Åpne hvelvet, det ligger tolv maler der inne, ferdige til bruk",
        "Velg malen som passer det du holder på med akkurat nå",
        "Trykk kopier, og lim malen rett inn i Claude",
        "Bytt ut det som står i [klammer] med ditt eget",
        "Få et førsteutkast du bare trenger å justere, ikke skrive fra bunnen",
        "Legg resultatet der du allerede jobber: kurset ditt, siden din, e-postene dine",
        "Nye maler legges til i hvelvet, og du har tilgang for alltid"
      ],

      forDegTittel: "Dette er for deg hvis",
      forDeg: [
        "Du sitter fast på tom side hver gang du skal lage noe",
        "Du har mye innhold, men ingenting å selge ennå",
        "Du vil lage produkter uten å lære et helt system først",
        "Du liker å ha noe ferdig å ta utgangspunkt i",
        "Du vil ha maler på både norsk og engelsk"
      ],

      ikkeForDegTittel: "Dette er ikke for deg hvis",
      ikkeForDeg: [
        "Du leter etter en snarvei til raske penger",
        "Du vil ha noen til å lage produktene for deg",
        "Du bruker ikke AI i det hele tatt, og vil helst ikke begynne"
      ],

      garanti: "",
      kjopKnapp: "Ja takk, gi meg tilgang til hvelvet",
      sosialtBevis:
        "Laget av Renate Dahl, høgskoleutdannet montessoripedagog, som bygger hele LME selv.",
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: ""
    },

    takk: {
      merkelapp: "Hvelvet er ditt",
      overskrift: "Takk, du er inne",
      underoverskrift:
        "Tilgangslenken din ligger i innboksen, og den virker for alltid. " +
        "Sjekk søppelposten hvis du ikke ser den etter noen minutter.",
      steg: [
        "Åpne e-posten fra meg og trykk på lenken til hvelvet",
        "Velg malen som passer det du holder på med nå",
        "Kopier malen, lim den inn i Claude og fyll inn ditt eget",
        "Legg det ferdige resultatet ut, det er slik det blir et produkt"
      ],
      knapp: "Åpne hvelvet",
      knappLenke: "/academy/vault",
      sekundaerKnapp: "Til LME Studio",
      sekundaerLenke: "/academy",
      support: "Noe som ikke stemmer? Svar på e-posten, så ordner jeg det."
    }
  },

  /* =================================================================
     ENGELSK
     ================================================================= */
  en: {
    brand: {
      navn: "Little Montessori Explorers",
      kortnavn: "LME",
      logo: "/images/lme-logo.png"
    },

    salg: {
      checkoutUrl: "https://buy.stripe.com/00wbJ22FL87l3XT0OP9R70Y",   // Stripe: LME Vault $19
      etterKjop: "takk.html",

      pris: {
        belop: 19,
        valuta: "$",
        visningFor: "$34"
      },

      merkelapp: "Founding price",
      overskrift: "Ready-made Claude templates for digital products",
      underoverskrift:
        "LME Vault is my collection of twelve ready-made templates that take you from " +
        "a blank page to a finished product. You copy the template, fill in your own " +
        "details, and have something you can give away or sell the same day.",

      hvaDuFaarTittel: "What is inside the vault",
      hvaDuLaererTittel: "How you use it",
      hvaDuLaerer: [
        "Open the vault, twelve templates are waiting there, ready to use",
        "Pick the template that fits what you are working on right now",
        "Hit copy, and paste the template straight into Claude",
        "Replace everything in [brackets] with your own details",
        "Get a first draft you only need to adjust, not write from scratch",
        "Put the result where you already work: your course, your page, your emails",
        "New templates are added to the vault, and your access lasts forever"
      ],

      forDegTittel: "This is for you if",
      forDeg: [
        "You get stuck on the blank page every time you want to create something",
        "You have plenty of content, but nothing to sell yet",
        "You want to build products without learning a whole system first",
        "You like having something finished to start from",
        "You want the templates in both English and Norwegian"
      ],

      ikkeForDegTittel: "This is not for you if",
      ikkeForDeg: [
        "You are looking for a shortcut to quick money",
        "You want someone to build the products for you",
        "You do not use AI at all, and would rather not start"
      ],

      garanti: "",
      kjopKnapp: "Yes, give me access to the vault",
      sosialtBevis:
        "Made by Renate Dahl, a college trained Montessori teacher who builds all of LME herself.",
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: ""
    },

    takk: {
      merkelapp: "The vault is yours",
      overskrift: "Thank you, you are in",
      underoverskrift:
        "Your access link is in your inbox, and it works forever. " +
        "Check your spam folder if you do not see it after a few minutes.",
      steg: [
        "Open the email from me and click the link to the vault",
        "Pick the template that fits what you are working on now",
        "Copy the template, paste it into Claude and fill in your own details",
        "Publish the finished result, that is how it becomes a product"
      ],
      knapp: "Open the vault",
      knappLenke: "/academy/vault",
      sekundaerKnapp: "To LME Studio",
      sekundaerLenke: "/academy",
      support: "Something not right? Just reply to the email and I will fix it."
    }
  }
};
