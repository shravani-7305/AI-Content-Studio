import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Download, Loader2, Pencil, Save, Sparkles, PenLine, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel } from "@/components/app-shell";
import { Field, SelectField } from "@/components/form-field";
import { CONTENT_TYPES, LENGTHS, TONES, type ContentType, type Length, type Tone } from "@/lib/constants";
import { generateContent } from "@/lib/ai-service";
import { downloadText, historyStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/generator")({
  head: () => ({
    meta: [
      { title: "AI Content Generator — AI Content Creator" },
      { name: "description", content: "Generate blogs, articles, posts, ads, emails and more with custom tone and length." },
      { property: "og:title", content: "AI Content Generator" },
      { property: "og:description", content: "Generate content with custom type, tone, length and keywords." },
    ],
  }),
  component: Generator,
});

function Generator() {
  const [topic, setTopic] = useState("");
  const [contentType, setType] = useState<ContentType>("Blog");
  const [tone, setTone] = useState<Tone>("Professional");
  const [length, setLength] = useState<Length>("Medium");
  const [keywords, setKeywords] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const kwList = keywords.split(",").map((k) => k.trim()).filter(Boolean);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!topic.trim()) return setError("Please enter a topic to generate content.");
    setLoading(true);
    setEditing(false);
    setSaved(false);
    try {
      setOutput(await generateContent({ topic, contentType, tone, length, keywords: kwList }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function onSave() {
    historyStore.add({ topic, contentType, tone, length, keywords: kwList, content: output });
    setSaved(true);
    toast.success("Saved to history");
  }

  return (
    <>
      <PageHeader icon={PenLine} title="AI Content Generator" subtitle="Describe what you need and let AI write it." />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Panel>
          <form onSubmit={onGenerate} className="space-y-5">
            <Field label="Topic" htmlFor="topic">
              <Input id="topic" className="h-11 rounded-xl" placeholder="e.g. Future of electric vehicles" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </Field>
            <SelectField label="Content type" value={contentType} options={CONTENT_TYPES} onChange={setType} />
            <SelectField label="Writing tone" value={tone} options={TONES} onChange={setTone} />
            <Field label="Content length">
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
                {LENGTHS.map((l) => (
                  <button
                    type="button"
                    key={l}
                    onClick={() => setLength(l)}
                    className={cn(
                      "rounded-lg py-2 text-sm font-medium transition-colors",
                      length === l ? "bg-card text-primary shadow-card" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Keywords (comma separated)" htmlFor="kw">
              <Input id="kw" className="h-11 rounded-xl" placeholder="battery, charging, eco" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
            </Field>
            {error && (
              <p className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="size-4" /> {error}
              </p>
            )}
            <Button type="submit" variant="ai" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {loading ? "Generating..." : "Generate Content"}
            </Button>
          </form>
        </Panel>

        <Panel className="flex min-h-[480px] flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="font-semibold">Generated content</h2>
              <p className="text-xs text-muted-foreground">
                {output ? `${output.split(/\s+/).length} words · ${contentType} · ${tone}` : "Your result will appear here"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={!output} onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied to clipboard"); }}>
                <Copy /> Copy
              </Button>
              <Button size="sm" variant={editing ? "secondary" : "outline"} disabled={!output} onClick={() => setEditing((v) => !v)}>
                <Pencil /> {editing ? "Done" : "Edit"}
              </Button>
              <Button size="sm" variant="outline" disabled={!output || saved} onClick={onSave}>
                {saved ? <Check /> : <Save />} {saved ? "Saved" : "Save"}
              </Button>
              <Button size="sm" variant="outline" disabled={!output} onClick={() => downloadText(`${topic || "content"}.txt`, output)}>
                <Download /> Download
              </Button>
            </div>
          </div>
          <div className="flex-1 pt-4">
            {loading ? (
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Loader2 className="size-4 animate-spin" /> AI is writing your content...
                </p>
                {[90, 100, 75, 95, 60].map((w, i) => (
                  <div key={i} className="h-3 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : output ? (
              editing ? (
                <Textarea className="h-full min-h-[380px] rounded-xl text-sm leading-relaxed" value={output} onChange={(e) => { setOutput(e.target.value); setSaved(false); }} />
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{output}</div>
              )
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center">
                <Sparkles className="size-10 text-violet" />
                <p className="mt-3 font-medium">Nothing generated yet</p>
                <p className="text-sm text-muted-foreground">Fill in the form and click Generate Content.</p>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
