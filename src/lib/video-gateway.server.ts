export const VIDEO_BASE = "https://ai.gateway.lovable.dev";
export const VIDEO_MODEL = "google/gemini-omni-1.1-flash";

export function videoKey() {
  const k = process.env["LOVABLE_API_KEY"];
  if (!k) throw new Error("AI service is not configured.");
  return k;
}

/** Pass the gateway's status and safe message through to the browser. */
export async function relayJson(res: Response) {
  const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) {
    return Response.json(
      { message: (json?.["message"] as string) ?? (json?.["error"] as { message?: string })?.message ?? `Video request failed (${res.status})` },
      { status: res.status },
    );
  }
  const j = json as { id: string; status: string; progress?: number; error?: { message?: string } };
  return Response.json({ id: j.id, status: j.status, progress: j.progress ?? null, error: j.error?.message ?? null });
}
