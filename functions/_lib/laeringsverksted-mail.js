/**
 * LME Læringsverksted — leveringsmail ved kjøp av en enkeltressurs, via
 * MailerSend rett fra koden (samme mønster som claude-mail.js), IKKE en
 * MailerLite-automasjon (se CLAUDE.md). Sendes fra oppskrift-webhook.js når
 * betalingslenken finnes i LAERINGSVERKSTED_PAYMENT_LINKS
 * (functions/_lib/purchase-links.js).
 *
 * ENGANGS-OPPSETT: samme MAILERSEND_API_KEY-hemmelighet som claude-mail.js.
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

function content(lang, name, title, downloadUrl, resourceUrl) {
  const no = lang !== "en";
  const hi = esc(name) || (no ? "der" : "there");
  if (no) {
    return {
      subject: "Takk for kjøpet: " + title,
      html: wrap(
        '<p>Hei ' + hi + ',</p>' +
        '<p>Tusen takk for kjøpet av <strong>' + esc(title) + '</strong> fra LME Læringsverksted!</p>' +
        (downloadUrl ? btn(downloadUrl, "Last ned ressursen") : "") +
        '<p>Du finner ressursen igjen når som helst på <a href="' + resourceUrl + '" style="color:#E91E89;">produktsiden</a>, og under "Mine kjøp" på <a href="' + SITE + '/min-konto" style="color:#E91E89;">Min side</a>.</p>' +
        '<p>Har du spørsmål, svar på denne e-posten, så hjelper jeg deg.</p>' +
        '<p>Klem fra Renate</p>'
      ),
      text: "Takk for kjøpet av " + title + "! Last ned: " + (downloadUrl || resourceUrl),
    };
  }
  return {
    subject: "Thank you for your purchase: " + title,
    html: wrap(
      '<p>Hi ' + hi + ',</p>' +
      '<p>Thank you so much for purchasing <strong>' + esc(title) + '</strong> from the LME Learning Workshop!</p>' +
      (downloadUrl ? btn(downloadUrl, "Download the resource") : "") +
      '<p>You can find it again any time on the <a href="' + resourceUrl + '" style="color:#E91E89;">product page</a>, and under "My purchases" on your <a href="' + SITE + '/min-konto" style="color:#E91E89;">account page</a>.</p>' +
      '<p>Questions? Just reply to this email.</p>' +
      '<p>With love from Renate</p>'
    ),
    text: "Thank you for purchasing " + title + "! Download: " + (downloadUrl || resourceUrl),
  };
}

export async function sendResourceDeliveryMail(env, opts) {
  const to = opts && opts.to;
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey || !to) return { ok: false, skipped: true };
  const msg = content(opts.lang, opts.name, opts.title, opts.downloadUrl, opts.resourceUrl);
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
