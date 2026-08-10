/**
 * Starter et Vipps-kjøp av en LME Læringsverksted-ressurs (Skoledagbøkene,
 * Plansjer, Tidslinje, og alle andre betalte ressurser i samme system,
 * siden de alle deler samme pris-/leveringsformat).
 *
 *   POST /api/vipps-pay
 *   body: { slug, email, name?, phoneNumber?, lang }
 *   -> { ok: true, redirectUrl } eller { ok: false, error }
 *
 * E-postadressen samles inn HER (i skjemaet på siden, før Vipps-knappen
 * trykkes), ikke av Vipps selv, siden webhooken som leverer kjøpet etterpå
 * bare får en betalingsreferanse, ikke kjøperens e-post. Adressen lagres
 * midlertidig på selve ordren (vipps_order:<referanse>) og hentes fram
 * igjen av vipps-webhook.js når betalingen er godkjent.
 */
import { createVippsPayment, parseNokPriceToOre } from "../_lib/vipps.js";
import { KEY_PREFIX as LV_KEY_PREFIX } from "./laeringsverksted.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function cleanSlug(slug) {
  if (typeof slug !== "string") return null;
  const s = slug.trim().toLowerCase();
  return /^[a-z0-9-]{1,80}$/.test(s) ? s : null;
}

function randomId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ ok: false, error: "not_configured" }, 503);
  if (!env.VIPPS_CLIENT_ID) return json({ ok: false, error: "vipps_not_configured" }, 503);

  const body = await request.json().catch(() => ({}));
  const slug = cleanSlug(body.slug);
  const email = ((body.email || "") + "").trim().toLowerCase();
  const lang = body.lang === "en" ? "en" : "no";
  if (!slug) return json({ ok: false, error: "bad_slug" }, 400);
  if (!email || !email.includes("@")) return json({ ok: false, error: "bad_email" }, 400);

  let resource = null;
  try {
    const raw = await env.BUILDER_KV.get(LV_KEY_PREFIX + slug);
    if (raw) resource = JSON.parse(raw);
  } catch (e) {}
  if (!resource || resource.published === false) return json({ ok: false, error: "not_found" }, 404);
  if (resource.priceType !== "betalt") return json({ ok: false, error: "not_a_paid_resource" }, 400);

  // Prisen hentes fra ressursen selv (samme sted salgssiden viser prisen
  // fra), ikke fra klienten, slik at ingen kan manipulere beløpet som
  // faktisk trekkes.
  const priceStr = resource.price && (resource.price.no || resource.price.en);
  const amount = parseNokPriceToOre(priceStr);
  if (!amount) return json({ ok: false, error: "no_price" }, 400);

  const title = (resource.title && (resource.title[lang] || resource.title.no)) || slug;
  const reference = "lv-" + slug + "-" + randomId();
  const origin = new URL(request.url).origin;

  const result = await createVippsPayment(env, {
    amount,
    currency: "NOK",
    reference,
    returnUrl: origin + "/lv/" + slug + "?vipps=" + encodeURIComponent(reference),
    description: title,
    phoneNumber: body.phoneNumber || undefined,
  });
  if (!result.ok) return json(result, 502);

  // Lagre ordren, så webhooken vet hvem som skal ha varen og hva den
  // faktisk het, og kan sjekke at samme ordre ikke leveres to ganger.
  try {
    await env.BUILDER_KV.put(
      "vipps_order:" + reference,
      JSON.stringify({
        reference, slug, email, name: body.name || "", lang,
        amount, currency: "NOK", title,
        status: "created", createdAt: Date.now(),
      })
    );
  } catch (e) {
    return json({ ok: false, error: "order_store_failed" }, 500);
  }

  return json({ ok: true, redirectUrl: result.redirectUrl, reference });
}
