/**
 * LME Autopilot — oppfølgingsserien etter et kjøp.
 *
 * HVORFOR DEN FINNES
 * Kjøpet er ikke det vanskelige. Det vanskelige er de tjue minuttene etterpå,
 * der kunden skal koble til det appen trenger for å virke. Kommer hun ikke
 * gjennom dem, ligger kjøpet ubrukt, og da sier hun opp eller ber om pengene
 * tilbake. Serien er tre korte brev som tar henne dit.
 *
 * TO VARIANTER, FOR DE TO MÅTENE Å KJØPE PÅ
 *   "kjop"       engangskjøpet: hun bruker sine egne AI-nøkler, og det er
 *                nøklene som er den kronglete biten.
 *   "abonnement" Start, Proff eller VIP: bildene og tekstene er inkludert på
 *                LMEs nøkkel, så hun trenger ingen nøkler i det hele tatt.
 *                Da er nisjen hennes det viktigste å få på plass.
 *
 * Sendes med MailerSend rett fra koden, som all annen e-post på plattformen
 * (CLAUDE.md: MailerLite skal aldri brukes igjen). Køen ligger i KV som
 * `autopilot_fu:<e-post>`, og functions/api/cron/autopilot-followups.js
 * sender de som er modne.
 */
const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
/* Adressen til selve appen. IKKE app.lmexplorers.com, se app-kjop-mail.js. */
const APP = "https://lme-contentstudio.pages.dev";
const FROM_EMAIL = "post@lmexplorers.com";
const FROM_NAME = "Renate fra LME";

/* Stegene i serien, med dager etter kjøpet. Endres et tall her, gjelder det
   bare nye kjøp: de som alt står i køen beholder tiden de fikk. */
export const STEG = [
  { nr: 1, dager: 2 },
  { nr: 2, dager: 7 },
  { nr: 3, dager: 21 },
];

export function nesteSteg(nr) {
  const i = STEG.findIndex((s) => s.nr === nr);
  return i >= 0 && i + 1 < STEG.length ? STEG[i + 1] : null;
}

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
    '<div style="max-width:560px;color:#938E99;font-size:12px;padding:16px;">Little Montessori Explorers · Renate Dahl · Tønsberg</div>' +
    '</td></tr></table></body></html>';
}

function btn(href, label) {
  return '<p style="margin:22px 0;"><a href="' + href + '" style="background:#E91E89;color:#ffffff;text-decoration:none;font-weight:bold;padding:13px 24px;border-radius:999px;display:inline-block;">' + esc(label) + '</a></p>';
}

function lenke(href, tekst) {
  return '<a href="' + href + '" style="color:#E91E89;">' + tekst + '</a>';
}

/* Innholdet. Hvert steg finnes i to varianter og to språk. Teksten er
   bevisst kort: dette er brev som skal leses på en telefon, mellom to
   andre gjøremål. */
