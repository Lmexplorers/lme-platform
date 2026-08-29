/* =====================================================================
   LME Vault, felles innholdsliste (norsk + engelsk)
   ---------------------------------------------------------------------
   Én kilde til malene i LME Vault, brukt to steder:
     funnel/vault/salg.html  → viser tittel og kort tekst (smakebiten)
     academy/vault.html      → viser hele malen med ferdig Claude-prompt

   Slik legger du til en ny mal: kopier en blokk under, endre id, ikon og
   tekstene. Alt som er synlig finnes både på norsk (no) og engelsk (en).
   Bruk [klammer] i promptene der leseren skal fylle inn sitt eget.
   ===================================================================== */

window.LME_VAULT_ITEMS = [
  {
    id: "produktide",
    ikon: "🎬",
    no: {
      tittel: "Video til produktidé",
      kort: "Gjør én video, reel eller live du allerede har laget om til ferdige produktideer.",
      hva: "Du limer inn manuset eller teksten fra en video du har laget, og får fem produktideer med navn, pris og hvem produktet er for.",
      prompt:
        "Du er produktstrategen min. Under limer jeg inn teksten fra en video jeg har laget.\n\n" +
        "VIDEO:\n[lim inn manus, undertekster eller en kort oppsummering]\n\n" +
        "MÅLGRUPPE: [hvem jeg snakker til]\n\n" +
        "Gi meg fem digitale produktideer som springer ut av akkurat dette innholdet. " +
        "For hver idé vil jeg ha: navn, én setning om hva produktet løser, formatet " +
        "(mal, sjekkliste, minikurs, quiz eller verktøy), en pris i kroner, og hvor lang " +
        "tid det tar meg å lage det. Sorter fra raskest til tregest å lage. " +
        "Skriv enkelt og uten markedsføringsspråk.",
      tips: "Velg den ideen du kan lage ferdig samme dag, ikke den som høres størst ut."
    },
    en: {
      tittel: "Video to product idea",
      kort: "Turn one video, reel or live you already made into finished product ideas.",
      hva: "You paste the script or text from a video you made, and get five product ideas with name, price and who the product is for.",
      prompt:
        "You are my product strategist. Below I paste the text from a video I made.\n\n" +
        "VIDEO:\n[paste the script, captions or a short summary]\n\n" +
        "AUDIENCE: [who I speak to]\n\n" +
        "Give me five digital product ideas that grow out of this exact content. " +
        "For each idea I want: a name, one sentence on what the product solves, the format " +
        "(template, checklist, mini course, quiz or tool), a price, and how long it takes me " +
        "to make it. Sort from fastest to slowest to build. Write plainly, no marketing language.",
      tips: "Pick the idea you can finish the same day, not the one that sounds biggest."
    }
  },
  {
    id: "inntektsstrom",
    ikon: "💰",
    no: {
      tittel: "Inntektsstrøm-finner",
      kort: "Se hvilke inntektsstrømmer innholdet ditt allerede bærer, og hva som mangler.",
      hva: "En gjennomgang av kanalen eller kontoen din, med de tre inntektsstrømmene som passer best og en enkel rekkefølge å bygge dem i.",
      prompt:
        "Du er rådgiveren min for inntekter. Her er hva jeg driver med:\n\n" +
        "KANAL/KONTO: [lenke eller kort beskrivelse]\n" +
        "TEMA: [hva jeg lager innhold om]\n" +
        "FØLGERE: [omtrent antall]\n" +
        "SELGER I DAG: [det jeg allerede selger, eller ingenting]\n\n" +
        "Foreslå de tre inntektsstrømmene som passer best for akkurat denne kanalen, " +
        "og forklar for hver: hvorfor den passer meg, hva jeg må lage, hva jeg kan ta betalt, " +
        "og hva jeg realistisk kan tjene den første måneden. Sett dem i rekkefølge, " +
        "hva jeg bør bygge først, andre og tredje. Vær ærlig hvis noe ikke passer ennå.",
      tips: "Kjør denne på nytt hver tredje måned, svarene endrer seg når kanalen vokser."
    },
    en: {
      tittel: "Income stream finder",
      kort: "See which income streams your content already carries, and what is missing.",
      hva: "A review of your channel or account, with the three income streams that fit best and a simple order to build them in.",
      prompt:
        "You are my income advisor. Here is what I do:\n\n" +
        "CHANNEL/ACCOUNT: [link or short description]\n" +
        "TOPIC: [what I make content about]\n" +
        "FOLLOWERS: [roughly how many]\n" +
        "SELLING TODAY: [what I already sell, or nothing]\n\n" +
        "Suggest the three income streams that fit this channel best, and for each explain: " +
        "why it fits me, what I need to create, what I can charge, and what I can realistically " +
        "earn in the first month. Put them in order, what to build first, second and third. " +
        "Be honest if something does not fit yet.",
      tips: "Run this again every three months, the answers change as the channel grows."
    }
  },
  {
    id: "quiz",
    ikon: "🧩",
    no: {
      tittel: "Quizmal som fanger e-poster",
      kort: "En ferdig quiz med resultater og oppfølging, laget for å samle e-postadresser.",
      hva: "Åtte spørsmål, fire resultattyper og en kort tekst til hvert resultat, klar til å legges inn som lead magnet.",
      prompt:
        "Lag en quiz som skal fange e-postadresser for meg.\n\n" +
        "TEMA: [hva quizen skal handle om]\n" +
        "MÅLGRUPPE: [hvem som tar den]\n" +
        "PRODUKTET MITT: [hva jeg selger etterpå]\n\n" +
        "Gi meg: en tittel som gjør folk nysgjerrige, åtte spørsmål med fire svaralternativer hver, " +
        "fire resultattyper, og for hver type en tekst på fem til sju setninger som beskriver typen, " +
        "sier hva neste steg er, og leder naturlig over til produktet mitt. " +
        "Skriv varmt og uten skryt, som om jeg snakker med én person.",
      tips: "Resultattekstene er selve salget, bruk mest tid på dem."
    },
    en: {
      tittel: "Quiz template that captures emails",
      kort: "A finished quiz with results and follow-up, built to collect email addresses.",
      hva: "Eight questions, four result types and a short text for each result, ready to use as a lead magnet.",
      prompt:
        "Build a quiz that captures email addresses for me.\n\n" +
        "TOPIC: [what the quiz is about]\n" +
        "AUDIENCE: [who takes it]\n" +
        "MY PRODUCT: [what I sell afterwards]\n\n" +
        "Give me: a title that makes people curious, eight questions with four answer options each, " +
        "four result types, and for each type a text of five to seven sentences that describes the type, " +
        "says what the next step is, and leads naturally to my product. " +
        "Write warmly and without bragging, as if I speak to one person.",
      tips: "The result texts are the actual selling, spend most of your time there."
    }
  },
  {
    id: "minikurs",
    ikon: "🔑",
    no: {
      tittel: "Minikursmal",
      kort: "Fra tom side til ferdig minikurs med moduler, leksjoner og oppgaver.",
      hva: "En komplett kursplan med fire moduler, leksjonstitler, hva hver leksjon skal lære bort og en oppgave til hver.",
      prompt:
        "Du er kursdesigneren min. Hjelp meg å bygge et minikurs.\n\n" +
        "TEMA: [hva kurset skal lære bort]\n" +
        "MÅLGRUPPE: [hvem kurset er for]\n" +
        "RESULTATET: [hva de sitter igjen med etterpå]\n" +
        "LENGDE: [hvor lang tid kurset skal ta]\n\n" +
        "Lag en kursplan med fire moduler. For hver modul vil jeg ha: modultittel, " +
        "tre til fem leksjoner med tittel, én setning om hva leksjonen lærer bort, " +
        "og én oppgave deltakeren gjør selv. Legg til en velkomstleksjon og en avslutning " +
        "som peker videre til neste steg hos meg. Ingen fyllstoff, bare det som faktisk " +
        "flytter deltakeren mot resultatet.",
      tips: "Legg planen rett inn i Kursbygger på /kursbygger, så er kurset ute samme dag."
    },
    en: {
      tittel: "Mini course template",
      kort: "From a blank page to a finished mini course with modules, lessons and tasks.",
      hva: "A complete course plan with four modules, lesson titles, what each lesson teaches and one task per lesson.",
      prompt:
        "You are my course designer. Help me build a mini course.\n\n" +
        "TOPIC: [what the course teaches]\n" +
        "AUDIENCE: [who it is for]\n" +
        "OUTCOME: [what they walk away with]\n" +
        "LENGTH: [how long the course should take]\n\n" +
        "Create a course plan with four modules. For each module I want: a module title, " +
        "three to five lessons with a title, one sentence on what the lesson teaches, " +
        "and one task the participant does themselves. Add a welcome lesson and a closing " +
        "that points to the next step with me. No filler, only what actually moves the " +
        "participant towards the outcome.",
      tips: "Drop the plan straight into the course builder at /kursbygger, and the course is live the same day."
    }
  },
  {
    id: "videoguide",
    ikon: "📖",
    no: {
      tittel: "Interaktiv videoguide",
      kort: "Gjør en video om til en guide leseren kan følge, med huk av-punkter.",
      hva: "Et manus til en side der videoen står øverst og stegene under, med avkryssing, så leseren faktisk kommer i mål.",
      prompt:
        "Gjør videoen min om til en interaktiv guide.\n\n" +
        "VIDEO:\n[lim inn manus eller undertekster]\n\n" +
        "Del innholdet i steg leseren kan hake av etter hvert. For hvert steg vil jeg ha: " +
        "en kort tittel, to til tre setninger med forklaring, tiden det tar, og hva som er " +
        "gjort når steget er ferdig. Legg til en kort intro som sier hva leseren sitter igjen " +
        "med, og en avslutning som sier hva de bør gjøre videre. Skriv i du-form.",
      tips: "Ti steg er nok, flere gjør at folk slutter halvveis."
    },
    en: {
      tittel: "Interactive video guide",
      kort: "Turn a video into a guide the reader can follow, with tick-off steps.",
      hva: "A script for a page with the video on top and the steps below, with checkboxes, so the reader actually finishes.",
      prompt:
        "Turn my video into an interactive guide.\n\n" +
        "VIDEO:\n[paste the script or captions]\n\n" +
        "Split the content into steps the reader can tick off as they go. For each step I want: " +
        "a short title, two to three sentences of explanation, how long it takes, and what is " +
        "done once the step is complete. Add a short intro that says what the reader walks away " +
        "with, and a closing that says what to do next. Write directly to the reader.",
      tips: "Ten steps is plenty, more and people stop halfway."
    }
  },
  {
    id: "synlighet",
    ikon: "📊",
    no: {
      tittel: "Synlighetsdashbord",
      kort: "Én ukesoversikt over hva som faktisk gir synlighet, og hva du bør droppe.",
      hva: "En fast ukesrapport du fyller med tallene dine, og som svarer med tre ting å gjøre mer av og én ting å slutte med.",
      prompt:
        "Vær synlighetsanalytikeren min. Her er tallene mine for uken:\n\n" +
        "PLATTFORM: [hvor jeg publiserer]\n" +
        "INNLEGG DENNE UKEN: [antall og temaer]\n" +
        "VISNINGER: [tall]\n" +
        "NYE FØLGERE: [tall]\n" +
        "NYE E-POSTADRESSER: [tall]\n" +
        "BEST OG DÅRLIGST: [innlegget som gikk best og det som gikk dårligst]\n\n" +
        "Gi meg: hva tallene faktisk sier, tre ting jeg bør gjøre mer av neste uke, " +
        "én ting jeg bør slutte med, og ett eksperiment jeg kan prøve. " +
        "Ingen ros for ros sin skyld, jeg vil ha den ærlige lesningen.",
      tips: "Samme spørsmål hver mandag, da ser du mønstrene i stedet for enkeltuker."
    },
    en: {
      tittel: "Visibility dashboard",
      kort: "One weekly view of what actually creates visibility, and what to drop.",
      hva: "A fixed weekly report you fill with your numbers, answering with three things to do more of and one thing to stop.",
      prompt:
        "Be my visibility analyst. Here are my numbers for the week:\n\n" +
        "PLATFORM: [where I publish]\n" +
        "POSTS THIS WEEK: [count and topics]\n" +
        "VIEWS: [number]\n" +
        "NEW FOLLOWERS: [number]\n" +
        "NEW EMAIL ADDRESSES: [number]\n" +
        "BEST AND WORST: [the post that did best and the one that did worst]\n\n" +
        "Give me: what the numbers actually say, three things to do more of next week, " +
        "one thing to stop doing, and one experiment to try. " +
        "No praise for the sake of praise, I want the honest read.",
      tips: "Same questions every Monday, that is how you see patterns instead of single weeks."
    }
  },
  {
    id: "lansering",
    ikon: "🚀",
    no: {
      tittel: "Lanser på en helg",
      kort: "En time for time-plan som tar deg fra idé til åpent salg i løpet av en helg.",
      hva: "En lanseringsplan for fredag, lørdag og søndag, med hva som skal være ferdig når, og hva du trygt kan hoppe over.",
      prompt:
        "Legg en lanseringsplan for meg, time for time, fra fredag kveld til søndag kveld.\n\n" +
        "PRODUKT: [hva jeg lanserer]\n" +
        "PRIS: [pris]\n" +
        "HVOR: [hvor folk kjøper]\n" +
        "PUBLIKUM: [e-postliste, følgere eller ingen ennå]\n\n" +
        "Del helgen i økter på to timer. For hver økt vil jeg ha: hva jeg lager, " +
        "hva som skal være ferdig når økten er over, og hva jeg trygt kan hoppe over " +
        "hvis tiden blir knapp. Ta med tekstene jeg må skrive, e-postene jeg må sende " +
        "og innleggene jeg må publisere. Planlegg for at jeg er alene om alt.",
      tips: "Sett salget åpent før du føler deg klar, resten kan pusses mens folk kjøper."
    },
    en: {
      tittel: "Launch in a weekend",
      kort: "An hour by hour plan that takes you from idea to open sales in one weekend.",
      hva: "A launch plan for Friday, Saturday and Sunday, with what needs to be done when, and what you can safely skip.",
      prompt:
        "Lay out a launch plan for me, hour by hour, from Friday evening to Sunday evening.\n\n" +
        "PRODUCT: [what I am launching]\n" +
        "PRICE: [price]\n" +
        "WHERE: [where people buy]\n" +
        "AUDIENCE: [email list, followers or none yet]\n\n" +
        "Split the weekend into two hour sessions. For each session I want: what I create, " +
        "what must be finished when the session ends, and what I can safely skip if time runs short. " +
        "Include the copy I need to write, the emails I need to send and the posts I need to publish. " +
        "Plan for me doing all of it alone.",
      tips: "Open the sale before you feel ready, the rest can be polished while people buy."
    }
  },
  {
    id: "veikart",
    ikon: "🗺️",
    no: {
      tittel: "Veikartmal",
      kort: "Et veikart kunden kan følge, som viser hvor de er og hva som kommer.",
      hva: "Fem faser med navn, hva som skjer i hver fase, hvordan man vet at fasen er ferdig, og hvor produktene dine hører hjemme.",
      prompt:
        "Lag et veikart jeg kan gi kundene mine.\n\n" +
        "REISEN: [fra hvor til hvor jeg tar dem]\n" +
        "MÅLGRUPPE: [hvem de er]\n" +
        "PRODUKTENE MINE: [det jeg selger i dag]\n\n" +
        "Gi meg fem faser. For hver fase vil jeg ha: et navn folk kjenner seg igjen i, " +
        "hva som skjer i fasen, den vanligste feilen i akkurat den fasen, hvordan man vet " +
        "at fasen er ferdig, og hvilket av produktene mine som hører hjemme her. " +
        "Skriv fasenavnene som noe en person ville sagt om seg selv, ikke som fagbegreper.",
      tips: "Ser du et hull uten produkt, er det neste produkt du bør lage."
    },
    en: {
      tittel: "Roadmap template",
      kort: "A roadmap your customer can follow, showing where they are and what comes next.",
      hva: "Five phases with names, what happens in each, how you know a phase is done, and where your products belong.",
      prompt:
        "Create a roadmap I can give my customers.\n\n" +
        "THE JOURNEY: [from where to where I take them]\n" +
        "AUDIENCE: [who they are]\n" +
        "MY PRODUCTS: [what I sell today]\n\n" +
        "Give me five phases. For each phase I want: a name people recognise themselves in, " +
        "what happens in the phase, the most common mistake in that phase, how you know the " +
        "phase is done, and which of my products belongs here. " +
        "Write the phase names as something a person would say about themselves, not as jargon.",
      tips: "If you see a gap with no product, that is the next product to build."
    }
  },
  {
    id: "promptbibliotek",
    ikon: "🧠",
    no: {
      tittel: "Ditt eget promptbibliotek",
      kort: "Bygg en fast samling prompter som holder stemmen din lik hver gang.",
      hva: "En profil av deg og skrivestemmen din, som du limer inn øverst i alle samtaler, pluss ti prompter for hverdagen din.",
      prompt:
        "Hjelp meg å lage mitt eget promptbibliotek.\n\n" +
        "HVEM JEG ER: [yrke, bakgrunn, hvem jeg hjelper]\n" +
        "STEMMEN MIN: [tre ord som beskriver hvordan jeg skriver]\n" +
        "SKRIVER OFTEST: [de oppgavene som går igjen hos meg]\n\n" +
        "Lag først en kort profil jeg kan lime inn øverst i enhver samtale, så du husker " +
        "hvem jeg er og hvordan jeg vil at svarene skal låte. Lag deretter ti ferdige " +
        "prompter for oppgavene jeg gjør oftest, med [klammer] der jeg fyller inn. " +
        "Gi hver prompt et kort navn jeg kjenner igjen.",
      tips: "Lagre profilen ett sted du finner den igjen, den er halve jobben."
    },
    en: {
      tittel: "Your own prompt library",
      kort: "Build a fixed set of prompts that keeps your voice the same every time.",
      hva: "A profile of you and your writing voice to paste at the top of every chat, plus ten prompts for your everyday work.",
      prompt:
        "Help me build my own prompt library.\n\n" +
        "WHO I AM: [profession, background, who I help]\n" +
        "MY VOICE: [three words describing how I write]\n" +
        "I WRITE MOSTLY: [the tasks that keep coming back]\n\n" +
        "First create a short profile I can paste at the top of any chat, so you remember " +
        "who I am and how I want the answers to sound. Then create ten ready-made prompts " +
        "for the tasks I do most often, with [brackets] where I fill in my own details. " +
        "Give each prompt a short name I recognise.",
      tips: "Save the profile somewhere you find it again, it is half the work."
    }
  },
  {
    id: "leadmagnet",
    ikon: "🧲",
    no: {
      tittel: "Lead magnet på tjue minutter",
      kort: "En liten gratis ting folk gjerne gir e-postadressen sin for.",
      hva: "Tre forslag til lead magnet, og hele innholdet i den du velger, ferdig til å legges ut.",
      prompt:
        "Lag en lead magnet for meg, noe jeg kan gi bort på tjue minutter.\n\n" +
        "MÅLGRUPPE: [hvem jeg vil ha på lista]\n" +
        "PROBLEMET: [det de sliter med akkurat nå]\n" +
        "PRODUKTET MITT: [hva jeg selger etterpå]\n\n" +
        "Foreslå tre lead magnets som løser ett lite problem helt, ikke et stort problem " +
        "halvveis. For hver: navn, format, hvorfor akkurat den passer publikumet mitt. " +
        "Skriv deretter ut hele innholdet i den du mener er best, klart til å legges ut, " +
        "med en tittel og en avslutning som peker mot produktet mitt.",
      tips: "Sett den opp med skjemaet på plattformen, så havner e-postene rett i abonnentlista di."
    },
    en: {
      tittel: "Lead magnet in twenty minutes",
      kort: "A small free thing people happily give their email address for.",
      hva: "Three lead magnet suggestions, and the full content of the one you pick, ready to publish.",
      prompt:
        "Create a lead magnet for me, something I can give away in twenty minutes.\n\n" +
        "AUDIENCE: [who I want on my list]\n" +
        "THE PROBLEM: [what they struggle with right now]\n" +
        "MY PRODUCT: [what I sell afterwards]\n\n" +
        "Suggest three lead magnets that solve one small problem completely, not a big problem " +
        "halfway. For each: name, format, why it fits my audience. Then write out the full " +
        "content of the one you think is best, ready to publish, with a title and a closing " +
        "that points towards my product.",
      tips: "Set it up with the platform form, and the emails land straight in your subscriber list."
    }
  },
  {
    id: "salgsside",
    ikon: "🎨",
    no: {
      tittel: "Salgsside som er din",
      kort: "En ferdig salgsside i din egen stemme, uten hype og store løfter.",
      hva: "Overskrift, ingress, punktliste over hva kjøperen får, avsnitt om hvem det er for, og en avslutning med pris.",
      prompt:
        "Skriv salgssiden til produktet mitt.\n\n" +
        "PRODUKT: [navn og hva det er]\n" +
        "FOR HVEM: [hvem det er laget for]\n" +
        "RESULTAT: [hva kjøperen sitter igjen med]\n" +
        "PRIS: [pris]\n" +
        "STEMMEN MIN: [tre ord om hvordan jeg skriver]\n\n" +
        "Gi meg: en overskrift, en ingress på tre setninger, en punktliste over hva kjøperen " +
        "får, et avsnitt om hvem produktet er for og hvem det ikke er for, svar på de tre " +
        "vanligste innvendingene, og en avslutning med prisen og en tydelig oppfordring. " +
        "Ingen overdrivelser, ingen løfter om inntekt, ingen falsk hastverk.",
      tips: "Les den høyt til slutt, det du snubler i, skriver du om."
    },
    en: {
      tittel: "A sales page that sounds like you",
      kort: "A finished sales page in your own voice, without hype or big promises.",
      hva: "Headline, intro, a list of what the buyer gets, who it is for, and a closing with the price.",
      prompt:
        "Write the sales page for my product.\n\n" +
        "PRODUCT: [name and what it is]\n" +
        "FOR WHOM: [who it is built for]\n" +
        "OUTCOME: [what the buyer walks away with]\n" +
        "PRICE: [price]\n" +
        "MY VOICE: [three words about how I write]\n\n" +
        "Give me: a headline, a three sentence intro, a list of what the buyer gets, " +
        "a paragraph on who the product is for and who it is not for, answers to the three " +
        "most common objections, and a closing with the price and a clear call to action. " +
        "No exaggeration, no income promises, no false urgency.",
      tips: "Read it out loud at the end, whatever you stumble over, rewrite."
    }
  },
  {
    id: "epostserie",
    ikon: "💌",
    no: {
      tittel: "E-postserie etter kjøp",
      kort: "Fem e-poster som tar kjøperen fra takk for kjøpet til faktisk i mål.",
      hva: "Ferdige e-poster med emnefelt og tekst, tidfestet fra kjøpsdagen og fjorten dager fram.",
      prompt:
        "Skriv e-postserien som går ut etter at noen har kjøpt produktet mitt.\n\n" +
        "PRODUKT: [hva de kjøpte]\n" +
        "RESULTAT: [hva de skal få til]\n" +
        "STÅR OFTEST FAST PÅ: [der folk pleier å stoppe opp]\n" +
        "NESTE STEG HOS MEG: [det jeg tilbyr videre]\n\n" +
        "Gi meg fem e-poster: rett etter kjøp, dag 2, dag 5, dag 9 og dag 14. " +
        "For hver: emnefelt, brødtekst på 120 til 200 ord, og én ting leseren skal gjøre. " +
        "Den siste skal invitere videre til neste steg uten å presse. " +
        "Skriv som meg til én person, ikke som et firma til en liste.",
      tips: "Legg tekstene rett inn i koden med MailerSend, samme mønster som resten av plattformen."
    },
    en: {
      tittel: "Post-purchase email series",
      kort: "Five emails that take the buyer from thank you to actually finished.",
      hva: "Ready emails with subject lines and body text, timed from purchase day through fourteen days.",
      prompt:
        "Write the email series that goes out after someone buys my product.\n\n" +
        "PRODUCT: [what they bought]\n" +
        "OUTCOME: [what they should achieve]\n" +
        "USUALLY STUCK ON: [where people tend to stall]\n" +
        "NEXT STEP WITH ME: [what I offer next]\n\n" +
        "Give me five emails: right after purchase, day 2, day 5, day 9 and day 14. " +
        "For each: subject line, 120 to 200 words of body text, and one thing the reader should do. " +
        "The last one should invite them to the next step without pushing. " +
        "Write as me to one person, not as a company to a list.",
      tips: "Put the texts straight into the code with MailerSend, same pattern as the rest of the platform."
    }
  }
];
