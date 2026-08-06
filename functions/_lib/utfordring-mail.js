/**
 * 10 000-visninger-utfordringen — automatiske e-poster via MailerSend.
 *
 * Sender hele 30-dagers-serien rett fra plattformen, samme mønster som
 * Claude-kurset (_lib/claude-mail.js). Ingen MailerLite-automasjon eller
 * -redigering nødvendig, alt ligger som HTML-tekst her i koden.
 *
 * Ekte daglig serie: én e-post per dag i 30 dager (d1 til d30), pluss
 * velkomstmailen (d0) med en gang man blir med. De fleste dagene er en
 * fem-minutters-oppgave med en kort forklaring på hvorfor den er nyttig
 * (simpleDay), noen få er lengre, ukentlige oppsummeringer (d7, d14, d21,
 * d30), som også har en myk nevning av Inner Circle som neste steg for
 * de som vil ha tettere støtte (mersalg, aldri en teknisk sammenblanding
 * med selve utfordringen).
 *
 * Bruker samme MAILERSEND_API_KEY-hemmelighet som Claude-kurset allerede
 * har i Cloudflare, ingen nytt oppsett trengs.
 */

const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "renate@lmexplorers.com";
const FROM_NAME = "Renate Dahl";
const FELLESSKAP = SITE + "/utfordringen-fellesskap";
const MEDLEMSKAP = SITE + "/medlemskap";

function btn(href, label) {
  return '<p style="margin:22px 0;"><a href="' + href + '" style="background:#E91E89;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:999px;display:inline-block;">' + label + '</a></p>';
}

function ps(text) {
  return '<p style="font-size:13px;color:#938E99;margin-top:18px;border-top:1px solid #F0E7EC;padding-top:14px;">' + text + '</p>';
}

function wrap(inner) {
  return '<!DOCTYPE html><html><body style="margin:0;background:#FBF7F0;font-family:Arial,Helvetica,sans-serif;color:#1F1B24;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7F0;padding:24px 0;"><tr><td align="center">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;">' +
    '<tr><td style="padding:28px 32px 6px;text-align:center;"><img src="' + SITE + '/images/lme-logo.png" alt="Little Montessori Explorers" width="120" style="width:120px;height:auto;"></td></tr>' +
    '<tr><td style="padding:6px 32px 30px;font-size:16px;line-height:1.65;color:#3a343f;">' + inner + '</td></tr>' +
    '</table>' +
    '<div style="max-width:560px;color:#938E99;font-size:12px;padding:16px;">Little Montessori Explorers · Renate Dahl · Tønsberg</div>' +
    '</td></tr></table></body></html>';
}

const PS_NO = 'P.S. Vil du ha enda tettere støtte, og flere folk å dele fremgangen med underveis? <a href="' + MEDLEMSKAP + '" style="color:#E91E89;">Inner Circle</a> er neste steg når du er klar for det.';
const PS_EN = 'P.S. Want even closer support, and more people to share your progress with along the way? <a href="' + MEDLEMSKAP + '" style="color:#E91E89;">Inner Circle</a> is the next step when you\'re ready for it.';

function exampleBox(text) {
  return '<p style="background:#FBF0F5;border-left:3px solid #E91E89;padding:10px 14px;border-radius:8px;font-size:14.5px;color:#5a4750;margin:14px 0;"><strong>Eksempel: </strong>' + text + '</p>';
}
function exampleBoxEn(text) {
  return '<p style="background:#FBF0F5;border-left:3px solid #E91E89;padding:10px 14px;border-radius:8px;font-size:14.5px;color:#5a4750;margin:14px 0;"><strong>Example: </strong>' + text + '</p>';
}

/* Enkel dag: ett avsnitt med dagens fem-minutters-oppgave, en kort
   forklaring på hvorfor den er nyttig, og et konkret eksempel, samme
   oppbygning på alle slike dager (bare teksten er unik per dag). Samme
   myke Inner Circle-nevning som milepæl-dagene, så alle 30 dagene har
   like mye innhold, ikke bare de 6 opprinnelige. */