const BREV = {
  kjop: {
    no: {
      1: {
        emne: "Fikk du lagt inn nøklene? 🔑",
        html: "<p>Hei {navn},</p>" +
          "<p>Appen er din, og det eneste som står igjen er nøklene. Det er den ene kronglete biten, og den er en engangsjobb på rundt tjue minutter.</p>" +
          "<p>Du trenger to: én til bilder, fra OpenAI eller Gemini, og én til tekst, fra Claude. Begge limes inn under Innstillinger i appen. Da betaler du AI-en direkte for det du lager, noen få kroner per bilde og ører per tekst.</p>" +
          btn(SITE + "/autopilot-nokler", "Hent nøklene, steg for steg") +
          "<p>Står du fast, svarer du bare på denne e-posten. Da hjelper jeg deg gjennom det, og det koster ingenting.</p>" +
          "<p style=\"margin:16px 0 0;\">Varm hilsen<br>Renate</p>",
      },
      2: {
        emne: "En hel måned med innhold, på ti minutter",
        html: "<p>Hei {navn},</p>" +
          "<p>Her er den raskeste veien inn: Skriv inn nisjen din under Innstillinger, altså hva du faktisk driver med og hvem du snakker til. Alt appen lager etterpå treffer mye bedre.</p>" +
          "<p>Så velger du et tema og lar den bygge en innholdsplan. Du får hooks, bildetekster, emneknagger og ferdige innlegg, fordelt utover ukedagene. Det du ikke liker, bytter du ut med ett trykk.</p>" +
          btn(APP, "Åpne appen") +
          "<p>Mitt beste råd: Lag hele planen først, og finpuss etterpå. Det er lettere å rette på noe som finnes enn å starte på blankt ark hver dag.</p>" +
          "<p style=\"margin:16px 0 0;\">Varm hilsen<br>Renate</p>",
      },
      3: {
        emne: "Hvordan går det med Autopilot?",
        html: "<p>Hei {navn},</p>" +
          "<p>Det er noen uker siden du kjøpte appen, og jeg er oppriktig nysgjerrig: Har du fått den i gang, og legger den ut for deg nå?</p>" +
          "<p>Svarer du på denne, leser jeg hvert ord selv. Både det som funker og det som irriterer deg, for det er sånn appen blir bedre.</p>" +
          "<p>Vil du heller ha den satt opp ferdig, gjør jeg det sammen med deg på video. Da går vi gjennom nøkler, publisering og din første plan, og du er i gang før vi legger på. Se " + lenke(SITE + "/tjenester", "lmexplorers.com/tjenester") + ".</p>" +
          "<p style=\"margin:16px 0 0;\">Varm hilsen<br>Renate</p>",
      },
    },
    en: {
      1: {
        emne: "Did you get your keys in? 🔑",
        html: "<p>Hi {navn},</p>" +
          "<p>The app is yours, and the only thing left is the keys. That is the one fiddly part, and it is a one-time job of about twenty minutes.</p>" +
          "<p>You need two: one for images, from OpenAI or Gemini, and one for text, from Claude. Both go under Settings in the app. You then pay the AI directly for what you make.</p>" +
          btn(SITE + "/autopilot-nokler?lang=en", "Get the keys, step by step") +
          "<p>Stuck? Just reply to this email and I will walk you through it, at no cost.</p>" +
          "<p style=\"margin:16px 0 0;\">Warmly,<br>Renate</p>",
      },
      2: {
        emne: "A whole month of content, in ten minutes",
        html: "<p>Hi {navn},</p>" +
          "<p>Here is the fastest way in: Write your niche under Settings, that is what you actually do and who you speak to. Everything the app makes afterwards will fit much better.</p>" +
          "<p>Then pick a topic and let it build a content plan. You get hooks, captions, hashtags and finished posts, spread across the week. Anything you dislike, you swap with one tap.</p>" +
          btn(APP, "Open the app") +
          "<p>My best advice: Make the whole plan first and polish afterwards. It is easier to fix something that exists than to start from a blank page every day.</p>" +
          "<p style=\"margin:16px 0 0;\">Warmly,<br>Renate</p>",
      },
      3: {
        emne: "How is Autopilot going?",
        html: "<p>Hi {navn},</p>" +
          "<p>It has been a few weeks since you bought the app, and I am genuinely curious: Did you get it going, and is it posting for you now?</p>" +
          "<p>Reply to this and I read every word myself. Both what works and what annoys you, because that is how the app gets better.</p>" +
          "<p>Would you rather have it set up for you, I do it together with you on video. See " + lenke(SITE + "/tjenester", "lmexplorers.com/tjenester") + ".</p>" +
          "<p style=\"margin:16px 0 0;\">Warmly,<br>Renate</p>",
      },
    },
  },
  abonnement: {
    no: {
      1: {
        emne: "Bildene dine er klare, og de går på min nøkkel 🎨",
        html: "<p>Hei {navn},</p>" +
          "<p>En ting mange lurer på først: Bildene og tekstene er inkludert i abonnementet ditt og går på min nøkkel, så dem kan du lage med en gang, uten å skaffe noe selv.</p>" +"<p>Skal appen legge ut helt av seg selv, er det én ting du må ordne: din egen nøkkel fra Blotato. Den krever en betalt plan hos dem, fra 29 dollar i måneden. Uten den lager appen alt innholdet ferdig, men du legger det ut selv. Slik gjør du det: <a href=\"https://lmexplorers.com/autopilot-nokler\">lmexplorers.com/autopilot-nokler</a></p>" +
          "<p>Det eneste jeg vil du skal gjøre nå, er å skrive inn nisjen din under Innstillinger. Hva du driver med, og hvem du snakker til. Det tar to minutter, og alt appen lager etterpå treffer mye bedre.</p>" +
          btn(APP, "Åpne appen") +
          "<p>Står du fast, svarer du bare på denne e-posten.</p>" +
          "<p style=\"margin:16px 0 0;\">Varm hilsen<br>Renate</p>",
      },
      2: {
        emne: "En hel måned med innhold, på ti minutter",
        html: "<p>Hei {navn},</p>" +
          "<p>Velg et tema, og la appen bygge en innholdsplan. Du får hooks, bildetekster, emneknagger og ferdige innlegg, fordelt utover ukedagene. Det du ikke liker, bytter du ut med ett trykk.</p>" +
          "<p>Vil du at appen skal legge dem ut for deg også, kobler du til Blotato under Innstillinger. Det er en egen tjeneste som koster 29 dollar i måneden hos dem, og den er det eneste som kommer i tillegg til abonnementet ditt. Hopper du over det, laster du ned innleggene og legger dem ut selv.</p>" +
          btn(APP, "Lag planen din") +
          "<p style=\"margin:16px 0 0;\">Varm hilsen<br>Renate</p>",
      },
      3: {
        emne: "Hvordan går det med Autopilot?",
        html: "<p>Hei {navn},</p>" +
          "<p>Det er noen uker siden du ble med, og jeg er oppriktig nysgjerrig: Bruker du appen, og hjelper den deg faktisk?</p>" +
          "<p>Svarer du på denne, leser jeg hvert ord selv. Både det som funker og det som irriterer deg, for det er sånn appen blir bedre.</p>" +
          "<p>Og trenger du et par timer spart, gjør jeg jobben for deg i stedet. Se " + lenke(SITE + "/tjenester", "lmexplorers.com/tjenester") + ".</p>" +
          "<p style=\"margin:16px 0 0;\">Varm hilsen<br>Renate</p>",
      },
    },
    en: {
      1: {
        emne: "Your images are ready, and they run on my key 🎨",
        html: "<p>Hi {navn},</p>" +
          "<p>One thing people wonder about first: Images and text are included in your subscription and run on my key, so you can start on those right away without getting anything yourself.</p>" +"<p>For the app to post on its own there is one thing you need: your own key from Blotato. It requires a paid plan with them, from 29 dollars a month. Without it the app still makes everything, you just post it yourself. Here is how: <a href=\"https://lmexplorers.com/autopilot-nokler\">lmexplorers.com/autopilot-nokler</a></p>" +
          "<p>The only thing I want you to do now is write your niche under Settings. What you do, and who you speak to. It takes two minutes, and everything the app makes afterwards will fit much better.</p>" +
          btn(APP, "Open the app") +
          "<p>Stuck? Just reply to this email.</p>" +
          "<p style=\"margin:16px 0 0;\">Warmly,<br>Renate</p>",
      },
      2: {
        emne: "A whole month of content, in ten minutes",
        html: "<p>Hi {navn},</p>" +
          "<p>Pick a topic and let the app build a content plan. You get hooks, captions, hashtags and finished posts, spread across the week. Anything you dislike, you swap with one tap.</p>" +
          "<p>If you want the app to post them for you as well, connect Blotato under Settings. That is a separate service at 29 dollars a month with them, and it is the only thing that comes on top of your subscription. Skip it, and you download the posts and publish them yourself.</p>" +
          btn(APP, "Make your plan") +
          "<p style=\"margin:16px 0 0;\">Warmly,<br>Renate</p>",
      },
      3: {
        emne: "How is Autopilot going?",
        html: "<p>Hi {navn},</p>" +
          "<p>It has been a few weeks since you joined, and I am genuinely curious: Are you using the app, and is it actually helping?</p>" +
          "<p>Reply to this and I read every word myself. Both what works and what annoys you, because that is how the app gets better.</p>" +
          "<p>And if you need a couple of hours back, I can do the work for you instead. See " + lenke(SITE + "/tjenester", "lmexplorers.com/tjenester") + ".</p>" +
          "<p style=\"margin:16px 0 0;\">Warmly,<br>Renate</p>",
      },
    },
  },
};

