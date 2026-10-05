import { useEffect, useState } from "react";
import { AlertCircle, Check, Download, Film, ImageIcon, Info, Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Panel } from "@/components/app-shell";
import { Field, SelectField } from "@/components/form-field";
import { ASPECT_RATIOS, DURATIONS, MEDIA_STYLES, type AspectRatio, type MediaKind, type MediaStyle } from "@/lib/constants";
import { generateImage, generateVideo, MEDIA_DEMO_MODE } from "@/lib/media-service";
import { historyStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ASPECT_CLASS: Record<AspectRatio, string> = {
  "1:1": "aspect-square max-w-md",
  "16:9": "aspect-video w-full",
  "9:16": "aspect-[9/16] max-w-xs",
  "4:3": "aspect-[4/3] max-w-lg",
};

export function DemoNotice({ kind }: { kind: MediaKind }) {
  if (!MEDIA_DEMO_MODE) return null;
  return (
    <p className="flex items-start gap-2 rounded-xl bg-accent px-3 py-2 text-xs text-accent-foreground">
      <Info className="mt-0.5 size-4 shrink-0" />
      Demo mode: no AI {kind} service is connected yet, so results are placeholder {kind === "image" ? "images" : "clips"} — not real AI-generated media.
    </p>
  );
}

export function MediaGenerator({ kind }: { kind: MediaKind }) {
  const isVideo = kind === "video";
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<MediaStyle>("Realistic");
  const [aspect, setAspect] = useState<AspectRatio>(isVideo ? "16:9" : "1:1");
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>("4 seconds");
  const [url, setUrl] = useState("");
  const [shownAspect, setShownAspect] = useState<AspectRatio>(aspect);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [seed, setSeed] = useState(0);

  useEffect(() => () => { if (url.startsWith("blob:")) URL.revokeObjectURL(url); }, [url]);

  const secs = parseInt(duration);

  async function run(nextSeed: number) {
    setError("");
    if (!prompt.trim()) return setError(`Please enter a ${kind} prompt.`);
    setLoading(true);
    setSaved(false);
    try {
      const req = { prompt, style, aspect, duration: secs };
      const out = isVideo ? await generateVideo(req, nextSeed) : await generateImage(req, nextSeed);
      setUrl(out);
      setShownAspect(aspect);
      setSeed(nextSeed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function save() {
    historyStore.add({
      kind,
      topic: prompt.slice(0, 80),
      contentType: isVideo ? "Video" : "Image",
      tone: style as never,
      length: aspect as never,
      keywords: [],
      content: prompt,
      // Image placeholders are small and kept; demo video blobs don't survive reloads, so only settings are stored.
      media: { prompt, style, aspect, duration: secs, url: isVideo ? undefined : url },
    });
    setSaved(true);
    toast.success("Saved to history");
  }

  const Icon = isVideo ? Film : ImageIcon;

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Panel>
        <form onSubmit={(e) => { e.preventDefault(); run(0); }} className="space-y-5">
          <Field label={`${isVideo ? "Video" : "Image"} prompt`} htmlFor={`${kind}-prompt`}>
            <Textarea
              id={`${kind}-prompt`}
              className="min-h-28 rounded-xl"
              placeholder={isVideo ? "e.g. A drone flying over a futuristic smart city at sunset" : "e.g. A robot teaching students in a modern classroom"}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </Field>
          <SelectField label="Style" value={style} options={MEDIA_STYLES} onChange={setStyle} />
          <Field label="Aspect ratio">
            <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted p-1">
              {ASPECT_RATIOS.map((r) => (
                <button type="button" key={r} onClick={() => setAspect(r)}
                  className={cn("rounded-lg py-2 text-sm font-medium transition-colors", aspect === r ? "bg-card text-primary shadow-card" : "text-muted-foreground hover:text-foreground")}>
                  {r}
                </button>
              ))}
            </div>
          </Field>
          {isVideo && <SelectField label="Duration" value={duration} options={DURATIONS} onChange={setDuration} />}
          {error && (
            <p className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4" /> {error}
            </p>
          )}
          <Button type="submit" variant="ai" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {loading ? "Generating..." : `Generate ${isVideo ? "Video" : "Image"}`}
          </Button>
          <DemoNotice kind={kind} />
        </form>
      </Panel>

      <Panel className="flex min-h-[480px] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              {isVideo ? "Video preview" : "Image preview"}
              {url && MEDIA_DEMO_MODE && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">Demo</span>}
            </h2>
            <p className="text-xs text-muted-foreground">{url ? `${style} · ${shownAspect}${isVideo ? ` · ${secs}s` : ""}` : "Your result will appear here"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={!url || loading} onClick={() => run(seed + 1)}><RefreshCw /> Regenerate</Button>
            <Button size="sm" variant="outline" disabled={!url} asChild={!!url}>
              {url ? <a href={url} download={`demo-${kind}.${isVideo ? "webm" : "svg"}`}><Download /> Download</a> : <span><Download /> Download</span>}
            </Button>
            <Button size="sm" variant="outline" disabled={!url || saved} onClick={save}>{saved ? <Check /> : <Save />} {saved ? "Saved" : "Save"}</Button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center pt-4">
          {loading ? (
            <div className={cn("flex animate-pulse flex-col items-center justify-center gap-2 rounded-2xl bg-muted text-sm text-primary", ASPECT_CLASS[aspect])}>
              <Loader2 className="size-6 animate-spin" />
              {isVideo ? `Rendering ${secs}s demo clip...` : "Creating demo image..."}
            </div>
          ) : url ? (
            isVideo ? (
              <video src={url} controls autoPlay loop muted playsInline className={cn("rounded-2xl bg-muted", ASPECT_CLASS[shownAspect])} />
            ) : (
              <img src={url} alt={prompt} className={cn("rounded-2xl object-cover", ASPECT_CLASS[shownAspect])} />
            )
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center">
              <Icon className="size-10 text-violet" />
              <p className="mt-3 font-medium">Nothing generated yet</p>
              <p className="text-sm text-muted-foreground">Describe your {kind} and click Generate.</p>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
