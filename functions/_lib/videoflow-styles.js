/**
 * LME VideoFlow, visual style presets.
 *
 * Unlike Mia & Teo Video Creator (functions/_lib/miateo-bible.js), VideoFlow
 * has no fixed characters: any idea, any topic, any niche. What IS fixed per
 * project is the chosen visual STYLE, injected into every scene's image
 * prompt so a project stays visually consistent scene to scene even though
 * the subject matter changes freely.
 */

export const STYLES = {
  cinematic: {
    id: "cinematic", label: "Cinematic",
    prompt: "Cinematic photographic still, dramatic natural lighting, shallow depth of field, film grain, high production value, professional color grading.",
  },
  pixar3d: {
    id: "pixar3d", label: "3D Pixar-style",
    prompt: "High-end 3D Pixar/Disney animated feature-film still, soft global illumination, warm rounded character design, rich detail, expressive, wholesome.",
  },
  anime: {
    id: "anime", label: "Anime",
    prompt: "Japanese anime illustration style, clean cel shading, expressive line art, vibrant color palette, dynamic composition.",
  },
  claymation: {
    id: "claymation", label: "Claymation",
    prompt: "Stop-motion claymation still, visible clay texture and fingerprints, handcrafted felt and plasticine look, warm soft studio lighting.",
  },
  comic: {
    id: "comic", label: "Comic book",
    prompt: "Bold comic book illustration, thick ink outlines, halftone shading, punchy saturated colors, dynamic panel-style composition.",
  },
  vintage: {
    id: "vintage", label: "Vintage editorial",
    prompt: "Vintage encyclopedia illustration style, muted retro color palette, fine crosshatched linework, aged paper texture, mid-century editorial feel.",
  },
  photoreal: {
    id: "photoreal", label: "Photorealistic",
    prompt: "Photorealistic high-resolution photograph, natural lighting, realistic textures and materials, sharp focus, professional photography.",
  },
  whiteboard: {
    id: "whiteboard", label: "Whiteboard sketch",
    prompt: "Hand-drawn black and white pencil sketch illustration, detailed ink line art, crosshatching shading, bold clean outlines, pure white background, no color.",
  },
};

export const DEFAULT_STYLE = "cinematic";

export function styleById(id) {
  return STYLES[id] || STYLES[DEFAULT_STYLE];
}

// Negative/avoid list, appended to every image prompt regardless of style.
export const AVOID_LIST =
  "Avoid: text, words, letters, numbers, logos, watermarks, extra or missing fingers, distorted faces, nonsensical anatomy.";

// Family-safety suffix appended to every image/video prompt.
export const SAFE_SUFFIX = ", safe for a general audience, no violence, no nudity, no real identifiable people, no hateful or graphic content";