/** Brevet for ett steg. Returnerer null hvis steget ikke finnes. */
export function brevFor({ steg, kilde, lang, navn }) {
  const k = kilde === "abonnement" ? "abonnement" : "kjop";
  const l = lang === "en" ? "en" : "no";
  const b = BREV[k][l][steg];
  if (!b) return null;
  const fornavn = esc(String(navn || "").split(" ")[0]);
  const hei = fornavn || (l === "en" ? "there" : "du");
  return {
    subject: b.emne,
    html: wrap(b.html.replace("{navn}", hei)),
  };
}

export async function sendOppfolging(env, { to, name, lang, steg, kilde }) {
  if (!env || !env.MAILERSEND_API_KEY || !to) return { ok: false, grunn: "mangler_nokkel_eller_mottaker" };
  const brev = brevFor({ steg: steg, kilde: kilde, lang: lang, navn: name });
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
        subject: brev.subject,
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
 * Legg kunden i oppfølgingskøen. Kalles rett etter at kjøpet er levert.
 * Skriver aldri over en kø som alt finnes, så en kunde som kjøper to ganger
 * ikke får serien to ganger samtidig.
 */
export async function koOppfolging(env, { email, name, lang, kilde }) {
  try {
    if (!env || !env.BUILDER_KV || !email) return;
    const nokkel = "autopilot_fu:" + String(email).trim().toLowerCase();
    const finnes = await env.BUILDER_KV.get(nokkel);
    if (finnes) return;
    const forste = STEG[0];
    await env.BUILDER_KV.put(nokkel, JSON.stringify({
      email: String(email).trim().toLowerCase(),
      name: name || "",
      lang: lang === "en" ? "en" : "no",
      kilde: kilde === "abonnement" ? "abonnement" : "kjop",
      steg: forste.nr,
      sendAfter: Date.now() + forste.dager * 24 * 60 * 60 * 1000,
      opprettet: new Date().toISOString(),
    }), { expirationTtl: 60 * 60 * 24 * 120 });
  } catch (e) {
    // Stille med vilje. En kø som ikke ble skrevet skal aldri velte et kjøp.
  }
}
