import { useMemo, useState } from "react";
import { useSegments, useStartups } from "@/hooks/useWorkspaceData";
import { TrendBadge, PriorityBadge, StageBadge } from "@/components/dealmap/PriorityBadge";
import { ArrowUpRight, Layers, LayoutGrid, Grid3x3, Table as TableIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { MarketSegmentDetailSheet } from "@/components/dealmap/MarketSegmentDetailSheet";
import type { SegmentWithStartups, StartupWithSegment } from "@/lib/workspace-types";

// Mock external competitor mapping per segment name
const SEGMENT_EXTERNAL: Record<string, { external: string[] }> = {
  "Climate Tech":      { external: ["Watershed", "Sweep"] },
  "Legal AI":          { external: ["Harvey", "Spellbook"] },
  "Sales Automation":  { external: ["Clay", "Apollo"] },
  "DevTools":          { external: ["Sentry", "Linear"] },
};

type View = "board" | "matrix" | "table";

export default function MarketMap() {
  const { data: segments = [] } = useSegments();
  const { data: startups = [] } = useStartups();
  const [view, setView] = useState<View>("board");
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);

  const unsegmented = useMemo(() => startups.filter((s) => !s.segment_id), [startups]);
  const selectedSegment = useMemo(
    () => segments.find((segment) => segment.id === selectedSegmentId) ?? null,
    [segments, selectedSegmentId],
  );
  const openSegment = (segmentId: string) => setSelectedSegmentId(segmentId);

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-normal tracking-tight">Market Map</h1>
          <p className="text-sm text-muted-foreground">Visualize your portfolio across segments, opportunity, and crowdedness.</p>
        </div>
        <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-border bg-surface p-0.5">
          {[
            { v: "board" as const, icon: LayoutGrid, label: "Board" },
            { v: "matrix" as const, icon: Grid3x3, label: "Matrix" },
            { v: "table" as const, icon: TableIcon, label: "Table" },
          ].map((t) => (
            <button key={t.v} onClick={() => setView(t.v)} className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
              view === t.v ? "bg-accent-soft text-accent" : "text-muted-foreground hover:text-foreground",
            )}>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
        </div>
      </div>

      {view === "board" && <BoardView segments={segments} unsegmented={unsegmented} onOpenSegment={openSegment} />}
      {view === "matrix" && <MatrixView segments={segments} onOpenSegment={openSegment} />}
      {view === "table" && <TableView segments={segments} onOpenSegment={openSegment} />}

      <MarketSegmentDetailSheet
        segmentId={selectedSegmentId}
        open={!!selectedSegmentId}
        onOpenChange={(open) => {
          if (!open) setSelectedSegmentId(null);
        }}
        fallbackSegment={selectedSegment}
      />
    </div>
  );
}

