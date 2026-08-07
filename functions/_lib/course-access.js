/**
 * Kurstilgang via personlig lenke (ikke innlogging).
 *
 * Brukes av de låste kursene (academy/youtube.html, academy/youtube-videre.html,
 * academy/ki-for-pedagoger.html): kjøperen (eller gratis-bekrefteren i
 * lanseringsvinduet) får en unik lenke i e-posten, f.eks.
 *   /academy/youtube?t=<token>
 * Token lagres i localStorage av js/course-gate.js ved første besøk, så
 * senere besøk uten ?t= i URL-en også fungerer. Tilgang varer "for alltid"
 * (ingen expirationTtl), i tråd med "engangsbeløp, tilgang for alltid".
 *
 * KV: course_access:<courseId>:<token> -> { email, name, ts }
 */

function tokenKey(courseId, token) {
  return "course_access:" + courseId + ":" + token;
}

export async function grantCourseAccess(env, courseId, email, name) {
  const token = crypto.randomUUID().replace(/-/g, "");
  await env.BUILDER_KV.put(tokenKey(courseId, token), JSON.stringify({
    email: email || "", name: name || "", ts: Date.now(),
  }));
  return token;
}

export async function checkCourseAccess(env, courseId, token) {
  if (!token || !/^[a-f0-9]{16,40}$/i.test(token)) return false;
  const raw = await env.BUILDER_KV.get(tokenKey(courseId, token));
  return !!raw;
}
