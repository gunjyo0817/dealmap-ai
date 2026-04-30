import { FileText, Wand2, AlertCircle } from "lucide-react";

interface Props {
  notes: string;
  setNotes: (v: string) => void;
  onLoadSample: () => void;
  onGenerate: () => void;
  generating: boolean;
  error?: string | null;
}

export function NotesInput({
  notes,
  setNotes,
  onLoadSample,
  onGenerate,
  generating,
  error,
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Meeting notes
          </span>
          <span className="text-xs text-muted-foreground">
            · founder calls, partner reviews, CRM context
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {notes.length.toLocaleString()} chars
        </span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Paste meeting notes, founder call transcript, or CRM notes here…"
        className="block min-h-[180px] w-full resize-y bg-transparent px-5 py-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-muted px-5 py-3">
        <div className="flex items-center gap-3">
          {error ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-danger">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              Tip: combine CRM rows + notes for the strongest market map.
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary"
          >
            Load Sample Notes
          </button>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-card-md transition hover:opacity-90 disabled:opacity-60"
          >
            <Wand2 className="h-3.5 w-3.5" />
            {generating ? "Analyzing…" : "Generate Market Map"}
          </button>
        </div>
      </div>
    </div>
  );
}