/**
 * LME Studio Tjenester, e-postene rundt en forespørsel.
 *
 * To brev sendes med en gang noen fyller ut skjemaet på /tjenester:
 *   1. Varsel til Renate, så hun ser forespørselen uten å måtte åpne siden.
 *   2. Kvittering til kunden, så hun vet at det kom fram og hva som skjer nå.
 *
 * Sendes med MailerSend rett fra koden, samme mønster som resten av
 * plattformen (CLAUDE.md: MailerLite skal aldri brukes igjen).
 * Krever MAILERSEND_API_KEY, som allerede er satt opp.
 */
const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "post@lmexplorers.com";
const FROM_NAME = "Renate fra LME";

/* Hit går varselet om nye forespørsler. Står den tom, sendes varselet ikke,
   men forespørselen ligger uansett trygt i KV og vises på /tjenester. */
const VARSEL_TIL = "renate@lmexplorers.com";

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

/* Varselet til Renate. Alltid på norsk, det er hun som leser det. */
export async function sendVarselTilRenate(env, sak, pakkeNavn) {
  const rader = [
    ["Navn", sak.navn],
    ["E-post", sak.epost],
    ["Telefon", sak.telefon],
    ["Pakke", pakkeNavn + (sak.pris ? " (" + sak.pris + " kr)" : "")],
    ["Lenke til materiale", sak.lenke],
    ["Språk", sak.lang === "en" ? "engelsk" : "norsk"],
  ];
  let tabell = "";
  for (let i = 0; i < rader.length; i++) {
    if (!rader[i][1]) continue;
    tabell += '<tr><td style="padding:6px 12px 6px 0;color:#938E99;white-space:nowrap;vertical-align:top;">' +
      esc(rader[i][0]) + '</td><td style="padding:6px 0;">' + esc(rader[i][1]) + "</td></tr>";
  }
  const inner =
    '<h2 style="font-size:21px;margin:0 0 14px;">Ny forespørsel på en tjenestepakke</h2>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;">' + tabell + "</table>" +
    '<p style="margin:18px 0 6px;color:#938E99;font-size:13px;">Hva hun skrev:</p>' +
    '<div style="background:#FBF6F0;border-radius:12px;padding:14px 16px;white-space:pre-wrap;">' + esc(sak.melding) + "</div>" +
    '<p style="margin:20px 0 6px;">Svar henne på <a href="mailto:' + esc(sak.epost) + '" style="color:#E91E89;">' + esc(sak.epost) + "</a>, og send betalingslenke eller faktura når dere er enige.</p>" +
    '<p style="margin:14px 0 0;"><a href="' + SITE + '/tjenester" style="color:#E91E89;">Se alle forespørslene på /tjenester</a></p>';
  return send(env, VARSEL_TIL, "Renate Dahl", "Ny forespørsel: " + pakkeNavn, wrap(inner));
}

/* Kvitteringen til kunden. Tospråklig. */
export async function sendKvitteringTilKunde(env, sak, pakkeNavn) {
  const en = sak.lang === "en";
  const fornavn = (sak.navn || "").split(" ")[0];
  const hei = en ? "Hi " + esc(fornavn) + "," : "Hei " + esc(fornavn) + ",";
  const inner = en
    ? '<h2 style="font-size:21px;margin:0 0 14px;">Thank you, I have got it</h2>' +
      "<p>" + hei + "</p>" +
      "<p>Your request for <strong>" + esc(pakkeNavn) + "</strong> has arrived, and I read it myself. You will hear from me within one working day, with a fixed price and a suggested start date.</p>" +
      '<p style="margin:18px 0 6px;color:#938E99;font-size:13px;">This is what you sent me:</p>' +
      '<div style="background:#FBF6F0;border-radius:12px;padding:14px 16px;white-space:pre-wrap;">' + esc(sak.melding) + "</div>" +
      "<p style=\"margin:20px 0 0;\">Nothing is charged before you have said yes to the price. If anything has changed in the meantime, just reply to this email.</p>" +
      '<p style="margin:16px 0 0;">Warmly,<br>Renate</p>'
    : '<h2 style="font-size:21px;margin:0 0 14px;">Takk, jeg har fått den</h2>' +
      "<p>" + hei + "</p>" +
      "<p>Forespørselen din på <strong>" + esc(pakkeNavn) + "</strong> er kommet fram, og jeg leser den selv. Du hører fra meg innen én virkedag, med fast pris og forslag til når vi starter.</p>" +
      '<p style="margin:18px 0 6px;color:#938E99;font-size:13px;">Dette er det du sendte meg:</p>' +
      '<div style="background:#FBF6F0;border-radius:12px;padding:14px 16px;white-space:pre-wrap;">' + esc(sak.melding) + "</div>" +
      '<p style="margin:20px 0 0;">Ingenting trekkes før du har sagt ja til prisen. Har noe endret seg i mellomtiden, svarer du bare på denne e-posten.</p>' +
      '<p style="margin:16px 0 0;">Varm hilsen<br>Renate</p>';
  const emne = en ? "I have got your request 💗" : "Jeg har fått forespørselen din 💗";
  return send(env, sak.epost, sak.navn, emne, wrap(inner));
}

/**
 * Kvitteringen til en som har betalt en pakke rett i kassen, uten å be om
 * tilbud først. Da er prisen avklart, og det eneste som gjenstår er å få tak
 * i materialet hennes. Derfor spør dette brevet om nettopp det, i stedet for
 * å love et pristilbud hun allerede har betalt.
 *
 * Stripe sender sin egen betalingskvittering. Denne er min, med neste steg.
 */
export async function sendKvitteringKjop(env, sak, pakkeNavn) {
  const fornavn = esc((sak.navn || "").split(" ")[0]);
  const harLenke = !!sak.lenke;
  const inner =
    '<h2 style="font-size:21px;margin:0 0 14px;">Takk! Nå setter jeg i gang</h2>' +
    "<p>Hei " + fornavn + ",</p>" +
    "<p>Du har kjøpt <strong>" + esc(pakkeNavn) + "</strong>, og jeg har fått beskjed. Nå er det bare én ting jeg trenger fra deg, og det er materialet ditt.</p>" +
    (harLenke
      ? '<p>Du la igjen denne lenken i kassen, og den ser jeg på med en gang: <br><span style="color:#938E99;">' + esc(sak.lenke) + "</span></p>"
      : "<p>Svar på denne e-posten med en lenke til filene dine, fra Google Drive, Dropbox eller WeTransfer. Er de store, er en lenke bedre enn vedlegg.</p>") +
    '<p style="margin:18px 0 6px;">Fortell meg gjerne samtidig:</p>' +
    '<ul style="margin:0 0 18px;padding-left:20px;">' +
    "<li>hvem innholdet er for</li>" +
    "<li>hvilken tone du vil ha, rolig eller energisk</li>" +
    "<li>om du har farger, logo eller en font jeg skal holde meg til</li>" +
    "</ul>" +
    "<p>Så snart jeg har materialet, starter leveringstiden å løpe, og du får et utkast før noe er endelig. Er det noe du lurer på underveis, svarer du bare her.</p>" +
    '<p style="margin:16px 0 0;">Varm hilsen<br>Renate</p>';
  return send(env, sak.epost, sak.navn, "Takk for kjøpet, her er neste steg 💗", wrap(inner));
}
