/**
 * YouTube-kurset — automatisk oppfølgingsserie via MailerSend.
 *
 * Når noen bekrefter e-posten sin på /gratis-youtube-kurs (se _lib/free-
 * course.js), køes en 3-ukers oppfølgingsserie i KV (ytfu:<e-post>:<dag>).
 * En daglig jobb (functions/api/cron/youtube-followups.js) sender de som
 * er modne. Samme MailerSend-oppsett som resten av plattformen.
 *
 *   Dag 2  · påminnelse om å starte + arbeidsboken
 *   Dag 5  · nisje-steget + sjekklisten
 *   Dag 9  · manus med Claude (mersalg: Claude-kurset)
 *   Dag 14 · klar for neste steg (mersalg: verktøyene / Videre med YouTube)
 *   Dag 21 · hvordan går det + inn i den vanlige ukentlige serien
 */

const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "post@lmexplorers.com";
const FROM_NAME = "Renate fra LME";

const COURSE = SITE + "/kurs/youtube";
const WORKBOOK = SITE + "/ressurser/print/youtube-kurs-arbeidsbok";
const CLAUDE_COURSE = SITE + "/claude-kurs";
const UPGRADE = SITE + "/oppgrader";
const NEXT_LEVEL = SITE + "/kurs/youtube-videre";

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
  return '<a href="' + href + '" style="background:#E91E89;color:#ffffff;text-decoration:none;font-weight:bold;padding:13px 24px;border-radius:999px;display:inline-block;">' + label + '</a>';
}
function btnRow(pairs) {
  return '<p style="margin:22px 0;">' + pairs.map(function (p) { return btn(p[0], p[1]); }).join('<br><br>') + '</p>';
}

