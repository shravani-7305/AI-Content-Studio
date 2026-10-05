/**
 * Image / video generation layer. DEMO MODE: no real AI media API is
 * connected, so these return locally drawn placeholder media clearly
 * labelled "DEMO". Replace the bodies with calls to a server route that
 * talks to a real image/video model (keep API keys server-side).
 */
import type { AspectRatio, MediaRequest, MediaStyle } from "./constants";

export const MEDIA_DEMO_MODE = true;

const SIZES: Record<AspectRatio, [number, number]> = {
  "1:1": [768, 768],
  "16:9": [960, 540],
  "9:16": [540, 960],
  "4:3": [800, 600],
};

const PALETTE: Record<MediaStyle, [string, string]> = {
  Realistic: ["#3b6fd4", "#1f2a44"],
  Illustration: ["#f59e9e", "#7c5cd6"],
  "3D": ["#22c1c3", "#5b4bdb"],
  Cartoon: ["#fbbf24", "#ef4444"],
  Cinematic: ["#0f172a", "#b45309"],
};

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);

function wrap(text: string, max: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function demoImageUrl(req: MediaRequest, seed = 0) {
  const [w, h] = SIZES[req.aspect];
  const [a, b] = PALETTE[req.style];
  const rot = (seed * 47) % 360;
  const lines = wrap(req.prompt, Math.floor(w / 26));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" gradientTransform="rotate(${rot} .5 .5)"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<circle cx="${w * 0.75}" cy="${h * 0.3}" r="${Math.min(w, h) * 0.22}" fill="#fff" opacity=".12"/>
<circle cx="${w * 0.2}" cy="${h * 0.8}" r="${Math.min(w, h) * 0.3}" fill="#fff" opacity=".08"/>
<rect x="24" y="24" rx="14" width="190" height="40" fill="#000" opacity=".45"/>
<text x="40" y="51" font-family="sans-serif" font-size="18" font-weight="700" fill="#fff">DEMO PREVIEW</text>
${lines.map((l, i) => `<text x="50%" y="${h / 2 - (lines.length - 1) * 18 + i * 36}" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="600" fill="#fff">${esc(l)}</text>`).join("")}
<text x="50%" y="${h - 32}" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#fff" opacity=".85">${req.style} · ${req.aspect} · placeholder, not AI-generated</text>
</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export async function generateImage(req: MediaRequest, seed = 0): Promise<string> {
  if (!req.prompt.trim()) throw new Error("Please enter an image prompt.");
  await wait(1200);
  return demoImageUrl(req, seed);
}

/** Records a short animated canvas clip (WebM) as a demo video. */
export async function generateVideo(req: MediaRequest, seed = 0): Promise<string> {
  if (!req.prompt.trim()) throw new Error("Please enter a video prompt.");
  if (typeof MediaRecorder === "undefined") throw new Error("Your browser cannot create the demo video.");
  const [w, h] = SIZES[req.aspect].map((n) => Math.round(n / 1.5)) as [number, number];
  const [a, b] = PALETTE[req.style];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const stream = canvas.captureStream(30);
  const rec = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm" });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<string>((res) => (rec.onstop = () => res(URL.createObjectURL(new Blob(chunks, { type: "video/webm" })))));
  const dur = (req.duration ?? 4) * 1000;
  const start = performance.now();
  const lines = wrap(req.prompt, Math.floor(w / 18));
  rec.start();
  await new Promise<void>((resolve) => {
    const frame = () => {
      const t = (performance.now() - start) / dur;
      const ang = t * Math.PI * 2 + seed;
      const g = ctx.createLinearGradient(0, 0, w * (0.5 + 0.5 * Math.cos(ang)), h);
      g.addColorStop(0, a);
      g.addColorStop(1, b);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,.15)";
      ctx.beginPath();
      ctx.arc(w / 2 + Math.cos(ang) * w * 0.3, h / 2 + Math.sin(ang) * h * 0.25, Math.min(w, h) * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.fillRect(16, 16, 150, 32);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("DEMO PREVIEW", 28, 37);
      ctx.textAlign = "center";
      ctx.font = "600 20px sans-serif";
      lines.forEach((l, i) => ctx.fillText(l, w / 2, h / 2 - (lines.length - 1) * 13 + i * 26));
      ctx.font = "13px sans-serif";
      ctx.fillText(`${req.style} · ${req.aspect} · placeholder, not AI-generated`, w / 2, h - 20);
      ctx.textAlign = "left";
      // progress bar
      ctx.fillStyle = "rgba(255,255,255,.7)";
      ctx.fillRect(0, h - 4, w * Math.min(t, 1), 4);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    frame();
  });
  rec.stop();
  return done;
}
