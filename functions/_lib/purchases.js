/**
 * Delt kjøpslogg på tvers av plattformen: purchases:<e-post> i BUILDER_KV,
 * en liste med de siste kjøpene (nyeste først), uavhengig av produkttype
 * (oppskrift, kurs, modul, kreditt, Autopilot-abonnement, Læringsverksted-
 * ressurs). Brukt av Min side ("Kjøp"-fanen) til å vise ekte kjøpshistorikk
 * i stedet for den tidligere statiske eksempelvisningen.
 *
 * recordPurchase() kalles ADDITIVT fra webhooken, ETTER at selve leveringen
 * (tilgang/e-post) allerede er i gang, og er alltid pakket i try/catch der
 * den brukes: kjøpsloggen skal aldri kunne stoppe eller forsinke en faktisk
 * leveranse.
 */

function purchaseKey(email) {
  return "purchases:" + email.trim().toLowerCase();
}

export async function recordPurchase(env, email, item) {
  if (!env.BUILDER_KV || !email) return;
  const key = purchaseKey(email);
  let list = [];
  try {
    const raw = await env.BUILDER_KV.get(key);
    if (raw) list = JSON.parse(raw) || [];
    if (!Array.isArray(list)) list = [];
  } catch (e) {
    list = [];
  }
  list.unshift({
    type: item.type || "other", // "oppskrift" | "kurs" | "modul" | "kreditt" | "autopilot" | "claude" | "laeringsverksted"
    id: item.id || "",
    title: item.title || "",
    amount: typeof item.amount === "number" ? item.amount : null, // Stripe amount_total, øre/cent
    currency: item.currency || null,
    url: item.url || "", // lenke til produktet/nedlastingen, hvis relevant
    date: Date.now(),
  });
  if (list.length > 200) list = list.slice(0, 200);
  await env.BUILDER_KV.put(key, JSON.stringify(list));
}

export async function getPurchases(env, email) {
  if (!env.BUILDER_KV || !email) return [];
  try {
    const raw = await env.BUILDER_KV.get(purchaseKey(email));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}
