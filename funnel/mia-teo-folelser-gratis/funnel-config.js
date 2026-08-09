/* =====================================================================
   LME — Freebie-funnel: Mitt første følelsesverktøy med Mia & Teo
   ---------------------------------------------------------------------
   Gratis lead magnet-funnel (Renate, 9. august 2026): opt-in-side som
   fanger e-posten, og en takkeside med begge gratisheftene (3-6 og 6-9
   år) pluss et mykt tilbud om hele "Følelser og sosial kompetanse"-
   serien (samlepakken). Ingen betaling i selve funnelen.

   Flyten: opt-in.html -> (MailerLite + MailerSend-kø) -> takk.html
   (begge PDF-ene + tilbud om samlepakken)

   Fem oppfølgingsmailer sendes automatisk via MailerSend (IKKE en
   MailerLite-automasjon, se CLAUDE.md): functions/_lib/mia-teo-mail.js +
   functions/api/mia-teo-optin.js (kø-start) +
   functions/api/cron/mia-teo-followups.js (daglig sender).
   ===================================================================== */

window.LME_FUNNEL = {
  no: {
    brand: {
      navn: "Little Montessori Explorers",
      kortnavn: "LME",
      logo: "/images/lme-logo.png",
      optInActionUrl: "/api/mia-teo-optin",
      etterOptIn: "takk.html"
    },

    optIn: {
      merkelapp: "Gratis aktivitetshefte",
      overskrift: "Mitt første følelsesverktøy med Mia & Teo",
      underoverskrift:
        "En liten, gratis smakebit fra LME sin serie om følelser og sosial kompetanse. " +
        "Et følelsestermometer, fire enkle ro-strategier og en side som hjelper barnet sette ord " +
        "på det som kjennes vanskelig. Skriv inn navnet og e-posten din, så sender jeg deg begge " +
        "aldersversjonene (3–6 år og 6–9 år) med en gang.",
      punkter: [
        "Passer for foreldre, besteforeldre, barnehager og skoler",
        "To aldersversjoner inkludert: 3–6 år og 6–9 år",
        "Ferdig illustrert med Mia & Teo, klar til utskrift samme dag"
      ],
      epostPlaceholder: "Skriv inn e-posten din",
      navnPlaceholder: "Fornavn",
      knapp: "Send meg gratisheftet",
      bekreftelseTittel: "Takk! Sjekk innboksen din 🌸",
      bekreftelseTekst: "Jeg sender deg rett videre til nedlastingen …",
      sikkerhet: "Ingen spam. Meld deg av når som helst.",
      bilde: "https://lmexplorers.com/images/laeringsverksted/mia-teo-gratis-3-6-cover.jpg"
    },

    takk: {
      merkelapp: "Gratisheftet ditt er klart",
      overskrift: "Velkommen inn, her er heftet ditt 🌸",
      underoverskrift:
        "Last ned den aldersversjonen som passer barnet ditt best, eller begge. " +
        "Du får også en kopi i innboksen din, sammen med noen brukstips i dagene som kommer.",
      dl36: "Last ned, 3–6 år",
      dl36Lenke: "https://lmexplorers.com/laeringsverksted-filer/nedlasting/mia-teo-forste-folelsesverktoy-gratis-3-6-no.pdf",
      dl69: "Last ned, 6–9 år",
      dl69Lenke: "https://lmexplorers.com/laeringsverksted-filer/nedlasting/mia-teo-forste-folelsesverktoy-gratis-6-9-no.pdf",
      steg: [
        "Skriv ut i faktisk størrelse på A4, gjerne på litt kraftig papir.",
        "Utforsk én side om gangen i en rolig stund, ikke midt i en sterk følelse.",
        "Sjekk e-posten din: der finner du heftet igjen, pluss noen enkle brukstips."
      ],
      butikkTittel: "Vil du ha hele følelsesserien?",
      butikkTekst:
        "Dette gratisheftet er en liten smakebit. Den komplette serien har ni ressurser: " +
        "følelseskort, situasjonskort, samtalekort, aktivitetshefter, personlige følelsesbøker og " +
        "følelsestermometer, for barn fra 3 til 9 år. Som ny leser får du 20 % rabatt på hele " +
        "samlepakken med koden MIATEO20 i kassen.",
        butikkKnapp: "Se hele følelsesserien",
      butikkLenke: "https://lmexplorers.com/lv/mia-teo-folelser-serien-komplett",
      footer: "Har du spørsmål? Svar bare på e-posten du får fra meg."
    }
  },

  en: {
    brand: {
      navn: "Little Montessori Explorers",
      kortnavn: "LME",
      logo: "/images/lme-logo.png",
      optInActionUrl: "/api/mia-teo-optin",
      etterOptIn: "takk.html"
    },

    optIn: {
      merkelapp: "Free activity booklet",
      overskrift: "My First Feelings Toolkit with Mia & Teo",
      underoverskrift:
        "A small, free taste of LME's series on feelings and social skills. A feelings " +
        "thermometer, four simple calming strategies, and a page that helps the child put " +
        "words to what feels hard. Enter your name and email, and I'll send you both age " +
        "versions (3-6 and 6-9 years) right away.",
      punkter: [
        "For parents, grandparents, preschools and schools",
        "Both age versions included: 3-6 and 6-9 years",
        "Fully illustrated with Mia & Teo, ready to print the same day"
      ],
      epostPlaceholder: "Enter your email",
      navnPlaceholder: "First name",
      knapp: "Send me the free booklet",
      bekreftelseTittel: "Thank you! Check your inbox 🌸",
      bekreftelseTekst: "Sending you straight to the download …",
      sikkerhet: "No spam. Unsubscribe anytime.",
      bilde: "https://lmexplorers.com/images/laeringsverksted/mia-teo-gratis-3-6-cover.jpg"
    },

    takk: {
      merkelapp: "Your free booklet is ready",
      overskrift: "Welcome in, here's your booklet 🌸",
      underoverskrift:
        "Download the age version that fits your child best, or both. You'll also get a copy " +
        "in your inbox, along with a few usage tips over the next few days.",
      dl36: "Download, ages 3-6",
      dl36Lenke: "https://lmexplorers.com/laeringsverksted-filer/nedlasting/mia-teo-forste-folelsesverktoy-gratis-3-6-no.pdf",
      dl69: "Download, ages 6-9",
      dl69Lenke: "https://lmexplorers.com/laeringsverksted-filer/nedlasting/mia-teo-forste-folelsesverktoy-gratis-6-9-no.pdf",
      steg: [
        "Print at actual size on A4, ideally on slightly heavier paper.",
        "Explore one page at a time in a calm moment, not in the middle of a strong feeling.",
        "Check your email: you'll find the booklet again there, plus a few simple usage tips."
      ],
      butikkTittel: "Want the whole feelings series?",
      butikkTekst:
        "This free booklet is a small taste. The complete series has nine resources: feeling " +
        "cards, situation cards, conversation cards, activity booklets, personal feelings books " +
        "and a feelings thermometer, for children ages 3 to 9. As a new reader, get 20% off the " +
        "complete bundle with code MIATEO20 at checkout.",
      butikkKnapp: "See the whole feelings series",
      butikkLenke: "https://lmexplorers.com/lv/mia-teo-folelser-serien-komplett?lang=en",
      footer: "Questions? Just reply to the email you get from me."
    }
  }
};
