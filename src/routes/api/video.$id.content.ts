import { createFileRoute } from "@tanstack/react-router";
import { VIDEO_BASE, videoKey } from "@/lib/video-gateway.server";

export const Route = createFileRoute("/api/video/$id/content")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        let key: string;
        try { key = videoKey(); } catch (e) { return new Response((e as Error).message, { status: 500 }); }
        const res = await fetch(`${VIDEO_BASE}/v1/videos/${encodeURIComponent(params.id)}/content`, {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (!res.ok || !res.body) return new Response("Video download failed", { status: res.status || 502 });
        return new Response(res.body, { headers: { "Content-Type": "video/mp4", "Cache-Control": "no-store" } });
      },
    },
  },
});
