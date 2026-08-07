/**
 * Mia & Teo Video Creator, continuity engine.
 *
 * Pure logic, no API calls, no cost. Tracks story state (location, time of
 * day, weather, what each character is holding/wearing, important objects)
 * across an episode's shots in order, so the prompt sent to the image/video
 * generator for shot N always knows what shot N-1 left behind. Without this,
 * a generative model has no memory and will happily change Mia's clothes or
 * make a picked-up leaf vanish between shots (spec §12, "Continuity Engine").
 *
 * A shot declares what changes DURING it via shot.continuityEvents, e.g.
 *   { type: "location", value: "old oak clearing" }
 *   { type: "time", value: "afternoon" }
 *   { type: "weather", value: "sunny" }
 *   { type: "holds", character: "mia", item: "a small red leaf" }
 *   { type: "drops", character: "mia", item: "a small red leaf" }
 *   { type: "object", name: "the tiny wooden door", value: "now open" }
 *   { type: "note", value: "free-text continuity detail" }
 * This module walks the shot list in scene/shot order and produces the
 * running state entering and leaving every shot.
 */

function emptyState() {
  return {
    location: "", timeOfDay: "", weather: "",
    holding: { mia: [], teo: [] },
    objects: {}, // name -> current value/state
    notes: [],
};
}

function cloneState(s) {
  return {
    location: s.location, timeOfDay: s.timeOfDay, weather: s.weather,
    holding: { mia: s.holding.mia.slice(), teo: s.holding.teo.slice() },
    objects: Object.assign({}, s.objects),
    notes: s.notes.slice(),
  };
}

function applyEvent(state, ev) {
  if (!ev || !ev.type) return;
  switch (ev.type) {
    case "location": state.location = String(ev.value || "").slice(0, 200); break;
    case "time": state.timeOfDay = String(ev.value || "").slice(0, 60); break;
    case "weather": state.weather = String(ev.value || "").slice(0, 60); break;
    case "holds": {
      const c = ev.character === "teo" ? "teo" : "mia";
      const item = String(ev.item || "").slice(0, 120);
      if (item && state.holding[c].indexOf(item) === -1) state.holding[c].push(item);
      break;
    }
    case "drops": {
      const c = ev.character === "teo" ? "teo" : "mia";
      const item = String(ev.item || "").slice(0, 120);
      state.holding[c] = state.holding[c].filter((x) => x !== item);
      break;
    }
    case "object": {
      const name = String(ev.name || "").slice(0, 120);
      if (name) state.objects[name] = String(ev.value || "").slice(0, 200);
      break;
    }
    case "note": {
      const n = String(ev.value || "").slice(0, 240);
      if (n) state.notes.push(n);
      break;
    }
    default: break;
  }
}

/**
 * Order shots by scene.index then shot.index (falls back to array order for
 * shots whose scene can't be found, so a malformed doc still produces a
 * deterministic result instead of throwing).
 */
function orderedShots(project) {
  const sceneOrder = new Map();
  (project.scenes || []).forEach((sc) => sceneOrder.set(sc.id, sc.index || 0));
  return (project.shots || []).slice().sort((a, b) => {
    const sa = sceneOrder.has(a.sceneId) ? sceneOrder.get(a.sceneId) : 999;
    const sb = sceneOrder.has(b.sceneId) ? sceneOrder.get(b.sceneId) : 999;
    if (sa !== sb) return sa - sb;
    return (a.index || 0) - (b.index || 0);
  });
}

/**
 * Compute { before: Map<shotId, state>, after: Map<shotId, state> } for the
 * whole project. `before` is what the prompt for that shot should know;
 * `after` (== before of the next shot) is stored back onto the shot as
 * continuityOut when the caller persists the project.
 */
export function computeContinuity(project) {
  const shots = orderedShots(project);
  const before = new Map();
  const after = new Map();
  let state = emptyState();
  for (const shot of shots) {
    before.set(shot.id, cloneState(state));
    const next = cloneState(state);
    (shot.continuityEvents || []).forEach((ev) => applyEvent(next, ev));
    after.set(shot.id, next);
    state = next;
  }
  return { before, after };
}

/** Human/model-readable continuity note to inject into a generation prompt. */
export function continuityNoteFor(state) {
  if (!state) return "";
  const bits = [];
  if (state.location) bits.push("Location: " + state.location + ".");
  if (state.timeOfDay) bits.push("Time of day: " + state.timeOfDay + ".");
  if (state.weather) bits.push("Weather: " + state.weather + ".");
  if (state.holding.mia.length) bits.push("Mia is holding: " + state.holding.mia.join(", ") + ".");
  if (state.holding.teo.length) bits.push("Teo is holding: " + state.holding.teo.join(", ") + ".");
  const objectBits = Object.keys(state.objects).map((k) => k + " (" + state.objects[k] + ")");
  if (objectBits.length) bits.push("Important objects: " + objectBits.join(", ") + ".");
  if (state.notes.length) bits.push(state.notes.join(" "));
  return bits.join(" ");
}

/** Convenience: continuity note text for a single shot id, "" if unknown. */
export function continuityNoteForShot(project, shotId) {
  const { before } = computeContinuity(project);
  return continuityNoteFor(before.get(shotId));
}
