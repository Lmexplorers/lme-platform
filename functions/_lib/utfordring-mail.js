/**
 * 10 000-visninger-utfordringen — automatiske e-poster via MailerSend.
 *
 * Sender hele 30-dagers-serien rett fra plattformen, samme mønster som
 * Claude-kurset (_lib/claude-mail.js). Ingen MailerLite-automasjon eller
 * -redigering nødvendig, alt ligger som HTML-tekst her i koden.
 *
 * Bruker samme MAILERSEND_API_KEY-hemmelighet som Claude-kurset allerede
 * har i Cloudflare, ingen nytt oppsett trengs.
 */

const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "renate@lmexplorers.com";
const FROM_NAME = "Renate Dahl";

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

const CONTENT = {
  no: {
    d0: () => ({
      subject: "Velkommen inn i utfordringen 🌸",
      html: wrap(
        '<p>Så glad jeg er for å ha deg med i 10 000-visninger-utfordringen. De neste 30 dagene viser jeg deg, fem minutter om dagen, hvordan du finner nisjen din, planlegger innhold med AI og lager noe som faktisk blir sett.</p>' +
        '<p>Du trenger ingen følgere, ingen erfaring og ikke noe dyrt utstyr. Bare fem minutter og litt vilje til å prøve.</p>' +
        '<p>Første oppgave kommer i morgen. Følg med i innboksen din.</p>' +
        '<p>Klem fra Renate, LME 💛</p>'
      ),
      text: "Så glad jeg er for å ha deg med i 10 000-visninger-utfordringen. Fem minutter om dagen i 30 dager. Første oppgave kommer i morgen.\n\nKlem fra Renate, LME",
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
        '<p>Your first task lands tomorrow. Watch your inbox.</p>' +
        '<p>Love, Renate, LME 💛</p>'
      ),
      text: "I'm so glad to have you in the 10,000 Views Challenge. Five minutes a day for 30 days. Your first task lands tomorrow.\n\nLove, Renate, LME",
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
