/**
 * Vipps-betaling — egen Cloudflare Worker.
 * ========================================================================
 * Bruker Vipps MobilePay sitt ePayment API (den nyeste, gjeldende APIen;
 * den gamle "eCom"-APIen er faset ut hos Vipps og har andre endepunkter
 * enn det man kanskje husker/googler seg til).
 *
 *   1) Henter et JWT-tilgangstoken fra Access Token-APIet
 *      (POST /accessToken/get), med client_id/client_secret + de andre
 *      påkrevde headerne.
 *   2) Oppretter en betaling med det tokenet
 *      (POST /epayment/v1/payments), som gir tilbake en redirectUrl
 *      brukeren sendes til (Vipps-appen på mobil, eller en nettside for
 *      å skanne QR-kode/logge inn på desktop).
 *
 * Testmiljø: https://apitest.vipps.no
 * Produksjon: https://api.vipps.no
 * (styres av miljøvariabelen VIPPS_ENV, se wrangler.toml)
 *
 * SECRETS (wrangler secret put ...), hentes fra portal.vippsmobilepay.com:
 *   VIPPS_CLIENT_ID
 *   VIPPS_CLIENT_SECRET
 *   VIPPS_SUBSCRIPTION_KEY       ("Ocp-Apim-Subscription-Key")
 *   VIPPS_MERCHANT_SERIAL_NUMBER (MSN-et for salgsenheten)
 *
 * Detaljer og oppsett: se VIPPS-SETUP.md i denne mappen.
 */

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function baseUrl(env) {
  return env.VIPPS_ENV === "production" ? "https://api.vipps.no" : "https://apitest.vipps.no";
}

/* Standard-headerne Vipps ber om på alle kall, så de kan se hvilken
   integrasjon som ringer dem (nyttig for dem ved feilsøking, ikke
   noe man trenger å tenke mer på enn dette). */
function vippsSystemHeaders() {
  return {
    "Vipps-System-Name": "lme-plattform",
    "Vipps-System-Version": "1.0.0",
    "Vipps-System-Plugin-Name": "lme-vipps-worker",
    "Vipps-System-Plugin-Version": "1.0.0",
  };
}

/**
 * Henter et ferskt JWT-tilgangstoken. Gyldig i 1 time i testmiljø, 24
 * timer i produksjon, men hentes friskt her hver gang for enkelhets
 * skyld. Ønsker man å spare kall kan token+utløpstid mellomlagres i KV.
 */
async function getVippsAccessToken(env) {
  const res = await fetch(baseUrl(env) + "/accessToken/get", {
    method: "POST",
    headers: {
      client_id: env.VIPPS_CLIENT_ID,
      client_secret: env.VIPPS_CLIENT_SECRET,
      "Ocp-Apim-Subscription-Key": env.VIPPS_SUBSCRIPTION_KEY,
      "Merchant-Serial-Number": env.VIPPS_MERCHANT_SERIAL_NUMBER,
      ...vippsSystemHeaders(),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error("vipps_token_failed: " + res.status + " " + JSON.stringify(data));
  }
  return data.access_token;
}

/**
 * Oppretter en betaling og returnerer Vipps sin redirect-URL.
 *
 * @param {object} env - Worker env (må ha VIPPS_*-hemmelighetene).
 * @param {object} opts
 * @param {number} opts.amount - Beløp i øre (1000 = 10,00 kr).
 * @param {string} opts.reference - Unik ordrereferanse (bokstaver/tall/bindestrek).
 * @param {string} opts.returnUrl - Siden brukeren sendes tilbake til etter betaling.
 * @param {string} [opts.description] - Kort beskrivelse av kjøpet, vises i Vipps-appen.
 * @param {string} [opts.phoneNumber] - Kjøperens mobilnummer (8 siffer, uten landskode), valgfritt.
 * @param {string} [opts.currency] - Standard "NOK".
 * @returns {Promise<{ok: boolean, redirectUrl?: string, reference?: string, error?: string}>}
 */
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
    const res = await fetch(baseUrl(env) + "/epayment/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
        "Ocp-Apim-Subscription-Key": env.VIPPS_SUBSCRIPTION_KEY,
        "Merchant-Serial-Number": env.VIPPS_MERCHANT_SERIAL_NUMBER,
        // Må være unik per forsøk, forhindrer at en automatisk retry
        // (f.eks. ved tidsavbrudd) lager to betalinger av samme kjøp.
        "Idempotency-Key": opts.idempotencyKey || opts.reference,
        ...vippsSystemHeaders(),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (data && (data.detail || data.title)) || "vipps_payment_failed", status: res.status };
    // NB: feltnavnet redirectUrl er ikke 100 % dobbeltbekreftet mot Vipps
    // sin egen dokumentasjon her (nettleseren min ble blokkert fra å
    // hente den direkte), så test dette responsfeltet i testmiljøet før
    // dette settes i produksjon. Loggfør hele `data` ved første test.
    return { ok: true, redirectUrl: data.redirectUrl, reference: data.reference || opts.reference, raw: data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    if (url.pathname === "/vipps/pay" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      if (!body.amount || !body.reference || !body.returnUrl) {
        return json({ error: "amount, reference og returnUrl er påkrevd" }, 400);
      }
      const result = await createVippsPayment(env, body);
      if (!result.ok) return json(result, 502);
      return json(result);
    }

    return json({ error: "not_found" }, 404);
  },
};
