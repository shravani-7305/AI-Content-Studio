import { createFileRoute } from "@tanstack/react-router";
import { relayJson, VIDEO_BASE, videoKey } from "@/lib/video-gateway.server";

export const Route = createFileRoute("/api/video/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        let key: string;
        try { key = videoKey(); } catch (e) { return Response.json({ message: (e as Error).message }, { status: 500 }); }
        const res = await fetch(`${VIDEO_BASE}/v1/videos/${encodeURIComponent(params.id)}`, {
          headers: { Authorization: `Bearer ${key}` },
        });
        return relayJson(res);
      },
    },
  },
});
