/**
 * Vipps ePayment — delt bibliotek for LME Butikk/Læringsverksted.
 *
 * Bruker Vipps MobilePay sitt gjeldende ePayment API (ikke den utfasede
 * "eCom"-APIen). Ligger her (ikke i den separate workers/vipps-payment/)
 * fordi selve leveringen av kjøpet (sendResourceDeliveryMail,
 * sendOwnerSaleNotice, recordPurchase) allerede lever i denne
 * kodebasen, og skal gjenbrukes uendret, ikke dupliseres i en egen worker.
 *
 * SECRETS (Cloudflare Pages -> Settings -> Variables and secrets):
 *   VIPPS_CLIENT_ID
 *   VIPPS_CLIENT_SECRET
 *   VIPPS_SUBSCRIPTION_KEY
 *   VIPPS_MERCHANT_SERIAL_NUMBER
 *   VIPPS_WEBHOOK_SECRET   (satt automatisk av vipps-register-webhook.js)
 * VARS:
 *   VIPPS_ENV = "test" | "production" (standard: "test")
 */

/* Hvilket Vipps-miljoe vi ringer.

   Verdien skrives av et menneske i Cloudflare, og da kommer den som
   "Production", "production", "PROD" eller med et mellomrom bak. Sammenligner
   vi tegn for tegn mot "production", faller alt annet stille tilbake til
   testmiljoeet, og da svarer Vipps 401 fordi produksjonsnoeklene ikke gjelder
   der. Det tok oss en hel kveld aa finne.

   Derfor: klipp vekk mellomrom, gjoer om til smaa bokstaver, og godta "prod"
   som det samme. Alt annet, inkludert tomt og usatt, er test. */
export function vippsBaseUrl(env) {
  const m = String((env && env.VIPPS_ENV) || "").trim().toLowerCase();
  const produksjon = m === "production" || m === "prod";
  return produksjon ? "https://api.vipps.no" : "https://apitest.vipps.no";
}

/* Alle fire hemmelighetene maa finnes FOER vi ringer Vipps.

   Mangler en av dem, blir headeren sendt som teksten "undefined", og da kan
   Vipps la forbindelsen henge i stedet for aa svare. En Cloudflare-funksjon
   som venter paa et svar som aldri kommer, rekker aldri aa svare selv, og da
   er det Cloudflare som svarer kunden med "502 Bad gateway". Kunden ser en
   feilside uten forklaring, og vi ser ingenting.

   Derfor sjekkes de her, og navnet paa den som mangler kommer med i svaret.
   Det roeper ingen hemmelighet, bare hvilken innstilling som ikke er satt. */
export function manglendeVippsNokkel(env) {
  const kreves = [
    "VIPPS_CLIENT_ID",
    "VIPPS_CLIENT_SECRET",
    "VIPPS_SUBSCRIPTION_KEY",
    "VIPPS_MERCHANT_SERIAL_NUMBER",
  ];
  const mangler = kreves.filter((n) => !env[n] || typeof env[n] !== "string" || !env[n].trim());
  return mangler.length ? mangler.join(", ") : null;
}

/* Vipps med tidsfrist. Uten denne kan et kall som henger spise hele
   funksjonens levetid, og da svarer Cloudflare med 502 i stedet for oss.
   Tolv sekunder er rundelig: Vipps svarer normalt paa under ett. */
const VIPPS_TIDSFRIST_MS = 12000;

async function vippsFetch(url, init) {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(VIPPS_TIDSFRIST_MS) });
  } catch (e) {
    const navn = (e && e.name) || "";
    if (navn === "TimeoutError" || navn === "AbortError") {
      throw new Error("vipps_timeout: svarte ikke innen " + (VIPPS_TIDSFRIST_MS / 1000) + " sekunder");
    }
    throw e;
  }
}

function vippsSystemHeaders() {
  return {
    "Vipps-System-Name": "lme-plattform",
    "Vipps-System-Version": "1.0.0",
    "Vipps-System-Plugin-Name": "lme-butikk",
    "Vipps-System-Plugin-Version": "1.0.0",
  };
}

