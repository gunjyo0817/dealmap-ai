import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNotes } from "@/hooks/useWorkspaceData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analyzeNote } from "@/lib/analyze-note";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { FileText, Paperclip, Plus, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Notes() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: notes = [], isLoading } = useNotes();
  const [pasted, setPasted] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [q, setQ] = useState("");
  const [src, setSrc] = useState("all");
  const [status, setStatus] = useState("all");
  const [active, setActive] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => notes.filter((n) => {
    if (q && !`${n.title ?? ""} ${n.raw_text}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (src !== "all" && n.source !== src) return false;
    if (status !== "all" && n.status !== status) return false;
    return true;
  }), [notes, q, src, status]);

  const selected = filtered.find((n) => n.id === active) ?? filtered[0];

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
    toast.success("Added transcript");
    refresh();
  };

  const addAndAnalyze = async () => {
    if (!pasted.trim() || !user || isImporting) return;
    setIsImporting(true);
    try {
      const { data: note, error: noteError } = await supabase
        .from("notes")
        .insert({
          user_id: user.id,
          source: "manual" as const,
          title: `Transcript · ${new Date().toLocaleDateString()}`,
          raw_text: pasted.trim(),
          status: "unprocessed" as const,
        })
        .select("id")
        .single();
      if (noteError) { toast.error(noteError.message); return; }

      const { startup, isNew } = await analyzeNote(note.id, user.id);
      setPasted("");
      toast.success(
        isNew
          ? `New startup created: ${startup.name}`
          : `${startup.name} updated with transcript insights`,
      );
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsImporting(false);
    }
  };

  const extractTextFromPdf = async (file: File) => {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();

    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data: bytes }).promise;
    const chunks: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .trim();

      if (pageText) chunks.push(pageText);
    }

    return chunks.join("\n\n");
  };

  const extractTextFromDocx = async (file: File) => {
    const mammoth = await import("mammoth/mammoth.browser");
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return value.trim();
  };

  const uploadTranscript = async (file: File | null) => {
    if (!file) return;
    try {
      const name = file.name.toLowerCase();
      let content = "";

      if (name.endsWith(".pdf")) {
        content = await extractTextFromPdf(file);
      } else if (name.endsWith(".docx")) {
        content = await extractTextFromDocx(file);
      } else {
        content = await file.text();
      }

      if (!content.trim()) {
        toast.error("Uploaded file is empty");
        return;
      }
      setPasted((prev) => (prev.trim() ? `${prev.trim()}\n\n${content.trim()}` : content.trim()));
      toast.success(`Loaded ${file.name}`);
    } catch {
      toast.error("Failed to read file");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <div>
        <h1 className="font-display text-3xl font-normal tracking-tight">Notes</h1>
        <p className="text-sm text-muted-foreground">Deal inbox and persistent library of every note across your deal flow.</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Plus className="h-4 w-4" /> Add transcript</div>
        <Textarea rows={4} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="Paste meeting notes, call transcript, or forwarded intro..." />
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.csv,.json,.docx,.pdf,text/plain,text/markdown,text/csv,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            void uploadTranscript(file);
            e.currentTarget.value = "";
          }}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
            <Paperclip className="mr-1.5 h-3.5 w-3.5" />
            Upload file
          </Button>
          <Button size="sm" variant="outline" onClick={addPasted} disabled={!pasted.trim() || isImporting}>Save to inbox</Button>
          <Button size="sm" onClick={addAndAnalyze} disabled={!pasted.trim() || isImporting}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {isImporting ? "Analyzing…" : "Analyze & Import to CRM"}
          </Button>
        </div>
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
            {filtered.map((n) => (
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
