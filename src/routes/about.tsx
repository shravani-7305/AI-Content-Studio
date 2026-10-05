import { createFileRoute } from "@tanstack/react-router";
import { Info, Cpu, Database, Layout, Server } from "lucide-react";
import { PageHeader, Panel } from "@/components/app-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — AI Content Creator" },
      { name: "description", content: "About the Generative AI Based Content Creation Tool, a CSE final-year project." },
      { property: "og:title", content: "About — AI Content Creator" },
      { property: "og:description", content: "Project overview, objectives and architecture." },
    ],
  }),
  component: About,
});

const STACK = [
  { icon: Layout, t: "Frontend", d: "React, TanStack Start, Tailwind CSS — responsive UI with reusable components." },
  { icon: Cpu, t: "AI Layer", d: "Service module ready to connect to a Generative AI model (LLM) API." },
  { icon: Server, t: "Backend", d: "Server functions for secure API calls, keeping keys off the browser." },
  { icon: Database, t: "Database", d: "Storage layer for users and history — demo uses local storage." },
];

function About() {
  return (
    <>
      <PageHeader icon={Info} title="About the Project" subtitle="Generative AI Based Content Creation Tool" />
      <div className="space-y-6">
        <Panel>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="mt-2 text-muted-foreground">
            AI Content Creator is a web application that uses Generative AI to help students, marketers and
            businesses produce written content quickly. Users enter a topic, choose a content type, writing tone
            and length, and receive ready-to-use content along with SEO suggestions.
          </p>
        </Panel>
        <Panel>
          <h2 className="text-lg font-semibold">Objectives</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Reduce the time and effort needed to write quality content.</li>
            <li>Support multiple formats: blogs, articles, posts, ads, emails and more.</li>
            <li>Improve online visibility with AI-generated SEO metadata.</li>
            <li>Keep a history of generated content for reuse and editing.</li>
          </ul>
        </Panel>
        <div>
          <h2 className="mb-4 text-lg font-semibold">System architecture</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {STACK.map(({ icon: Icon, t, d }) => (
              <Panel key={t}>
                <Icon className="size-6 text-violet" />
                <p className="mt-3 font-semibold">{t}</p>
                <p className="text-sm text-muted-foreground">{d}</p>
              </Panel>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
