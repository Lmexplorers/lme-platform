/**
 * Claude-kurset — automatiske e-poster via MailerSend.
 *
 * Sender takke- og oppfølgingsmail rett fra plattformen når noen kjøper,
 * på riktig språk (norsk/engelsk). Ingen MailerLite-automasjon nødvendig.
 *
 * ENGANGS-OPPSETT (Cloudflare):
 *   Workers & Pages → Pages-prosjektet → Settings → Variables and Secrets:
 *     Name:  MAILERSEND_API_KEY
 *     Value: <API-token fra MailerSend → Integrations → API tokens>
 *   Domenet lmexplorers.com må være verifisert i MailerSend (samme type
 *   DNS-oppsett som du alt har for e-post). Legg nøkkelen til for både
 *   Production OG Preview, og redeploy.
 */

const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "renate@lmexplorers.com";
const FROM_NAME = "Renate Dahl";

function esc(s) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

function btn(href, label) {
  return '<p style="margin:22px 0;"><a href="' + href + '" style="background:#E91E89;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:999px;display:inline-block;">' + label + '</a></p>';
}

const COURSE = SITE + "/academy/claude";
const PDF = SITE + "/funnel/nedlasting/LME-Claude-oppskrifter.pdf";
const UPSELL_NO = SITE + "/funnel/claude-kurs/mersalg.html";
const UPSELL_EN = SITE + "/funnel/claude-kurs/mersalg.html?lang=en";

const CONTENT = {
  no: {
    takk: (name) => ({
      subject: "Takk for kjøpet, her er Claude-kurset ditt 💛",
      html: wrap(
        '<p>Hei ' + esc(name) + ',</p>' +
        '<p>Tusen takk, og så gøy å ha deg med! Claude-kurset ditt er klart, og du kan starte med en gang.</p>' +
        btn(COURSE, "Åpne Claude-kurset") +
        '<p>Last ned oppskriftspakken med alle de ferdige prompterne:</p>' +
        '<p><a href="' + PDF + '" style="color:#E91E89;font-weight:bold;">Last ned oppskriftspakken (PDF)</a></p>' +
        '<p>Mitt beste tips: Begynn med leksjon 1 og ta det i ditt eget tempo. Du trenger ikke kunne noe fra før.</p>' +
        '<p>Vil du ta det et steg videre? Videre med Claude viser deg skills, koblinger og hvordan du kan bygge enkle sider selv, alt forklart i vanlig språk.</p>' +
        btn(UPSELL_NO, "Se Videre med Claude") +
        '<p>Har du spørsmål, svar på denne e-posten, så hjelper jeg deg.</p>' +
        '<p>Klem fra Renate</p>'
      ),
      text: "Hei " + (name || "") + ",\n\nTusen takk, og så gøy å ha deg med! Claude-kurset ditt er klart.\n\nÅpne kurset: " + COURSE + "\nOppskriftspakken (PDF): " + PDF + "\n\nVil du ta det videre? Videre med Claude: " + UPSELL_NO + "\n\nKlem fra Renate",
    }),
    oppfolging: (name) => ({
      subject: "Kom du i gang med Claude? (+ et lite tips)",
      html: wrap(
        '<p>Hei ' + esc(name) + ',</p>' +
        '<p>Bare en liten titt innom: Fikk du prøvd Claude-kurset?</p>' +
        '<p>Hvis du ikke har begynt ennå, er det helt greit. Start med én ting: Åpne en oppskrift fra pakken, lim den inn i Claude, og se hva som skjer. Det tar to minutter, og da er du i gang.</p>' +
        btn(COURSE, "Åpne Claude-kurset") +
        '<p>Og hvis du har fått blod på tann: Videre med Claude tar deg fra å bruke Claude til å bygge med Claude, forklart i vanlig språk. Du får det fortsatt til lanseringspris:</p>' +
        btn(UPSELL_NO, "Se Videre med Claude") +
        '<p>Heier på deg!<br>Renate</p>'
      ),
      text: "Hei " + (name || "") + ",\n\nFikk du prøvd Claude-kurset? Start med én oppskrift, lim den inn i Claude, så er du i gang.\n\nÅpne kurset: " + COURSE + "\nVidere med Claude: " + UPSELL_NO + "\n\nHeier på deg!\nRenate",
    }),
  },
  en: {
    takk: (name) => ({
      subject: "Thank you, here's your Claude course 💛",
      html: wrap(
        '<p>Hi ' + esc(name) + ',</p>' +
        '<p>Thank you so much, and I\'m so glad to have you! Your Claude course is ready, and you can start right away.</p>' +
        btn(COURSE, "Open the Claude course") +
        '<p>Download the recipe pack with all the ready-made prompts:</p>' +
        '<p><a href="' + PDF + '" style="color:#E91E89;font-weight:bold;">Download the recipe pack (PDF)</a></p>' +
        '<p>My best tip: Start with lesson 1 and take it at your own pace. You don\'t need to know anything beforehand.</p>' +
        '<p>Want to take it a step further? Next Level with Claude shows you skills, connections and how to build simple pages yourself, all in plain language.</p>' +
        btn(UPSELL_EN, "See Next Level with Claude") +
        '<p>If you have any questions, just reply to this email and I\'ll help you.</p>' +
        '<p>Warm wishes,<br>Renate</p>'
      ),
      text: "Hi " + (name || "") + ",\n\nThank you so much! Your Claude course is ready.\n\nOpen the course: " + COURSE + "\nRecipe pack (PDF): " + PDF + "\n\nNext Level with Claude: " + UPSELL_EN + "\n\nWarm wishes,\nRenate",
    }),
    oppfolging: (name) => ({
      subject: "Did you get started with Claude? (+ a little tip)",
      html: wrap(
        '<p>Hi ' + esc(name) + ',</p>' +
        '<p>Just checking in: did you get to try the Claude course?</p>' +
        '<p>If you haven\'t started yet, that\'s completely fine. Start with one thing: Open a recipe from the pack, paste it into Claude, and see what happens. It takes two minutes, and you\'re off.</p>' +
        btn(COURSE, "Open the Claude course") +
        '<p>And if you\'ve caught the bug: Next Level with Claude takes you from using Claude to building with Claude, in plain language. It\'s still at the launch price:</p>' +
        btn(UPSELL_EN, "See Next Level with Claude") +
        '<p>Cheering you on,<br>Renate</p>'
      ),
      text: "Hi " + (name || "") + ",\n\nDid you get to try the Claude course? Start with one recipe, paste it into Claude, and you're off.\n\nOpen the course: " + COURSE + "\nNext Level with Claude: " + UPSELL_EN + "\n\nCheering you on,\nRenate",
    }),
  },
};

export function claudeEmail(lang, kind, name) {
  const l = lang === "en" ? "en" : "no";
  const byLang = CONTENT[l] || CONTENT.no;
  const fn = byLang[kind] || byLang.takk;
  return fn(name || "");
}

/* Sender én e-post via MailerSend. Returnerer {ok, status/skipped/error}. */
export async function sendClaudeMail(env, opts) {
  const to = opts && opts.to;
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey || !to) return { ok: false, skipped: true };
  const msg = claudeEmail(opts.lang, opts.kind, opts.name);
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
