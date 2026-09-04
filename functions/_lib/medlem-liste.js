/**
 * Medlemmenes egne e-postlister.
 *
 * Renates abonnenter ligger på nl:<e-post> og er hennes. Et medlem som samler
 * adresser gjennom sitt eget kurs eller sin egen gave, skal ha sin egen liste,
 * som aldri blandes med hennes. Derfor et eget lager per eier:
 *
 *   nl-medlem:<eier>:<e-post>  -> { epost, navn, kilde, sprak, ts }
 *
 * Medlemmet ser lista på /min-epost, kan laste den ned som CSV og ta den med
 * til det e-postverktøyet de selv velger. LME sender ikke nyhetsbrev på
 * medlemmets vegne: det ville sendt deres innhold fra Renates avsender og
 * hennes domene, og både kostnaden og omdømmet ville vært hennes. Samme
 * prinsipp som betalingen, de velger selv, og det holdes adskilt.
 */

const pre = (eier) => "nl-medlem:" + (eier || "").trim().toLowerCase() + ":";

export function medlemListeKey(eier, epost) {
  return pre(eier) + (epost || "").trim().toLowerCase();
}

export function gyldigEpost(e) {
  return /^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test((e || "").trim());
}

/* Legger en adresse til medlemmets liste. Samme adresse to ganger overskriver,
   den dobles ikke. */
export async function leggTil(env, eier, { epost, navn, kilde, sprak }) {
  if (!env.BUILDER_KV || !eier || !gyldigEpost(epost)) return { ok: false };
  const e = epost.trim().toLowerCase();
  const key = medlemListeKey(eier, e);
  let fra_for = null;
  try { const raw = await env.BUILDER_KV.get(key); fra_for = raw ? JSON.parse(raw) : null; } catch (err) {}
  await env.BUILDER_KV.put(key, JSON.stringify({
    epost: e,
    navn: (navn || (fra_for && fra_for.navn) || "").slice(0, 80),
    kilde: (kilde || (fra_for && fra_for.kilde) || "").slice(0, 60),
    sprak: (sprak === "en" ? "en" : "no"),
    ts: (fra_for && fra_for.ts) || Date.now(),
  }));
  return { ok: true, nyttNavn: !fra_for };
}

export async function hentListe(env, eier, grense) {
  if (!env.BUILDER_KV || !eier) return [];
  const ut = [];
  try {
    const listet = await env.BUILDER_KV.list({ prefix: pre(eier), limit: grense || 1000 });
    for (const key of (listet && listet.keys) || []) {
      const raw = await env.BUILDER_KV.get(key.name);
      if (!raw) continue;
      try { ut.push(JSON.parse(raw)); } catch (e) {}
    }
  } catch (e) {}
  ut.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  return ut;
}

export async function fjern(env, eier, epost) {
  if (!env.BUILDER_KV || !eier) return false;
  try { await env.BUILDER_KV.delete(medlemListeKey(eier, epost)); return true; } catch (e) { return false; }
}

/* CSV medlemmet kan ta rett inn i sitt eget e-postverktøy. */
export function tilCsv(liste) {
  const rad = (v) => '"' + ((v == null ? "" : v) + "").replace(/"/g, '""') + '"';
  const linjer = ["epost,navn,kilde,sprak,dato"];
  liste.forEach((a) => {
    linjer.push([
      rad(a.epost), rad(a.navn), rad(a.kilde), rad(a.sprak),
      rad(new Date(a.ts || 0).toISOString().slice(0, 10)),
    ].join(","));
  });
  return linjer.join("\n");
}
