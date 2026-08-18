/**
 * Mia & Teo, gratisheftet "Mitt første følelsesverktøy" — 5-stegs
 * automatisk e-postserie via MailerSend. Samme mønster som Claude-kursets
 * oppfølging (_lib/claude-mail.js): ingen MailerLite-automasjon (CLAUDE.md).
 *
 * Jobben lagres i BUILDER_KV under KEY_PREFIX + <e-post> og beveger seg
 * gjennom STEPS via den daglige cronen (api/cron/mia-teo-followups.js).
 *
 * ENGANGS-OPPSETT: samme MAILERSEND_API_KEY som Claude-kurset (allerede satt).
 */
const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "renate@lmexplorers.com";
const FROM_NAME = "Renate Dahl";

export const KEY_PREFIX = "mia_teo_fu:";

// Forsinkelse (i millisekunder) fra FORRIGE steg til neste steg sendes
// (ikke kumulativt fra opt-in). Med disse verdiene lander stegene på cirka
// dag 0, 1, 3, 6 og 9 etter opt-in.
export const STEP_DELAYS_MS = [
  2 * 60 * 1000,             // steg 0: levering, ~2 minutter etter opt-in
  1 * 24 * 60 * 60 * 1000,   // steg 1: brukstips, 1 dag etter steg 0 (dag ~1)
  2 * 24 * 60 * 60 * 1000,   // steg 2: møt Mia & Teo, 2 dager etter steg 1 (dag ~3)
  3 * 24 * 60 * 60 * 1000,   // steg 3: introduser serien, 3 dager etter steg 2 (dag ~6)
  3 * 24 * 60 * 60 * 1000,   // steg 4: tilbud på samlepakken, 3 dager etter steg 3 (dag ~9)
];
export const STEP_COUNT = STEP_DELAYS_MS.length;

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

const DL36 = SITE + "/laeringsverksted-filer/nedlasting/mia-teo-forste-folelsesverktoy-gratis-3-6-no.pdf";
const DL69 = SITE + "/laeringsverksted-filer/nedlasting/mia-teo-forste-folelsesverktoy-gratis-6-9-no.pdf";
const BUNDLE_NO = SITE + "/lv/mia-teo-folelser-serien-komplett";
const BUNDLE_EN = SITE + "/lv/mia-teo-folelser-serien-komplett?lang=en";
const CATALOG_NO = SITE + "/laeringsverksted";
const CATALOG_EN = SITE + "/laeringsverksted?lang=en";

