/**
 * LME AI Core, felles jobbstatus.
 *
 * Plattformen har i dag tre ulike måter å vente på en lang generering:
 * VideoFlow lagrer statusen inne i scenen sin, Mia & Teo poller
 * leverandøren direkte, og renderingen har sin egen `render.status`. Ingen
 * av dem kan svare på det enkle spørsmålet "hva holder på akkurat nå".
 *
 * Denne filen gir ett svar: én jobb, én id, én tilstand. Den erstatter
 * ingenting i dag. Rutene som allerede virker fortsetter å virke, og
 * skriver i tillegg en jobb hit når de tas i bruk, slik at den
 * sammenhengende arbeidsflyten (idé til publisering) kan vise framdrift
 * på tvers av apper.
 *
 * KV-nøkler:
 *   ai:job:<id>             -> hele jobben
 *   ai:job-index:<e-post>   -> [ { id, app, task, status, updatedAt } ]
 */

const JOB_PREFIX = "ai:job:";
const INDEX_PREFIX = "ai:job-index:";

/** Jobber lever i sju dager. Lenger enn det er ingen som poller. */
const JOB_TTL = 7 * 24 * 3600;

/** Hvor mange jobber vi husker per bruker i oversikten. */
const INDEX_MAX = 60;

export const STATES = ["pending", "running", "done", "failed"];

export function newJobId() {
  return "job-" + crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}

function cleanId(id) {
  if (typeof id !== "string") return null;
  const s = id.trim().toLowerCase();
  return /^job-[a-z0-9]{8,32}$/.test(s) ? s : null;
}

async function readJson(env, key, fallback) {
  try {
    const raw = await env.BUILDER_KV.get(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function touchIndex(env, job) {
  if (!job.ownerEmail) return;
  try {
    const key = INDEX_PREFIX + String(job.ownerEmail).toLowerCase();
    const list = (await readJson(env, key, [])) || [];
    const rest = (Array.isArray(list) ? list : []).filter((e) => e && e.id !== job.id);
    rest.unshift({
      id: job.id, app: job.app, task: job.task, status: job.status,
      label: job.label || "", updatedAt: job.updatedAt,
    });
    await env.BUILDER_KV.put(key, JSON.stringify(rest.slice(0, INDEX_MAX)), {
      expirationTtl: JOB_TTL,
    });
  } catch (e) {
    // Oversikten er en bekvemmelighet. Jobben selv er lagret uansett.
  }
}

/**
 * Oppretter en jobb.
 *
 *   const job = await createJob(env, {
 *     app: "videoflow", task: "video", ownerEmail: user.email,
 *     label: "Scene 3, animasjon", projectId: p.id,
 *   });
 *
 * Feiler aldri på en måte som velter kallet: hvis KV ikke svarer, får du
 * jobbobjektet i hånden uten at det er lagret, og genereringen går videre.
 */
export async function createJob(env, fields) {
  const now = Date.now();
  const job = {
    id: newJobId(),
    app: String((fields && fields.app) || "ukjent"),
    task: String((fields && fields.task) || "ukjent"),
    ownerEmail: String((fields && fields.ownerEmail) || "").toLowerCase(),
    label: String((fields && fields.label) || "").slice(0, 120),
    projectId: (fields && fields.projectId) || null,
    modelId: (fields && fields.modelId) || null,
    status: "pending",
    progress: 0,
    message: "",
    result: null,
    error: "",
    createdAt: now,
    updatedAt: now,
  };
  if (!env || !env.BUILDER_KV) return job;
  try {
    await env.BUILDER_KV.put(JOB_PREFIX + job.id, JSON.stringify(job), { expirationTtl: JOB_TTL });
    await touchIndex(env, job);
  } catch (e) {
    // Se over: jobben returneres uansett.
  }
  return job;
}

export async function readJob(env, id) {
  const cid = cleanId(id);
  if (!cid || !env || !env.BUILDER_KV) return null;
  return readJson(env, JOB_PREFIX + cid, null);
}

/** Leser en jobb og sjekker at den hører til brukeren. Eier ser alt. */
export async function readOwnJob(env, id, email, isOwnerUser) {
  const job = await readJob(env, id);
  if (!job) return null;
  if (isOwnerUser) return job;
  if (!email || job.ownerEmail !== String(email).toLowerCase()) return null;
  return job;
}

async function writeJob(env, job) {
  job.updatedAt = Date.now();
  if (!env || !env.BUILDER_KV) return job;
  try {
    await env.BUILDER_KV.put(JOB_PREFIX + job.id, JSON.stringify(job), { expirationTtl: JOB_TTL });
    await touchIndex(env, job);
  } catch (e) {
    // Framdrift som ikke ble lagret er et kosmetisk tap, ikke et reelt.
  }
  return job;
}

/** Oppdaterer framdrift underveis. */
export async function updateJob(env, id, changes) {
  const job = await readJob(env, id);
  if (!job) return null;
  const c = changes || {};
  if (c.status && STATES.indexOf(c.status) > -1) job.status = c.status;
  if (typeof c.progress === "number") job.progress = Math.min(100, Math.max(0, Math.round(c.progress)));
  if (typeof c.message === "string") job.message = c.message.slice(0, 300);
  if (c.modelId) job.modelId = c.modelId;
  return writeJob(env, job);
}

/** Merker jobben som ferdig, med referanse til resultatet. */
export async function finishJob(env, id, result) {
  const job = await readJob(env, id);
  if (!job) return null;
  job.status = "done";
  job.progress = 100;
  job.error = "";
  job.result = result == null ? null : result;
  return writeJob(env, job);
}

/** Merker jobben som mislykket, med en kort forklaring brukeren kan lese. */
export async function failJob(env, id, error) {
  const job = await readJob(env, id);
  if (!job) return null;
  job.status = "failed";
  job.error = String(error || "").slice(0, 300);
  return writeJob(env, job);
}

/** Brukerens siste jobber, nyeste først. */
export async function listJobs(env, email) {
  if (!env || !env.BUILDER_KV || !email) return [];
  const list = await readJson(env, INDEX_PREFIX + String(email).toLowerCase(), []);
  return Array.isArray(list) ? list : [];
}
