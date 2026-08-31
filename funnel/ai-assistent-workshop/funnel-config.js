/* =====================================================================
   Workshop: Ansett dine fem AI-assistenter · salgstrakt (norsk + engelsk)
   ---------------------------------------------------------------------
   Trakten har to steg:
     salg.html  → salgsside med pris og kjøp     (/workshop)
     takk.html  → takkeside etter kjøp           (/workshop-takk)

   Selve workshopen ligger i Kursbygger (KV) og vises på
   https://lmexplorers.com/academy/kurs?k=ai-assistent-workshop
   Innholdet er skrevet i functions/_lib/seed-ai-assistent-workshop-data.js

   Slik henger betalingen sammen:
     Betalingslenkene er faste Stripe-lenker, én per pris og valuta, og
     ligger i LENKER under. Betalingslenke-ID-ene (plink_…) ligger i
     COURSE_PAYMENT_LINKS i functions/_lib/purchase-links.js med courseId
     "ai-assistent-workshop", og det er de som gjør at kjøperen får
     tilgangslenken sin på e-post.

   Prisen bytter seg selv: kampanjekalenderen i /js/kampanjer.js bestemmer
     om det er tilbud nå, og hva tilbudet heter, akkurat som på
     YouTube-kursene. Tilbudspris 490 kr og $49 frem til 1. februar 2027,
     deretter full pris 990 kr og $99. Beløpene under er sjekket mot Stripe
     31. august 2026, og endres en pris der, må den endres her i samme
     slengen.

   Rediger bare verdiene under, lagre, og last siden på nytt.
   ===================================================================== */

