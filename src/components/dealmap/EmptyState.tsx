import { Map, Wand2 } from "lucide-react";

export function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center shadow-card">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-foreground">
        <Map className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-normal tracking-tight text-foreground">
        Your market map will appear here
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Import your CRM and load sample notes, then generate a market map to
        see segments, profiles, and follow-up questions.
      </p>
      <button
        onClick={onGenerate}
        className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
      >
        <Wand2 className="h-3.5 w-3.5" />
        Generate Market Map
      </button>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="rounded-xl border border-border bg-surface p-10 text-center shadow-card">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-normal tracking-tight text-foreground">
        Analyzing CRM records and meeting notes…
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Extracting startups, clustering segments, matching similar companies,
        and drafting follow-up questions.
      </p>
      <div className="mx-auto mt-6 grid max-w-md gap-2 text-left text-xs text-muted-foreground">
        {[
          "Parsing 4 startup mentions",
          "Clustering 4 market segments",
          "Matching against 1,284 known companies",
          "Drafting follow-up questions",
        ].map((t, i) => (
          <div
            key={t}
            className="flex items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-1.5"
            style={{ animation: `fade-in-up 0.4s ease-out ${i * 200}ms both` }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}