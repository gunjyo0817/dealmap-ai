import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useInsights } from "@/hooks/useWorkspaceData";
import { Sparkles, TrendingUp, Layers, AlertTriangle, Lightbulb, HelpCircle, Brain, Share2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPES = [
  { v: "all", label: "All" },
  { v: "trend", label: "Trends", icon: TrendingUp },
  { v: "whitespace", label: "White-space", icon: Lightbulb },
  { v: "crowded_market", label: "Crowded", icon: Layers },
  { v: "missing_competitor", label: "Missing competitors", icon: AlertTriangle },
  { v: "follow_up", label: "Follow-ups", icon: HelpCircle },
  { v: "similar_alert", label: "Similar memory", icon: Brain },
] as const;

const TYPE_TONE: Record<string, string> = {
  trend: "bg-accent-soft text-accent border-accent/30",
  whitespace: "bg-success/10 text-success border-success/30",
  crowded_market: "bg-warning/10 text-warning border-warning/30",
  missing_competitor: "bg-violet/10 text-violet border-violet/30",
  follow_up: "bg-surface-muted text-foreground border-border",
  similar_alert: "bg-teal/10 text-teal border-teal/30",
};

export default function Insights() {
  const { data: insights = [] } = useInsights();
  const [type, setType] = useState<string>("all");

  const filtered = useMemo(() => insights.filter((i: any) => type === "all" || i.type === type), [insights, type]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    insights.forEach((i: any) => { c[i.type] = (c[i.type] ?? 0) + 1; });
    return c;
  }, [insights]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <div>
        <h1 className="font-display text-3xl font-normal tracking-tight">Insights</h1>
        <p className="text-sm text-muted-foreground">Saved AI insights with confidence and recommended actions.</p>
      </div>

      <Link to="/social-sourcing" className="flex items-center justify-between rounded-xl border border-border bg-gradient-to-r from-violet-soft/60 to-accent-soft/40 px-4 py-3 shadow-card hover:border-violet/40">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet text-white"><Share2 className="h-4 w-4" /></div>
          <div>
            <div className="text-sm font-semibold">Social sourcing signals</div>
            <div className="text-[11px] text-muted-foreground">3 high-signal founders · 4 warm intro paths · demo social graph</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-violet">Open Social Sourcing <ArrowRight className="h-3 w-3" /></span>
      </Link>

      <div className="flex flex-wrap gap-1.5">
        {TYPES.map((t) => {
          const Icon = "icon" in t ? t.icon : Sparkles;
          const count = t.v === "all" ? insights.length : (counts[t.v] ?? 0);
          return (
            <button
              key={t.v}
              onClick={() => setType(t.v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition",
                type === t.v
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              <span className={cn("rounded-full px-1.5 text-[10px]", type === t.v ? "bg-white/20" : "bg-surface-muted")}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">No insights match this filter.</div>}
        {filtered.map((i: any) => (
          <article key={i.id} className="rounded-xl border border-border bg-surface p-5 shadow-card">
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider", TYPE_TONE[i.type] ?? "border-border bg-surface-muted")}>
                    {i.type.replace("_", " ")}
                  </span>
                  <h3 className="text-base font-semibold">{i.title}</h3>
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {i.startup?.id && <Link to={`/startups/${i.startup.id}`} className="text-accent hover:underline">{i.startup.name}</Link>}
                  {i.segment?.name && <span>· Segment: {i.segment.name}</span>}
                </div>
              </div>
              <ConfidenceMeter value={i.confidence_score} />
            </header>
            {i.content && <p className="mt-3 text-sm leading-relaxed text-foreground/85">{i.content}</p>}
            {i.recommended_action && (
              <div className="mt-3 rounded-lg border border-accent/20 bg-accent-soft/60 px-3 py-2 text-xs text-accent">
                → {i.recommended_action}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const tone = value >= 80 ? "text-success" : value >= 60 ? "text-warning" : "text-muted-foreground";
  return (
    <div className="shrink-0 text-right">
      <div className={cn("font-mono text-sm font-semibold", tone)}>{value}%</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">confidence</div>
    </div>
  );
}