(function () {
  // Kampanjekalenderen i /js/kampanjer.js bestemmer om det er tilbud nå, og
  // hva tilbudet heter. Laster den ikke, gjelder tilbudsprisen frem til
  // 1. februar 2027, samme dato som kalenderen bruker.
  var k = (window.LME_KAMPANJE && window.LME_KAMPANJE.naa()) || {
    tilbud: Date.now() < Date.parse("2027-02-01T00:00:00+01:00"),
    merkelapp: { no: "Lanseringstilbud", en: "Launch offer" },
  };
  var tilbud = k.tilbud;

  var LENKER = {
    no: { tilbud: "https://buy.stripe.com/cNi9AUgwBcnB3XTeFF9R711", full: "https://buy.stripe.com/eVqbJ28050ETfGB1ST9R713" },
    en: { tilbud: "https://buy.stripe.com/8x2eVe8051IX51X4119R712", full: "https://buy.stripe.com/cNi00kdkp9bp7a56999R714" },
  };

  function pris(lang) {
    return tilbud
      ? { belop: lang === "en" ? 49 : 490, valuta: lang === "en" ? "$" : "kr", visningFor: lang === "en" ? "$99" : "990 kr" }
      : { belop: lang === "en" ? 99 : 990, valuta: lang === "en" ? "$" : "kr", visningFor: "" };
  }
  function kasse(lang) { return tilbud ? LENKER[lang].tilbud : LENKER[lang].full; }
  // Merkelappen øverst på siden. Kalenderens siste periode heter "Fullt kurs",
  // som passer på kursene, men ikke her. Uten tilbud står det bare Workshop.
  function merkelapp(lang) {
    if (!tilbud) return "Workshop";
    return lang === "en" ? k.merkelapp.en : k.merkelapp.no;
  }

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
      checkoutUrl: kasse("no"),
      etterKjop: "takk.html",

      pris: pris("no"),

      merkelapp: merkelapp("no"),
      overskrift: "Ansett dine fem AI-assistenter",
      underoverskrift:
        "En arbeidsøkt, ikke en forelesning. Du setter fem faste assistenter i arbeid " +
        "i Claude, én for hver oppgave som spiser opp uken din, og lager seks ferdige " +
        "karuseller på seksti minutter. Du går ut med prompter du kan bruke i kveld.",

      fakta: "16 leksjoner · 4 deler · kursbevis · tilgang for alltid",

      hvaDuFaarTittel: "Dette er workshopen",
      deler: [
        {
          ikon: "🎙️",
          tittel: "Del 1: Klar til start",
          kort: "Stemmeprompten som gjør at Claude skriver som deg, og de tre linjene som beskriver en jobb."
        },
        {
          ikon: "🤖",
          tittel: "Del 2: De fem assistentene",
          kort: "E-post, regnskap, design, innhold og podkast, hver med ferdig prompt og en oppgave."
        },
        {
          ikon: "⏱️",
          tittel: "Del 3: Seks karuseller på seksti minutter",
          kort: "De seks stegene, rammeverket for de ti bildene, krokene og språket som blir ditt."
        },
        {
          ikon: "🗓️",
          tittel: "Del 4: Etter workshopen",
          kort: "Ukesrytmen som holder assistentene i arbeid, og planen for assistent nummer seks."
        }
      ],

      hvaDuLaererTittel: "Slik foregår det",
      hvaDuLaerer: [
        "Du har Claude åpent ved siden av, og gjør oppgaven i hver leksjon",
        "Du gir Claude stemmen din én gang, og alle assistentene arver den",
        "Du beskriver hver jobb med tre linjer: den får, den gjør, den sparer meg",
        "Du får ferdige prompter du bare limer inn og fyller ut med ditt eget",
        "Du setter av én time og lager seks karuseller i samme økt",
        "Du setter assistentene i en ukesrytme du faktisk holder",
        "Du får kursbevis når du er ferdig, og tilgang for alltid"
      ],

      forDegTittel: "Dette er for deg hvis",
      forDeg: [
        "Uken din spises opp av oppgaver rundt selve jobben du elsker",
        "Du bruker Claude litt, men aldri til det samme to ganger",
        "Du vil ha innhold klart på forhånd, ikke i panikk om morgenen",
        "Du vil at teksten skal høres ut som deg, ikke som en brosjyre",
        "Du liker å jobbe mens du lærer, ikke bare se på"
      ],

      ikkeForDegTittel: "Dette er ikke for deg hvis",
      ikkeForDeg: [
        "Du vil at noen andre skal gjøre jobben for deg",
        "Du leter etter en snarvei til raske penger",
        "Du vil helst ikke bruke AI i det hele tatt"
      ],

      garanti: "",
      kjopKnapp: "Ja takk, gi meg workshopen",
      sosialtBevis:
        "Laget av Renate Dahl, høgskoleutdannet montessoripedagog, som bygger hele LME selv.",
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: ""
    },

    takk: {
      merkelapp: "Workshopen er din",
      overskrift: "Takk, du er inne",
      underoverskrift:
        "Tilgangslenken din ligger i innboksen, og den virker for alltid. " +
        "Sjekk søppelposten hvis du ikke ser den etter noen minutter.",
      steg: [
        "Åpne e-posten fra meg og trykk på lenken til workshopen",
        "Sett av førti minutter, og ha Claude åpent i et vindu ved siden av",
        "Start med Del 1, der gir du Claude stemmen din",
        "Ansett den første assistenten i kveld, resten kan vente til i morgen"
      ],
      knapp: "Åpne workshopen",
      knappLenke: "/academy/kurs?k=ai-assistent-workshop",
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
      checkoutUrl: kasse("en"),
      etterKjop: "takk.html",

      pris: pris("en"),

      merkelapp: merkelapp("en"),
      overskrift: "Hire your five AI assistants",
      underoverskrift:
        "A working session, not a lecture. You put five permanent assistants to work " +
        "in Claude, one for each task that eats up your week, and create six finished " +
        "carousels in sixty minutes. You leave with prompts you can use tonight.",

      fakta: "16 lessons · 4 parts · certificate · access forever",

      hvaDuFaarTittel: "This is the workshop",
      deler: [
        {
          ikon: "🎙️",
          tittel: "Part 1: Ready to start",
          kort: "The voice prompt that makes Claude write like you, and the three lines that describe a job."
        },
        {
          ikon: "🤖",
          tittel: "Part 2: The five assistants",
          kort: "Email, bookkeeping, design, content and podcast, each with a ready-made prompt and a task."
        },
        {
          ikon: "⏱️",
          tittel: "Part 3: Six carousels in sixty minutes",
          kort: "The six steps, the framework for the ten slides, the hooks and the language that becomes yours."
        },
        {
          ikon: "🗓️",
          tittel: "Part 4: After the workshop",
          kort: "The weekly rhythm that keeps the assistants working, and the plan for assistant number six."
        }
      ],

      hvaDuLaererTittel: "How it works",
      hvaDuLaerer: [
        "You keep Claude open beside you, and do the task in every lesson",
        "You give Claude your voice once, and every assistant inherits it",
        "You describe each job in three lines: it gets, it does, it saves me",
        "You get ready-made prompts you simply paste and fill in with your own details",
        "You set aside one hour and create six carousels in the same sitting",
        "You put the assistants into a weekly rhythm you can actually keep",
        "You get a certificate when you finish, and access forever"
      ],

      forDegTittel: "This is for you if",
      forDeg: [
        "Your week is eaten up by tasks around the work you actually love",
        "You use Claude a little, but never for the same thing twice",
        "You want content ready in advance, not in a panic in the morning",
        "You want the writing to sound like you, not like a brochure",
        "You like working while you learn, not just watching"
      ],

      ikkeForDegTittel: "This is not for you if",
      ikkeForDeg: [
        "You want someone else to do the work for you",
        "You are looking for a shortcut to quick money",
        "You would rather not use AI at all"
      ],

      garanti: "",
      kjopKnapp: "Yes, give me the workshop",
      sosialtBevis:
        "Made by Renate Dahl, a college trained Montessori teacher who builds all of LME herself.",
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: ""
    },

    takk: {
      merkelapp: "The workshop is yours",
      overskrift: "Thank you, you are in",
      underoverskrift:
        "Your access link is in your inbox, and it works forever. " +
        "Check your spam folder if you do not see it after a few minutes.",
      steg: [
        "Open the email from me and click the link to the workshop",
        "Set aside forty minutes, and keep Claude open in a window beside you",
        "Start with Part 1, where you give Claude your voice",
        "Hire the first assistant tonight, the rest can wait until tomorrow"
      ],
      knapp: "Open the workshop",
      knappLenke: "/academy/kurs?k=ai-assistent-workshop",
      sekundaerKnapp: "To LME Studio",
      sekundaerLenke: "/academy",
      support: "Something not right? Just reply to the email and I will fix it."
    }
  }
};

})();
