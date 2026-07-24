/**
 * LME ukentlig nyhetsbrev — evergreen serie via MailerSend.
 *
 * Hver abonnent (KV-nøkkel nl:<e-post>) får ett brev i uka fra denne faste
 * serien, styrt av den ukentlige jobben (functions/api/cron/newsletter.js).
 * Tospråklig. Avsender post@lmexplorers.com. Krever MAILERSEND_API_KEY.
 */

const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "post@lmexplorers.com";
const FROM_NAME = "Renate fra LME";

function esc(s) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrap(inner) {
  return '<!DOCTYPE html><html><body style="margin:0;background:#FBF7F0;font-family:Arial,Helvetica,sans-serif;color:#1F1B24;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7F0;padding:24px 0;"><tr><td align="center">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;">' +
    '<tr><td style="padding:26px 32px 4px;text-align:center;"><img src="' + SITE + '/images/lme-logo.png" alt="Little Montessori Explorers" width="110" style="width:110px;height:auto;"></td></tr>' +
    '<tr><td style="padding:6px 32px 28px;font-size:16px;line-height:1.65;color:#3a343f;">' + inner + '</td></tr>' +
    '</table>' +
    '<div style="max-width:560px;color:#938E99;font-size:12px;padding:16px;">Little Montessori Explorers · Renate Dahl · Tønsberg<br>Du får dette fordi du meldte deg på hos oss.</div>' +
    '</td></tr></table></body></html>';
}

function btn(href, label) {
  return '<p style="margin:22px 0;"><a href="' + href + '" style="background:#E91E89;color:#ffffff;text-decoration:none;font-weight:bold;padding:13px 24px;border-radius:999px;display:inline-block;">' + label + '</a></p>';
}

function mk(intro, body, ctaHref, ctaLabel, sign) {
  return wrap('<p>' + intro + '</p><p>' + body + '</p>' + btn(ctaHref, ctaLabel) + '<p>' + sign + '</p>');
}

