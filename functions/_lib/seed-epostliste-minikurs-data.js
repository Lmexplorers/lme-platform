/**
 * Ferdig-skrevet innhold for det nye gratis Kursbygger-kurset "Få dine
 * første 100 e-postabonnenter", et minikurs som gir de aller første stegene
 * inn i e-postliste-temaet, og som gratis-funnelen funnel/epostliste-minikurs/
 * gir tilgang til etter registrering (samme mønster som Montessori-friebien,
 * se functions/_lib/seed-montessori-kurs-data.js). Brukes kun av
 * functions/api/seed-epostliste-minikurs.js til engangs-import inn i
 * Kursbygger (KV), samme skjema som functions/api/kurs.js.
 */
export const EPOSTLISTE_MINIKURS = {
  "slug": "epostliste-100-abonnenter",
  "size": "mini",
  "published": true,
  "cert": false,
  "meet": false,
  "kicker": {
    "no": "GRATIS · E-POSTLISTE",
    "en": "FREE · EMAIL LIST"
  },
  "title": {
    "no": "Få dine første 100 e-postabonnenter",
    "en": "Get your first 100 email subscribers"
  },
  "lede": {
    "no": "Den gratis starten på e-postlisten din: hvorfor du bør begynne nå, hvem du skriver til, din første lead magnet og en enkel 7-dagers plan for å komme i gang.",
    "en": "The free start of your email list: why you should begin now, who you're writing to, your first lead magnet, and a simple 7-day plan to get going."
  },
  "learn": [
    {
      "no": "Hvorfor e-postlisten bør bygges tidlig, uansett hvor liten virksomheten er",
      "en": "Why your email list should be built early, no matter how small your business is"
    },
    {
      "no": "Hvem du ønsker på listen, og hvordan du snakker rett til den personen",
      "en": "Who you want on the list, and how to speak directly to that person"
    },
    {
      "no": "Hvordan du velger og lager din første lead magnet",
      "en": "How to choose and create your first lead magnet"
    },
    {
      "no": "En enkel 7-dagers plan som tar deg fra ingenting til dine første abonnenter",
      "en": "A simple 7-day plan that takes you from nothing to your first subscribers"
    }
  ],
  "lessons": [
    {
      "title": { "no": "Velkommen til minikurset", "en": "Welcome to the mini-course" },
      "body": [
        {
          "no": "Å bygge en e-postliste er noe av det mest lønnsomme du kan gjøre for virksomheten din, og det trenger ikke være komplisert. I dette minikurset går jeg gjennom akkurat det du trenger for å få dine første 100 abonnenter, ingenting mer.",
          "en": "Building an email list is one of the most valuable things you can do for your business, and it doesn't need to be complicated. In this mini-course I walk you through exactly what you need to get your first 100 subscribers, nothing more."
        },
        { "no": "## Hva du lærer i dette kurset", "en": "## What you'll learn in this course" },
        {
          "no": "Hvorfor e-postlisten bør bygges tidlig, uansett hvor liten virksomheten er\n\nHvem du ønsker på listen, og hvordan du snakker rett til den personen\n\nHvordan du velger og lager din første lead magnet\n\nEn enkel 7-dagers plan som tar deg fra ingenting til dine første abonnenter",
          "en": "Why your email list should be built early, no matter how small your business is\n\nWho you want on the list, and how to speak directly to that person\n\nHow to choose and create your first lead magnet\n\nA simple 7-day plan that takes you from nothing to your first subscribers"
        }
      ],
      "tip": null,
      "module": { "no": "Få dine første 100 e-postabonnenter", "en": "Get your first 100 email subscribers", "lock": "free" }
    },
    {
      "title": { "no": "Hvorfor e-postlisten bør bygges tidlig", "en": "Why the email list should be built early" },
      "body": [
        { "no": "**Mål:** Du forstår hvorfor e-postlisten er verdt tiden, selv når du akkurat har startet.", "en": "**Goal:** You understand why the email list is worth your time, even when you've just started." },
        {
          "no": "Følgere på sosiale medier leier du. Plattformen bestemmer hvem som ser innholdet ditt, og den kan endre reglene når som helst. Abonnenter på e-postlisten eier du. Ingen algoritme står mellom deg og innboksen deres.",
          "en": "Followers on social media are rented. The platform decides who sees your content, and it can change the rules at any time. Subscribers on your email list are owned. No algorithm stands between you and their inbox."
        },
        { "no": "## Effekten bygger seg opp over tid", "en": "## The effect builds up over time" },
        {
          "no": "Du trenger ikke tusenvis av abonnenter for at listen skal være verdifull. En liten liste med de riktige menneskene, som faktisk åpner e-postene dine, er verdt langt mer enn et stort tall du aldri når fram til. Jo tidligere du begynner, jo mer tid har listen til å vokse mens du gjør alt det andre.",
          "en": "You don't need thousands of subscribers for the list to be valuable. A small list of the right people, who actually open your emails, is worth far more than a big number you never reach. The earlier you start, the more time the list has to grow while you do everything else."
        },
        {
          "no": "## Kort oppsummert\n\nSosiale medier leier du, e-postlisten eier du.\n\nEn liten, engasjert liste slår et stort, tilfeldig følgertall.\n\nJo tidligere du begynner, jo mer tid har listen til å vokse.",
          "en": "## In short\n\nSocial media is rented, the email list is owned.\n\nA small, engaged list beats a large, random follower count.\n\nThe earlier you start, the more time the list has to grow."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Skriv ned ett tidspunkt du mistet kontakt med følgere fordi en plattform endret seg. Det er akkurat den sårbarheten e-postlisten løser.",
        "en": "📝 Task: Write down one time you lost touch with followers because a platform changed. That's exactly the vulnerability the email list solves."
      }
    },
    {
      "title": { "no": "Hvem du ønsker på listen", "en": "Who you want on the list" },
      "body": [
        { "no": "**Mål:** Du vet nøyaktig hvem du skriver til, ikke bare \"alle som kan være interessert\".", "en": "**Goal:** You know exactly who you're writing to, not just \"everyone who might be interested\"." },
        {
          "no": "\"Alle\" er ingen målgruppe. Når du skriver til alle, treffer du som regel ingen. Se for deg én person: hva strever hun med akkurat nå, og hva ønsker hun seg i stedet?",
          "en": "\"Everyone\" isn't an audience. When you write to everyone, you usually reach no one. Picture one person: what is she struggling with right now, and what does she wish for instead?"
        },
        { "no": "## Snakk til ett menneske", "en": "## Speak to one person" },
        {
          "no": "Du trenger ikke velge bort hele virksomheten din. Velg én tydelig person å skrive til i denne omgangen, gjerne den du allerede kjenner best, og la resten av listen vokse rundt henne etter hvert.",
          "en": "You don't need to give up the rest of your business. Choose one clear person to write to for now, ideally the one you already know best, and let the rest of the list grow around her over time."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Fullfør setningen: Jeg skriver til [én person], som strever med [problem], og som egentlig ønsker seg [resultat].",
        "en": "📝 Task: Finish the sentence: I'm writing to [one person], who struggles with [problem], and who really wants [outcome]."
      }
    },
    {
      "title": { "no": "Velg én enkel lead magnet", "en": "Choose one simple lead magnet" },
      "body": [
        { "no": "**Mål:** Du har valgt én lead magnet du faktisk kan lage denne uken.", "en": "**Goal:** You've chosen one lead magnet you can actually make this week." },
        {
          "no": "En lead magnet er en liten, konkret gave du gir bort mot en e-postadresse: en sjekkliste, en kort guide, en mal eller en enkel oppskrift. Den skal løse ett problem, ikke alle problemene.",
          "en": "A lead magnet is a small, concrete gift you give away in exchange for an email address: a checklist, a short guide, a template, or a simple recipe. It should solve one problem, not every problem."
        },
        { "no": "## Enkelt slår perfekt", "en": "## Simple beats perfect" },
        {
          "no": "Velg et format du kan lage på noen timer, ikke noe som krever en hel helg. En enkel sjekkliste som faktisk blir ferdig, er alltid bedre enn en ambisiøs guide som aldri blir publisert.",
          "en": "Choose a format you can make in a few hours, not something that takes a whole weekend. A simple checklist that actually gets finished always beats an ambitious guide that never gets published."
        }
      ],
      "tip": {
        "no": "🎁 Trenger du inspirasjon til tekst og titler? Ferdige tekstmaler til lead magnets finner du i kurset \"Voks e-postlisten din\".",
        "en": "🎁 Need inspiration for copy and titles? Ready-made text templates for lead magnets are in the \"Grow Your Email List\" course."
      }
    },
    {
      "title": { "no": "Lag en enkel påmeldingsside", "en": "Create a simple opt-in page" },
      "body": [
        { "no": "**Mål:** Du vet nøyaktig hva en påmeldingsside trenger, og ingenting mer.", "en": "**Goal:** You know exactly what an opt-in page needs, and nothing more." },
        {
          "no": "En påmeldingsside trenger fire ting: en overskrift som lover ett resultat, tre korte punkter om hva gaven inneholder, ett felt for navn og e-post, og én tydelig knapp. Alt annet er forstyrrelse.",
          "en": "An opt-in page needs four things: a headline that promises one result, three short bullet points about what the gift contains, one field for name and email, and one clear button. Everything else is a distraction."
        },
        { "no": "## Ingen meny, ingen utganger", "en": "## No menu, no exits" },
        {
          "no": "Fjern alt som kan lokke besøkende bort før de har meldt seg på: navigasjonsmeny, lenker til andre sider, sosiale medier-ikoner. Bygg siden i LME Studio sin Builder eller i Canva, det viktigste er ikke hvor pen den er, det er at den er tydelig.",
          "en": "Remove anything that could lure visitors away before they sign up: navigation menu, links to other pages, social media icons. Build the page in LME Studio's Builder or in Canva, what matters most isn't how pretty it is, it's how clear it is."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Skriv de tre punktene og overskriften til din egen påmeldingsside, klare til å limes rett inn.",
        "en": "📝 Task: Write the three bullet points and the headline for your own opt-in page, ready to paste straight in."
      }
    },
    {
      "title": { "no": "Fem steder du kan dele lead magneten", "en": "Five places to share your lead magnet" },
      "body": [
        { "no": "**Mål:** Du har fem konkrete steder å dele gaven din de neste ukene.", "en": "**Goal:** You have five concrete places to share your gift over the coming weeks." },
        {
          "no": "Gaven hjelper ingen så lenge den ligger gjemt. Del den der menneskene du skriver til allerede er.",
          "en": "The gift helps no one while it sits hidden. Share it where the people you're writing to already are."
        },
        {
          "no": "## Fem steder å begynne\n\nLenken i bio-en på Instagram eller TikTok\n\nEt festet innlegg øverst på profilen din\n\nSom svar når noen stiller et relevant spørsmål i kommentarfeltet\n\nI signaturen på hver e-post du sender\n\nI et fellesskap eller en gruppe du allerede er en del av",
          "en": "## Five places to start\n\nThe link in your bio on Instagram or TikTok\n\nA pinned post at the top of your profile\n\nAs a reply whenever someone asks a relevant question in the comments\n\nIn the signature on every email you send\n\nIn a community or group you're already part of"
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Velg to av de fem stedene, og del lenken din der i dag.",
        "en": "📝 Task: Pick two of the five places, and share your link there today."
      }
    },
    {
      "title": { "no": "En kort velkomstmail", "en": "A short welcome email" },
      "body": [
        { "no": "**Mål:** Du har en enkel velkomstmail klar til å sende automatisk.", "en": "**Goal:** You have a simple welcome email ready to send automatically." },
        {
          "no": "Den første e-posten er den viktigste. Lever gaven med en gang, i klartekst, uten at abonnenten må lete. Skriv varmt og personlig, som til en venn, ikke som en brosjyre.",
          "en": "The first email is the most important one. Deliver the gift right away, in plain sight, without the subscriber having to search. Write warmly and personally, like to a friend, not like a brochure."
        },
        { "no": "## Et enkelt eksempel", "en": "## A simple example" },
        {
          "no": "Emne: Her er den jeg lovte deg 🌸\n\nHei [navn], her er [gaven], akkurat som lovet. Jeg håper den hjelper deg med [problemet]. Svar gjerne på denne e-posten hvis du lurer på noe, jeg leser alt selv.",
          "en": "Subject: Here's what I promised you 🌸\n\nHi [name], here's [the gift], just as promised. I hope it helps you with [the problem]. Feel free to reply to this email if you have any questions, I read every reply myself."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Skriv din egen versjon av velkomstmailen, klar til å limes inn i e-postverktøyet ditt.",
        "en": "📝 Task: Write your own version of the welcome email, ready to paste into your email tool."
      }
    },
    {
      "title": { "no": "Din 7-dagers handlingsplan", "en": "Your 7-day action plan" },
      "body": [
        { "no": "**Mål:** Du har en konkret plan for de neste sju dagene.", "en": "**Goal:** You have a concrete plan for the next seven days." },
        {
          "no": "Du trenger ikke gjøre alt på én gang. Fordelt over en uke er hvert steg lett å få til, selv med lite tid.",
          "en": "You don't need to do everything at once. Spread over a week, every step is easy to manage, even with little time."
        },
        {
          "no": "## Dag for dag\n\nDag 1: bestem hvem du skriver til\n\nDag 2: velg din lead magnet\n\nDag 3: lag gaven\n\nDag 4: bygg påmeldingssiden\n\nDag 5: skriv velkomstmailen\n\nDag 6: koble sammen påmeldingssiden, e-postverktøyet og velkomstmailen, og test hele reisen selv\n\nDag 7: del lenken din på to av de fem stedene fra tidligere",
          "en": "## Day by day\n\nDay 1: Decide who you're writing to\n\nDay 2: Choose your lead magnet\n\nDay 3: Create the gift\n\nDay 4: Build the opt-in page\n\nDay 5: Write the welcome email\n\nDay 6: Connect the opt-in page, your email tool and the welcome email, and test the whole journey yourself\n\nDay 7: Share your link in two of the five places from before"
        },
        {
          "no": "Når disse sju dagene er unnagjort, har du et fungerende system som jobber for deg i bakgrunnen, dag og natt. Vil du ha hele strategien videre, målgruppe, flere lead magnets, trafikk, automatisering og vekst, venter kurset \"Voks e-postlisten din\" på deg.",
          "en": "Once these seven days are done, you'll have a working system running in the background for you, day and night. If you want the full strategy from here, audience, more lead magnets, traffic, automation and growth, the \"Grow Your Email List\" course is waiting for you."
        }
      ],
      "tip": {
        "no": "🌸 Husk: Du trenger ikke et perfekt system, du trenger et system som finnes. Du kan alltid forbedre det underveis.",
        "en": "🌸 Remember: You don't need a perfect system, you need a system that exists. You can always improve it along the way."
      }
    }
  ],
  "outro": {
    "title": {
      "no": "Du har nå dine første steg mot 100 abonnenter 🌸",
      "en": "You now have your first steps toward 100 subscribers 🌸"
    },
    "text": {
      "no": "Kom tilbake hit når du vil, i ditt eget tempo. Jeg heier på deg, Renate.",
      "en": "Come back here whenever you like, at your own pace. I'm cheering you on, Renate."
    }
  }
};