function simpleDay(day, no, en) {
  return {
    no: () => ({
      subject: "Dag " + day + ": " + no.subject,
      html: wrap('<p>' + no.body + '</p>' + exampleBox(no.example) + '<p>Klem fra Renate, LME 💛</p>' + ps(PS_NO)),
      text: "Dag " + day + ": " + no.body + "\n\nEksempel: " + no.example + "\n\nKlem fra Renate, LME",
    }),
    en: () => ({
      subject: "Day " + day + ": " + en.subject,
      html: wrap('<p>' + en.body + '</p>' + exampleBoxEn(en.example) + '<p>Love, Renate, LME 💛</p>' + ps(PS_EN)),
      text: "Day " + day + ": " + en.body + "\n\nExample: " + en.example + "\n\nLove, Renate, LME",
    }),
  };
}

const SIMPLE_DAYS = [
  simpleDay(2,
    { subject: "finn målgruppen din", body: "I dag bruker du fem minutter på å beskrive én bestemt person i målgruppen din. Hva bryr hun seg om, og hva sliter hun med akkurat nå? Snakk som om du skriver et brev til henne, ikke til alle på én gang.", example: "en trøtt mamma til en toåring, som vil ha råd hun faktisk rekker å bruke." },
    { subject: "find your audience", body: "Today, spend five minutes describing one specific person in your audience. What does she care about, and what is she struggling with right now? Write as if you're speaking directly to her, not to everyone at once.", example: "a tired mum of a two-year-old, who wants advice she'll actually have time to use." }),
  simpleDay(4,
    { subject: "velg hovedplattformen din", body: "I dag bruker du fem minutter på å velge én plattform å fokusere på denne måneden. Der målgruppen din allerede er, er der du bør være. Du kan alltid utvide til flere plattformer senere, når den første sitter.", example: "Instagram Reels, hvis målgruppen din helst scroller der." },
    { subject: "pick your main platform", body: "Today, spend five minutes picking one platform to focus on this month. Wherever your audience already is, that's where you should be. You can always expand to more platforms later, once the first one is working.", example: "Instagram Reels, if that's where your audience scrolls the most." }),
  simpleDay(5,
    { subject: "studer tre skapere du liker", body: "I dag bruker du fem minutter på å se på tre skapere innenfor nisjen din. Hva gjør innholdet deres bra? Skriv ned tre observasjoner. Du skal ikke kopiere dem, bare forstå hvorfor det fungerer.", example: "Legg merke til hvordan de åpner videoene sine, det er sjelden tilfeldig." },
    { subject: "study three creators you like", body: "Today, spend five minutes looking at three creators in your niche. What makes their content work? Write down three observations. You're not copying them, just understanding why it works.", example: "Notice how they open their videos, it's rarely an accident." }),
  simpleDay(6,
    { subject: "lag et utkast, ikke publiser ennå", body: "I dag bruker du fem minutter på å skrive et utkast til innlegget ditt. Ikke publiser det ennå, bare få ideen ut av hodet og ned på papiret. Et ferdig utkast slår et perfekt innlegg som aldri blir skrevet.", example: "Skriv gjerne bare stikkord først, fullstendige setninger kan komme senere." },
    { subject: "make a draft, don't publish yet", body: "Today, spend five minutes writing a draft of your post. Don't publish it yet, just get the idea out of your head and onto paper. A finished draft beats a perfect post that never gets written.", example: "Jot down keywords first if that's easier, full sentences can come later." }),
  simpleDay(8,
    { subject: "øv på en god åpning", body: "De første tre sekundene avgjør om noen blir eller scroller videre. I dag bruker du fem minutter på å skrive tre ulike åpningssetninger til samme innhold, og velger den beste. En god åpning stiller et løfte, resten av innlegget holder det.", example: '"Dette gjorde jeg feil i to år" fanger mer enn "hei, i dag skal jeg vise deg".' },
    { subject: "practice a strong opening", body: "The first three seconds decide whether someone stays or scrolls on. Today, spend five minutes writing three different opening lines for the same piece of content, and pick the strongest one. A strong opening makes a promise, the rest of the post keeps it.", example: '"I did this wrong for two years" grabs more attention than "hi, today I\'ll show you".' }),
  simpleDay(9,
    { subject: "planlegg flere innlegg i én økt", body: "I dag bruker du fem minutter på å skrive ned ideer til tre innlegg, ikke bare ett. Da har du noe å ta av resten av uken, selv på de travle dagene. Det er lettere å være kreativ når du ikke også må finne på noe fra bunnen hver dag.", example: "Tre overskrifter er nok akkurat nå, resten av innholdet kan du fylle inn etter hvert." },
    { subject: "plan several posts at once", body: "Today, spend five minutes writing down ideas for three posts, not just one. That way you have something to draw on for the rest of the week, even on the busy days. It's easier to be creative when you don't also have to start from scratch every day.", example: "Three headlines are enough for now, you can fill in the rest as you go." }),
  simpleDay(10,
    { subject: "la AI skjerpe teksten din", body: "I dag bruker du fem minutter på å lime inn teksten fra et av innleggene dine i et AI-verktøy, og be om en kortere, skarpere versjon. Behold din egen stemme, bare stram opp språket. AI er verktøyet, du er fortsatt den som bestemmer hva som skal sies.", example: '"Gjør denne teksten tretti prosent kortere, men behold tonen."' },
    { subject: "let AI sharpen your text", body: "Today, spend five minutes pasting the text from one of your posts into an AI tool, and ask for a shorter, sharper version. Keep your own voice, just tighten the language. AI is the tool, you're still the one who decides what gets said.", example: '"Make this text thirty percent shorter, but keep the tone."' }),
  simpleDay(11,
    { subject: "se på tallene dine", body: "I dag bruker du fem minutter på å se gjennom visninger og engasjement på det du har laget så langt. Hva forteller tallene deg om hva som fungerer? Tallene lyver aldri, selv når de ikke er det du håpet på.", example: "Se spesielt på hvor lenge folk blir, ikke bare hvor mange som ser." },
    { subject: "look at your numbers", body: "Today, spend five minutes looking through the views and engagement on what you've made so far. What do the numbers tell you about what's working? The numbers never lie, even when they're not what you hoped for.", example: "Look especially at how long people stay, not just how many see it." }),
  simpleDay(12,
    { subject: "snakk direkte til seeren", body: 'I dag bruker du fem minutter på å skrive teksten din som om du snakker til én person. Bruk "du", ikke "man" eller "de". Det gjør innholdet varmere, og lettere å kjenne seg igjen i.', example: '"Du trenger ikke gjøre alt riktig" slår "man trenger ikke gjøre alt riktig".' },
    { subject: "talk straight to the viewer", body: 'Today, spend five minutes rewriting your text as if you\'re talking to one single person. Use "you", not "people" or "one". It makes the content warmer, and easier to recognise yourself in.', example: '"You don\'t need to get everything right" lands better than "one doesn\'t need to get everything right".' }),
  simpleDay(13,
    { subject: "gjenbruk noe som fungerte", body: "I dag bruker du fem minutter på å finne innlegget ditt med mest respons, og lage en ny versjon av det. Det som fungerte én gang, fungerer ofte igjen. Det er ikke jugsing, det er å gi flere sjansen til å se det.", example: "Bytt ut eksemplet eller vinkelen, men behold strukturen som fungerte." },
    { subject: "reuse something that worked", body: "Today, spend five minutes finding your post with the most response, and making a new version of it. What worked once often works again. It's not cheating, it's giving more people the chance to see it.", example: "Swap the example or the angle, but keep the structure that worked." }),
  simpleDay(15,
    { subject: "publiser, selv om det ikke er perfekt", body: "I dag bruker du fem minutter på å publisere noe, selv om det ikke føles helt ferdig. Konsistens slår perfeksjon hver gang. Det innlegget du er mest usikker på, er ofte det som treffer best.", example: 'Det er lov å skrive det rett ut: "Dette er ikke perfekt, men jeg deler det uansett."' },
    { subject: "post it, even if it's not perfect", body: "Today, spend five minutes publishing something, even if it doesn't feel quite finished. Consistency beats perfection, every time. The post you're most unsure about is often the one that lands best.", example: 'It\'s fine to say it outright: "This isn\'t perfect, but I\'m sharing it anyway."' }),
  simpleDay(16,
    { subject: "les gjennom kommentarene dine", body: "I dag bruker du fem minutter på å lese gjennom tilbakemeldingene du har fått så langt. Hva spør folk om? Det er ofte ditt neste innlegg. Publikum forteller deg alltid hva de vil ha mer av, om du lytter.", example: "Spør tre personer om det samme, er det gjerne et tegn, ikke en tilfeldighet." },
    { subject: "read through your comments", body: "Today, spend five minutes reading through the feedback you've gotten so far. What are people asking about? That's often your next post. Your audience always tells you what they want more of, if you listen.", example: "If three people ask the same thing, that's usually a sign, not a coincidence." }),
  simpleDay(17,
    { subject: "nevn noen andre i nisjen din", body: "I dag bruker du fem minutter på å nevne eller tagge noen andre i nisjen din i et innlegg. Fellesskap slår konkurranse, og det åpner dører. De fleste svarer positivt på å bli lagt merke til.", example: 'Et enkelt "har du sett @..." er nok, det trenger ikke være stort.' },
    { subject: "mention someone else in your niche", body: "Today, spend five minutes mentioning or tagging someone else in your niche in a post. Community beats competition, and it opens doors. Most people respond well to being noticed.", example: 'A simple "have you seen @..." is enough, it doesn\'t need to be a big deal.' }),
  simpleDay(18,
    { subject: "fortell en liten personlig historie", body: "I dag bruker du fem minutter på å dele noe personlig knyttet til temaet ditt. Folk husker historier bedre enn råd. Du trenger ikke dele alt, bare nok til at det føles ekte.", example: "En liten detalj, som noe barnet ditt sa i går, er ofte nok." },
    { subject: "tell a small personal story", body: "Today, spend five minutes sharing something personal connected to your topic. People remember stories better than advice. You don't need to share everything, just enough for it to feel real.", example: "One small detail, like something your child said yesterday, is often enough." }),
  simpleDay(19,
    { subject: "test et nytt format", body: "I dag bruker du fem minutter på å planlegge noe i et format du ikke har prøvd før, video, karusell eller ren tekst. Du vet aldri hva som treffer før du tester. Den beste måten å finne formatet ditt på, er å prøve flere.", example: "Har du bare laget bilder til nå? Prøv en kort video denne gangen." },
    { subject: "try a new format", body: "Today, spend five minutes planning something in a format you haven't tried before, video, carousel or plain text. You never know what lands until you test it. The best way to find your format is to try several.", example: "Only made images so far? Try a short video this time." }),
  simpleDay(20,
    { subject: "rydd i profilen din", body: "I dag bruker du fem minutter på å sjekke bio og profilbilde. Viser de tydelig hva du driver med, og hvorfor noen bør følge deg? Dette er ofte det aller første noen ser, før de leser et eneste innlegg.", example: "Les bioen din høyt for deg selv, gir den mening på fem sekunder?" },
    { subject: "tidy up your profile", body: "Today, spend five minutes checking your bio and profile picture. Do they clearly show what you do, and why someone should follow you? This is often the very first thing someone sees, before reading a single post.", example: "Read your bio out loud, does it make sense in five seconds?" }),
  simpleDay(22,
    { subject: "planlegg tre ideer for neste uke", body: "I dag bruker du fem minutter på å skrive ned tre ideer for uken som kommer. Da slipper du å stå fast når det er tid for å lage innhold. Fem minutter nå sparer deg for en hel travel morgen senere.", example: "Skriv dem som stikkord, du trenger ikke ha alt utformet ennå." },
    { subject: "plan three ideas for next week", body: "Today, spend five minutes writing down three ideas for the week ahead. That way you won't get stuck when it's time to create. Five minutes now saves you a whole busy morning later.", example: "Write them as keywords, you don't need to have it all figured out yet." }),
  simpleDay(23,
    { subject: "still et spørsmål", body: "I dag bruker du fem minutter på å stille et konkret spørsmål i innlegget ditt. Spørsmål gir svar, og svar gir samtaler. Jo enklere spørsmålet, jo flere svarer.", example: '"Hva sliter du mest med akkurat nå?" er nok til å starte en samtale.' },
    { subject: "ask a question", body: "Today, spend five minutes asking a concrete question in your post. Questions get answers, and answers start conversations. The simpler the question, the more people answer.", example: '"What are you struggling with most right now?" is enough to start a conversation.' }),
  simpleDay(24,
    { subject: "finn din stemme", body: "I dag bruker du fem minutter på å skrive ned hva som gjør innholdet ditt annerledes enn andres i samme nisje. Det er stemmen din, ikke bare temaet, som folk husker. Det er lov å høres ut som deg selv, selv når andre gjør det annerledes.", example: "Er du den varme, den ærlige eller den humoristiske? Det er ofte tydeligere for andre enn for deg selv." },
    { subject: "find your voice", body: "Today, spend five minutes writing down what makes your content different from others in the same niche. It's your voice, not just the topic, that people remember. It's okay to sound like yourself, even when others do it differently.", example: "Are you the warm one, the honest one, or the funny one? It's often clearer to others than to yourself." }),
  simpleDay(25,
    { subject: "del en lærdom", body: "I dag bruker du fem minutter på å dele én ting du har lært om innhold denne måneden. Det du selv har lært, hjelper ofte andre lengst på vei. Du trenger ikke være ferdig lært for å dele det du vet så langt.", example: '"Jeg lærte at korte innlegg fungerer bedre for meg" er mer enn nok.' },
    { subject: "share a lesson", body: "Today, spend five minutes sharing one thing you've learned about content this month. What you've learned yourself often helps others the furthest. You don't need to be fully done learning to share what you know so far.", example: '"I learned that shorter posts work better for me" is more than enough.' }),
  simpleDay(26,
    { subject: "sammenlign med dag 1", body: "I dag bruker du fem minutter på å se tilbake på det aller første innlegget du laget i utfordringen. Se hvor langt du har kommet. Fremgang er lettest å se når du ser tilbake, ikke fremover.", example: "Legg merke til både innholdet og selvtilliten, begge deler har som regel vokst." },
    { subject: "compare with day 1", body: "Today, spend five minutes looking back at the very first post you made in the challenge. See how far you've come. Progress is easiest to see when you look back, not forward.", example: "Notice both the content and the confidence, both have usually grown." }),
  simpleDay(27,
    { subject: "inviter en venn med", body: "I dag bruker du fem minutter på å dele utfordringen med en venn som også ønsker å bli mer synlig. Det er lettere å holde ut sammen med noen. Det gjør også fellesskapet i utfordringen litt større.", example: '"Jeg gjør denne utfordringen, bli med?" er nok av en melding.' },
    { subject: "invite a friend", body: "Today, spend five minutes sharing the challenge with a friend who also wants to get more visible. It's easier to keep going together. It also makes the community in the challenge a little bigger.", example: '"I\'m doing this challenge, want to join?" is message enough.' }),
  simpleDay(28,
    { subject: "finn din beste dag", body: "I dag bruker du fem minutter på å finne innlegget som fikk mest respons denne måneden. Hvorfor tror du akkurat det fungerte? Det du finner der, kan du bruke om igjen resten av utfordringen.", example: "Var det tidspunktet, temaet eller formatet som gjorde forskjellen?" },
    { subject: "find your best day", body: "Today, spend five minutes finding the post that got the most response this month. Why do you think that one worked? What you find there, you can use again for the rest of the challenge.", example: "Was it the timing, the topic, or the format that made the difference?" }),
  simpleDay(29,
    { subject: "planlegg veien videre", body: "I dag bruker du fem minutter på å skrive ned hva du vil fortsette med etter utfordringen. De gode vanene er verdt å beholde. Utfordringen tar slutt om en dag, vanene dine trenger ikke å gjøre det.", example: "Kanskje det er selve rytmen, ikke bare innholdet, du vil beholde." },
    { subject: "plan the road ahead", body: "Today, spend five minutes writing down what you want to keep doing after the challenge. The good habits are worth keeping. The challenge ends in a day, your habits don't have to.", example: "Maybe it's the rhythm itself, not just the content, you want to keep." }),
];

