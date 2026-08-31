/* =====================================================================
   LME Momentum — innholdet i den elleve dager lange reisen
   ---------------------------------------------------------------------
   Én dag om gangen: en tekst å lese eller høre, noen spørsmål å skrive
   på, og en knapp som fullfører dagen. Dag 1 og dag 11 spør om det samme
   tallet, så medlemmet ser sin egen endring svart på hvitt.

   Alt innhold ligger her, slik at Renate kan endre tekst uten å røre
   selve appen. Legger du til eller fjerner en dag, retter appen seg
   etter det av seg selv, den teller dagene i denne lista.

   Feltene per dag:
     skifte    hvilken av de fem delene dagen hører til
     tittel    navnet på dagen
     ingress   den korte teksten på forsiden ("dagens aktivering")
     tekst     selve innholdet, ett avsnitt per element
     journal   spørsmålene å skrive på
     lyd       valgfri lydfil. Står den tom, vises bare teksten, og
               appen ser hel ut. Renate kan spille inn senere.
     maaling   valgfritt spørsmål med tall fra 0 til 10. Brukes på dag 1
               (utgangspunkt) og dag 11 (samme spørsmål igjen).
   ===================================================================== */

window.LME_MOMENTUM = {
  navn: { no: "LME Momentum", en: "LME Momentum" },
  tittel: {
    no: "Elleve dager som setter deg i gang",
    en: "Eleven days to get you moving",
  },
  ingress: {
    no: "En liten ting hver dag, i elleve dager. Du trenger ikke være ferdig utlært, og du trenger ikke gjøre alt på en gang. Du trenger bare å begynne.",
    en: "One small thing each day, for eleven days. You do not need to know everything first, and you do not need to do it all at once. You only need to begin.",
  },

  skifter: [
    { id: "retning", navn: { no: "Retning", en: "Direction" } },
    { id: "grunnmur", navn: { no: "Grunnmuren", en: "The foundation" } },
    { id: "synlighet", navn: { no: "Synlighet", en: "Visibility" } },
    { id: "salg", navn: { no: "Salg", en: "Selling" } },
    { id: "videre", navn: { no: "Videre", en: "Onwards" } },
  ],

  dager: [
    {
      skifte: "retning",
      tittel: { no: "Hvorfor du er her", en: "Why you are here" },
      ingress: {
        no: "Vi begynner med det ærligste spørsmålet: hva er det du egentlig vil ha mer av? Ikke målet du tror du burde ha, men det du kjenner når du er alene med tanken.",
        en: "We start with the most honest question: what do you actually want more of? Not the goal you think you should have, but the one you feel when you are alone with the thought.",
      },
      tekst: {
        no: [
          "De fleste starter med en plan. Jeg vil at du skal starte med et ønske, for planen blir aldri bedre enn ønsket den skal tjene.",
          "Da jeg begynte med LME, hadde jeg ingen strategi. Jeg hadde en følelse av at det måtte gå an å bygge noe eget, i mitt eget tempo, uten å måtte være en annen enn den jeg er. Alt det andre kom etterpå.",
          "I dag skal du ikke bestemme deg for noe. Du skal bare si det høyt, eller skrive det ned, som er nesten det samme. Hva vil du ha mer av om et år? Mer tid? Mer ro? En inntekt som er din egen? Noe å være stolt av?",
          "Og så tar du et tall på hvor du står nå. Ikke for å dømme deg selv, men fordi du skal se det samme tallet igjen på dag elleve. Det er den eneste målingen som betyr noe: din egen, fra der du faktisk startet.",
        ],
        en: [
          "Most people start with a plan. I want you to start with a wish, because the plan never gets better than the wish it serves.",
          "When I started LME, I had no strategy. I had a feeling that it had to be possible to build something of my own, at my own pace, without having to be someone other than who I am. Everything else came afterwards.",
          "Today you are not deciding anything. You are just saying it out loud, or writing it down, which is almost the same thing. What do you want more of a year from now? More time? More calm? An income that is your own? Something to be proud of?",
          "And then you put a number on where you stand now. Not to judge yourself, but because you will see that same number again on day eleven. It is the only measurement that matters: your own, from where you actually started.",
        ],
      },
      journal: {
        no: [
          "Hva vil du ha mer av om et år? Skriv det som om ingen andre skal lese det.",
          "Hva er det som holder deg igjen akkurat nå? Vær ærlig, det er bare du som ser dette.",
        ],
        en: [
          "What do you want more of a year from now? Write it as if no one else will read it.",
          "What is holding you back right now? Be honest, you are the only one who sees this.",
        ],
      },
      maaling: {
        no: "Hvor nær er du det livet du vil ha, akkurat nå?",
        en: "How close are you to the life you want, right now?",
      },
      lyd: "",
    },

    {
      skifte: "retning",
      tittel: { no: "Gi deg selv lov", en: "Give yourself permission" },
      ingress: {
        no: "Det er ikke evner du mangler, det er tillatelse. I dag ser vi på hvem du egentlig venter på at skal si ja.",
        en: "It is not ability you are missing, it is permission. Today we look at who you are actually waiting for to say yes.",
      },
      tekst: {
        no: [
          "Mange venter på et slags klarsignal. At noen skal si at nå er du god nok, nå kan du begynne. Det klarsignalet kommer aldri utenfra, og det er faktisk en god nyhet, for da slipper du å vente på det.",
          "Jeg utsatte LME i lang tid fordi jeg tenkte at jeg måtte kunne mer først. Så oppdaget jeg noe: den som er ett steg foran, er den beste læreren. Ikke eksperten som har glemt hvordan det var å ikke vite noe.",
          "Du kan det du kan. Det er nok for noen, og de noen er akkurat dem du skal hjelpe.",
          "I dag skal du legge merke til hvor ofte du sier \"ikke ennå\" til deg selv i løpet av en dag. Bare legge merke til det, ikke rette på det. Det holder for i dag.",
        ],
        en: [
          "Many people are waiting for some kind of green light. For someone to say that now you are good enough, now you can start. That green light never comes from outside, and that is actually good news, because then you do not have to wait for it.",
          "I put LME off for a long time because I thought I had to know more first. Then I discovered something: the person one step ahead is the best teacher. Not the expert who has forgotten what it was like to know nothing.",
          "You know what you know. That is enough for someone, and those someones are exactly the people you are meant to help.",
          "Today you are going to notice how often you say \"not yet\" to yourself over the course of a day. Just notice it, do not correct it. That is enough for today.",
        ],
      },
      journal: {
        no: [
          "Hvem venter du på at skal si at du er klar?",
          "Hva ville du gjort denne uken hvis du visste at ingen kom til å le?",
        ],
        en: [
          "Who are you waiting for to tell you that you are ready?",
          "What would you do this week if you knew no one was going to laugh?",
        ],
      },
      lyd: "",
    },

    {
      skifte: "retning",
      tittel: { no: "Hvem du hjelper", en: "Who you help" },
      ingress: {
        no: "Du kan ikke snakke til alle. I dag velger du én person, og fra nå av skriver du alt til henne.",
        en: "You cannot speak to everyone. Today you choose one person, and from now on you write everything to her.",
      },
      tekst: {
        no: [
          "Det vanligste rådet er å finne en nisje. Jeg liker et mildere ord: velg en person.",
          "Ikke en målgruppe med alder og inntekt, men et menneske du kan se for deg. Kanskje er det deg selv for tre år siden. Det er ofte det beste svaret, for da vet du nøyaktig hva hun trenger å høre, og du slipper å gjette.",
          "Når du skriver til én, kjenner mange seg igjen. Når du skriver til alle, kjenner ingen seg igjen. Det er hele hemmeligheten, og den er lettere å bruke enn den er å tro på.",
          "Gi henne et navn i dag. Det høres rart ut, men det virker. Neste gang du skal skrive noe, skriver du til henne, ikke ut i lufta.",
        ],
        en: [
          "The most common advice is to find a niche. I prefer a gentler word: choose one person.",
          "Not a target group with an age and an income, but a human being you can picture. Maybe it is you three years ago. That is often the best answer, because then you know exactly what she needs to hear, and you do not have to guess.",
          "When you write to one, many recognise themselves. When you write to everyone, no one does. That is the whole secret, and it is easier to use than it is to believe.",
          "Give her a name today. It sounds odd, but it works. Next time you write something, you write to her, not out into the air.",
        ],
      },
      journal: {
        no: [
          "Hvem er hun? Skriv noen setninger om henne, som om du beskrev en venn.",
          "Hva ligger hun våken og tenker på?",
          "Hva ville hun betalt for å slippe?",
        ],
        en: [
          "Who is she? Write a few sentences about her, as if you were describing a friend.",
          "What does she lie awake thinking about?",
          "What would she pay to be free of?",
        ],
      },
      lyd: "",
    },

    {
      skifte: "grunnmur",
      tittel: { no: "Det du allerede kan", en: "What you already know" },
      ingress: {
        no: "Du sitter på mer enn du tror. I dag graver vi det fram, og du får se det skrevet ned.",
        en: "You are sitting on more than you think. Today we dig it out, and you get to see it written down.",
      },
      tekst: {
        no: [
          "Det du kan best, er som regel det du har sluttet å legge merke til. Det føles ikke som kunnskap, det føles bare som deg.",
          "Jeg trodde lenge at det jeg kunne om Montessori var helt vanlig. Så begynte folk å spørre, og da forsto jeg at det som er selvsagt for meg, kan være helt nytt for andre.",
          "I dag lager du en liste. Alt du har lært deg, alt folk spør deg om, alt du har løst for deg selv. Ikke sorter, ikke vurder, bare skriv. Det kommer alltid mer enn du tror når du gir deg selv ti minutter.",
          "Et sted i den lista ligger ditt første produkt. Du trenger ikke se hvor ennå.",
        ],
        en: [
          "What you are best at is usually what you have stopped noticing. It does not feel like knowledge, it just feels like you.",
          "For a long time I thought what I knew about Montessori was completely ordinary. Then people started asking, and I understood that what is obvious to me can be brand new to someone else.",
          "Today you make a list. Everything you have taught yourself, everything people ask you about, everything you have solved for yourself. Do not sort it, do not judge it, just write. There is always more than you think once you give yourself ten minutes.",
          "Somewhere in that list is your first product. You do not need to see where yet.",
        ],
      },
      journal: {
        no: [
          "Hva spør folk deg om?",
          "Hva har du løst for deg selv som andre fortsatt sliter med?",
          "Hva kunne du forklart noen på ti minutter, uten å forberede deg?",
        ],
        en: [
          "What do people ask you about?",
          "What have you solved for yourself that others still struggle with?",
          "What could you explain to someone in ten minutes, without preparing?",
        ],
      },
      lyd: "",
    },

    {
      skifte: "grunnmur",
      tittel: { no: "Ditt første lille produkt", en: "Your first small product" },
      ingress: {
        no: "Ikke det store kurset. Den lille tingen som løser ett problem, og som du kan bli ferdig med denne uken.",
        en: "Not the big course. The small thing that solves one problem, and that you can finish this week.",
      },
      tekst: {
        no: [
          "Den vanligste feilen er å begynne for stort. Et helt kurs, en hel bok, en hel plattform. Så blir det aldri ferdig, og etter noen måneder føles hele ideen litt flau.",
          "Begynn med en ting som løser ett problem. En sjekkliste, en mal, en kort guide, ett lite verktøy. Noe som tar deg noen timer, ikke noen måneder.",
          "Det lille produktet gjør to jobber. Det lærer deg hele veien fra idé til betaling, i lite format der det ikke gjør vondt å bomme. Og det gir deg de første kjøperne, som er de eneste som kan fortelle deg hva de egentlig vil ha.",
          "Velg én ting fra lista di i går. Bare én. Den beste ideen er den du kan bli ferdig med.",
        ],
        en: [
          "The most common mistake is starting too big. A whole course, a whole book, a whole platform. Then it never gets finished, and after a few months the whole idea feels a little embarrassing.",
          "Start with one thing that solves one problem. A checklist, a template, a short guide, one small tool. Something that takes you a few hours, not a few months.",
          "The small product does two jobs. It teaches you the whole road from idea to payment, in a small format where getting it wrong does not hurt. And it gives you your first buyers, who are the only ones who can tell you what they actually want.",
          "Choose one thing from yesterday's list. Only one. The best idea is the one you can finish.",
        ],
      },
      journal: {
        no: [
          "Hvilken ting velger du? Skriv den i én setning.",
          "Hva er det minste den kan være og fortsatt være til hjelp?",
          "Når er den ferdig? Sett en dato.",
        ],
        en: [
          "Which thing do you choose? Write it in one sentence.",
          "What is the smallest it can be and still be useful?",
          "When is it finished? Set a date.",
        ],
      },
      lyd: "",
    },

    {
      skifte: "synlighet",
      tittel: { no: "Å bli sett uten å rope", en: "Being seen without shouting" },
      ingress: {
        no: "Du trenger ikke bli en annen på nett. I dag ser vi på hvordan du blir synlig som deg selv.",
        en: "You do not need to become someone else online. Today we look at how you become visible as yourself.",
      },
      tekst: {
        no: [
          "Mange tror synlighet betyr å bli høyest i rommet. Det er én måte, og det er ikke min.",
          "Den som deler det hun holder på med, jevnt og roligt, blir husket. Den som roper en gang i måneden, blir ikke det. Det er ikke volum som teller, det er at du er der igjen i morgen.",
          "Del prosessen, ikke bare resultatet. Ingen har lyst til å se en ferdig fasade, men mange kjenner seg igjen i noen som holder på med noe.",
          "I dag velger du én kanal. Bare én. Den du faktisk orker å åpne. Alle de andre kan vente til denne går av seg selv.",
        ],
        en: [
          "Many people think visibility means being the loudest in the room. That is one way, and it is not mine.",
          "The person who shares what she is working on, steadily and calmly, gets remembered. The person who shouts once a month does not. It is not volume that counts, it is that you are there again tomorrow.",
          "Share the process, not just the result. Nobody wants to look at a finished facade, but plenty of people recognise themselves in someone who is in the middle of something.",
          "Today you choose one channel. Only one. The one you can actually face opening. All the others can wait until this one runs by itself.",
        ],
      },
      journal: {
        no: [
          "Hvilken kanal velger du, og hvorfor akkurat den?",
          "Hva er du redd for at folk skal tenke? Skriv det ned, det blir mindre av å bli sett.",
        ],
        en: [
          "Which channel do you choose, and why that one?",
          "What are you afraid people will think? Write it down, it gets smaller once it is seen.",
        ],
      },
      lyd: "",
    },

    {
      skifte: "synlighet",
      tittel: { no: "Én ting om dagen", en: "One thing a day" },
      ingress: {
        no: "Ikke ti innlegg på søndag og så stille i tre uker. I dag lager vi en rytme du klarer å holde.",
        en: "Not ten posts on Sunday and then silence for three weeks. Today we build a rhythm you can actually keep.",
      },
      tekst: {
        no: [
          "Alt som er avhengig av at du er i form, ryker første dårlige uke. Derfor bygger vi rytmen for den dårlige uken, ikke for den gode.",
          "Spør deg selv hva du klarer på en dag der ingenting går som det skal. Er svaret ett innlegg i uken, så er det rytmen din. Ett innlegg i uken i et år er femtito innlegg. Ti innlegg på en søndag i januar er ti innlegg.",
          "Sett rytmen lavere enn du tror du klarer. Det er lettere å øke enn å ta igjen.",
          "Og la verktøyene ta det de kan. Du skal bruke hodet på hva du sier, ikke på å huske når du skal si det.",
        ],
        en: [
          "Anything that depends on you being in good form breaks the first bad week. So we build the rhythm for the bad week, not the good one.",
          "Ask yourself what you can manage on a day when nothing goes to plan. If the answer is one post a week, then that is your rhythm. One post a week for a year is fifty two posts. Ten posts on a Sunday in January is ten posts.",
          "Set the rhythm lower than you think you can manage. It is easier to increase than to catch up.",
          "And let the tools take what they can. Your head should go into what you say, not into remembering when to say it.",
        ],
      },
      journal: {
        no: [
          "Hva klarer du på en dårlig uke? Det er rytmen din.",
          "Hva er det første du dropper når det blir travelt? Kan noe annet ta den jobben?",
        ],
        en: [
          "What can you manage in a bad week? That is your rhythm.",
          "What is the first thing you drop when things get busy? Could something else take that job?",
        ],
      },
      lyd: "",
    },

    {
      skifte: "salg",
      tittel: { no: "Å ta betalt", en: "Charging for it" },
      ingress: {
        no: "Dagen de fleste hopper over. I dag ser vi på hvorfor det er så vondt å sette en pris, og hva du gjør med det.",
        en: "The day most people skip. Today we look at why setting a price hurts so much, and what to do about it.",
      },
      tekst: {
        no: [
          "Det er ikke prisen som er vanskelig. Det er tanken på at noen skal se prisen og synes den er for høy, og at det egentlig betyr at du er for lite verdt.",
          "Men prisen sier ingenting om deg. Den sier hva ting koster, og hva det er verdt for den som kjøper. Det er to helt andre regnestykker enn ditt eget verd.",
          "En pris som er for lav, gjør faktisk vondt verre. Den gir deg kjøpere som ikke bruker det de kjøpte, og den gjør at du må selge mye mer for å komme noen vei. Billig er ikke snilt.",
          "Sett en pris i dag. Ikke den endelige, bare en. Du kan endre den senere, det gjør alle. Poenget er å ha en, så det finnes noe å kjøpe.",
        ],
        en: [
          "It is not the price that is hard. It is the thought of someone seeing the price, thinking it is too high, and that really meaning you are worth too little.",
          "But the price says nothing about you. It says what things cost, and what it is worth to the person buying. Those are two entirely different sums from your own worth.",
          "A price that is too low actually makes things worse. It gives you buyers who never use what they bought, and it means you have to sell far more to get anywhere. Cheap is not kind.",
          "Set a price today. Not the final one, just one. You can change it later, everyone does. The point is to have one, so that there is something to buy.",
        ],
      },
      journal: {
        no: [
          "Hva koster det du lager? Skriv et tall, uten å forklare det bort.",
          "Hva er det verdt for henne du skriver til, hvis det virker?",
          "Hva sier du til deg selv om penger som du egentlig ikke tror på?",
        ],
        en: [
          "What does what you make cost? Write a number, without explaining it away.",
          "What is it worth to the person you write to, if it works?",
          "What do you tell yourself about money that you do not actually believe?",
        ],
      },
      lyd: "",
    },

    {
      skifte: "salg",
      tittel: { no: "Den første kjøperen", en: "The first buyer" },
      ingress: {
        no: "Den første er den vanskeligste, og den eneste som virkelig teller. I dag rydder vi veien for henne.",
        en: "The first one is the hardest, and the only one that truly counts. Today we clear the way for her.",
      },
      tekst: {
        no: [
          "Det er stor forskjell på null kjøpere og én kjøper. Fra én til hundre er bare mer av det samme, men fra null til én skjer det noe i hodet ditt som ingen kan fortelle deg om på forhånd.",
          "Derfor er hele jobben nå å gjøre det lett å si ja. Én tydelig knapp, én tydelig pris, én tydelig setning om hva hun får. Alt annet kan vente.",
          "Og så må hun faktisk få vite at det finnes. Det er her de fleste stopper: produktet er ferdig, men ingen har hørt om det. Å fortelle om noe du har laget, er ikke mas. Det er informasjon.",
          "I dag skriver du de setningene. Ikke lag noe nytt, bare gjør det som finnes lett å forstå og lett å kjøpe.",
        ],
        en: [
          "There is a huge difference between zero buyers and one buyer. From one to a hundred is just more of the same, but from zero to one something happens in your head that nobody can describe to you in advance.",
          "So the whole job now is to make it easy to say yes. One clear button, one clear price, one clear sentence about what she gets. Everything else can wait.",
          "And she has to actually find out that it exists. This is where most people stop: the product is finished, but nobody has heard of it. Telling people about something you made is not nagging. It is information.",
          "Today you write those sentences. Do not make anything new, just make what exists easy to understand and easy to buy.",
        ],
      },
      journal: {
        no: [
          "Hva får hun, sagt i én setning?",
          "Hvor skal hun trykke? Er det tydelig nok?",
          "Hvem er de fem første du kan fortelle om det?",
        ],
        en: [
          "What does she get, in one sentence?",
          "Where does she click? Is it clear enough?",
          "Who are the first five people you can tell about it?",
        ],
      },
      lyd: "",
    },

    {
      skifte: "videre",
      tittel: { no: "Rytmen som holder", en: "The rhythm that lasts" },
      ingress: {
        no: "De som lykkes er sjelden de flinkeste. Det er de som fortsatt holder på når de andre har gitt seg.",
        en: "The ones who succeed are rarely the most talented. They are the ones still going when everyone else has stopped.",
      },
      tekst: {
        no: [
          "Nesten alle klarer to uker. Det er måned tre som skiller, den måneden der det ikke har skjedd noe ennå og ingen ser hva du holder på med.",
          "Det som bærer deg gjennom den måneden, er ikke motivasjon. Det er en rytme som er så liten at den overlever en dårlig dag, og noe som minner deg på hvor langt du faktisk har kommet.",
          "Derfor skal du skrive ned seirene dine, også de små. Den første kommentaren, den første påmeldingen, den første kroner du tjente selv. Om tre måneder husker du dem ikke hvis du ikke skrev dem ned, og da føles det som om ingenting har skjedd, selv om mye har det.",
          "I dag setter du rytmen for de neste tre månedene. En ting du gjør fast, og et sted du fører seirene.",
        ],
        en: [
          "Almost everyone manages two weeks. It is month three that separates people, the month where nothing has happened yet and nobody can see what you are doing.",
          "What carries you through that month is not motivation. It is a rhythm small enough to survive a bad day, and something that reminds you how far you have actually come.",
          "So write down your wins, the small ones too. The first comment, the first sign up, the first krone you earned yourself. In three months you will not remember them if you did not write them down, and then it feels like nothing has happened, even though plenty has.",
          "Today you set the rhythm for the next three months. One thing you do regularly, and one place where you keep the wins.",
        ],
      },
      journal: {
        no: [
          "Hva gjør du fast de neste tre månedene? Én ting.",
          "Hvilken seier har du allerede hatt, som du ikke har regnet med?",
        ],
        en: [
          "What will you do regularly for the next three months? One thing.",
          "Which win have you already had, that you have not been counting?",
        ],
      },
      lyd: "",
    },

    {
      skifte: "videre",
      tittel: { no: "Slik ser året ditt ut nå", en: "This is what your year looks like now" },
      ingress: {
        no: "Siste dag. Du svarer på det samme spørsmålet som på dag én, og så ser du forskjellen selv.",
        en: "The last day. You answer the same question as on day one, and then you see the difference for yourself.",
      },
      tekst: {
        no: [
          "Elleve dager er ikke lang tid. Du har ikke bygget et imperium, og det var heller aldri meningen.",
          "Men noe har flyttet seg. Du vet hvem du skriver til, du vet hva du lager først, du har satt en pris, og du har en rytme. Det er faktisk hele grunnmuren, og de fleste kommer aldri så langt fordi de venter på å være sikre først.",
          "Nå svarer du på det samme spørsmålet som på dag én. Ikke tenk på hva du svarte da, bare svar ærlig i dag. Tallet er ditt alene, og det eneste det sammenlignes med, er deg selv for elleve dager siden.",
          "Og så fortsetter du. Ikke med alt, bare med den ene tingen du skrev i går. Det er sånn det bygges.",
        ],
        en: [
          "Eleven days is not a long time. You have not built an empire, and that was never the point.",
          "But something has moved. You know who you are writing to, you know what you are making first, you have set a price, and you have a rhythm. That is actually the whole foundation, and most people never get this far because they are waiting to be certain first.",
          "Now you answer the same question as on day one. Do not think about what you answered then, just answer honestly today. The number is yours alone, and the only thing it is compared with is you, eleven days ago.",
          "And then you carry on. Not with everything, just with the one thing you wrote yesterday. That is how it gets built.",
        ],
      },
      journal: {
        no: [
          "Hva er annerledes nå enn på dag én?",
          "Hva er det aller neste steget ditt, og når tar du det?",
        ],
        en: [
          "What is different now compared with day one?",
          "What is your very next step, and when will you take it?",
        ],
      },
      maaling: {
        no: "Hvor nær er du det livet du vil ha, akkurat nå?",
        en: "How close are you to the life you want, right now?",
      },
      lyd: "",
    },
  ],
};
