import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Eye, Film, History as HistoryIcon, Pencil, Trash2, Search } from "lucide-react";

const KIND_LABEL = { text: "Text", image: "Image", video: "Video" } as const;
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, Panel } from "@/components/app-shell";
import { historyStore, timeAgo, useHistory } from "@/lib/store";
import type { HistoryItem } from "@/lib/constants";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — AI Content Creator" },
      { name: "description", content: "View, edit, copy and delete previously generated AI content." },
      { property: "og:title", content: "Content History — AI Content Creator" },
      { property: "og:description", content: "Manage your previously generated AI content." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const items = useHistory();
  const [q, setQ] = useState("");
  const [view, setView] = useState<HistoryItem | null>(null);
  const [edit, setEdit] = useState<HistoryItem | null>(null);
  const [draft, setDraft] = useState("");

  const filtered = items.filter((i) => (i.topic + i.contentType).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader icon={HistoryIcon} title="History" subtitle="All the content you've generated and saved." />
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-11 rounded-xl bg-card pl-9" placeholder="Search history..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Panel className="py-14 text-center">
          <HistoryIcon className="mx-auto size-10 text-violet" />
          <p className="mt-3 font-medium">No content found</p>
          <Button asChild variant="ai" className="mt-4">
            <Link to="/generator">Generate content</Link>
          </Button>
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <Panel key={item.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{KIND_LABEL[item.kind ?? "text"]}</span>
                  {(item.kind ?? "text") === "text" && <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">{item.contentType}</span>}
                </div>
                <span className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
              </div>
              {item.kind === "image" && item.media?.url && (
                <img src={item.media.url} alt={item.topic} className="mt-3 h-40 w-full rounded-xl object-cover" />
              )}
              {item.kind === "video" && (
                <div className="mt-3 flex h-40 items-center justify-center gap-2 rounded-xl bg-gradient-soft text-sm text-primary">
                  <Film className="size-5" /> {item.media?.duration ?? 4}s video
                </div>
              )}
              <h3 className="mt-3 font-semibold">{item.topic}</h3>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{item.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">{item.tone} · {item.length}</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                <Button size="sm" variant="outline" onClick={() => setView(item)}><Eye /> View</Button>
                <Button size="sm" variant="outline" onClick={() => { setEdit(item); setDraft(item.content); }}><Pencil /> Edit</Button>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(item.content); toast.success("Copied"); }}><Copy /> Copy</Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => { if (confirm("Delete this item?")) { historyStore.remove(item.id); toast.success("Deleted"); } }}>
                  <Trash2 /> Delete
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader><DialogTitle>{view?.topic}</DialogTitle></DialogHeader>
          {view?.kind === "image" && view.media?.url && <img src={view.media.url} alt={view.topic} className="max-h-[50vh] w-full rounded-xl object-contain" />}
          {view?.kind === "video" && (
            <p className="rounded-xl bg-accent px-3 py-2 text-xs text-accent-foreground">Video files aren't stored in history — use Download when generating to keep the file. Prompt and settings are below.</p>
          )}
          <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">{view?.content}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader><DialogTitle>Edit content</DialogTitle></DialogHeader>
          <Textarea className="min-h-[300px] rounded-xl" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
            <Button variant="ai" onClick={() => { if (edit) historyStore.update(edit.id, draft); setEdit(null); toast.success("Updated"); }}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
