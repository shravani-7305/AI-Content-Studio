import { createFileRoute } from "@tanstack/react-router";
import { relayJson, VIDEO_BASE, VIDEO_MODEL, videoKey } from "@/lib/video-gateway.server";
import { buildMediaPrompt } from "@/lib/media-prompt";
import { ASPECT_RATIOS, MEDIA_STYLES, type AspectRatio, type MediaStyle } from "@/lib/constants";

export const Route = createFileRoute("/api/video")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          prompt?: string; style?: MediaStyle; aspect?: AspectRatio; duration?: number;
        };
        const prompt = String(body.prompt ?? "").trim().slice(0, 2000);
        if (!prompt) return Response.json({ message: "Please enter a video prompt." }, { status: 400 });
        const style = MEDIA_STYLES.includes(body.style as MediaStyle) ? body.style! : "Realistic";
        const aspect = ASPECT_RATIOS.includes(body.aspect as AspectRatio) ? body.aspect! : "16:9";
        const duration = Math.min(10, Math.max(3, Math.round(Number(body.duration) || 4)));
        let key: string;
        try { key = videoKey(); } catch (e) { return Response.json({ message: (e as Error).message }, { status: 500 }); }
        const response_format: Record<string, string> = { type: "video", resolution: "720p", duration: `${duration}s` };
        // The model only supports 16:9 and 9:16; other ratios are steered through the prompt.
        if (aspect === "16:9" || aspect === "9:16") response_format["aspect_ratio"] = aspect;
        const res = await fetch(`${VIDEO_BASE}/v1/videos`, {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: VIDEO_MODEL,
            input: `${buildMediaPrompt(prompt, style, aspect)} In a single continuous shot. Audio: fitting ambient sound and soft background music. No dialogue.`,
            response_format,
          }),
        });
        return relayJson(res);
      },
    },
  },
});
