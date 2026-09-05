/**
 * LME Strikk & Hekle: oppfølgingsserien etter kjøpet.
 *
 * Tre brev. Rekkefølgen er valgt med vilje: hjelp først, tilbud etterpå.
 * Den som nettopp har betalt skal føle at hun får mer enn hun betalte for,
 * før hun blir spurt om noe. Derfor selger brev 1 ingenting.
 *
 * Mersalget er bestemt av Renate 5. september 2026: Inner Circle, og et
 * kommende strikkeprodukt. Det siste finnes ikke ennå, så brev 3 spør henne
 * i stedet for å love noe. Svarene kommer rett i innboksen til Renate, og
 * er den beste kildene til hva som faktisk bør lages.
 *
 * Køen ligger i BUILDER_KV under strikk_fu:<e-post>, og tømmes daglig av
 * functions/api/cron/strikk-followups.js (GitHub Actions).
 */
const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "post@lmexplorers.com";
const FROM_NAME = "Renate fra LME";

export const KEY_PREFIX = "strikk_fu:";

/* Stegene i serien, med dager etter kjøpet. Endres et tall her, gjelder det
   alle nye kjøp. De som alt står i køen beholder tiden de fikk. */
export const TRINN = [
  { nr: 1, dager: 2 },
  { nr: 2, dager: 7 },
  { nr: 3, dager: 21 },
];

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

/* Et mykt tilbud nederst, tydelig atskilt fra hjelpen over. */
function tilbud(tittel, tekst, href, knapp) {
  return '<div style="margin:26px 0 0;padding:18px 20px;background:#FDF1F4;border-radius:14px;">' +
    '<p style="margin:0 0 6px;font-weight:bold;">' + tittel + "</p>" +
    '<p style="margin:0 0 12px;font-size:15px;color:#5A5560;">' + tekst + "</p>" +
    '<a href="' + href + '" style="font-weight:bold;color:#C13D6A;text-decoration:none;">' + knapp + " →</a></div>";
}