export async function getVippsAccessToken(env) {
  const mangler = manglendeVippsNokkel(env);
  if (mangler) throw new Error("vipps_mangler_nokkel: " + mangler);
  const res = await vippsFetch(vippsBaseUrl(env) + "/accessToken/get", {
    method: "POST",
    headers: {
      client_id: env.VIPPS_CLIENT_ID,
      client_secret: env.VIPPS_CLIENT_SECRET,
      "Ocp-Apim-Subscription-Key": env.VIPPS_SUBSCRIPTION_KEY,
      "Merchant-Serial-Number": env.VIPPS_MERCHANT_SERIAL_NUMBER,
      ...vippsSystemHeaders(),
    },
  });
  /* Vipps forklarer alltid hvorfor en 400 eller 401 ble avvist, og
     forklaringen er som regel presis: "Invalid client secret provided",
     "Merchant not found" og lignende. Vi beholdt bare tallet og kastet
     teksten, og da sto vi igjen med et statusnummer uten mening.

     Nå tas forklaringen med. Den inneholder ingen hemmelighet, bare hva
     Vipps mente var galt, og den kappes uansett etter 200 tegn. */
  const raatekst = await res.text();
  let data = {};
  try { data = JSON.parse(raatekst); } catch (e) {}
  if (!res.ok || !data.access_token) {
    const hvorfor =
      data.error_description || data.error || data.detail || data.title ||
      raatekst.replace(/\s+/g, " ").trim();
    throw new Error(
      "vipps_token_failed: " + res.status +
      (hvorfor ? " " + String(hvorfor).slice(0, 200) : "")
    );
  }
  return data.access_token;
}

/* Oppretter en betaling. Se opts i workers/vipps-payment/index.js sin
   JSDoc, samme kontrakt. Returnerer { ok, redirectUrl, reference }. */
