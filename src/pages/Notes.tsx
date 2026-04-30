import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNotes } from "@/hooks/useWorkspaceData";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Notes() {
  const { data: notes = [], isLoading } = useNotes();
  const [q, setQ] = useState("");
  const [src, setSrc] = useState("all");
  const [status, setStatus] = useState("all");
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(() => notes.filter((n: any) => {
    if (q && !`${n.title ?? ""} ${n.raw_text}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (src !== "all" && n.source !== src) return false;
    if (status !== "all" && n.status !== status) return false;
    return true;
  }), [notes, q, src, status]);

  const selected = filtered.find((n: any) => n.id === active) ?? filtered[0];

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <div>
        <h1 className="font-display text-3xl font-normal tracking-tight">Notes</h1>
        <p className="text-sm text-muted-foreground">Persistent library of every note across your deal flow.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes…" className="h-9 pl-9 bg-surface" />
        </div>
        <Select value={src} onValueChange={setSrc}>
          <SelectTrigger className="h-9 w-36 bg-surface"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="hubspot">HubSpot</SelectItem>
            <SelectItem value="granola">Granola</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-40 bg-surface"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="unprocessed">Unprocessed</SelectItem>
            <SelectItem value="analyzed">Analyzed</SelectItem>
            <SelectItem value="needs_review">Needs review</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} of {notes.length}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
          <div className="max-h-[640px] divide-y divide-border overflow-y-auto">
            {isLoading && <div className="p-6 text-sm text-muted-foreground">Loading…</div>}
            {!isLoading && filtered.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No notes match.</div>}
            {filtered.map((n: any) => (
              <button
                key={n.id}
                onClick={() => setActive(n.id)}
                className={cn(
                  "block w-full px-4 py-3 text-left transition hover:bg-surface-muted",
                  selected?.id === n.id && "bg-accent-soft/40",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{n.title ?? "Untitled"}</span>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{n.source}</span>
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{n.startup?.name ?? "Unassigned"} · {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</div>
                <div className="mt-1 line-clamp-2 text-xs text-foreground/70">{n.raw_text}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          {selected ? (
            <article>
              <header className="flex items-start justify-between gap-3 border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-base font-semibold">{selected.title ?? "Untitled note"}</h2>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {selected.startup?.id ? (
                      <Link to={`/startups/${selected.startup.id}`} className="text-accent hover:underline">{selected.startup.name}</Link>
                    ) : "Unassigned"}
                    {" · "}{selected.source} · {formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}
                  </div>
                </div>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{selected.status}</span>
              </header>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{selected.raw_text}</div>
            </article>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Select a note</div>
          )}
        </div>
      </div>
    </div>
  );
}