/**
 * Ferdig-skrevet innhold for workshopen "Ansett dine fem AI-assistenter",
 * en praktisk arbeidsøkt i LME Studio: fem faste assistenter i Claude, og
 * seks ferdige karuseller laget på én time. Brukes kun av
 * functions/api/seed-ai-assistent-workshop.js til import inn i Kursbygger
 * (KV), samme skjema som functions/api/kurs.js.
 */
export const AI_ASSISTENT_WORKSHOP = {
  "slug": "ai-assistent-workshop",
  "size": "stor",
  "published": true,
  "cert": true,
  "meet": false,
  "kicker": {
    "no": "WORKSHOP · LME STUDIO",
    "en": "WORKSHOP · LME STUDIO"
  },
  "title": {
    "no": "Workshop: Ansett dine fem AI-assistenter",
    "en": "Workshop: Hire your five AI assistants"
  },
  "lede": {
    "no": "En arbeidsøkt, ikke en forelesning. Du setter fem faste assistenter i arbeid i Claude, én for hver oppgave som spiser opp uken din, og lager seks ferdige karuseller på seksti minutter. Du går ut med ferdige prompter du kan bruke i kveld, ikke bare gode intensjoner.",
    "en": "A working session, not a lecture. You put five permanent assistants to work in Claude, one for each task that eats up your week, and create six finished carousels in sixty minutes. You leave with prompts you can use tonight, not just good intentions."
  },
  "learn": [
    {
      "no": "Hvordan du gir Claude stemmen din, så alt som kommer ut høres ut som deg",
      "en": "How to give Claude your voice, so everything that comes out sounds like you"
    },
    {
      "no": "Hvordan du beskriver en jobb så tydelig at en assistent kan gjøre den uten deg",
      "en": "How to describe a job clearly enough that an assistant can do it without you"
    },
    {
      "no": "Fem ferdige assistenter: e-post, regnskap, design, innhold og podkast",
      "en": "Five ready-made assistants: email, bookkeeping, design, content and podcast"
    },
    {
      "no": "Rammeverket som gjør en idé om til en karusell på ti bilder",
      "en": "The framework that turns one idea into a ten-slide carousel"
    },
    {
      "no": "Hvordan du lager seks karuseller i samme økt, i stedet for én om gangen",
      "en": "How to create six carousels in one sitting, instead of one at a time"
    },
    {
      "no": "En ukesrytme som holder assistentene i arbeid etter at workshopen er over",
      "en": "A weekly rhythm that keeps the assistants working after the workshop is over"
    }
  ],
  "lessons": [
    {
      "module": {
        "no": "Del 1 · Klar til start",
        "en": "Part 1 · Ready to start",
        "lock": "free"
      },
      "title": {
        "no": "Velkommen til workshopen",
        "en": "Welcome to the workshop"
      },
      "body": [
        {
          "no": "Dette er en arbeidsøkt. Du har Claude åpent i et vindu ved siden av, og etter hver leksjon har du noe ferdig: en assistent som virker, eller et innlegg du kan legge ut.",
          "en": "This is a working session. You keep Claude open in a window beside you, and after every lesson you have something finished: an assistant that works, or a post you can publish."
        },
        {
          "no": "## Slik er økten satt opp\n\nDel 1: Du gir Claude stemmen din, så alt som kommer ut høres ut som deg.\n\nDel 2: Du ansetter fem assistenter, én for hver oppgave som spiser opp uken din.\n\nDel 3: Du lager seks karuseller på seksti minutter, med assistenten du nettopp ansatte.\n\nDel 4: Du setter det hele i en rytme du faktisk holder.",
          "en": "## How the session is set up\n\nPart 1: you give Claude your voice, so everything that comes out sounds like you.\n\nPart 2: you hire five assistants, one for each task that eats up your week.\n\nPart 3: you create six carousels in sixty minutes, with the assistant you just hired.\n\nPart 4: you put it all into a rhythm you can actually keep."
        },
        {
          "no": "## Dette trenger du\n\nEn konto hos Claude, gratisversjonen holder for å komme i gang.\n\nRundt to timer, eller tre kvelder på førti minutter om det passer bedre.\n\nEt sted å lagre promptene dine, for eksempel et dokument eller et prosjekt i Claude.",
          "en": "## What you need\n\nA Claude account, the free version is enough to get started.\n\nAround two hours, or three evenings of forty minutes if that suits you better.\n\nSomewhere to store your prompts, for example a document or a project inside Claude."
        },
        {
          "no": "Å lære opp en nyansatt tar måneder. En AI-assistent er i arbeid samme kveld, og den blir aldri lei av å gjøre den samme kjedelige oppgaven på nytt. Det er ikke magi, det er en godt skrevet arbeidsbeskrivelse, og den skriver du i dag.",
          "en": "Training a new employee takes months. An AI assistant is at work the same evening, and it never tires of doing the same boring task again. It isn't magic, it's a well written job description, and you write it today."
        }
      ],
      "tip": {
        "no": "🌸 Tips: Ikke les gjennom alt først. Ta leksjon for leksjon med Claude åpent ved siden av, så har du fem assistenter i drift når du er ferdig.",
        "en": "🌸 Tip: Don't read it all through first. Take it lesson by lesson with Claude open beside you, and you'll have five assistants running by the time you finish."
      }
    },
    {
      "module": null,
      "title": {
        "no": "Gi Claude stemmen din først",
        "en": "Give Claude your voice first"
      },
      "body": [
        {
          "no": "**Mål:** Claude skriver som deg, ikke som en brosjyre.",
          "en": "**Goal:** Claude writes like you, not like a brochure."
        },
        {
          "no": "Den vanligste grunnen til at AI-tekst høres ut som AI, er at Claude ikke vet hvem som snakker. Før du ber om noe som helst, forteller du hvem du er, hvem du hjelper og hvordan du høres ut.",
          "en": "The most common reason AI text sounds like AI is that Claude doesn't know who is speaking. Before you ask for anything at all, you say who you are, who you help and how you sound."
        },
        {
          "no": "## Ferdig prompt\n\n\"Du er [det du er god på] som hjelper [den du hjelper] med å [resultatet de vil ha]. Tonen din er [tre ord som beskriver deg]. Skriv alt innhold fra dette ståstedet, på norsk, med korte setninger og uten floskler.\"",
          "en": "## Ready-made prompt\n\n\"You are [what you're good at] who helps [the person you help] achieve [the result they want]. Your tone is [three words that describe you]. Write all content from this perspective, with short sentences and no filler.\""
        },
        {
          "no": "Tre ord er nok: varm, direkte, lun. Eller: rolig, konkret, uten pisk. Jo mer presise ordene er, jo mindre etterarbeid får du.",
          "en": "Three words are enough: warm, direct, gentle. Or: calm, concrete, no guilt. The more precise the words, the less rewriting you're left with."
        },
        {
          "no": "## Lagre den, ikke skriv den på nytt\n\nI Claude kan du lage et prosjekt og legge stemmen din inn som fast instruksjon. Da slipper du å lime den inn hver gang, og alle assistentene dine arver den samme stemmen.",
          "en": "## Save it, don't rewrite it\n\nIn Claude you can create a project and store your voice there as a standing instruction. Then you don't have to paste it in every time, and all your assistants inherit the same voice."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Skriv stemmeprompten din nå, lim den inn i Claude og be om tre setninger om hva du gjør. Kjenner du deg ikke igjen, bytt de tre toneordene og prøv på nytt.",
        "en": "📝 Task: Write your voice prompt now, paste it into Claude and ask for three sentences about what you do. If it doesn't sound like you, swap the three tone words and try again."
      }
    },
    {
      "module": null,
      "title": {
        "no": "Slik ser en god assistent ut",
        "en": "What a good assistant looks like"
      },
      "body": [
        {
          "no": "**Mål:** Du kan beskrive en jobb så tydelig at Claude kan gjøre den uten deg.",
          "en": "**Goal:** You can describe a job clearly enough that Claude can do it without you."
        },
        {
          "no": "En assistent er ikke ett spørsmål du stiller én gang. Det er en fast jobb du beskriver godt én gang, og henter fram igjen hver uke. Jeg bruker tre linjer på hver av dem.",
          "en": "An assistant isn't one question you ask once. It's a permanent job you describe well once, and pull out again every week. I use three lines for each one."
        },
        {
          "no": "## De tre linjene\n\nDEN FÅR: hva du gir den, hver gang.\n\nDEN GJØR: hva som skal komme ut, helt konkret.\n\nDEN SPARER MEG: hva du får igjen, i tid eller i irritasjon.",
          "en": "## The three lines\n\nIT GETS: what you hand it, every time.\n\nIT DOES: what should come out, in concrete terms.\n\nIT SAVES ME: what you get back, in time or in frustration."
        },
        {
          "no": "Den siste linjen er ikke pynt. Den avgjør om assistenten er verdt å ansette. Sparer den deg ti minutter i måneden, la den ligge. Sparer den deg en time i uken, sett den i arbeid i kveld.",
          "en": "The last line isn't decoration. It decides whether the assistant is worth hiring. If it saves you ten minutes a month, leave it. If it saves you an hour a week, put it to work tonight."
        },
        {
          "no": "Legg merke til hva de fem assistentene i neste del har felles: De gjør ikke faget ditt, de gjør alt rundt faget ditt. Du beholder vurderingene, varmen og siste ord.",
          "en": "Notice what the five assistants in the next part have in common: they don't do your craft, they do everything around it. You keep the judgement, the warmth and the final say."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Velg oppgaven du gruer deg mest til denne uken, og skriv de tre linjene for den. Det er assistent nummer én for deg, uansett hva jeg foreslår videre.",
        "en": "📝 Task: Pick the task you dread most this week and write the three lines for it. That's assistant number one for you, whatever I suggest next."
      }
    },
    {
      "module": {
        "no": "Del 2 · De fem assistentene",
        "en": "Part 2 · The five assistants",
        "lock": "free"
      },
      "title": {
        "no": "Assistent 1: E-postassistenten",
        "en": "Assistant 1: The email assistant"
      },
      "body": [
        {
          "no": "**Mål:** Innboksen er sortert og svarene er skrevet før du har drukket opp kaffen.",
          "en": "**Goal:** The inbox is sorted and the replies are written before your coffee is finished."
        },
        {
          "no": "DEN FÅR: innboksen din, hver morgen.\n\nDEN GJØR: sorterer e-postene i bunker og skriver ferdige svarutkast i din stemme. Du leser gjennom og trykker send.\n\nDEN SPARER MEG: den delen av morgenen som pleide å gå med til å bestemme hva jeg skulle svare på først.",
          "en": "IT GETS: your inbox, every morning.\n\nIT DOES: sorts the emails into piles and writes finished draft replies in your voice. You read them through and hit send.\n\nIT SAVES ME: the part of the morning that used to go into deciding what to answer first."
        },
        {
          "no": "## Ferdig prompt\n\n\"Her er e-postene jeg har fått i dag. Del dem i tre bunker: svar i dag, svar denne uken, trenger ikke svar. Skriv deretter ferdige svarutkast i min stemme til bunken svar i dag, maks 120 ord hver, vennlige og konkrete. Marker det du er usikker på, i stedet for å gjette.\"",
          "en": "## Ready-made prompt\n\n\"Here are the emails I received today. Split them into three piles: answer today, answer this week, no answer needed. Then write finished draft replies in my voice for the answer today pile, max 120 words each, friendly and concrete. Flag anything you're unsure about instead of guessing.\""
        },
        {
          "no": "## Vær ryddig med andres opplysninger\n\nDu trykker send, ikke Claude. Bytt ut navn, adresser og fødselsdatoer med [forelder] eller [barn] før du limer inn, så får du samme hjelpen uten å dele opplysninger som ikke er dine.",
          "en": "## Be careful with other people's details\n\nYou hit send, not Claude. Replace names, addresses and dates of birth with [parent] or [child] before you paste, and you get the same help without sharing details that aren't yours."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Lim inn tre e-poster du ikke har svart på ennå, og be om utkast. Endrer du mer enn en tredel av teksten, er stemmeprompten din for vag, ikke Claude.",
        "en": "📝 Task: Paste in three emails you haven't answered yet and ask for drafts. If you change more than a third of the text, your voice prompt is too vague, not Claude."
      }
    },
    {
      "module": null,
      "title": {
        "no": "Assistent 2: Regnskapsassistenten",
        "en": "Assistant 2: The bookkeeping assistant"
      },
      "body": [
        {
          "no": "**Mål:** Bilagene er sortert og oppsummert før du sender dem videre.",
          "en": "**Goal:** Your receipts are sorted and summarised before you send them on."
        },
        {
          "no": "DEN FÅR: bilag og fakturaer, samlet en gang i måneden.\n\nDEN GJØR: setter opp en oversikt med dato, leverandør, beløp, mva og kategori, og lager en kort oppsummering av måneden.\n\nDEN SPARER MEG: kvelden som pleide å gå med til å bla gjennom en bunke og lure på hva som hørte hjemme hvor.",
          "en": "IT GETS: receipts and invoices, gathered once a month.\n\nIT DOES: builds an overview with date, supplier, amount, VAT and category, and writes a short summary of the month.\n\nIT SAVES ME: the evening that used to go into leafing through a pile wondering what belonged where."
        },
        {
          "no": "## Ferdig prompt\n\n\"Her er bilagene for denne måneden. Sett opp en tabell med dato, leverandør, beløp, mva og hvilken utgiftskategori du mener det hører hjemme i. Marker tydelig alt du er usikker på, i stedet for å gjette. Skriv til slutt tre setninger om hva jeg brukte mest penger på, og hva som skiller seg fra forrige måned.\"",
          "en": "## Ready-made prompt\n\n\"Here are this month's receipts. Build a table with date, supplier, amount, VAT and the expense category you think it belongs to. Clearly flag anything you're unsure about instead of guessing. Finish with three sentences on what I spent the most on, and what stands out compared to last month.\""
        },
        {
          "no": "## Assistenten forbereder, regnskapsføreren bestemmer\n\nDette er forarbeidet, ikke selve regnskapet. Bilagene skal fortsatt lagres slik loven krever, og regnskapsføreren din skal ha siste ord. Det du sparer, er tiden fram til hun får en ryddig bunke i hendene.",
          "en": "## The assistant prepares, your accountant decides\n\nThis is the preparation, not the accounts themselves. The receipts still have to be stored the way the law requires, and your accountant still has the final say. What you save is the time it takes to hand her a tidy pile."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Ta forrige måned, som du allerede vet fasiten på, og la assistenten sortere den. Da ser du med en gang hvor den treffer og hvor den bommer.",
        "en": "📝 Task: Take last month, where you already know the answer, and let the assistant sort it. You'll see straight away where it hits and where it misses."
      }
    },
    {
      "module": null,
      "title": {
        "no": "Assistent 3: Designassistenten",
        "en": "Assistant 3: The design assistant"
      },
      "body": [
        {
          "no": "**Mål:** Presentasjonen er ferdig strukturert før du åpner et designprogram.",
          "en": "**Goal:** The presentation is fully structured before you open a design tool."
        },
        {
          "no": "DEN FÅR: temaet for webinaret, kurset eller foreldremøtet.\n\nDEN GJØR: bygger hele presentasjonen, bilde for bilde, med overskrift, punkter og en setning du kan si høyt.\n\nDEN SPARER MEG: timene som pleide å gå med til å stirre på et tomt lysbilde og flytte tekstbokser fram og tilbake.",
          "en": "IT GETS: the topic for the webinar, the class or the parents' meeting.\n\nIT DOES: builds the whole presentation, slide by slide, with a headline, bullet points and one sentence you can say out loud.\n\nIT SAVES ME: the hours that used to go into staring at a blank slide and nudging text boxes around."
        },
        {
          "no": "## Ferdig prompt\n\n\"Lag en presentasjon på tolv bilder om [tema] for [publikum]. Gi meg overskrift, maks tre punkter og én setning jeg skal si, for hvert bilde. Bygg den slik at det siste bildet leder naturlig til [det du vil at de skal gjøre]. Foreslå også ett bilde eller én illustrasjon per lysbilde.\"",
          "en": "## Ready-made prompt\n\n\"Create a twelve-slide presentation about [topic] for [audience]. Give me a headline, at most three bullet points and one sentence for me to say, for each slide. Build it so the last slide leads naturally to [what you want them to do]. Also suggest one image or illustration per slide.\""
        },
        {
          "no": "Når strukturen sitter, er selve designet raskt. Da limer du innholdet inn i malen du allerede bruker, og bruker tiden på hvordan det ser ut, ikke på hva som skal stå.",
          "en": "Once the structure is in place, the design itself is quick. You paste the content into the template you already use, and spend your time on how it looks rather than on what it should say."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Be om presentasjonen først, og deretter om en kortversjon på fem bilder. Kortversjonen er ofte den du faktisk holder.",
        "en": "📝 Task: Ask for the presentation first, then for a five-slide short version. The short version is often the one you actually deliver."
      }
    },
    {
      "module": null,
      "title": {
        "no": "Assistent 4: Innholdsassistenten",
        "en": "Assistant 4: The content assistant"
      },
      "body": [
        {
          "no": "**Mål:** Ideen fra gåturen blir et ferdig innlegg, samme dag.",
          "en": "**Goal:** The idea from your walk becomes a finished post, the same day."
        },
        {
          "no": "DEN FÅR: en idé, ofte snakket inn på telefonen mens du går.\n\nDEN GJØR: rydder i tanken og skriver den om til innlegg og bildetekster i din stemme, klare til å legges ut.\n\nDEN SPARER MEG: timen som pleide å gå med til å skrive det samme fem ganger før det ble bra nok.",
          "en": "IT GETS: an idea, often spoken into your phone while walking.\n\nIT DOES: tidies up the thought and turns it into posts and captions in your voice, ready to publish.\n\nIT SAVES ME: the hour that used to go into writing the same thing five times before it was good enough."
        },
        {
          "no": "## Ferdig prompt\n\n\"Her er en idé jeg snakket inn mens jeg gikk. Rydd i den og skriv den om til et innlegg til [plattform] i min stemme. Behold mine egne formuleringer der de er gode, og fjern alt som høres ut som en brosjyre. Gi meg tre forslag til første setning.\"",
          "en": "## Ready-made prompt\n\n\"Here's an idea I spoke into my phone while walking. Tidy it up and rewrite it as a post for [platform] in my voice. Keep my own phrasing where it's good, and remove anything that sounds like a brochure. Give me three suggestions for the opening line.\""
        },
        {
          "no": "Når teksten er klar, tar LME Autopilot seg av selve produksjonen: reels, stories og karuseller, laget på minutter. Denne assistenten skriver, Autopilot lager, og veien inn går via [LME Studio](https://lmexplorers.com/creative-academy).",
          "en": "Once the text is ready, LME Autopilot handles the production itself: reels, stories and carousels, made in minutes. This assistant writes, Autopilot builds, and the way in goes through [LME Studio](https://lmexplorers.com/creative-academy)."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Snakk inn en idé på tretti sekunder, og send den rått til assistenten, med pauser og alt. Den ryddige varianten din er ikke bedre, den er bare mer forsiktig.",
        "en": "📝 Task: Speak an idea for thirty seconds and send it in raw, pauses and all. Your tidied-up version isn't better, it's just more cautious."
      }
    },
    {
      "module": null,
      "title": {
        "no": "Assistent 5: Podkastprodusenten",
        "en": "Assistant 5: The podcast producer"
      },
      "body": [
        {
          "no": "**Mål:** Episoden har en vinkling før opptak, og alt etterarbeidet er skrevet etterpå.",
          "en": "**Goal:** The episode has an angle before you record, and all the follow-up is written afterwards."
        },
        {
          "no": "DEN FÅR: notatene fra uken, samtalene du har hatt og ideene du har lagt fra deg underveis.\n\nDEN GJØR: finner ut hva episoden skal handle om, og lager disposisjon, show notes, e-post til listen og innlegg som peker til episoden.\n\nDEN SPARER MEG: timene før og etter opptak, som var mer arbeid enn selve opptaket.",
          "en": "IT GETS: the week's notes, the conversations you've had and the ideas you jotted down along the way.\n\nIT DOES: works out what the episode should be about, and creates the outline, show notes, an email to your list and posts pointing to the episode.\n\nIT SAVES ME: the hours before and after recording, which were more work than the recording itself."
        },
        {
          "no": "## Ferdig prompt\n\n\"Her er notatene mine fra denne uken. Foreslå tre vinklinger til neste episode, med én setning om hvem hver av dem er for. Når jeg har valgt én, lager du disposisjon med fem bolker, show notes, en e-post til listen min og tre innlegg som peker til episoden.\"",
          "en": "## Ready-made prompt\n\n\"Here are my notes from this week. Suggest three angles for the next episode, with one sentence on who each of them is for. Once I've chosen one, create an outline with five sections, show notes, an email to my list and three posts pointing to the episode.\""
        },
        {
          "no": "Det samme oppsettet fungerer for et nyhetsbrev, en YouTube-video eller en live-økt. Bytt ut ordet episode med det du faktisk lager, så har du en produsent for det også.",
          "en": "The same setup works for a newsletter, a YouTube video or a live session. Swap the word episode for whatever you actually make, and you have a producer for that too."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Be om de tre vinklingene før du bestemmer deg for tema. Det er som regel den tredje, den du ikke hadde tenkt på selv, som blir den beste episoden.",
        "en": "📝 Task: Ask for the three angles before you settle on a topic. It's usually the third one, the one you hadn't thought of yourself, that makes the best episode."
      }
    },
    {
      "module": {
        "no": "Del 3 · Seks karuseller på seksti minutter",
        "en": "Part 3 · Six carousels in sixty minutes",
        "lock": "free"
      },
      "title": {
        "no": "Slik fungerer timen",
        "en": "How the hour works"
      },
      "body": [
        {
          "no": "**Mål:** Du vet nøyaktig hva du skal gjøre med de neste seksti minuttene, før du starter klokken.",
          "en": "**Goal:** You know exactly what to do with the next sixty minutes, before you start the clock."
        },
        {
          "no": "## Timen fordelt på seks steg\n\nSteg 1 og 2, ti minutter: stemmen din og seks temaer.\n\nSteg 3, femten minutter: rammeverket for de ti bildene.\n\nSteg 4, ti minutter: krokene.\n\nSteg 5, tjuefem minutter: språket blir ditt.\n\nSteg 6 skjer hele veien: Du gjør alle seks samtidig, ikke én om gangen.",
          "en": "## The hour split into six steps\n\nSteps 1 and 2, ten minutes: your voice and six topics.\n\nStep 3, fifteen minutes: the framework for the ten slides.\n\nStep 4, ten minutes: the hooks.\n\nStep 5, twenty-five minutes: making the language yours.\n\nStep 6 runs throughout: you do all six at once, not one at a time."
        },
        {
          "no": "Regelen for økten: Du skriver ikke én karusell, legger den ut og starter på nytt i morgen. Du lager alle seks i samme økt, og pusser dem samlet til slutt. Det er selve gevinsten, ikke AI-en i seg selv.",
          "en": "The rule for this session: you don't write one carousel, post it and start over tomorrow. You make all six in the same sitting, and polish them together at the end. That's where the leverage is, not in the AI itself."
        },
        {
          "no": "Seks karuseller er halvannen måned med innhold, hvis du legger ut én i uken. Det er derfor timen er verdt å sette av, selv en uke der du ikke har tid til noe.",
          "en": "Six carousels is a month and a half of content, if you post one a week. That's why the hour is worth setting aside, even in a week when you have time for nothing."
        }
      ],
      "tip": {
        "no": "⏱️ Tips: Sett en timer på seksti minutter, og la den gå. Uten klokke blir dette et prosjekt; med klokke blir det en økt.",
        "en": "⏱️ Tip: Set a timer for sixty minutes and let it run. Without a clock this becomes a project; with one it stays a session."
      }
    },
    {
      "module": null,
      "title": {
        "no": "Steg 1 og 2: stemmen og de seks temaene",
        "en": "Steps 1 and 2: your voice and the six topics"
      },
      "body": [
        {
          "no": "**Mål:** Du har seks temaer på papiret, og Claude vet hvem som skriver dem.",
          "en": "**Goal:** You have six topics on paper, and Claude knows who is writing them."
        },
        {
          "no": "Start med stemmeprompten fra Del 1. Har du lagret den i et prosjekt, er steg 1 gjort på fem sekunder, og du kan gå rett videre.",
          "en": "Start with the voice prompt from Part 1. If you saved it in a project, step 1 is done in five seconds and you can go straight on."
        },
        {
          "no": "## Ferdig prompt\n\n\"Gi meg seks ideer til karuseller som viser at jeg er den som hjelper [den du hjelper] med [problemet]. Hver idé skal utfordre noe de tror er sant, og vise hva som blir mulig i stedet. Skriv én linje per idé.\"",
          "en": "## Ready-made prompt\n\n\"Give me six carousel ideas that position me as the one who helps [the person you help] with [the problem]. Each idea should challenge something they believe is true, and show what becomes possible instead. Write one line per idea.\""
        },
        {
          "no": "Får du seks ideer som ligner på hverandre, er beskrivelsen av problemet for vid. Snevre den inn til det ene folk faktisk spør deg om, og be om seks nye.",
          "en": "If you get six ideas that all look alike, your description of the problem is too broad. Narrow it to the one thing people actually ask you about, and ask for six new ones."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Sorter de seks ideene etter hvor ofte du får spørsmålet i virkeligheten. Den øverste blir karusellen du lager først.",
        "en": "📝 Task: Sort the six ideas by how often you get the question in real life. The top one becomes the carousel you build first."
      }
    },
    {
      "module": null,
      "title": {
        "no": "Steg 3: rammeverket for de ti bildene",
        "en": "Step 3: the framework for the ten slides"
      },
      "body": [
        {
          "no": "**Mål:** Hver av de seks ideene har en ferdig struktur, ikke bare en tittel.",
          "en": "**Goal:** Each of the six ideas has a finished structure, not just a title."
        },
        {
          "no": "## De ti bildene\n\n1. Krok\n2. Problem\n3. Kostnaden ved å la det være\n4. Skiftet i tankegang\n5. Systemet, steg én\n6. Systemet, steg to\n7. Systemet, steg tre\n8. Resultatet\n9. Valget leseren står overfor\n10. Oppfordringen",
          "en": "## The ten slides\n\n1. Hook\n2. Problem\n3. The cost of leaving it\n4. The shift in thinking\n5. The system, step one\n6. The system, step two\n7. The system, step three\n8. The result\n9. The choice the reader faces\n10. The call to action"
        },
        {
          "no": "## Ferdig prompt\n\n\"Gjør denne ideen om til en karusell på ti bilder. Struktur: krok, problem, kostnaden ved å la det være, skiftet i tankegang, systemet fordelt på tre bilder, resultatet, valget leseren står overfor, og til slutt en oppfordring. Maks 40 ord per bilde, i min stemme.\"",
          "en": "## Ready-made prompt\n\n\"Turn this idea into a ten-slide carousel. Structure: hook, problem, the cost of leaving it, the shift in thinking, the system across three slides, the result, the choice the reader faces, and finally a call to action. Max 40 words per slide, in my voice.\""
        },
        {
          "no": "Kjør den samme prompten for alle seks ideene, rett etter hverandre. Ikke stopp for å pusse noe underveis, det gjør du i steg 4 og 5.",
          "en": "Run the same prompt for all six ideas, one after another. Don't stop to polish anything along the way, that happens in steps 4 and 5."
        }
      ],
      "tip": {
        "no": "💡 Bra å vite: Rammeverket virker fordi det tar leseren fra en tanke til en avgjørelse. Bytt gjerne ut ordene, men behold rekkefølgen.",
        "en": "💡 Good to know: The framework works because it moves the reader from a thought to a decision. Change the wording if you like, but keep the order."
      }
    },
    {
      "module": null,
      "title": {
        "no": "Steg 4: puss kroken",
        "en": "Step 4: polish the hook"
      },
      "body": [
        {
          "no": "**Mål:** Det første bildet stopper tommelen, uten at du overdriver.",
          "en": "**Goal:** The first slide stops the thumb, without overselling."
        },
        {
          "no": "Kroken er det ene bildet folk faktisk ser. Er den vag, spiller det ingen rolle hvor gode de ni andre er. Derfor får den to minutter, alene.",
          "en": "The hook is the one slide people actually see. If it's vague, it doesn't matter how good the other nine are. So it gets two minutes, on its own."
        },
        {
          "no": "## Ferdig prompt\n\n\"Gi meg fem varianter av denne kroken. Hver variant skal være kortere, mer konkret og gjøre leseren mer nysgjerrig enn den forrige. Ingen store ord, ingen løfter jeg ikke kan holde.\"",
          "en": "## Ready-made prompt\n\n\"Give me five variations of this hook. Each one should be shorter, more specific and more curiosity-driven than the last. No big words, no promises I can't keep.\""
        },
        {
          "no": "Velg den sterkeste, ikke den flinkeste. Den sterkeste er som regel den som sier noe konkret du faktisk har gjort, ikke den som lover mest.",
          "en": "Pick the strongest, not the cleverest. The strongest is usually the one that says something concrete you've actually done, not the one that promises the most."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Les de fem krokene høyt. Den du klarer å si uten å krympe deg, er din.",
        "en": "📝 Task: Read the five hooks out loud. The one you can say without wincing is yours."
      }
    },
    {
      "module": null,
      "title": {
        "no": "Steg 5: gjør språket til ditt",
        "en": "Step 5: make the language yours"
      },
      "body": [
        {
          "no": "**Mål:** Ingen kan se at en assistent var innom.",
          "en": "**Goal:** Nobody can tell an assistant was involved."
        },
        {
          "no": "Les gjennom hver karusell og bytt ut de generelle formuleringene med dine egne ord. Det er her karusellen slutter å høres ut som alle andre sine, og begynner å høres ut som deg.",
          "en": "Read through each carousel and swap the generic phrases for your own words. This is where the carousel stops sounding like everyone else's and starts sounding like you."
        },
        {
          "no": "## Ferdig prompt\n\n\"Skriv om bilde [nummer] så det høres mer [ditt ord: varmt, direkte, tørt] ut og mindre som en brosjyre. Behold innholdet, bytt bare språket.\"",
          "en": "## Ready-made prompt\n\n\"Rewrite slide [number] so it sounds more [your word: warm, direct, dry] and less corporate. Keep the content, change only the language.\""
        },
        {
          "no": "Regn med fem minutter per karusell. Går det mye lenger, er det stemmeprompten fra Del 1 som må bli tydeligere, ikke bildene.",
          "en": "Count on five minutes per carousel. If it takes much longer, it's the voice prompt from Part 1 that needs sharpening, not the slides."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Sett strek under hver setning du aldri ville sagt høyt, og be om den setningen på nytt. Er det ingen streker, er du ferdig.",
        "en": "📝 Task: Underline every sentence you'd never say out loud, and ask for that sentence again. If there are no underlines, you're done."
      }
    },
    {
      "module": null,
      "title": {
        "no": "Steg 6: lag alle seks i samme økt",
        "en": "Step 6: make all six in one sitting"
      },
      "body": [
        {
          "no": "**Mål:** Halvannen måned med innhold ligger ferdig, laget på en time.",
          "en": "**Goal:** A month and a half of content sits finished, made in an hour."
        },
        {
          "no": "Det som gjør denne timen mulig, er ikke at Claude skriver fort. Det er at du gjør det samme steget seks ganger på rad, i stedet for å starte forfra i seks forskjellige uker. Du er allerede varm, promptene ligger klare, og hodet er i modus.",
          "en": "What makes this hour possible isn't that Claude writes fast. It's that you do the same step six times in a row, instead of starting over in six different weeks. You're already warmed up, the prompts are ready, and your head is in the right mode."
        },
        {
          "no": "Når teksten er ferdig, gjenstår bare selve bildene. Har du en fast mal, går det raskt. Vil du hoppe over det leddet også, sender du tekstene rett inn i LME Autopilot, som lager karusellene ferdig for deg.",
          "en": "When the text is finished, only the visuals remain. If you have a fixed template, it goes quickly. If you want to skip that step too, send the text straight into LME Autopilot, which builds the carousels for you."
        },
        {
          "no": "AI erstatter ikke strategien din, den utfører den raskere. Du står for ståstedet, Claude står for strukturen, og du gjør språket til ditt.",
          "en": "AI doesn't replace your strategy, it executes it faster. You bring the positioning, Claude handles the structure, and you refine the language into your own."
        }
      ],
      "tip": {
        "no": "🗓️ Tips: Legg de seks karusellene i en plan med én utlegging i uken. Da har du seks uker der innhold ikke er noe du må finne på om morgenen.",
        "en": "🗓️ Tip: Put the six carousels into a plan with one post a week. That gives you six weeks where content isn't something you have to invent in the morning."
      }
    },
    {
      "module": {
        "no": "Del 4 · Etter workshopen",
        "en": "Part 4 · After the workshop",
        "lock": "free"
      },
      "title": {
        "no": "Sett assistentene i drift",
        "en": "Put the assistants to work"
      },
      "body": [
        {
          "no": "**Mål:** Assistentene blir en rytme, ikke noe du gjorde en gang på en workshop.",
          "en": "**Goal:** The assistants become a rhythm, not something you did once at a workshop."
        },
        {
          "no": "## En uke med fem assistenter\n\nHver morgen: E-postassistenten sorterer og skriver utkast.\n\nMandag: Innholdsassistenten gjør ukens ideer om til innlegg.\n\nOnsdag: Podkastprodusenten finner vinklingen til neste episode.\n\nFredag: Regnskapsassistenten rydder i bilagene mens de er ferske.\n\nVed behov: designassistenten, hver gang noe skal presenteres.",
          "en": "## A week with five assistants\n\nEvery morning: the email assistant sorts and drafts.\n\nMonday: the content assistant turns the week's ideas into posts.\n\nWednesday: the podcast producer finds the angle for the next episode.\n\nFriday: the bookkeeping assistant tidies the receipts while they're fresh.\n\nAs needed: the design assistant, every time something has to be presented."
        },
        {
          "no": "Lagre hver prompt i sitt eget prosjekt i Claude, med et navn du kjenner igjen. En assistent du må lete etter, blir ikke brukt.",
          "en": "Save each prompt in its own project in Claude, with a name you recognise. An assistant you have to hunt for doesn't get used."
        },
        {
          "no": "Videre i LME Studio finner du verktøyene som tar over der assistentene slipper: LME Autopilot for reels, stories og karuseller, Kursbygger for dine egne kurs, og Blogg og Podkast for det lengre innholdet. Alt ligger i [LME Studio](https://lmexplorers.com/creative-academy).",
          "en": "Further into LME Studio you'll find the tools that take over where the assistants leave off: LME Autopilot for reels, stories and carousels, the course builder for your own classes, and Blog and Podcast for longer content. It's all in [LME Studio](https://lmexplorers.com/creative-academy)."
        }
      ],
      "tip": {
        "no": "📝 Oppgave: Sett de fem faste tidspunktene i kalenderen din nå, med navnet på assistenten i tittelen. Rytmen er det eneste som skiller en workshop fra en endring.",
        "en": "📝 Task: Put the five fixed slots in your calendar now, with the assistant's name in the title. The rhythm is the only thing separating a workshop from a change."
      }
    },
    {
      "module": null,
      "title": {
        "no": "Din egen assistentplan",
        "en": "Your own assistant plan"
      },
      "body": [
        {
          "no": "**Mål:** Du vet hvilken assistent du ansetter som nummer seks, og når.",
          "en": "**Goal:** You know which assistant you're hiring as number six, and when."
        },
        {
          "no": "Du har nå fem assistenter i arbeid, en stemme Claude kjenner, og seks karuseller som ligger klare. Det tok en kveld eller tre, ikke måneder med opplæring.",
          "en": "You now have five assistants at work, a voice Claude knows, and six carousels ready to go. It took an evening or three, not months of training."
        },
        {
          "no": "## De tre linjene, en gang til\n\nDEN FÅR: hva du gir den, hver gang.\n\nDEN GJØR: hva som skal komme ut, helt konkret.\n\nDEN SPARER MEG: hva du får igjen, i tid eller i irritasjon.\n\nDet er hele oppskriften. Alt annet i denne workshopen er eksempler på den.",
          "en": "## The three lines, once more\n\nIT GETS: what you hand it, every time.\n\nIT DOES: what should come out, in concrete terms.\n\nIT SAVES ME: what you get back, in time or in frustration.\n\nThat's the whole recipe. Everything else in this workshop is an example of it."
        },
        {
          "no": "Assistentene tar aldri over faget ditt. De tar over alt som ligger rundt, slik at du får tiden tilbake til det du faktisk startet for.",
          "en": "The assistants never take over your craft. They take over everything around it, so you get your time back for what you actually started this for."
        }
      ],
      "tip": {
        "no": "📝 Siste oppgave: Skriv de tre linjene for assistent nummer seks, den du selv trenger mest, og sett den i arbeid før uken er omme.",
        "en": "📝 Final task: Write the three lines for assistant number six, the one you need most yourself, and put it to work before the week is over."
      }
    }
  ],
  "outro": {
    "title": {
      "no": "Du har fem assistenter i arbeid",
      "en": "You have five assistants at work"
    },
    "text": {
      "no": "Du kom hit med en uke som var for full, og går ut med fem faste assistenter, en stemme Claude kjenner igjen, og seks karuseller klare til å legges ut. Neste steg er å la verktøyene i LME Studio ta over der assistentene slipper.",
      "en": "You came here with a week that was too full, and you leave with five permanent assistants, a voice Claude recognises, and six carousels ready to publish. The next step is letting the tools in LME Studio take over where the assistants leave off."
    },
    "cta": {
      "label": {
        "no": "Gå til LME Studio →",
        "en": "Go to LME Studio →"
      },
      "href": "/creative-academy"
    }
  }
};