const CONTENT = {
  no: {
    day2: (name) => ({
      subject: "Har du åpnet kurset ennå? 🌱",
      html: wrap(
        '<p>Hei ' + (name || '') + ',</p>' +
        '<p>Bare en liten hilsen: har du fått åpnet «Voks på YouTube med AI» ennå? Modul 1 tar bare noen minutter, og handler mest om å legge unnskyldningene til side.</p>' +
        '<p>Jeg har også laget en arbeidsbok som følger kurset, med refleksjon, sjekklister og ett konkret steg per del. Perfekt å ha ved siden av mens du går gjennom leksjonene.</p>' +
        btnRow([[COURSE, "Åpne kurset"], [WORKBOOK, "Last ned arbeidsboken"]]) +
        '<p>Klem fra Renate</p>'
      ),
      text: "Hei " + (name || "") + ",\n\nHar du fått åpnet kurset ennå? " + COURSE + "\n\nArbeidsboken: " + WORKBOOK + "\n\nKlem fra Renate",
    }),
    day5: (name) => ({
      subject: "Har du funnet nisjen din?",
      html: wrap(
        '<p>Hei ' + (name || '') + ',</p>' +
        '<p>Den vanligste grunnen til at en YouTube-kanal aldri tar av, er feil nisje. I del 2 av kurset går jeg gjennom sjekklisten for en god nisje, og hvordan du validerer den før du bygger videre.</p>' +
        '<p>Åpne arbeidsboken og fyll ut refleksjonsspørsmålene i kapittel 2, det tar ti minutter og gjør resten av kurset lettere.</p>' +
        btnRow([[WORKBOOK, "Til sjekklisten i arbeidsboken"]]) +
        '<p>Klem fra Renate</p>'
      ),
      text: "Hei " + (name || "") + ",\n\nHar du funnet nisjen din? Sjekklisten ligger i arbeidsboken: " + WORKBOOK + "\n\nKlem fra Renate",
    }),
    day9: (name) => ({
      subject: "Manuset ditt, klart på 20 minutter",
      html: wrap(
        '<p>Hei ' + (name || '') + ',</p>' +
        '<p>Når nisjen er på plass, er manuset neste steg. I kurset viser jeg hvordan Claude skriver et helt manus i din stil på rundt tjue minutter, når du gir det et vinnende manus som referanse.</p>' +
        '<p>Vil du bli enda kvassere på å skrive med Claude, ikke bare til manus, men til alt fra foreldrebrev til bildetekster? Claude-kurset mitt tar deg fra "hva skriver jeg" til ferdige oppskrifter du kan bruke med en gang.</p>' +
        btnRow([[CLAUDE_COURSE, "Se Claude-kurset"]]) +
        '<p>Klem fra Renate</p>'
      ),
      text: "Hei " + (name || "") + ",\n\nManuset er neste steg, se leksjon 8 i kurset. Vil du bli kvassere på Claude generelt? " + CLAUDE_COURSE + "\n\nKlem fra Renate",
    }),
    day14: (name) => ({
      subject: "Klar for neste steg?",
      html: wrap(
        '<p>Hei ' + (name || '') + ',</p>' +
        '<p>Du har nå vært gjennom hele systemet: tankesett, nisje, pakking og produksjon. Herfra er det to naturlige veier videre.</p>' +
        '<p><strong>Få verktøyene</strong>: oppgrader planen din og lås opp Reel Studio og Content Studio, så AI gjør enda mer av jobben for deg.</p>' +
        '<p><strong>Videre med YouTube</strong>: fortsettelsen av kurset, om å lese tallene, bygge et system og skalere til flere kanaler.</p>' +
        btnRow([[UPGRADE, "🚀 Få verktøyene"], [NEXT_LEVEL, "Fortsett: Videre med YouTube →"]]) +
        '<p>Klem fra Renate</p>'
      ),
      text: "Hei " + (name || "") + ",\n\nKlar for neste steg?\nFå verktøyene: " + UPGRADE + "\nVidere med YouTube: " + NEXT_LEVEL + "\n\nKlem fra Renate",
    }),
    day21: (name) => ({
      subject: "Hvordan går det med kanalen din?",
      html: wrap(
        '<p>Hei ' + (name || '') + ',</p>' +
        '<p>Det er tre uker siden du startet, og jeg er nysgjerrig: hvordan går det? Har du valgt nisjen din, eller lagt ut den første videoen?</p>' +
        '<p>Uansett hvor du er i prosessen: svar gjerne på denne e-posten, jeg leser alt selv. Og fra nå av hører du fra meg med jevne mellomrom, med små, rolige tips til å skape og vokse.</p>' +
        '<p>Klem fra Renate</p>'
      ),
      text: "Hei " + (name || "") + ",\n\nHvordan går det med kanalen din? Svar gjerne, jeg leser alt selv.\n\nKlem fra Renate",
    }),
  },
  en: {
    day2: (name) => ({
      subject: "Have you opened the course yet? 🌱",
      html: wrap(
        '<p>Hi ' + (name || '') + ',</p>' +
        '<p>Just a little nudge: have you opened "Grow on YouTube with AI" yet? Module 1 only takes a few minutes, and is mostly about setting the excuses aside.</p>' +
        '<p>I also made a workbook that follows the course, with reflection, checklists and one concrete step per part. Perfect to keep beside you as you go through the lessons.</p>' +
        btnRow([[COURSE + "?lang=en", "Open the course"], [WORKBOOK + "?lang=en", "Download the workbook"]]) +
        '<p>Warm wishes, Renate</p>'
      ),
      text: "Hi " + (name || "") + ",\n\nHave you opened the course yet? " + COURSE + "?lang=en\n\nWorkbook: " + WORKBOOK + "?lang=en\n\nWarm wishes, Renate",
    }),
    day5: (name) => ({
      subject: "Have you found your niche?",
      html: wrap(
        '<p>Hi ' + (name || '') + ',</p>' +
        '<p>The most common reason a YouTube channel never takes off is the wrong niche. In part 2 of the course I walk through the checklist for a good niche, and how to validate it before you build further.</p>' +
        '<p>Open the workbook and fill in the reflection questions in chapter 2, it takes ten minutes and makes the rest of the course easier.</p>' +
        btnRow([[WORKBOOK + "?lang=en", "Go to the checklist in the workbook"]]) +
        '<p>Warm wishes, Renate</p>'
      ),
      text: "Hi " + (name || "") + ",\n\nHave you found your niche? The checklist is in the workbook: " + WORKBOOK + "?lang=en\n\nWarm wishes, Renate",
    }),
    day9: (name) => ({
      subject: "Your script, ready in 20 minutes",
      html: wrap(
        '<p>Hi ' + (name || '') + ',</p>' +
        '<p>Once the niche is in place, the script is next. In the course I show how Claude writes a full script in your style in about twenty minutes, when you give it a winning script as a reference.</p>' +
        '<p>Want to get even sharper at writing with Claude, not just for scripts but for everything from parent letters to captions? My Claude course takes you from "what do I write" to ready-made recipes you can use right away.</p>' +
        btnRow([[CLAUDE_COURSE + "?lang=en", "See the Claude course"]]) +
        '<p>Warm wishes, Renate</p>'
      ),
      text: "Hi " + (name || "") + ",\n\nThe script is next, see lesson 8. Want to get sharper with Claude in general? " + CLAUDE_COURSE + "?lang=en\n\nWarm wishes, Renate",
    }),
    day14: (name) => ({
      subject: "Ready for the next step?",
      html: wrap(
        '<p>Hi ' + (name || '') + ',</p>' +
        "<p>You've now been through the whole system: mindset, niche, packaging and production. From here there are two natural paths forward.</p>" +
        '<p><strong>Get the tools</strong>: upgrade your plan and unlock Reel Studio and Content Studio, so AI does even more of the work for you.</p>' +
        '<p><strong>Next level with YouTube</strong>: the continuation of the course, on reading the numbers, building a system, and scaling to more channels.</p>' +
        btnRow([[UPGRADE, "🚀 Get the tools"], [NEXT_LEVEL + "?lang=en", "Continue: Next level with YouTube →"]]) +
        '<p>Warm wishes, Renate</p>'
      ),
      text: "Hi " + (name || "") + ",\n\nReady for the next step?\nGet the tools: " + UPGRADE + "\nNext level with YouTube: " + NEXT_LEVEL + "?lang=en\n\nWarm wishes, Renate",
    }),
    day21: (name) => ({
      subject: "How's your channel coming along?",
      html: wrap(
        '<p>Hi ' + (name || '') + ',</p>' +
        "<p>It's been three weeks since you started, and I'm curious: how's it going? Have you chosen your niche, or posted your first video?</p>" +
        "<p>Wherever you are in the process: feel free to reply to this email, I read everything myself. And from now on you'll hear from me now and then, with small, calm tips for creating and growing.</p>" +
        '<p>Warm wishes, Renate</p>'
      ),
      text: "Hi " + (name || "") + ",\n\nHow's your channel coming along? Feel free to reply, I read everything myself.\n\nWarm wishes, Renate",
    }),
  },
};