const BREV = {
  no: {
    1: {
      emne: "Prøvelappen som avgjør alt",
      inner:
        '<h2 style="font-size:21px;margin:0 0 14px;">Det ene som avgjør om tallene stemmer</h2>' +
        "<p>Nå har du hatt appen et par dager, og jeg vil gi deg det rådet som betyr mest.</p>" +
        "<p>Alle utregningene bygger på strikkefastheten din. Er den feil, er alt annet feil, uansett hvor riktig appen regner. Derfor: strikk prøvelappen større enn 10 x 10 cm, gjerne 15 x 15, og mål midt i den. Kantene trekker seg alltid litt sammen og lyver på deg.</p>" +
        "<p>Og vask den. Legg den i vann slik du vil vaske plagget, tørk den flatt, og mål først da. Mange garn endrer seg i vann, og et plagg som passet før vask er ikke til mye hjelp.</p>" +
        "<p>Når lappen er klar, legger du inn de to tallene øverst i appen. De huskes, så det gjør du bare én gang per garn.</p>" +
        btn(SITE + "/strikk", "Åpne appen") +
        "<p>Klem,<br>Renate</p>",
    },
    2: {
      emne: "Fra mål til ferdig genser, steg for steg",
      inner:
        '<h2 style="font-size:21px;margin:0 0 14px;">Slik tar du et helt plagg gjennom appen</h2>' +
        "<p>Skal du strikke en genser uten oppskrift, er dette rekkefølgen:</p>" +
        '<ol style="margin:0 0 18px;padding-left:20px;">' +
        "<li><strong>Masker og rader:</strong> legg inn brystvidden delt på to og lengden, så får du oppleggingen.</li>" +
        "<li><strong>Øk og fell:</strong> ermet fra håndleddet til overarmen, så vet du hvor ofte du øker og på hvilke rader.</li>" +
        "<li><strong>Fell av:</strong> ermehullet, halsen og skuldrene, med rekken oppskriftene bruker.</li>" +
        "<li><strong>Garnmengde:</strong> vei prøvelappen, legg inn delene, så vet du hvor mye du skal kjøpe før du starter.</li>" +
        "</ol>" +
        "<p>Bruk telleren mens du strikker. Setter du den til å markere hver 6. rad, sier den fra når det er rad for å øke, og du slipper å telle på nytt hver gang du legger fra deg arbeidet.</p>" +
        btn(SITE + "/strikk", "Åpne appen") +
        tilbud(
          "Strikker du alene?",
          "I Inner Circle møter du andre som holder på med det samme, og vi har live-samlinger sammen hver måned. Der kan du vise fram det du holder på med, og få hjelp når du står fast.",
          SITE + "/community",
          "Se hva Inner Circle er"
        ) +
        "<p style=\"margin-top:22px\">Klem,<br>Renate</p>",
    },
    3: {
      emne: "Hva skal jeg lage til deg neste gang?",
      inner:
        '<h2 style="font-size:21px;margin:0 0 14px;">Jeg vil gjerne høre fra deg</h2>' +
        "<p>Det er tre uker siden du kjøpte appen, og nå er jeg nysgjerrig: hva har du laget med den?</p>" +
        "<p>Jeg holder på å planlegge det neste til deg som strikker og hekler. Det kan bli oppskrifter, det kan bli et kurs, det kan bli noe helt annet. Og jeg vil heller lage det du faktisk trenger enn det jeg tror du trenger.</p>" +
        "<p>Så: <strong>svar på denne e-posten</strong> og fortell meg hva som er vanskeligst for deg akkurat nå. Den kommer rett til meg, og jeg leser hver eneste en. De som svarer, er de første som får vite når det nye er klart.</p>" +
        tilbud(
          "Inner Circle",
          "Vil du ha meg tettere på underveis, er det der jeg er. Live-samlinger hver måned, opptak etterpå, og et fellesskap som heier.",
          SITE + "/community",
          "Bli med i Inner Circle"
        ) +
        "<p style=\"margin-top:22px\">Klem,<br>Renate</p>",
    },
  },
  en: {
    1: {
      emne: "The swatch that decides everything",
      inner:
        '<h2 style="font-size:21px;margin:0 0 14px;">The one thing that decides whether the numbers are right</h2>' +
        "<p>You have had the app for a couple of days now, and I want to give you the advice that matters most.</p>" +
        "<p>Every calculation builds on your gauge. If that is wrong, everything else is wrong, no matter how correctly the app does the maths. So make the swatch bigger than 10 x 10 cm, ideally 15 x 15, and measure in the middle of it. The edges always pull in a little and lie to you.</p>" +
        "<p>And wash it. Put it in water the way you will wash the garment, dry it flat, and only then measure. Many yarns change in water, and a garment that fitted before washing is not much help.</p>" +
        "<p>Once the swatch is ready, enter the two numbers at the top of the app. They are remembered, so you only do that once per yarn.</p>" +
        btn(SITE + "/strikk", "Open the app") +
        "<p>Warm wishes,<br>Renate</p>",
    },
    2: {
      emne: "From measurements to a finished sweater, step by step",
      inner:
        '<h2 style="font-size:21px;margin:0 0 14px;">How to take a whole garment through the app</h2>' +
        "<p>If you are knitting a sweater without a pattern, this is the order:</p>" +
        '<ol style="margin:0 0 18px;padding-left:20px;">' +
        "<li><strong>Stitches and rows:</strong> enter half the chest width and the length, and you get the cast-on.</li>" +
        "<li><strong>Increase and decrease:</strong> the sleeve from wrist to upper arm, so you know how often to increase and on which rows.</li>" +
        "<li><strong>Bind off:</strong> the armhole, the neckline and the shoulders, with the sequence patterns use.</li>" +
        "<li><strong>Yarn amount:</strong> weigh the swatch, enter the pieces, and you know how much to buy before you start.</li>" +
        "</ol>" +
        "<p>Use the counter while you knit. Set it to mark every 6th row and it tells you when it is time to increase, so you do not have to count again every time you put your work down.</p>" +
        btn(SITE + "/strikk", "Open the app") +
        tilbud(
          "Knitting on your own?",
          "In Inner Circle you meet others working on the same things, and we have live sessions together every month. You can show what you are making, and get help when you are stuck.",
          SITE + "/community",
          "See what Inner Circle is"
        ) +
        "<p style=\"margin-top:22px\">Warm wishes,<br>Renate</p>",
    },
    3: {
      emne: "What should I make for you next?",
      inner:
        '<h2 style="font-size:21px;margin:0 0 14px;">I would love to hear from you</h2>' +
        "<p>It is three weeks since you bought the app, and now I am curious: what have you made with it?</p>" +
        "<p>I am planning the next thing for those of you who knit and crochet. It could be patterns, it could be a course, it could be something else entirely. And I would rather make what you actually need than what I think you need.</p>" +
        "<p>So: <strong>reply to this email</strong> and tell me what is hardest for you right now. It comes straight to me, and I read every single one. Those who reply are the first to know when the new thing is ready.</p>" +
        tilbud(
          "Inner Circle",
          "If you want me closer along the way, that is where I am. Live sessions every month, recordings afterwards, and a community that cheers you on.",
          SITE + "/community",
          "Join Inner Circle"
        ) +
        "<p style=\"margin-top:22px\">Warm wishes,<br>Renate</p>",
    },
  },
};