export async function createVippsPayment(env, opts) {
  if (!opts || !opts.amount || !opts.reference || !opts.returnUrl) {
    return { ok: false, error: "missing_required_fields" };
  }
  let accessToken;
  try {
    accessToken = await getVippsAccessToken(env);
  } catch (e) {
    return { ok: false, error: String(e) };
  }
  const body = {
    amount: { currency: opts.currency || "NOK", value: opts.amount },
    paymentMethod: { type: "WALLET" },
    reference: opts.reference,
    returnUrl: opts.returnUrl,
    userFlow: "WEB_REDIRECT",
    paymentDescription: opts.description || "Kjøp hos Little Montessori Explorers",
  };
  if (opts.phoneNumber) body.customer = { phoneNumber: opts.phoneNumber };
  try {
    const res = await vippsFetch(vippsBaseUrl(env) + "/epayment/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
        "Ocp-Apim-Subscription-Key": env.VIPPS_SUBSCRIPTION_KEY,
        "Merchant-Serial-Number": env.VIPPS_MERCHANT_SERIAL_NUMBER,
        "Idempotency-Key": opts.reference,
        ...vippsSystemHeaders(),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (data && (data.detail || data.title)) || "vipps_payment_failed", status: res.status };
    return { ok: true, redirectUrl: data.redirectUrl, reference: data.reference || opts.reference };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/* Fanger opp (tar betalt) et allerede godkjent (AUTHORIZED) beløp. Kalles
   fra webhooken rett etter at kjøperen har godkjent betalingen i appen,
   slik at pengene faktisk trekkes med en gang, samme opplevelse som et
   Stripe-kjøp (ingen egen "fang opp betaling senere"-jobb for Renate). */
export async function captureVippsPayment(env, reference, amount, currency) {
  let accessToken;
  try {
    accessToken = await getVippsAccessToken(env);
  } catch (e) {
    return { ok: false, error: String(e) };
  }
  try {
    const res = await vippsFetch(vippsBaseUrl(env) + "/epayment/v1/payments/" + encodeURIComponent(reference) + "/capture", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
        "Ocp-Apim-Subscription-Key": env.VIPPS_SUBSCRIPTION_KEY,
        "Merchant-Serial-Number": env.VIPPS_MERCHANT_SERIAL_NUMBER,
        "Idempotency-Key": reference + "-capture",
        ...vippsSystemHeaders(),
      },
      body: JSON.stringify({ modificationAmount: { currency: currency || "NOK", value: amount } }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (data && (data.detail || data.title)) || "vipps_capture_failed", status: res.status };
    return { ok: true, raw: data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/* Registrerer et webhook-abonnement hos Vipps. Kjøres ÉN gang (via
   vipps-register-webhook.js), gir tilbake en `secret` som må lagres som
   VIPPS_WEBHOOK_SECRET for at verifiseringen under skal fungere. */
export async function registerVippsWebhook(env, callbackUrl, events) {
  let accessToken;
  try {
    accessToken = await getVippsAccessToken(env);
  } catch (e) {
    return { ok: false, error: String(e) };
  }
  try {
    const res = await vippsFetch(vippsBaseUrl(env) + "/webhooks/v1/webhooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
        "Ocp-Apim-Subscription-Key": env.VIPPS_SUBSCRIPTION_KEY,
        "Merchant-Serial-Number": env.VIPPS_MERCHANT_SERIAL_NUMBER,
        ...vippsSystemHeaders(),
      },
      body: JSON.stringify({ url: callbackUrl, events: events || ["epayments.payment.authorized.v1"] }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (data && (data.detail || data.title)) || "vipps_webhook_register_failed", status: res.status };
    return { ok: true, id: data.id, secret: data.secret };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/* ---- Webhook-signaturverifisering (HMAC-SHA256) --------------------
   Vipps signerer hvert webhook-kall slik:
     streng-å-signere = "POST\n<path+query>\n<x-ms-date>;<host>;<x-ms-content-sha256>"
     signatur = base64(HMAC-SHA256(streng-å-signere, secret))
   Header "Authorization" inneholder signaturen, se dokumentasjonssøk
   (fikk ikke hentet Vipps sin egen referanseside direkte i dette miljøet,
   nettleseren min ble blokkert, så dette er bygget på søkeresultater +
   generell kunnskap om formatet, ikke dobbeltbekreftet ord for ord). Test
   grundig mot et ekte testmiljø-webhook-kall før dette stoler på i
   produksjon; logg gjerne alle headerne ved første reelle kall for å
   sammenligne mot det som faktisk kommer inn. */
async function hmacSha256Base64(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function sha256Base64(message) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

export async function verifyVippsWebhookSignature(request, rawBody, secret) {
  if (!secret) return false;
  const authHeader = request.headers.get("authorization") || "";
  const msDate = request.headers.get("x-ms-date") || "";
  const contentSha = request.headers.get("x-ms-content-sha256") || "";
  const host = request.headers.get("host") || new URL(request.url).host;
  if (!authHeader || !msDate || !contentSha) return false;

  const expectedContentSha = await sha256Base64(rawBody);
  if (expectedContentSha !== contentSha) return false;

  const url = new URL(request.url);
  const pathAndQuery = url.pathname + (url.search || "");
  const stringToSign = "POST\n" + pathAndQuery + "\n" + msDate + ";" + host + ";" + contentSha;
  const expectedSig = await hmacSha256Base64(secret, stringToSign);

  const sigMatch = authHeader.match(/Signature=([^&\s]+)/);
  const gotSig = sigMatch ? sigMatch[1] : authHeader;
  return gotSig === expectedSig;
}

/* Parser LME sine "499 kr"/"199 kr"-prisstrenger til øre (49900). Støtter
   kun NOK, siden Vipps kun tar betalt i NOK. */
export function parseNokPriceToOre(priceStr) {
  if (!priceStr) return null;
  const cleaned = String(priceStr).replace(/[^\d.,]/g, "").replace(",", ".");
  const kr = parseFloat(cleaned);
  if (!kr || Number.isNaN(kr)) return null;
  return Math.round(kr * 100);
}
