/**
 * Gelato print-on-demand — automatisk trykk + frakt for fysiske produkter
 * (Skoledagbøkene, planleggere, Plansjer/Tidslinje), samme mønster som
 * resten av plattformens integrasjoner (Stripe, MailerSend):
 * ett fetch()-kall rett fra Cloudflare Functions, ingen mellomtjeneste.
 *
 * Krever miljøvariabelen GELATO_API_KEY (Cloudflare Pages -> Settings ->
 * Variables and secrets), API-nøkkel hentet fra dashboard.gelato.com ->
 * Developer/API.
 *
 * IKKE ferdig koblet på noe kjøp ennå. Mangler før dette kan brukes:
 *   1. Riktig `productUid` for hvert fysiske produkt, hentet fra Gelato
 *      sin egen produktkatalog (dashboard.gelato.com), ikke noe man kan
 *      gjette seg til, den koder inn eksakt papir/binding/størrelse.
 *      NB: sjekk at sidetallet passer, "Photo Books"-linjen ser ut til å
 *      ha en øvre grense (så vidt vi fant, rundt 200 sider), mens
 *      Skoledagbøkene er 358 sider, dette må bekreftes i Gelato-kontoen.
 *   2. Stripe-kjøpet må samle inn leveringsadresse (shipping_address),
 *      det gjør det ikke i dag siden alt har vært rene digitale kjøp.
 *   3. Print-klare PDF-filer må ligge på en offentlig URL Gelato kan
 *      hente dem fra (f.eks. R2 eller /funnel/nedlasting/...).
 */

const GELATO_ORDERS_URL = "https://order.gelatoapis.com/v4/orders";

/**
 * Oppretter en trykk- og fraktordre hos Gelato.
 *
 * @param {object} env - Cloudflare env (må ha GELATO_API_KEY).
 * @param {object} opts
 * @param {string} opts.orderReferenceId - Unik referanse, f.eks. Stripe checkout-session-ID.
 * @param {string} opts.productUid - Gelato sin produkt-ID (fra deres katalog).
 * @param {string} opts.fileUrl - Offentlig URL til den trykkeklare PDF-en.
 * @param {number} [opts.quantity] - Antall eksemplarer, standard 1.
 * @param {string} opts.currency - "NOK" eller "USD" osv.
 * @param {string} opts.email - Kjøperens e-post (for ordrevarsler fra Gelato).
 * @param {string} opts.name - Mottakerens navn.
 * @param {object} opts.address - { addressLine1, addressLine2?, city, postCode, country (ISO 3166-1 alpha-2), state? }
 * @returns {Promise<{ok: boolean, orderId?: string, status?: number, error?: string}>}
 */
export async function createGelatoOrder(env, opts) {
  const apiKey = env.GELATO_API_KEY;
  if (!apiKey) return { ok: false, error: "missing_api_key" };
  if (!opts || !opts.productUid || !opts.fileUrl || !opts.address) {
    return { ok: false, error: "missing_required_fields" };
  }

  const body = {
    orderType: "order",
    orderReferenceId: opts.orderReferenceId,
    customerReferenceId: opts.email || opts.orderReferenceId,
    currency: opts.currency || "NOK",
    items: [
      {
        itemReferenceId: opts.orderReferenceId + "-1",
        productUid: opts.productUid,
        files: [{ type: "default", url: opts.fileUrl }],
        quantity: opts.quantity || 1,
      },
    ],
    shippingAddress: {
      firstName: (opts.name || "").split(" ")[0] || opts.name || "",
      lastName: (opts.name || "").split(" ").slice(1).join(" ") || "",
      addressLine1: opts.address.addressLine1,
      addressLine2: opts.address.addressLine2 || undefined,
      city: opts.address.city,
      postCode: opts.address.postCode,
      country: opts.address.country,
      state: opts.address.state || undefined,
      email: opts.email || undefined,
    },
  };

  try {
    const res = await fetch(GELATO_ORDERS_URL, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, error: (data && data.message) || "gelato_error" };
    return { ok: true, orderId: data && data.id, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