/** Brevet for ett steg. Returnerer null hvis steget ikke finnes. */
export function brevFor({ steg, lang, navn }) {
  const l = lang === "en" ? "en" : "no";
  const b = BREV[l][steg];
  if (!b) return null;
  const fornavn = esc((navn || "").split(" ")[0]);
  const hei = fornavn ? (l === "en" ? "Hi " + fornavn + "," : "Hei " + fornavn + ",") : (l === "en" ? "Hi," : "Hei,");
  return { emne: b.emne, html: wrap("<p>" + hei + "</p>" + b.inner) };
}

export async function sendOppfolging(env, { to, name, lang, steg }) {
  if (!env || !env.MAILERSEND_API_KEY || !to) return { ok: false, grunn: "mangler_nokkel_eller_mottaker" };
  const brev = brevFor({ steg: steg, lang: lang, navn: name });
  if (!brev) return { ok: false, grunn: "ukjent_steg" };
  try {
    const r = await fetch(MS, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.MAILERSEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: to, name: name || to }],
        subject: brev.emne,
        html: brev.html,
      }),
    });
    if (!r.ok) return { ok: false, grunn: "mailersend_" + r.status };
    return { ok: true };
  } catch (e) {
    return { ok: false, grunn: "nettverk" };
  }
}

/**
 * Legger kjøperen i køen. Kalles fra leveringen, både Stripe og Vipps.
 * Er hun der fra før, røres ingenting: to kjøp skal ikke gi to serier.
 */
export async function koOppfolging(env, { email, name, lang }) {
  if (!env || !env.BUILDER_KV || !email) return { ok: false };
  const nokkel = KEY_PREFIX + String(email).trim().toLowerCase();
  try {
    const finnes = await env.BUILDER_KV.get(nokkel);
    if (finnes) return { ok: true, grunn: "alt_i_ko" };
    const forste = TRINN[0];
    await env.BUILDER_KV.put(nokkel, JSON.stringify({
      email: String(email).trim().toLowerCase(),
      name: name || "",
      lang: lang === "en" ? "en" : "no",
      steg: forste.nr,
      sendAfter: Date.now() + forste.dager * 24 * 60 * 60 * 1000,
      startet: Date.now(),
    }));
    return { ok: true };
  } catch (e) {
    return { ok: false, grunn: "kv" };
  }
}

/** Neste steg etter det som nettopp ble sendt, eller null når serien er ferdig. */
export function nesteSteg(steg) {
  const i = TRINN.findIndex(function (t) { return t.nr === steg; });
  if (i < 0 || i + 1 >= TRINN.length) return null;
  const neste = TRINN[i + 1];
  const forrige = TRINN[i];
  return { nr: neste.nr, omMs: (neste.dager - forrige.dager) * 24 * 60 * 60 * 1000 };
}
