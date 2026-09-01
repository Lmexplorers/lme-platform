/**
 * LME Autopilot, engangskjøp av appen: kvitteringen til kjøperen.
 *
 * Brevet har én jobb utover å takke: å si hva hun må gjøre for at kjøpet
 * skal virke. Appen kjenner henne igjen på e-postadressen, og hun må legge
 * inn sine egne AI-nøkler under Innstillinger. Uten det virker ingenting,
 * og da tror hun at kjøpet var bortkastet.
 *
 * Sendes med MailerSend rett fra koden, samme mønster som resten av
 * plattformen (CLAUDE.md: MailerLite skal aldri brukes igjen).
 */
const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
/* Adressen til selve appen. IKKE app.lmexplorers.com: det domenet er
   oppført på /domener, men peker ikke noe sted (Renate fikk "tjeneren ble
   ikke funnet" i Safari 1. september 2026). Den levende adressen er den
   under, den samme som app-kortet på /apper bruker. Endres den, må den
   endres her, på /autopilot-app og i app-kortet. */
const APP = "https://lme-contentstudio.pages.dev";
const FROM_EMAIL = "post@lmexplorers.com";
const FROM_NAME = "Renate fra LME";

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

async function send(env, to, toName, subject, html) {
  if (!env || !env.MAILERSEND_API_KEY || !to) return { ok: false, grunn: "mangler_nokkel_eller_mottaker" };
  try {
    const r = await fetch(MS, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.MAILERSEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: to, name: toName || to }],
        subject: subject,
        html: html,
      }),
    });
    if (!r.ok) return { ok: false, grunn: "mailersend_" + r.status };
    return { ok: true };
  } catch (e) {
    return { ok: false, grunn: "nettverk" };
  }
}

export async function sendAppKjopMail(env, { to, name, lang, betaltMed }) {
  const en = lang === "en";
  const fornavn = esc((name || "").split(" ")[0]);
  const hei = fornavn ? (en ? "Hi " + fornavn + "," : "Hei " + fornavn + ",") : (en ? "Hi," : "Hei,");

  const inner = en
    ? '<h2 style="font-size:21px;margin:0 0 14px;">The app is yours</h2>' +
      "<p>" + hei + "</p>" +
      "<p>You have bought <strong>LME Autopilot</strong>, and the app is now unlocked on your account, for good. No monthly price, and nothing to cancel.</p>" +
      '<p style="margin:18px 0 6px;"><strong>Two things before you start:</strong></p>' +
      '<ol style="margin:0 0 18px;padding-left:20px;">' +
      "<li>Log in with <strong>this same email address</strong>. That is how the app recognises you.</li>" +
      "<li>Go to Settings and paste in your own AI keys, from OpenAI or Gemini for images, Claude for text, and Blotato so the app can post for you.</li>" +
      "</ol>" +
      "<p>Your own keys is the whole point of this purchase: you pay the AI directly for what you make, instead of a monthly fee to me. There is no included quota.</p>" +
      "<p>For images, get a key at <a href=\"https://platform.openai.com/api-keys\" style=\"color:#E91E89;\">platform.openai.com/api-keys</a>. For text, at <a href=\"https://console.anthropic.com/settings/keys\" style=\"color:#E91E89;\">console.anthropic.com/settings/keys</a>. Both need a small top-up under Billing before the key works. Posting for you runs through <a href=\"https://my.blotato.com\" style=\"color:#E91E89;\">Blotato</a>, and needs a paid plan there, since their free version does not include the API. Without it the app cannot publish.</p>" +
      btn(SITE + "/autopilot-nokler?lang=en", "Get started, step by step") +
      "<p>Stuck on the keys? Reply to this email and I will walk you through it.</p>" +
      '<p style="margin:16px 0 0;">Warmly,<br>Renate</p>'
    : '<h2 style="font-size:21px;margin:0 0 14px;">Appen er din</h2>' +
      "<p>" + hei + "</p>" +
      "<p>Du har kjøpt <strong>LME Autopilot</strong>, og appen er nå låst opp på kontoen din, for godt. Ingen månedspris, og ingenting å si opp.</p>" +
      "<p>Nå trenger den nøklene dine for å lage noe. Sett av tjue minutter, så er du i gang. Her er hvert steg.</p>" +
      '<p style="margin:20px 0 6px;"><strong>1. Logg inn med den samme e-postadressen</strong></p>' +
      "<p style=\"margin:0 0 14px;\">Appen kjenner deg igjen på adressen du betalte med. Bruker du en annen, finner den ikke kjøpet ditt. Du får en sekssifret kode på e-post, ikke noe passord å huske.</p>" +
      '<p style="margin:0 0 6px;"><strong>2. Nøkkel til bilder</strong></p>' +
      "<p style=\"margin:0 0 14px;\">Lag konto på <a href=\"https://platform.openai.com/api-keys\" style=\"color:#E91E89;\">platform.openai.com/api-keys</a>, legg inn kort under Billing og fyll på et lite beløp, og trykk Create new secret key. Kopier nøkkelen med en gang, den vises bare én gang. Lim den inn under Innstillinger i appen. Et bilde koster noen få kroner.</p>" +
      '<p style="margin:0 0 6px;"><strong>3. Nøkkel til tekst</strong></p>' +
      "<p style=\"margin:0 0 14px;\">Samme fremgangsmåte på <a href=\"https://console.anthropic.com/settings/keys\" style=\"color:#E91E89;\">console.anthropic.com/settings/keys</a>. Denne skriver bildetekster og innholdsplaner, og koster ører per tekst.</p>" +
      '<p style="margin:0 0 6px;"><strong>4. Koble til publiseringen</strong></p>' +
      "<p style=\"margin:0 0 14px;\">Da lager du konto på <a href=\"https://my.blotato.com\" style=\"color:#E91E89;\">my.blotato.com</a> og velger en betalt plan. API-et følger ikke med gratisversjonen deres, og det er API-et appen bruker. Koble til Instagram, Facebook og TikTok der, og hent nøkkelen under Settings, så API keys. Uten denne koblingen kan ikke appen legge ut for deg, og da mister du hele autopiloten.</p>" +
      '<p style="margin:18px 0 6px;">Hele veiledningen, med lenker og skjermbeskrivelser, ligger her:</p>' +
      btn(SITE + "/autopilot-nokler", "Kom i gang, steg for steg") +
      "<p>Egne nøkler er hele poenget med dette kjøpet: du betaler AI-en direkte for det du lager, i stedet for en månedspris til meg. Det følger derfor ingen kvote med.</p>" +
      "<p style=\"margin:16px 0 0;\">Står du fast på nøklene, svarer du bare på denne e-posten, så hjelper jeg deg gjennom det. Det er den eneste kronglete biten, og den er en engangsjobb.</p>" +
      '<p style="margin:16px 0 0;">Varm hilsen<br>Renate</p>';

  const emne = en ? "LME Autopilot is unlocked for you 🚀" : "LME Autopilot er låst opp for deg 🚀";
  return send(env, to, name, emne, wrap(inner));
}
