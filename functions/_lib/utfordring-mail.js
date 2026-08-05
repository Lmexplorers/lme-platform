/**
 * 10 000-visninger-utfordringen — automatiske e-poster via MailerSend.
 *
 * Sender hele 30-dagers-serien rett fra plattformen, samme mønster som
 * Claude-kurset (_lib/claude-mail.js). Ingen MailerLite-automasjon eller
 * -redigering nødvendig, alt ligger som HTML-tekst her i koden.
 *
 * Ekte daglig serie: én e-post per dag i 30 dager (d1 til d30), pluss
 * velkomstmailen (d0) med en gang man blir med. De fleste dagene er en
 * enkel, kort fem-minutters-oppgave (simpleDay), noen få er lengre,
 * ukentlige oppsummeringer (d7, d14, d21, d30).
 *
 * Bruker samme MAILERSEND_API_KEY-hemmelighet som Claude-kurset allerede
 * har i Cloudflare, ingen nytt oppsett trengs.
 */

const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "renate@lmexplorers.com";
const FROM_NAME = "Renate Dahl";
const FELLESSKAP = SITE + "/utfordringen-fellesskap";

function btn(href, label) {
  return '<p style="margin:22px 0;"><a href="' + href + '" style="background:#E91E89;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:999px;display:inline-block;">' + label + '</a></p>';
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

/* Enkel dag: ett kort avsnitt med dagens fem-minutters-oppgave, samme
   oppbygning på alle slike dager (bare teksten er unik per dag). */
function simpleDay(day, no, en) {
  return {
    no: () => ({
      subject: "Dag " + day + ": " + no.subject,
      html: wrap('<p>' + no.body + '</p><p>Klem fra Renate, LME 💛</p>'),
      text: "Dag " + day + ": " + no.body + "\n\nKlem fra Renate, LME",
    }),
    en: () => ({
      subject: "Day " + day + ": " + en.subject,
      html: wrap('<p>' + en.body + '</p><p>Love, Renate, LME 💛</p>'),
      text: "Day " + day + ": " + en.body + "\n\nLove, Renate, LME",
    }),
  };
}

const SIMPLE_DAYS = [
  simpleDay(2,
    { subject: "finn målgruppen din", body: "I dag bruker du fem minutter på å beskrive én bestemt person i målgruppen din. Hva bryr hun seg om, og hva sliter hun med akkurat nå?" },
    { subject: "find your audience", body: "Today, spend five minutes describing one specific person in your audience. What does she care about, and what is she struggling with right now?" }),
  simpleDay(4,
    { subject: "velg hovedplattformen din", body: "I dag bruker du fem minutter på å velge én plattform å fokusere på denne måneden. Der målgruppen din allerede er, er der du bør være." },
    { subject: "pick your main platform", body: "Today, spend five minutes picking one platform to focus on this month. Wherever your audience already is, that's where you should be." }),
  simpleDay(5,
    { subject: "studer tre skapere du liker", body: "I dag bruker du fem minutter på å se på tre skapere innenfor nisjen din. Hva gjør innholdet deres bra? Skriv ned tre observasjoner." },
    { subject: "study three creators you like", body: "Today, spend five minutes looking at three creators in your niche. What makes their content work? Write down three observations." }),
  simpleDay(6,
    { subject: "lag et utkast, ikke publiser ennå", body: "I dag bruker du fem minutter på å skrive et utkast til innlegget ditt. Ikke publiser det ennå, bare få ideen ut av hodet og ned på papiret." },
    { subject: "make a draft, don't publish yet", body: "Today, spend five minutes writing a draft of your post. Don't publish it yet, just get the idea out of your head and onto paper." }),
  simpleDay(8,
    { subject: "øv på en god åpning", body: "De første tre sekundene avgjør om noen blir eller scroller videre. I dag bruker du fem minutter på å skrive tre ulike åpningssetninger til samme innhold, og velger den beste." },
    { subject: "practice a strong opening", body: "The first three seconds decide whether someone stays or scrolls on. Today, spend five minutes writing three different opening lines for the same piece of content, and pick the strongest one." }),
  simpleDay(9,
    { subject: "planlegg flere innlegg i én økt", body: "I dag bruker du fem minutter på å skrive ned ideer til tre innlegg, ikke bare ett. Da har du noe å ta av resten av uken, selv på de travle dagene." },
    { subject: "plan several posts at once", body: "Today, spend five minutes writing down ideas for three posts, not just one. That way you have something to draw on for the rest of the week, even on the busy days." }),
  simpleDay(10,
    { subject: "la AI skjerpe teksten din", body: "I dag bruker du fem minutter på å lime inn teksten fra et av innleggene dine i et AI-verktøy, og be om en kortere, skarpere versjon. Behold din egen stemme, bare stram opp språket." },
    { subject: "let AI sharpen your text", body: "Today, spend five minutes pasting the text from one of your posts into an AI tool, and ask for a shorter, sharper version. Keep your own voice, just tighten the language." }),
  simpleDay(11,
    { subject: "se på tallene dine", body: "I dag bruker du fem minutter på å se gjennom visninger og engasjement på det du har laget så langt. Hva forteller tallene deg om hva som fungerer?" },
    { subject: "look at your numbers", body: "Today, spend five minutes looking through the views and engagement on what you've made so far. What do the numbers tell you about what's working?" }),
  simpleDay(12,
    { subject: "snakk direkte til seeren", body: 'I dag bruker du fem minutter på å skrive teksten din som om du snakker til én person. Bruk "du", ikke "man" eller "de".' },
    { subject: "talk straight to the viewer", body: 'Today, spend five minutes rewriting your text as if you\'re talking to one single person. Use "you", not "people" or "one".' }),
  simpleDay(13,
    { subject: "gjenbruk noe som fungerte", body: "I dag bruker du fem minutter på å finne innlegget ditt med mest respons, og lage en ny versjon av det. Det som fungerte én gang, fungerer ofte igjen." },
    { subject: "reuse something that worked", body: "Today, spend five minutes finding your post with the most response, and making a new version of it. What worked once often works again." }),
  simpleDay(15,
    { subject: "publiser, selv om det ikke er perfekt", body: "I dag bruker du fem minutter på å publisere noe, selv om det ikke føles helt ferdig. Konsistens slår perfeksjon hver gang." },
    { subject: "post it, even if it's not perfect", body: "Today, spend five minutes publishing something, even if it doesn't feel quite finished. Consistency beats perfection, every time." }),
  simpleDay(16,
    { subject: "les gjennom kommentarene dine", body: "I dag bruker du fem minutter på å lese gjennom tilbakemeldingene du har fått så langt. Hva spør folk om? Det er ofte ditt neste innlegg." },
    { subject: "read through your comments", body: "Today, spend five minutes reading through the feedback you've gotten so far. What are people asking about? That's often your next post." }),
  simpleDay(17,
    { subject: "nevn noen andre i nisjen din", body: "I dag bruker du fem minutter på å nevne eller tagge noen andre i nisjen din i et innlegg. Fellesskap slår konkurranse, og det åpner dører." },
    { subject: "mention someone else in your niche", body: "Today, spend five minutes mentioning or tagging someone else in your niche in a post. Community beats competition, and it opens doors." }),
  simpleDay(18,
    { subject: "fortell en liten personlig historie", body: "I dag bruker du fem minutter på å dele noe personlig knyttet til temaet ditt. Folk husker historier bedre enn råd." },
    { subject: "tell a small personal story", body: "Today, spend five minutes sharing something personal connected to your topic. People remember stories better than advice." }),
  simpleDay(19,
    { subject: "test et nytt format", body: "I dag bruker du fem minutter på å planlegge noe i et format du ikke har prøvd før, video, karusell eller ren tekst. Du vet aldri hva som treffer før du tester." },
    { subject: "try a new format", body: "Today, spend five minutes planning something in a format you haven't tried before, video, carousel or plain text. You never know what lands until you test it." }),
  simpleDay(20,
    { subject: "rydd i profilen din", body: "I dag bruker du fem minutter på å sjekke bio og profilbilde. Viser de tydelig hva du driver med, og hvorfor noen bør følge deg?" },
    { subject: "tidy up your profile", body: "Today, spend five minutes checking your bio and profile picture. Do they clearly show what you do, and why someone should follow you?" }),
  simpleDay(22,
    { subject: "planlegg tre ideer for neste uke", body: "I dag bruker du fem minutter på å skrive ned tre ideer for uken som kommer. Da slipper du å stå fast når det er tid for å lage innhold." },
    { subject: "plan three ideas for next week", body: "Today, spend five minutes writing down three ideas for the week ahead. That way you won't get stuck when it's time to create." }),
  simpleDay(23,
    { subject: "still et spørsmål", body: "I dag bruker du fem minutter på å stille et konkret spørsmål i innlegget ditt. Spørsmål gir svar, og svar gir samtaler." },
    { subject: "ask a question", body: "Today, spend five minutes asking a concrete question in your post. Questions get answers, and answers start conversations." }),
  simpleDay(24,
    { subject: "finn din stemme", body: "I dag bruker du fem minutter på å skrive ned hva som gjør innholdet ditt annerledes enn andres i samme nisje. Det er stemmen din, ikke bare temaet, som folk husker." },
    { subject: "find your voice", body: "Today, spend five minutes writing down what makes your content different from others in the same niche. It's your voice, not just the topic, that people remember." }),
  simpleDay(25,
    { subject: "del en lærdom", body: "I dag bruker du fem minutter på å dele én ting du har lært om innhold denne måneden. Det du selv har lært, hjelper ofte andre lengst på vei." },
    { subject: "share a lesson", body: "Today, spend five minutes sharing one thing you've learned about content this month. What you've learned yourself often helps others the furthest." }),
  simpleDay(26,
    { subject: "sammenlign med dag 1", body: "I dag bruker du fem minutter på å se tilbake på det aller første innlegget du laget i utfordringen. Se hvor langt du har kommet." },
    { subject: "compare with day 1", body: "Today, spend five minutes looking back at the very first post you made in the challenge. See how far you've come." }),
  simpleDay(27,
    { subject: "inviter en venn med", body: "I dag bruker du fem minutter på å dele utfordringen med en venn som også ønsker å bli mer synlig. Det er lettere å holde ut sammen med noen." },
    { subject: "invite a friend", body: "Today, spend five minutes sharing the challenge with a friend who also wants to get more visible. It's easier to keep going together." }),
  simpleDay(28,
    { subject: "finn din beste dag", body: "I dag bruker du fem minutter på å finne innlegget som fikk mest respons denne måneden. Hvorfor tror du akkurat det fungerte?" },
    { subject: "find your best day", body: "Today, spend five minutes finding the post that got the most response this month. Why do you think that one worked?" }),
  simpleDay(29,
    { subject: "planlegg veien videre", body: "I dag bruker du fem minutter på å skrive ned hva du vil fortsette med etter utfordringen. De gode vanene er verdt å beholde." },
    { subject: "plan the road ahead", body: "Today, spend five minutes writing down what you want to keep doing after the challenge. The good habits are worth keeping." }),
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
        '<p>I dag bruker du fem minutter på én ting: skriv ned tre temaer du kan snakke om i timevis, uten å bli lei. Det er nisjen din.</p>' +
        '<p>Ikke tenk for mye. Den første tanken er ofte den riktige.</p>' +
        '<p>Klem fra Renate, LME 💛</p>'
      ),
      text: "Dag 1: skriv ned tre temaer du kan snakke om i timevis, uten å bli lei. Det er nisjen din.\n\nKlem fra Renate, LME",
    }),
    d3: () => ({
      subject: "Dag 3: la AI gjøre planleggingen",
      html: wrap(
        '<p>I dag bruker du fem minutter på å la et AI-verktøy du allerede har (Claude, ChatGPT eller lignende) foreslå tre innholdsideer innenfor nisjen din. Velg den du liker best.</p>' +
        '<p>Klem fra Renate, LME 💛</p>'
      ),
      text: "Dag 3: la et AI-verktøy du allerede har foreslå tre innholdsideer innenfor nisjen din. Velg den du liker best.\n\nKlem fra Renate, LME",
    }),
    d7: () => ({
      subject: "Dag 7: første uke i boks",
      html: wrap(
        '<p>Se tilbake på det du har laget så langt. Det trenger ikke være perfekt, det trenger bare å være ekte.</p>' +
        '<p>Denne uken: lag ett innlegg til, og be gjerne noen du kjenner om ærlig tilbakemelding.</p>' +
        '<p>Klem fra Renate, LME 💛</p>'
      ),
      text: "Dag 7: se tilbake på det du har laget så langt. Denne uken: lag ett innlegg til, og be om ærlig tilbakemelding.\n\nKlem fra Renate, LME",
    }),
    d14: () => ({
      subject: "Dag 14: halvveis, og det går bra",
      html: wrap(
        '<p>Du er halvveis i utfordringen. Ta en liten pause og legg merke til hva som har endret seg siden dag 1.</p>' +
        '<p>Denne uken: se på innlegget som fikk mest respons, og lag ett til i samme stil.</p>' +
        '<p>Klem fra Renate, LME 💛</p>'
      ),
      text: "Dag 14: du er halvveis. Se på innlegget som fikk mest respons, og lag ett til i samme stil.\n\nKlem fra Renate, LME",
    }),
    d21: () => ({
      subject: "Dag 21: siste spurt",
      html: wrap(
        '<p>Ni dager igjen. Konsistens slår perfeksjon hver gang, så hold rytmen, selv på dagene du ikke føler for det.</p>' +
        '<p>Denne uken: planlegg innholdet ditt for resten av utfordringen i én økt.</p>' +
        '<p>Klem fra Renate, LME 💛</p>'
      ),
      text: "Dag 21: ni dager igjen. Hold rytmen. Planlegg resten av innholdet i én økt.\n\nKlem fra Renate, LME",
    }),
    d30: () => ({
      subject: "Dag 30: du klarte det! 🎉",
      html: wrap(
        '<p>30 dager, fem minutter om dagen, og du er fortsatt her. Det er ikke en selvfølge, og jeg er stolt av deg.</p>' +
        '<p>Abonnementet ditt fortsetter, så du får nye oppgaver i innboksen så lenge du er med.</p>' +
        '<p>Klem fra Renate, LME 💛</p>'
      ),
      text: "Dag 30: du klarte det! 30 dager, fem minutter om dagen. Abonnementet ditt fortsetter, med nye oppgaver i innboksen så lenge du er med.\n\nKlem fra Renate, LME",
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
        '<p>Don\'t overthink it. The first thought is usually the right one.</p>' +
        '<p>Love, Renate, LME 💛</p>'
      ),
      text: "Day 1: write down three topics you could talk about for hours without getting bored. That's your niche.\n\nLove, Renate, LME",
    }),
    d3: () => ({
      subject: "Day 3: let AI do the planning",
      html: wrap(
        '<p>Today, spend five minutes letting an AI tool you already have (Claude, ChatGPT or similar) suggest three content ideas within your niche. Pick the one you like best.</p>' +
        '<p>Love, Renate, LME 💛</p>'
      ),
      text: "Day 3: let an AI tool you already have suggest three content ideas within your niche. Pick the one you like best.\n\nLove, Renate, LME",
    }),
    d7: () => ({
      subject: "Day 7: first week done",
      html: wrap(
        '<p>Look back at what you\'ve made so far. It doesn\'t need to be perfect, it just needs to be real.</p>' +
        '<p>This week: make one more post, and ask someone you know for honest feedback.</p>' +
        '<p>Love, Renate, LME 💛</p>'
      ),
      text: "Day 7: look back at what you've made so far. This week: make one more post, and ask for honest feedback.\n\nLove, Renate, LME",
    }),
    d14: () => ({
      subject: "Day 14: halfway, and doing fine",
      html: wrap(
        '<p>You\'re halfway through the challenge. Take a small pause and notice what\'s changed since day 1.</p>' +
        '<p>This week: look at the post that got the most response, and make one more in the same style.</p>' +
        '<p>Love, Renate, LME 💛</p>'
      ),
      text: "Day 14: you're halfway there. Look at the post that got the most response, and make one more like it.\n\nLove, Renate, LME",
    }),
    d21: () => ({
      subject: "Day 21: final stretch",
      html: wrap(
        '<p>Nine days left. Consistency beats perfection every time, so keep the rhythm, even on the days you don\'t feel like it.</p>' +
        '<p>This week: plan your content for the rest of the challenge in one sitting.</p>' +
        '<p>Love, Renate, LME 💛</p>'
      ),
      text: "Day 21: nine days left. Keep the rhythm. Plan the rest of your content in one sitting.\n\nLove, Renate, LME",
    }),
    d30: () => ({
      subject: "Day 30: you did it! 🎉",
      html: wrap(
        '<p>30 days, five minutes a day, and you\'re still here. That\'s not nothing, and I\'m proud of you.</p>' +
        '<p>Your subscription continues, so you\'ll keep getting new tasks in your inbox for as long as you\'re with us.</p>' +
        '<p>Love, Renate, LME 💛</p>'
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