function BoardView({
  segments,
  unsegmented,
  onOpenSegment,
}: {
  segments: SegmentWithStartups[];
  unsegmented: StartupWithSegment[];
  onOpenSegment: (segmentId: string) => void;
}) {
  const cols = [...segments];
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {cols.map((s) => {
        const ext = SEGMENT_EXTERNAL[s.name] ?? { external: [] };
        const pipeline = s.startups ?? [];
        return (
          <div
            key={s.id}
            role="button"
            tabIndex={0}
            aria-label={`Open ${s.name} comparison`}
            onClick={() => onOpenSegment(s.id)}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpenSegment(s.id);
              }
            }}
            className="w-80 shrink-0 cursor-pointer rounded-xl border border-border bg-surface shadow-card transition hover:border-accent/45 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent/35"
          >
            <div className="border-b border-border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-semibold">{s.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendBadge value={s.trend} />
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-10 text-[10px] uppercase tracking-wider text-success">Opp</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-success/15">
                    <div className="h-full rounded-full bg-success/55" style={{ width: `${s.opportunity_score}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono text-[11px] font-semibold text-success">{s.opportunity_score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-10 text-[10px] uppercase tracking-wider text-warning">Crowd</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-warning/15">
                    <div className="h-full rounded-full bg-warning/55" style={{ width: `${s.crowdedness_score}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono text-[11px] font-semibold text-warning">{s.crowdedness_score}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-3">
              {/* Our pipeline */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                    Our pipeline
                  </span>
                  <div className="flex items-center gap-1">
                    {pipeline.map((st) => (
                      <div
                        key={st.id}
                        title={`${st.name}: ${st.priority ?? "Low"} priority`}
                        className={cn(
                          "h-2 w-2 rounded-full",
                          st.priority === "High" ? "bg-success" : st.priority === "Medium" ? "bg-warning" : "bg-muted-foreground/40",
                        )}
                      />
                    ))}
                    <span className="ml-0.5 text-[10px] text-muted-foreground">{pipeline.length}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {pipeline.length === 0 && (
                    <div className="rounded-md border border-dashed border-border p-2 text-center text-[11px] text-muted-foreground">
                      No startups in pipeline
                    </div>
                  )}
                  {pipeline.map((st) => (
                    <Link
                      key={st.id}
                      to={`/startups/${st.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="block rounded-lg border border-accent/40 bg-accent-soft/40 px-3 py-2 transition hover:border-accent"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{st.name}</span>
                        <PriorityBadge value={st.priority} />
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <StageBadge value={st.stage} />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{st.status}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* External competitors */}
              {ext.external.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      External competitors
                    </span>
                    <span className="text-[10px] text-muted-foreground">{ext.external.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {ext.external.map((name) => (
                      <div
                        key={name}
                        className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-foreground/85"
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {unsegmented.length > 0 && (
        <div className="w-72 shrink-0 rounded-xl border border-dashed border-border bg-surface/60 shadow-card">
          <div className="border-b border-border p-3">
            <span className="text-sm font-semibold text-muted-foreground">Unsegmented</span>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{unsegmented.length} startups</div>
          </div>
          <div className="space-y-2 p-3">
            {unsegmented.map((st) => (
              <Link key={st.id} to={`/startups/${st.id}`} className="block rounded-lg border border-border bg-surface-muted px-3 py-2">
                <span className="text-sm font-medium">{st.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MatrixView({ segments, onOpenSegment }: { segments: SegmentWithStartups[]; onOpenSegment: (segmentId: string) => void }) {
  // X = crowdedness, Y = opportunity (inverted so high opp is up)
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Opportunity matrix</span>
        <span>Bubble size = startups in segment</span>
      </div>
      <div className="relative h-[460px] rounded-lg border border-border bg-surface-muted">
        {/* Quadrant lines */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
          <div className="absolute left-0 top-1/2 h-px w-full bg-border" />
          <div className="absolute left-3 top-3 text-[10px] uppercase tracking-wider text-success">White-space · High opportunity</div>
          <div className="absolute right-3 top-3 text-[10px] uppercase tracking-wider text-warning">Crowded · High opportunity</div>
          <div className="absolute left-3 bottom-3 text-[10px] uppercase tracking-wider text-muted-foreground">Niche · Low opportunity</div>
          <div className="absolute right-3 bottom-3 text-[10px] uppercase tracking-wider text-danger">Crowded · Low opportunity</div>
        </div>
        {/* Axis labels */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] uppercase tracking-wider text-muted-foreground">Opportunity →</div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-muted-foreground">Crowdedness →</div>

        {segments.map((s) => {
          const x = s.crowdedness_score; // 0..100
          const y = 100 - s.opportunity_score; // invert
          const size = Math.max(36, Math.min(96, 28 + (s.startups?.length ?? 0) * 12));
          const tone = s.opportunity_score >= 70 && s.crowdedness_score < 60 ? "success"
            : s.crowdedness_score >= 70 && s.opportunity_score >= 60 ? "warning"
            : s.crowdedness_score >= 70 ? "danger" : "violet";
          const bg: Record<string, string> = {
            success: "bg-success/15 border-success/40 text-success",
            warning: "bg-warning/15 border-warning/40 text-warning",
            danger: "bg-danger/15 border-danger/40 text-danger",
            violet: "bg-violet/15 border-violet/40 text-violet",
          };
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => onOpenSegment(s.id)}
              className={cn("group absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[11px] font-semibold transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent/35", bg[tone])}
              style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
              title={`${s.name} · Opp ${s.opportunity_score} · Crowd ${s.crowdedness_score}`}
            >
              <span className="px-2 text-center leading-tight">{s.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TableView({ segments, onOpenSegment }: { segments: SegmentWithStartups[]; onOpenSegment: (segmentId: string) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <table className="w-full text-sm">
        <thead className="bg-surface-muted text-[11px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 text-left font-medium">Segment</th>
            <th className="px-4 py-2.5 text-left font-medium">Trend</th>
            <th className="px-4 py-2.5 text-left font-medium">Opportunity</th>
            <th className="px-4 py-2.5 text-left font-medium">Crowdedness</th>
            <th className="px-4 py-2.5 text-left font-medium">Startups</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {segments.map((s) => (
            <tr
              key={s.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenSegment(s.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenSegment(s.id);
                }
              }}
              className="cursor-pointer hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/35"
            >
              <td className="px-4 py-3 font-medium">{s.name}</td>
              <td className="px-4 py-3"><TrendBadge value={s.trend} /></td>
              <td className="px-4 py-3"><ScoreBar value={s.opportunity_score} tone="success" /></td>
              <td className="px-4 py-3"><ScoreBar value={s.crowdedness_score} tone="warning" /></td>
              <td className="px-4 py-3 text-muted-foreground">{s.startups?.length ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScoreBar({ value, tone }: { value: number; tone: "success" | "warning" }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
        <div className="h-full" style={{ width: `${value}%`, background: tone === "success" ? "hsl(var(--success))" : "hsl(var(--warning))" }} />
      </div>
      <span className="font-mono text-xs text-muted-foreground">{value}</span>
    </div>
  );
}
