import { createFileRoute } from "@tanstack/react-router";
import { generateImage, imageSettings } from "@/lib/image-gateway.server";
import { buildMediaPrompt } from "@/lib/media-prompt";
import { ASPECT_RATIOS, MEDIA_STYLES, type AspectRatio, type MediaStyle } from "@/lib/constants";

const SIZE: Record<AspectRatio, string> = {
  "1:1": "1024x1024",
  "16:9": "1536x1024",
  "4:3": "1536x1024",
  "9:16": "1024x1536",
};

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          prompt?: string; style?: MediaStyle; aspect?: AspectRatio; stream?: boolean;
        };
        const prompt = String(body.prompt ?? "").trim().slice(0, 2000);
        if (!prompt) return Response.json({ message: "Please enter an image prompt." }, { status: 400 });
        const style = MEDIA_STYLES.includes(body.style as MediaStyle) ? body.style! : "Realistic";
        const aspect = ASPECT_RATIOS.includes(body.aspect as AspectRatio) ? body.aspect! : "1:1";
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ message: "AI service is not configured." }, { status: 500 });
        const upstream = await generateImage(
          { ...imageSettings, apiKey },
          buildMediaPrompt(prompt, style, aspect),
          body.stream !== false,
          undefined,
          { size: SIZE[aspect] },
        );
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
