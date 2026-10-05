import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, LayoutDashboard, PenLine, Search, Type, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/app-shell";
import { timeAgo, useHistory, useUser } from "@/lib/store";
import { CONTENT_TYPES } from "@/lib/constants";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Content Creator" },
      { name: "description", content: "Overview of your AI content generation activity." },
      { property: "og:title", content: "Dashboard — AI Content Creator" },
      { property: "og:description", content: "Your AI content stats and recent activity." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const items = useHistory();
  const user = useUser();
  const words = items.reduce((n, i) => n + i.content.split(/\s+/).length, 0);
  const week = items.filter((i) => Date.now() - new Date(i.createdAt).getTime() < 7 * 86400e3).length;
  const counts = CONTENT_TYPES.map((t) => ({ t, n: items.filter((i) => i.contentType === t).length }));
  const max = Math.max(1, ...counts.map((c) => c.n));

  const stats = [
    { icon: FileText, label: "Total content", value: items.length },
    { icon: Clock, label: "This week", value: week },
    { icon: Type, label: "Words generated", value: words.toLocaleString() },
    { icon: LayoutDashboard, label: "Content types", value: CONTENT_TYPES.length },
  ];

  return (
    <>
      <PageHeader icon={LayoutDashboard} title={`Welcome${user ? `, ${user.name}` : ""} 👋`} subtitle="Here's an overview of your content activity." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }, i) => (
          <Panel key={label} className={i === 0 ? "bg-gradient-ai text-primary-foreground border-transparent" : ""}>
            <Icon className={i === 0 ? "size-5 opacity-80" : "size-5 text-primary"} />
            <p className="mt-3 font-display text-3xl font-bold">{value}</p>
            <p className={i === 0 ? "text-sm opacity-80" : "text-sm text-muted-foreground"}>{label}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Panel>
          <h2 className="font-semibold">Content by type</h2>
          <div className="mt-4 space-y-3">
            {counts.map(({ t, n }) => (
              <div key={t}>
                <div className="mb-1 flex justify-between text-sm"><span>{t}</span><span className="text-muted-foreground">{n}</span></div>
                <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-gradient-ai" style={{ width: `${(n / max) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent activity</h2>
            <Link to="/history" className="text-sm font-medium text-primary">View all</Link>
          </div>
          <ul className="mt-4 divide-y">
            {items.slice(0, 5).map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{i.topic}</p>
                  <p className="text-xs text-muted-foreground">{i.contentType} · {i.tone}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(i.createdAt)}</span>
              </li>
            ))}
            {items.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No activity yet.</li>}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Button asChild variant="ai" size="lg"><Link to="/generator"><PenLine /> New content</Link></Button>
        <Button asChild variant="outline" size="lg"><Link to="/seo"><Search /> SEO analysis</Link></Button>
      </div>
    </>
  );
}