const CONTENT = {
  no: {
    d0: () => ({
      subject: "Velkommen inn i utfordringen 🌸",
      html: wrap(
        '<p>Så glad jeg er for å ha deg med i 10 000-visninger-utfordringen. De neste 30 dagene viser jeg deg, fem minutter om dagen, hvordan du finner nisjen din, planlegger innhold med AI og lager noe som faktisk blir sett.</p>' +
        '<p>Du trenger ingen følgere, ingen erfaring og ikke noe dyrt utstyr. Bare fem minutter og litt vilje til å prøve.</p>' +
        '<p>Bli med i fellesskapet, der de andre som er med møtes og heier på hverandre:</p>' +
        btn(FELLESSKAP, "Bli med i fellesskapet") +
        '<p>Første oppgave kommer i morgen. Følg med i innboksen din.</p>' +
        '<p>Klem fra Renate, LME 💛</p>'
      ),
      text: "Så glad jeg er for å ha deg med i 10 000-visninger-utfordringen. Fem minutter om dagen i 30 dager. Bli med i fellesskapet: " + FELLESSKAP + " Første oppgave kommer i morgen.\n\nKlem fra Renate, LME",
    }),
    d1: () => ({
      subject: "Dag 1: finn nisjen din",
      html: wrap(
        '<p>I dag bruker du fem minutter på én ting: Skriv ned tre temaer du kan snakke om i timevis, uten å bli lei. Det er nisjen din.</p>' +
        '<p>Ikke tenk for mye. Den første tanken er ofte den riktige. Nisjen din trenger ikke være unik, den trenger bare å være ekte for deg, det er det som gjør at du holder ut når det blir travelt.</p>' +
        '<p>Klem fra Renate, LME 💛</p>' +
        ps(PS_NO)
      ),
      text: "Dag 1: Skriv ned tre temaer du kan snakke om i timevis, uten å bli lei. Det er nisjen din. Ikke tenk for mye, den første tanken er ofte den riktige.\n\nKlem fra Renate, LME",
    }),
    d3: () => ({
      subject: "Dag 3: la AI gjøre planleggingen",
      html: wrap(
        '<p>I dag bruker du fem minutter på å la et AI-verktøy du allerede har (Claude, ChatGPT eller lignende) foreslå tre innholdsideer innenfor nisjen din. Velg den du liker best.</p>' +
        '<p>Du trenger ikke starte fra et blankt ark. AI er godt til akkurat dette: å gi deg noe å reagere på, så du slipper å finne opp alt selv.</p>' +
        '<p>Klem fra Renate, LME 💛</p>' +
        ps(PS_NO)
      ),
      text: "Dag 3: La et AI-verktøy du allerede har foreslå tre innholdsideer innenfor nisjen din. Velg den du liker best. Du trenger ikke starte fra et blankt ark.\n\nKlem fra Renate, LME",
    }),
    d7: () => ({
      subject: "Dag 7: første uke i boks",
      html: wrap(
        '<p>Se tilbake på det du har laget så langt. Det trenger ikke være perfekt, det trenger bare å være ekte.</p>' +
        '<p>Denne uken: Lag ett innlegg til, og be gjerne noen du kjenner om ærlig tilbakemelding. Den første uken er ofte den tyngste, du har lagt grunnmuren nå.</p>' +
        '<p>Klem fra Renate, LME 💛</p>' +
        ps(PS_NO)
      ),
      text: "Dag 7: Se tilbake på det du har laget så langt. Denne uken: Lag ett innlegg til, og be om ærlig tilbakemelding. Den første uken er ofte den tyngste.\n\nKlem fra Renate, LME",
    }),
    d14: () => ({
      subject: "Dag 14: halvveis, og det går bra",
      html: wrap(
        '<p>Du er halvveis i utfordringen. Ta en liten pause og legg merke til hva som har endret seg siden dag 1.</p>' +
        '<p>Denne uken: Se på innlegget som fikk mest respons, og lag ett til i samme stil. De fleste gir opp rundt nå, bare det at du fortsatt er her, setter deg foran de fleste.</p>' +
        '<p>Klem fra Renate, LME 💛</p>' +
        ps(PS_NO)
      ),
      text: "Dag 14: Du er halvveis. Se på innlegget som fikk mest respons, og lag ett til i samme stil. De fleste gir opp rundt nå, du er fortsatt her.\n\nKlem fra Renate, LME",
    }),
    d21: () => ({
      subject: "Dag 21: siste spurt",
      html: wrap(
        '<p>Ni dager igjen. Konsistens slår perfeksjon hver gang, så hold rytmen, selv på dagene du ikke føler for det.</p>' +
        '<p>Denne uken: Planlegg innholdet ditt for resten av utfordringen i én økt. Da trenger du ikke ta den avgjørelsen på nytt hver eneste dag.</p>' +
        '<p>Klem fra Renate, LME 💛</p>' +
        ps(PS_NO)
      ),
      text: "Dag 21: ni dager igjen. Hold rytmen. Denne uken: Planlegg resten av innholdet i én økt.\n\nKlem fra Renate, LME",
    }),
    d30: () => ({
      subject: "Dag 30: du klarte det! 🎉",
      html: wrap(
        '<p>30 dager, fem minutter om dagen, og du er fortsatt her. Det er ikke en selvfølge, og jeg er stolt av deg.</p>' +
        '<p>Abonnementet ditt fortsetter, så du får nye oppgaver i innboksen så lenge du er med. Bruk arbeidsboken og fellesskapet til å holde rytmen videre.</p>' +
        '<p>Klem fra Renate, LME 💛</p>' +
        ps(PS_NO)
      ),
      text: "Dag 30: Du klarte det! 30 dager, fem minutter om dagen. Abonnementet ditt fortsetter, med nye oppgaver i innboksen så lenge du er med.\n\nKlem fra Renate, LME",
    }),
  },
  en: {
    d0: () => ({
      subject: "Welcome to the challenge 🌸",
      html: wrap(
        '<p>I\'m so glad to have you in the 10,000 Views Challenge. Over the next 30 days, five minutes a day, I\'ll show you how to find your niche, plan content with AI and create something that actually gets seen.</p>' +
        '<p>You don\'t need followers, experience or expensive equipment. Just five minutes and a bit of willingness to try.</p>' +
        '<p>Join the community, where everyone else in the challenge meets and cheers each other on:</p>' +
        btn(FELLESSKAP, "Join the community") +
        '<p>Your first task lands tomorrow. Watch your inbox.</p>' +
        '<p>Love, Renate, LME 💛</p>'
      ),
      text: "I'm so glad to have you in the 10,000 Views Challenge. Five minutes a day for 30 days. Join the community: " + FELLESSKAP + " Your first task lands tomorrow.\n\nLove, Renate, LME",
    }),
    d1: () => ({
      subject: "Day 1: find your niche",
      html: wrap(
        '<p>Today, spend five minutes on one thing: write down three topics you could talk about for hours without getting bored. That\'s your niche.</p>' +
        '<p>Don\'t overthink it. The first thought is usually the right one. Your niche doesn\'t need to be unique, it just needs to be real to you, that\'s what keeps you going when things get busy.</p>' +
        '<p>Love, Renate, LME 💛</p>' +
        ps(PS_EN)
      ),
      text: "Day 1: write down three topics you could talk about for hours without getting bored. That's your niche. Don't overthink it, the first thought is usually the right one.\n\nLove, Renate, LME",
    }),
    d3: () => ({
      subject: "Day 3: let AI do the planning",
      html: wrap(
        '<p>Today, spend five minutes letting an AI tool you already have (Claude, ChatGPT or similar) suggest three content ideas within your niche. Pick the one you like best.</p>' +
        '<p>You don\'t need to start from a blank page. This is exactly what AI is good for: giving you something to react to, so you don\'t have to invent everything yourself.</p>' +
        '<p>Love, Renate, LME 💛</p>' +
        ps(PS_EN)
      ),
      text: "Day 3: let an AI tool you already have suggest three content ideas within your niche. Pick the one you like best. You don't need to start from a blank page.\n\nLove, Renate, LME",
    }),
    d7: () => ({
      subject: "Day 7: first week done",
      html: wrap(
        '<p>Look back at what you\'ve made so far. It doesn\'t need to be perfect, it just needs to be real.</p>' +
        '<p>This week: make one more post, and ask someone you know for honest feedback. The first week is often the hardest, you\'ve laid the foundation now.</p>' +
        '<p>Love, Renate, LME 💛</p>' +
        ps(PS_EN)
      ),
      text: "Day 7: look back at what you've made so far. This week: make one more post, and ask for honest feedback. The first week is often the hardest.\n\nLove, Renate, LME",
    }),
    d14: () => ({
      subject: "Day 14: halfway, and doing fine",
      html: wrap(
        '<p>You\'re halfway through the challenge. Take a small pause and notice what\'s changed since day 1.</p>' +
        '<p>This week: look at the post that got the most response, and make one more in the same style. Most people quit around now, just being still here already puts you ahead.</p>' +
        '<p>Love, Renate, LME 💛</p>' +
        ps(PS_EN)
      ),
      text: "Day 14: you're halfway there. Look at the post that got the most response, and make one more like it. Most people quit around now, you're still here.\n\nLove, Renate, LME",
    }),
    d21: () => ({
      subject: "Day 21: final stretch",
      html: wrap(
        '<p>Nine days left. Consistency beats perfection every time, so keep the rhythm, even on the days you don\'t feel like it.</p>' +
        '<p>This week: plan your content for the rest of the challenge in one sitting. That way you don\'t have to make the decision all over again every single day.</p>' +
        '<p>Love, Renate, LME 💛</p>' +
        ps(PS_EN)
      ),
      text: "Day 21: nine days left. Keep the rhythm. This week: plan the rest of your content in one sitting.\n\nLove, Renate, LME",
    }),
    d30: () => ({
      subject: "Day 30: you did it! 🎉",
      html: wrap(
        '<p>30 days, five minutes a day, and you\'re still here. That\'s not nothing, and I\'m proud of you.</p>' +
        '<p>Your subscription continues, so you\'ll keep getting new tasks in your inbox for as long as you\'re with us. Use the workbook and the community to keep the rhythm going.</p>' +
        '<p>Love, Renate, LME 💛</p>' +
        ps(PS_EN)
      ),
      text: "Day 30: you did it! 30 days, five minutes a day. Your subscription continues, with new tasks in your inbox for as long as you're with us.\n\nLove, Renate, LME",
    }),
  },
};

SIMPLE_DAYS.forEach((d, i) => {
  const day = [2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29][i];
  CONTENT.no["d" + day] = d.no;
  CONTENT.en["d" + day] = d.en;
});

export function utfordringEmail(lang, kind) {
  const l = lang === "en" ? "en" : "no";
  const byLang = CONTENT[l] || CONTENT.no;
  const fn = byLang[kind] || byLang.d0;
  return fn();
}

/* Sender én e-post via MailerSend. Returnerer {ok, status/skipped/error}. */
export async function sendUtfordringMail(env, opts) {
  const to = opts && opts.to;
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey || !to) return { ok: false, skipped: true };
  const msg = utfordringEmail(opts.lang, opts.kind);
  const body = {
    from: { email: FROM_EMAIL, name: FROM_NAME },
    reply_to: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: to, name: opts.name || undefined }],
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
  };
  try {
    const res = await fetch(MS, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
