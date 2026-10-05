import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PenLine, Search, History, Zap, Shield, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/app-shell";
import { CONTENT_TYPES } from "@/lib/constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Content Creator — Generative AI Content Tool" },
      { name: "description", content: "Generate blogs, posts, ads, emails and SEO metadata from a single topic using Generative AI." },
      { property: "og:title", content: "AI Content Creator — Generative AI Content Tool" },
      { property: "og:description", content: "Generate blogs, posts, ads, emails and SEO metadata from a single topic." },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { icon: PenLine, title: "Content Generator", text: "Pick a type, tone and length — get ready-to-use content in seconds.", to: "/generator" },
  { icon: Search, title: "SEO Assistant", text: "Titles, meta descriptions, keywords, headings and hashtags.", to: "/seo" },
  { icon: History, title: "History", text: "Every generation is saved so you can view, edit or reuse it.", to: "/history" },
] as const;

function Home() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-ai p-8 text-primary-foreground shadow-glow sm:p-12">
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary-foreground/10 blur-2xl" />
        <div className="relative max-w-2xl">
          <span className="inline-block rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            Generative AI · Content Studio
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">Create quality content from just a topic.</h1>
          <p className="mt-4 text-lg opacity-90">
            Enter a topic, choose a content type and writing tone, and let AI write it for you.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/generator">
                Start generating <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground">
              <Link to="/seo">Try SEO Assistant</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text, to }) => (
          <Link key={to} to={to} className="group">
            <Panel className="h-full transition-all group-hover:-translate-y-1 group-hover:border-primary/40">
              <span className="grid size-11 place-items-center rounded-xl bg-gradient-soft text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Panel>
          </Link>
        ))}
      </section>

      <Panel>
        <h2 className="text-xl font-semibold">Supported content types</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {CONTENT_TYPES.map((t) => (
            <span key={t} className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
              {t}
            </span>
          ))}
        </div>
      </Panel>

      <section className="grid gap-5 sm:grid-cols-3">
        {[
          { icon: Zap, t: "Fast", d: "Content in seconds, not hours." },
          { icon: Layers, t: "Flexible", d: "7 content types, 7 tones, 3 lengths." },
          { icon: Shield, t: "API-ready", d: "Built to plug into any AI model and database." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="flex items-start gap-3">
            <Icon className="mt-0.5 size-5 text-violet" />
            <div>
              <p className="font-semibold">{t}</p>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
