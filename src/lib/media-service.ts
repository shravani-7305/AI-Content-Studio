/**
 * Image / video generation (browser side). Calls this app's own server
 * routes, which talk to Lovable AI. API keys never reach the browser.
 */
import type { MediaRequest } from "./constants";
import { streamImage } from "./stream-image";

function friendly(msg: string) {
  if (/402/.test(msg)) return "AI credits have run out. Please add credits to continue.";
  if (/429/.test(msg)) return "Too many requests right now. Please wait a moment and try again.";
  const m = msg.match(/\{.*\}/s);
  if (m) {
    try {
      const j = JSON.parse(m[0]);
      return j.message ?? j.error?.message ?? msg;
    } catch { /* ignore */ }
  }
  return msg;
}

export async function generateImage(req: MediaRequest, onFrame: (url: string, final: boolean) => void) {
  if (!req.prompt.trim()) throw new Error("Please enter an image prompt.");
  try {
    await streamImage("/api/generate-image", { prompt: req.prompt, style: req.style, aspect: req.aspect }, onFrame);
  } catch (e) {
    throw new Error(friendly(e instanceof Error ? e.message : "Image generation failed."));
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function json(res: Response) {
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(friendly(`${res.status} ${j.message ?? "Video request failed."}`).replace(/^\d+ /, ""));
  return j as { id: string; status: string; progress: number | null; error: string | null };
}

/** Creates a video job, polls until finished, and returns a playable blob URL. */
export async function generateVideo(req: MediaRequest, onStatus: (text: string, progress: number | null) => void) {
  if (!req.prompt.trim()) throw new Error("Please enter a video prompt.");
  onStatus("Sending request...", null);
  let job = await json(
    await fetch("/api/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    }),
  );
  while (job.status !== "completed") {
    if (job.status === "failed") throw new Error(job.error ?? "Video generation failed.");
    onStatus(job.status === "queued" ? "Waiting in queue..." : "AI is creating your video...", job.progress);
    await sleep(6000);
    job = await json(await fetch(`/api/video/${encodeURIComponent(job.id)}`));
  }
  onStatus("Downloading video...", 100);
  const res = await fetch(`/api/video/${encodeURIComponent(job.id)}/content`);
  if (!res.ok) throw new Error("The video was created but could not be downloaded. Please try again.");
  return URL.createObjectURL(await res.blob());
}

/** Small JPEG copy for History (keeps browser storage small). */
export function thumbnail(dataUrl: string, max = 512): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * s;
      c.height = img.height * s;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