export function youtubeCourseEmail(lang, kind, name) {
  const l = lang === "en" ? "en" : "no";
  const byLang = CONTENT[l] || CONTENT.no;
  const fn = byLang[kind] || byLang.day2;
  return fn(name || "");
}

export async function sendYoutubeCourseMail(env, opts) {
  const to = opts && opts.to;
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey || !to) return { ok: false, skipped: true };
  const msg = youtubeCourseEmail(opts.lang, opts.kind, opts.name);
  try {
    const res = await fetch(MS, {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        reply_to: { email: "renate@lmexplorers.com", name: "Renate Dahl" },
        to: [{ email: to, name: opts.name || undefined }],
        subject: msg.subject, html: msg.html, text: msg.text,
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/* Køer hele 3-ukers serien for en nylig bekreftet abonnent. */
export async function enqueueYoutubeFollowups(env, email, name, lang) {
  if (!env.BUILDER_KV || !email) return;
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const steps = [
    { day: 2, kind: "day2" },
    { day: 5, kind: "day5" },
    { day: 9, kind: "day9" },
    { day: 14, kind: "day14" },
    { day: 21, kind: "day21" },
  ];
  for (const s of steps) {
    const key = "ytfu:" + email.trim().toLowerCase() + ":" + s.day;
    await env.BUILDER_KV.put(key, JSON.stringify({
      email: email.trim(), name: name || "", lang: lang === "en" ? "en" : "no",
      kind: s.kind, sendAfter: now + s.day * DAY,
    }), { expirationTtl: 40 * 24 * 60 * 60 }); // 40 dager, god margin
  }
}
