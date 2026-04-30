import { useMemo, useState } from "react";
import { useNotes } from "@/hooks/useWorkspaceData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Inbox, CheckCircle2, X, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { analyzeNoteToStartup } from "@/lib/mock-analyze";

export default function DealInbox() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: notes = [] } = useNotes();
  const [pasted, setPasted] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const inbox = useMemo(() => notes.filter((n: any) => n.status === "unprocessed"), [notes]);
  const recentlyTriaged = useMemo(() => notes.filter((n: any) => n.status === "analyzed").slice(0, 6), [notes]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["notes"] });
    qc.invalidateQueries({ queryKey: ["startups"] });
    qc.invalidateQueries({ queryKey: ["insights"] });
    qc.invalidateQueries({ queryKey: ["followups"] });
  };

  const addPasted = async () => {
    if (!pasted.trim() || !user) return;
    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      source: "manual" as const,
      title: `Pasted note · ${new Date().toLocaleDateString()}`,
      raw_text: pasted.trim(),
      status: "unprocessed" as const,
    });
    if (error) return toast.error(error.message);
    setPasted("");
    toast.success("Added to inbox");
    refresh();
  };

  const analyze = async (id: string, raw: string) => {
    if (!user) return;
    try {
      setBusy(id);
      await new Promise((r) => setTimeout(r, 900));
      const startup = await analyzeNoteToStartup({ userId: user.id, noteId: id, rawText: raw });
      toast.success("Analyzed", { description: `Created startup profile · ${startup.name}` });
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Analysis failed");
    } finally {
      setBusy(null);
    }
  };

  const dismiss = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dismissed");
    refresh();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-normal tracking-tight">Deal Inbox</h1>
          <p className="text-sm text-muted-foreground">Triage raw notes and CRM imports before they become startup profiles.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          <Inbox className="h-3.5 w-3.5" /> {inbox.length} to triage
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Plus className="h-4 w-4" /> Paste a note or transcript</div>
        <Textarea rows={4} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="Paste meeting notes, an inbound email, or a forwarded intro…" />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={addPasted} disabled={!pasted.trim()}>Send to inbox</Button>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending triage · {inbox.length}</h2>
        <div className="space-y-3">
          {inbox.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
              Nothing in your inbox. Paste a note above or import from CRM.
            </div>
          )}
          {inbox.map((n: any) => (
            <article key={n.id} className="rounded-xl border border-border bg-surface p-5 shadow-card">
              <header className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{n.title ?? "Untitled note"}</span>
                    <span className="rounded-md border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{n.source}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => dismiss(n.id)} className="gap-1"><X className="h-3.5 w-3.5" /> Dismiss</Button>
                  <Button size="sm" disabled={busy === n.id} onClick={() => analyze(n.id, n.raw_text)} className="gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> {busy === n.id ? "Analyzing…" : "Analyze"}
                  </Button>
                </div>
              </header>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{n.raw_text}</p>
            </article>
          ))}
        </div>
      </section>

      {recentlyTriaged.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recently triaged</h2>
          <div className="divide-y divide-border rounded-xl border border-border bg-surface shadow-card">
            {recentlyTriaged.map((n: any) => (
              <Link key={n.id} to={n.startup?.id ? `/startups/${n.startup.id}` : "/notes"} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-muted">
                <div className="flex min-w-0 items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{n.title ?? "Note"}</div>
                    <div className="truncate text-xs text-muted-foreground">{n.startup?.name ?? "Unassigned"} · {n.source}</div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}