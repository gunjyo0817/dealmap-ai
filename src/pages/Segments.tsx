import { Link } from "react-router-dom";
import { useSegments } from "@/hooks/useWorkspaceData";
import { TrendBadge, PriorityBadge } from "@/components/dealmap/PriorityBadge";
import { Layers, ArrowRight } from "lucide-react";

export default function Segments() {
  const { data: segments = [], isLoading } = useSegments();

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <div>
        <h1 className="font-display text-3xl font-normal tracking-tight">Segments</h1>
        <p className="text-sm text-muted-foreground">Market categories with opportunity scores and white-space gaps.</p>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        {segments.map((s: any) => {
          const whitespace = s.opportunity_score >= 70 && s.crowdedness_score < 60;
          return (
            <article key={s.id} className="rounded-xl border border-border bg-surface p-5 shadow-card">
              <header className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent"><Layers className="h-4 w-4" /></div>
                    <h3 className="text-base font-semibold">{s.name}</h3>
                  </div>
                  {s.description && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.description}</p>}
                </div>
                <TrendBadge value={s.trend} />
              </header>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <ScoreBlock label="Opportunity" value={s.opportunity_score} tone="success" />
                <ScoreBlock label="Crowdedness" value={s.crowdedness_score} tone="warning" />
              </div>

              {whitespace && (
                <div className="mt-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
                  ✦ White-space opportunity: high opportunity, low crowdedness.
                </div>
              )}

              <div className="mt-4 border-t border-border pt-3">
                <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span>Startups in segment</span>
                  <span>{s.startups?.length ?? 0}</span>
                </div>
                <div className="space-y-1.5">
                  {(s.startups ?? []).slice(0, 5).map((st: any) => (
                    <Link key={st.id} to={`/startups/${st.id}`} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-surface-muted">
                      <span>{st.name}</span>
                      <PriorityBadge value={st.priority} />
                    </Link>
                  ))}
                  {(s.startups ?? []).length === 0 && <div className="text-xs text-muted-foreground">No startups mapped yet.</div>}
                </div>
                {(s.startups ?? []).length > 5 && (
                  <Link to={`/startups?seg=${s.id}`} className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline">
                    View all {s.startups.length} <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ScoreBlock({ label, value, tone }: { label: string; value: number; tone: "success" | "warning" }) {
  const color = tone === "success" ? "hsl(var(--success))" : "hsl(var(--warning))";
  return (
    <div className="rounded-lg border border-border bg-surface-muted p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-mono text-sm font-semibold">{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}