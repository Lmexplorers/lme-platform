/**
 * Delt takk-for-kjøpet-e-post for enkeltstående kurskjøp (ikke Inner Circle-
 * medlemskap). Brukes av "Voks på YouTube med AI", "Videre med YouTube" og
 * "KI for pedagoger" (se stripe-webhook.js). Samme MailerSend-oppsett og
 * mønster som _lib/claude-mail.js, men delt på tvers av flere kurs siden de
 * ikke har noe mersalg-steg, bare en enkel takkemail.
 *
 * Kun norsk foreløpig (samme som funnel-sidene for disse kursene).
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

/* Ett sted per kurs: navn, hvor kurset åpnes, og en kort personlig takk. */
const COURSES = {
  youtube: {
    name: "Voks på YouTube med AI",
    url: SITE + "/academy/youtube",
    tip: "Mitt beste tips: begynn med leksjon 1 og ta det i ditt eget tempo. Arbeidsboken som følger kurset finner du på " + SITE + "/ressurser/print/youtube-kurs-arbeidsbok.",
  },
  "youtube-videre": {
    name: "Videre med YouTube",
    url: SITE + "/academy/youtube-videre",
    tip: "Mitt beste tips: begynn med å lese tallene på kanalen din før du endrer noe, så vet du hva som faktisk trenger å bli bedre.",
  },
  "ki-for-pedagoger": {
    name: "KI for pedagoger",
    url: SITE + "/academy/ki-for-pedagoger",
    tip: "Mitt beste tips: begynn med firekukers-planen i kurset, ett lite steg om gangen.",
  },
};

function content(courseKey, name) {
  const c = COURSES[courseKey] || COURSES.youtube;
  const hi = "Hei " + esc(name || "") + ",";
  return {
    subject: "Takk for kjøpet, her er kurset ditt 💛",
    html: wrap(
      "<p>" + hi + "</p>" +
      "<p>Tusen takk, og så gøy å ha deg med! " + esc(c.name) + " er klart, og du kan starte med en gang.</p>" +
      btn(c.url, "Åpne kurset") +
      "<p>" + c.tip + "</p>" +
      "<p>Har du spørsmål, svar på denne e-posten, så hjelper jeg deg.</p>" +
      "<p>Klem fra Renate</p>"
    ),
    text: "Hei " + (name || "") + ",\n\nTusen takk! " + c.name + " er klart.\n\nÅpne kurset: " + c.url + "\n\n" + c.tip + "\n\nKlem fra Renate",
  };
}

/* Sender takk-for-kjøpet-mailen for ett av kursene over. Returnerer
   {ok, status/skipped/error}, samme mønster som sendClaudeMail. */
export async function sendCoursePurchaseMail(env, opts) {
  const to = opts && opts.to;
  const courseKey = (opts && opts.courseKey) || "youtube";
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey || !to) return { ok: false, skipped: true };
  const msg = content(courseKey, opts.name);
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