/* 6-ukers evergreen serie. Legg gjerne til flere uker senere. */
const SERIES = [
  {
    no: { subject: "Velkommen, la oss begynne rolig 🌸",
      html: mk("Hei " + "{name}" + ", så glad for å ha deg her!",
        "Hver uke sender jeg deg én liten, rolig idé du kan bruke hjemme eller i barnehagen, og av og til et tips om hvordan du kan skape og spare tid. Denne uken: Sett deg ned i fem minutter og bare observer barnet ditt, uten å gripe inn. Legg merke til hva det trekkes mot. Det forteller deg mer enn du tror.",
        SITE + "/blog", "Les mer på bloggen", "Klem fra Renate"),
      text: "Hei {name}, så glad for å ha deg her!\n\nDenne uken: Sett deg ned i fem minutter og bare observer barnet ditt, uten å gripe inn.\n\nLes mer: " + SITE + "/blog\n\nKlem fra Renate" },
    en: { subject: "Welcome, let's begin gently 🌸",
      html: mk("Hi " + "{name}" + ", so glad to have you here!",
        "Every week I'll send you one small, calm idea you can use at home or in the classroom, and now and then a tip on how to create and save time. This week: Sit down for five minutes and just observe your child, without stepping in. Notice what they're drawn to. It tells you more than you'd think.",
        SITE + "/blog", "Read more on the blog", "Warm wishes, Renate"),
      text: "Hi {name}, so glad to have you here!\n\nThis week: Sit down for five minutes and just observe your child, without stepping in.\n\nRead more: " + SITE + "/blog\n\nWarm wishes, Renate" },
  },
  {
    no: { subject: "Det forberedte miljøet, én liten endring",
      html: mk("Hei {name},",
        "Denne uken: Velg én hylle eller én kurv i barnehøyde, og legg tre ting barnet kan nå og bruke selv. Færre valg gir mer ro. Barn blomstrer når ting har sin faste plass.",
        SITE + "/ressurser", "Se ressurser", "Klem fra Renate"),
      text: "Hei {name},\n\nDenne uken: Velg én hylle i barnehøyde og legg tre ting barnet kan bruke selv.\n\nRessurser: " + SITE + "/ressurser\n\nKlem fra Renate" },
    en: { subject: "The prepared environment, one small change",
      html: mk("Hi {name},",
        "This week: Choose one shelf or basket at child height and place three things your child can reach and use on their own. Fewer choices bring more calm. Children blossom when things have their own place.",
        SITE + "/ressurser", "See resources", "Warm wishes, Renate"),
      text: "Hi {name},\n\nThis week: Choose one shelf at child height with three things your child can use themselves.\n\nResources: " + SITE + "/ressurser\n\nWarm wishes, Renate" },
  },
  {
    no: { subject: "Praktisk liv: la de små hjelpe til",
      html: mk("Hei {name},",
        "La barnet gjøre en ekte oppgave denne uken: skjære banan med smørkniv, tørke litt søl, vanne en plante. Det er ikke bare lek, det bygger selvstendighet og en stille stolthet.",
        SITE + "/butikk", "Se arbeidsbøker i butikken", "Klem fra Renate"),
      text: "Hei {name},\n\nLa barnet gjøre en ekte oppgave denne uken: skjære banan, tørke søl, vanne en plante.\n\nButikk: " + SITE + "/butikk\n\nKlem fra Renate" },
    en: { subject: "Practical life: let the little ones help",
      html: mk("Hi {name},",
        "Let your child do a real task this week: slice a banana with a butter knife, wipe a small spill, water a plant. It's not just play, it builds independence and a quiet pride.",
        SITE + "/butikk", "See workbooks in the shop", "Warm wishes, Renate"),
      text: "Hi {name},\n\nLet your child do a real task this week: slice a banana, wipe a spill, water a plant.\n\nShop: " + SITE + "/butikk\n\nWarm wishes, Renate" },
  },
  {
    no: { subject: "Mindre skjerm, mer nærvær (og litt smart hjelp)",
      html: mk("Hei {name},",
        "Nærvær er den beste gaven du gir barnet. Samtidig trenger du ikke gjøre alt for hånd. Jeg bruker Claude til det kjedelige, foreldrebrev, ukeplaner og oversettelser, så jeg får mer tid til det som betyr noe. Vil du lære det rolig, steg for steg?",
        SITE + "/claude-kurs", "Se Claude-kurset", "Klem fra Renate"),
      text: "Hei {name},\n\nDu trenger ikke gjøre alt for hånd. Jeg bruker Claude til foreldrebrev, ukeplaner og oversettelser.\n\nClaude-kurset: " + SITE + "/claude-kurs\n\nKlem fra Renate" },
    en: { subject: "Less screen, more presence (and a little smart help)",
      html: mk("Hi {name},",
        "Presence is the best gift you give your child. At the same time, you don't have to do everything by hand. I use Claude for the tedious parts, parent letters, weekly plans and translations, so I get more time for what matters. Want to learn it calmly, step by step?",
        SITE + "/claude-course", "See the Claude course", "Warm wishes, Renate"),
      text: "Hi {name},\n\nYou don't have to do everything by hand. I use Claude for parent letters, weekly plans and translations.\n\nClaude course: " + SITE + "/claude-course\n\nWarm wishes, Renate" },
  },
  {
    no: { subject: "Du kan skape ditt eget",
      html: mk("Hei {name},",
        "Du sitter på mer skaperkraft enn du tror. Med enkle verktøy kan du lage dine egne aktiviteter, bøker og innhold, i din egen stil. Start smått, med én ting du har lyst til å lage.",
        SITE + "/creative-academy", "Utforsk LME Creative Academy", "Klem fra Renate"),
      text: "Hei {name},\n\nMed enkle verktøy kan du lage dine egne aktiviteter, bøker og innhold. Start med én ting.\n\nCreative Academy: " + SITE + "/creative-academy\n\nKlem fra Renate" },
    en: { subject: "You can create your own",
      html: mk("Hi {name},",
        "You have more creative power than you think. With simple tools you can make your own activities, books and content, in your own style. Start small, with one thing you'd love to make.",
        SITE + "/creative-academy", "Explore LME Creative Academy", "Warm wishes, Renate"),
      text: "Hi {name},\n\nWith simple tools you can make your own activities, books and content. Start with one thing.\n\nCreative Academy: " + SITE + "/creative-academy\n\nWarm wishes, Renate" },
  },
  {
    no: { subject: "Du er ikke alene 💛",
      html: mk("Hei {name},",
        "Å bygge en rolig hverdag er finere med andre. I Inner Circle møter du likesinnede og meg, med månedlige samlinger, et varmt fellesskap og en direkte tråd når du lurer på noe.",
        SITE + "/community", "Bli med i Inner Circle", "Klem fra Renate"),
      text: "Hei {name},\n\nÅ bygge en rolig hverdag er finere med andre. Bli med i Inner Circle.\n\n" + SITE + "/community\n\nKlem fra Renate" },
    en: { subject: "You're not alone 💛",
      html: mk("Hi {name},",
        "Building a calm everyday life is nicer with others. In the Inner Circle you'll meet like-minded people and me, with monthly gatherings, a warm community and a direct thread whenever you wonder about something.",
        SITE + "/community", "Join the Inner Circle", "Warm wishes, Renate"),
      text: "Hi {name},\n\nBuilding a calm everyday life is nicer with others. Join the Inner Circle.\n\n" + SITE + "/community\n\nWarm wishes, Renate" },
  },
];

export function newsletterLength() { return SERIES.length; }

export function newsletterEmail(lang, index, name) {
  const item = SERIES[index];
  if (!item) return null;
  const l = lang === "en" ? "en" : "no";
  const msg = item[l] || item.no;
  const nm = name || (l === "en" ? "there" : "");
  return {
    subject: msg.subject,
    html: msg.html.replace(/\{name\}/g, esc(nm)),
    text: msg.text.replace(/\{name\}/g, nm),
  };
}

/* Sender uke <index> til en abonnent via MailerSend. */
export async function sendNewsletter(env, sub, index) {
  const apiKey = env.MAILERSEND_API_KEY;
  const to = sub && sub.email;
  if (!apiKey || !to) return { ok: false, skipped: true };
  const msg = newsletterEmail(sub.lang, index, sub.name);
  if (!msg) return { ok: false, done: true };
  try {
    const res = await fetch(MS, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        reply_to: { email: "renate@lmexplorers.com", name: "Renate Dahl" },
        to: [{ email: to, name: sub.name || undefined }],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/* Registrer / oppdater en nyhetsbrev-abonnent i KV. */
export async function registerNewsletter(env, email, name, lang, source) {
  if (!env.BUILDER_KV || !email) return;
  const key = "nl:" + email.trim().toLowerCase();
  const existing = await env.BUILDER_KV.get(key);
  if (existing) return; // ikke nullstill en som allerede er i gang
  await env.BUILDER_KV.put(key, JSON.stringify({
    email: email.trim(), name: name || "", lang: lang === "en" ? "en" : "no",
    weekIndex: 0, active: true, joined: Date.now(), lastSent: 0, source: (source || "").toString().slice(0, 60),
  }));
}