const STEPS = {
  no: [
    // Steg 0: levering
    (name) => ({
      subject: "Her er gratisheftet ditt 🌸",
      html: wrap(
        '<p>Hei ' + esc(name) + ',</p>' +
        '<p>Tusen takk for at du lastet ned <strong>Mitt første følelsesverktøy med Mia &amp; Teo</strong>! Her er begge aldersversjonene:</p>' +
        btn(DL36, "Last ned, 3–6 år") +
        btn(DL69, "Last ned, 6–9 år") +
        '<p>Et lite tips til å begynne med: bruk følelsestermometeret i en rolig stund, gjerne før følelsene blir sterke. Det skal hjelpe barnet sette ord på det som kjennes, ikke fjerne følelsen.</p>' +
        '<p>Klem fra Renate</p>'
      ),
      text: "Hei " + (name || "") + ",\n\nHer er begge aldersversjonene av Mitt første følelsesverktøy:\n3-6 år: " + DL36 + "\n6-9 år: " + DL69 + "\n\nKlem fra Renate",
    }),
    // Steg 1: brukstips
    (name) => ({
      subject: "Et lite brukstips til følelsesverktøyet ditt",
      html: wrap(
        '<p>Hei ' + esc(name) + ',</p>' +
        '<p>Håper du har fått kikket på heftet. Her er et lite tips fra veiledningen i heftet:</p>' +
        '<p><em>«Følelser er ikke feil. Målet er ikke å fjerne følelsen, men å forstå hva kroppen trenger.»</em></p>' +
        '<p>Prøv gjerne "Fire små ro-strategier"-siden sammen med barnet i dag. Tilby to kjente strategier, og la barnet velge selv, det er også lov å si nei.</p>' +
        '<p>Klem fra Renate</p>'
      ),
      text: "Hei " + (name || "") + ",\n\nEt lite tips: følelser er ikke feil. Prøv \"Fire små ro-strategier\"-siden sammen med barnet i dag, og la barnet velge selv.\n\nKlem fra Renate",
    }),
    // Steg 2: møt Mia & Teo
    (name) => ({
      subject: "Møt Mia & Teo 🌿",
      html: wrap(
        '<p>Hei ' + esc(name) + ',</p>' +
        '<p>Kanskje barnet ditt allerede har møtt Mia og Teo i gratisheftet? De to bestevennene er hovedpersonene i alt jeg lager hos Little Montessori Explorers, fra bøker og sanger til læringsressursene i Læringsverksted.</p>' +
        '<p>Mia og Teo utforsker verden sammen, akkurat som barnet ditt: nysgjerrig, litt forsiktig noen ganger, og alltid klare for neste oppdagelse.</p>' +
        btn(CATALOG_NO, "Se hele Læringsverksted") +
        '<p>Klem fra Renate</p>'
      ),
      text: "Hei " + (name || "") + ",\n\nMia og Teo er hovedpersonene i alt jeg lager hos Little Montessori Explorers.\n\nSe hele Læringsverksted: " + CATALOG_NO + "\n\nKlem fra Renate",
    }),
    // Steg 3: introduser serien
    (name) => ({
      subject: "Gratisheftet er bare begynnelsen",
      html: wrap(
        '<p>Hei ' + esc(name) + ',</p>' +
        '<p>Mitt første følelsesverktøy er en liten smakebit fra en hel serie om følelser og sosial kompetanse med Mia &amp; Teo. Serien har ni ressurser:</p>' +
        '<ul style="padding-left:20px;line-height:1.8;">' +
        '<li>Mia &amp; Teo utforsker følelsene (trepartskort)</li>' +
        '<li>Hva skjedde? Situasjonskort</li>' +
        '<li>La oss snakke om følelser (samtalekort)</li>' +
        '<li>Følelsene i kroppen (3–6 og 6–9 år)</li>' +
        '<li>Min følelsesbok (3–6 og 6–9 år)</li>' +
        '<li>Følelsestermometer og ro-strategier (3–6 og 6–9 år)</li>' +
        '</ul>' +
        btn(BUNDLE_NO, "Se hele serien") +
        '<p>Klem fra Renate</p>'
      ),
      text: "Hei " + (name || "") + ",\n\nHele serien har ni ressurser om følelser og sosial kompetanse med Mia & Teo.\n\nSe hele serien: " + BUNDLE_NO + "\n\nKlem fra Renate",
    }),
    // Steg 4: tilbud på samlepakken
    (name) => ({
      subject: "Et lite velkomsttilbud til deg 🎁",
      html: wrap(
        '<p>Hei ' + esc(name) + ',</p>' +
        '<p>Som takk for at du er ny leser: få <strong>20 % rabatt</strong> på hele "Følelser og sosial kompetanse"-serien, samlet i én pakke.</p>' +
        '<p>Bruk koden <strong>MIATEO20</strong> i kassen.</p>' +
        btn(BUNDLE_NO, "Se samlepakken og bruk koden") +
        '<p>Har du spørsmål, svar bare på denne e-posten.</p>' +
        '<p>Klem fra Renate</p>'
      ),
      text: "Hei " + (name || "") + ",\n\nFå 20 % rabatt på hele følelsesserien med koden MIATEO20 i kassen.\n\nSe samlepakken: " + BUNDLE_NO + "\n\nKlem fra Renate",
    }),
  ],
  en: [
    (name) => ({
      subject: "Here's your free booklet 🌸",
      html: wrap(
        '<p>Hi ' + esc(name) + ',</p>' +
        '<p>Thank you so much for downloading <strong>My First Feelings Toolkit with Mia &amp; Teo</strong>! Here are both age versions:</p>' +
        btn(DL36, "Download, ages 3-6") +
        btn(DL69, "Download, ages 6-9") +
        '<p>A quick tip to start with: use the feelings thermometer in a calm moment, ideally before feelings get strong. It\'s meant to help the child put words to what they feel, not remove the feeling.</p>' +
        '<p>Warm wishes,<br>Renate</p>'
      ),
      text: "Hi " + (name || "") + ",\n\nHere are both age versions of My First Feelings Toolkit:\nAges 3-6: " + DL36 + "\nAges 6-9: " + DL69 + "\n\nWarm wishes,\nRenate",
    }),
    (name) => ({
      subject: "A quick tip for your feelings toolkit",
      html: wrap(
        '<p>Hi ' + esc(name) + ',</p>' +
        '<p>Hope you\'ve had a chance to look through the booklet. Here\'s a tip from the guide inside:</p>' +
        '<p><em>"Feelings aren\'t wrong. The goal isn\'t to remove the feeling, but to understand what the body needs."</em></p>' +
        '<p>Try the "Four small calming strategies" page with your child today. Offer two familiar strategies and let the child choose, it\'s also okay to say no.</p>' +
        '<p>Warm wishes,<br>Renate</p>'
      ),
      text: "Hi " + (name || "") + ",\n\nA quick tip: feelings aren't wrong. Try the \"Four small calming strategies\" page with your child today.\n\nWarm wishes,\nRenate",
    }),
    (name) => ({
      subject: "Meet Mia & Teo 🌿",
      html: wrap(
        '<p>Hi ' + esc(name) + ',</p>' +
        '<p>Your child may have already met Mia and Teo in the free booklet. The two best friends are the main characters in everything I make at Little Montessori Explorers, from books and songs to the resources in the Learning Workshop.</p>' +
        '<p>Mia and Teo explore the world together, just like your child: curious, a little cautious sometimes, and always ready for the next discovery.</p>' +
        btn(CATALOG_EN, "See the whole Learning Workshop") +
        '<p>Warm wishes,<br>Renate</p>'
      ),
      text: "Hi " + (name || "") + ",\n\nMia and Teo are the main characters in everything I make at Little Montessori Explorers.\n\nSee the Learning Workshop: " + CATALOG_EN + "\n\nWarm wishes,\nRenate",
    }),
    (name) => ({
      subject: "The free booklet is just the beginning",
      html: wrap(
        '<p>Hi ' + esc(name) + ',</p>' +
        '<p>My First Feelings Toolkit is a small taste of a whole series on feelings and social skills with Mia &amp; Teo. The series has nine resources:</p>' +
        '<ul style="padding-left:20px;line-height:1.8;">' +
        '<li>Mia &amp; Teo Explore Feelings (three-part cards)</li>' +
        '<li>What Happened? Situation cards</li>' +
        '<li>Let\'s Talk About Feelings (conversation cards)</li>' +
        '<li>Feelings in the Body (ages 3-6 and 6-9)</li>' +
        '<li>My Feelings Book (ages 3-6 and 6-9)</li>' +
        '<li>Feelings Thermometer and Calming Strategies (ages 3-6 and 6-9)</li>' +
        '</ul>' +
        btn(BUNDLE_EN, "See the whole series") +
        '<p>Warm wishes,<br>Renate</p>'
      ),
      text: "Hi " + (name || "") + ",\n\nThe whole series has nine resources on feelings and social skills with Mia & Teo.\n\nSee the series: " + BUNDLE_EN + "\n\nWarm wishes,\nRenate",
    }),
    (name) => ({
      subject: "A little welcome offer for you 🎁",
      html: wrap(
        '<p>Hi ' + esc(name) + ',</p>' +
        '<p>As thanks for being a new reader: get <strong>20% off</strong> the whole "Feelings and Social Skills" series, bundled together.</p>' +
        '<p>Use code <strong>MIATEO20</strong> at checkout.</p>' +
        btn(BUNDLE_EN, "See the bundle and use the code") +
        '<p>Questions? Just reply to this email.</p>' +
        '<p>Warm wishes,<br>Renate</p>'
      ),
      text: "Hi " + (name || "") + ",\n\nGet 20% off the whole feelings series with code MIATEO20 at checkout.\n\nSee the bundle: " + BUNDLE_EN + "\n\nWarm wishes,\nRenate",
    }),
  ],
};

function miaTeoEmail(lang, step, name) {
  const l = lang === "en" ? "en" : "no";
  const list = STEPS[l] || STEPS.no;
  const fn = list[step] || list[0];
  return fn(name || "");
}

/** Sender ett steg i serien via MailerSend. Returnerer {ok, status/skipped/error}. */
export async function sendMiaTeoMail(env, opts) {
  const to = opts && opts.to;
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey || !to) return { ok: false, skipped: true };
  const msg = miaTeoEmail(opts.lang, opts.step, opts.name);
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
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
