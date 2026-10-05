import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, Copy, Loader2, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, Panel } from "@/components/app-shell";
import { Field } from "@/components/form-field";
import { generateSeo } from "@/lib/ai-service";
import type { SeoResult } from "@/lib/constants";

export const Route = createFileRoute("/seo")({
  head: () => ({
    meta: [
      { title: "SEO Assistant — AI Content Creator" },
      { name: "description", content: "Generate SEO titles, meta descriptions, keywords, headings and hashtags with AI." },
      { property: "og:title", content: "SEO Assistant — AI Content Creator" },
      { property: "og:description", content: "AI-generated SEO titles, meta descriptions, keywords and hashtags." },
    ],
  }),
  component: Seo,
});

const copy = (t: string) => {
  navigator.clipboard.writeText(t);
  toast.success("Copied");
};

function Card({ title, value, children }: { title: string; value: string; children: React.ReactNode }) {
  return (
    <Panel>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
        <button aria-label={`Copy ${title}`} onClick={() => copy(value)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary">
          <Copy className="size-4" />
        </button>
      </div>
      {children}
    </Panel>
  );
}

const Chips = ({ items, tone = "accent" }: { items: string[]; tone?: "accent" | "primary" }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((k) => (
      <span key={k} className={tone === "primary" ? "rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary" : "rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground"}>
        {k}
      </span>
    ))}
  </div>
);

function Seo() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [result, setResult] = useState<SeoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!topic.trim()) return setError("Please enter a topic for SEO analysis.");
    setLoading(true);
    try {
      setResult(await generateSeo(topic, keywords.split(",").map((k) => k.trim()).filter(Boolean)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader icon={Search} title="SEO Assistant" subtitle="Get search-optimised metadata for any topic." />
      <Panel className="mb-6">
        <form onSubmit={run} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <Field label="Topic" htmlFor="seo-topic">
            <Input id="seo-topic" className="h-11 rounded-xl" placeholder="e.g. Machine learning for beginners" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </Field>
          <Field label="Focus keywords (optional)" htmlFor="seo-kw">
            <Input id="seo-kw" className="h-11 rounded-xl" placeholder="python, AI" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </Field>
          <Button type="submit" variant="ai" size="lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} {loading ? "Analysing..." : "Generate SEO"}
          </Button>
        </form>
        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="size-4" /> {error}
          </p>
        )}
      </Panel>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : result ? (
        <div className="grid gap-5 md:grid-cols-2">
          <Card title="SEO Title" value={result.title}>
            <p className="text-lg font-semibold text-primary">{result.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{result.title.length} characters</p>
          </Card>
          <Card title="Meta Description" value={result.metaDescription}>
            <p className="text-sm">{result.metaDescription}</p>
            <p className="mt-1 text-xs text-muted-foreground">{result.metaDescription.length} / 160 characters</p>
          </Card>
          <Card title="Primary Keywords" value={result.primaryKeywords.join(", ")}>
            <Chips items={result.primaryKeywords} tone="primary" />
          </Card>
          <Card title="Secondary Keywords" value={result.secondaryKeywords.join(", ")}>
            <Chips items={result.secondaryKeywords} />
          </Card>
          <Card title="Suggested Headings" value={result.headings.join("\n")}>
            <ol className="space-y-2 text-sm">
              {result.headings.map((h, i) => (
                <li key={h} className="flex gap-2">
                  <span className="font-mono text-xs text-violet">H{i === 0 ? 1 : 2}</span> {h}
                </li>
              ))}
            </ol>
          </Card>
          <Card title="Hashtags" value={result.hashtags.join(" ")}>
            <Chips items={result.hashtags} tone="primary" />
          </Card>
        </div>
      ) : (
        <Panel className="py-14 text-center">
          <Search className="mx-auto size-10 text-violet" />
          <p className="mt-3 font-medium">Enter a topic to get SEO suggestions</p>
          <p className="text-sm text-muted-foreground">Title, meta description, keywords, headings and hashtags.</p>
        </Panel>
      )}
    </>
  );
}
