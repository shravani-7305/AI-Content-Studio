import type { AspectRatio, MediaStyle } from "./constants";

const STYLE_HINTS: Record<MediaStyle, string> = {
  Realistic: "photorealistic, natural lighting, high detail",
  Illustration: "digital illustration, clean lines, rich colors",
  "3D": "3D render, soft global illumination, detailed materials",
  Cartoon: "cartoon style, bold outlines, playful colors",
  Cinematic: "cinematic, dramatic lighting, film grain, shallow depth of field",
};

export function buildMediaPrompt(prompt: string, style: MediaStyle, aspect: AspectRatio) {
  return `${prompt.trim()}. Style: ${STYLE_HINTS[style]}. Composition framed for a ${aspect} aspect ratio.`;
}
