import { useEffect, useState } from "react";
import { AlertCircle, Check, Download, Film, ImageIcon, Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Panel } from "@/components/app-shell";
import { Field, SelectField } from "@/components/form-field";
import { ASPECT_RATIOS, DURATIONS, MEDIA_STYLES, type AspectRatio, type MediaKind, type MediaStyle } from "@/lib/constants";
import { generateImage, generateVideo, thumbnail } from "@/lib/media-service";
import { historyStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ASPECT_CLASS: Record<AspectRatio, string> = {
  "1:1": "aspect-square max-w-md w-full",
  "16:9": "aspect-video w-full",
  "9:16": "aspect-[9/16] max-w-xs w-full",
  "4:3": "aspect-[4/3] max-w-lg w-full",
};

export function MediaGenerator({ kind }: { kind: MediaKind }) {
  const isVideo = kind === "video";
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<MediaStyle>("Realistic");
  const [aspect, setAspect] = useState<AspectRatio>(isVideo ? "16:9" : "1:1");
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>("4 seconds");
  const [url, setUrl] = useState("");
  const [final, setFinal] = useState(false);
  const [shown, setShown] = useState({ aspect, style, secs: 4 });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ text: string; progress: number | null }>({ text: "", progress: null });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => () => { if (url.startsWith("blob:")) URL.revokeObjectURL(url); }, [url]);

  const secs = parseInt(duration);

  async function run() {
    setError("");
    if (!prompt.trim()) return setError(`Please enter a ${kind} prompt.`);
    setLoading(true);
    setSaved(false);
    setFinal(false);
    const req = { prompt, style, aspect, duration: secs };
    try {
      if (isVideo) {
        setUrl("");
        const out = await generateVideo(req, (text, progress) => setStatus({ text, progress }));
        setUrl(out);
        setFinal(true);
      } else {
        setUrl("");
        await generateImage(req, (frame, isFinal) => { setUrl(frame); setFinal(isFinal); });
      }
      setShown({ aspect, style, secs });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
      if (!isVideo) setUrl("");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    historyStore.add({
      kind,
      topic: prompt.slice(0, 80),
      contentType: isVideo ? "Video" : "Image",
      tone: shown.style as never,
      length: shown.aspect as never,
      keywords: [],
      content: prompt,
      // Videos are too large for browser storage; only their settings are saved.
      media: { prompt, style: shown.style, aspect: shown.aspect, duration: shown.secs, url: isVideo ? undefined : await thumbnail(url) },
    });
    setSaved(true);
    toast.success(isVideo ? "Saved to history (download the video to keep the file)" : "Saved to history");
  }

  const Icon = isVideo ? Film : ImageIcon;
  const ready = !!url && final && !loading;

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Panel>
        <form onSubmit={(e) => { e.preventDefault(); run(); }} className="space-y-5">
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
              <AlertCircle className="size-4 shrink-0" /> {error}
            </p>
          )}
          <Button type="submit" variant="ai" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {loading ? "Generating..." : `Generate ${isVideo ? "Video" : "Image"}`}
          </Button>
          {isVideo && <p className="text-xs text-muted-foreground">Videos usually take 1–3 minutes to create.</p>}
        </form>
      </Panel>

      <Panel className="flex min-h-[480px] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="font-semibold">{isVideo ? "Video preview" : "Image preview"}</h2>
            <p className="text-xs text-muted-foreground">{ready ? `${shown.style} · ${shown.aspect}${isVideo ? ` · ${shown.secs}s` : ""}` : "Your result will appear here"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={!ready} onClick={run}><RefreshCw /> Regenerate</Button>
            <Button size="sm" variant="outline" disabled={!ready} asChild={ready}>
              {ready ? <a href={url} download={`ai-${kind}.${isVideo ? "mp4" : "png"}`}><Download /> Download</a> : <span><Download /> Download</span>}
            </Button>
            <Button size="sm" variant="outline" disabled={!ready || saved} onClick={save}>{saved ? <Check /> : <Save />} {saved ? "Saved" : "Save"}</Button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center pt-4">
          {url && !isVideo ? (
            <img src={url} alt={prompt} className={cn("rounded-2xl object-cover transition-[filter] duration-500", ASPECT_CLASS[loading ? aspect : shown.aspect], final ? "blur-0" : "blur-2xl")} />
          ) : loading ? (
            <div className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl bg-muted p-6 text-center text-sm text-primary", ASPECT_CLASS[aspect])}>
              <Loader2 className="size-6 animate-spin" />
              {isVideo ? status.text || "Starting..." : "AI is creating your image..."}
              {isVideo && status.progress != null && <Progress value={status.progress} className="h-2 w-48" />}
            </div>
          ) : url ? (
            <video src={url} controls autoPlay loop playsInline className={cn("rounded-2xl bg-muted", ASPECT_CLASS[shown.aspect])} />
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
