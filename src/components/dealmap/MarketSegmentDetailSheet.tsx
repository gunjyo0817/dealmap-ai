import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  Building2,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  NotebookPen,
  Sparkles,
  Swords,
  Target,
  type LucideIcon,
  Users,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PriorityBadge, StageBadge, TrendBadge } from "@/components/dealmap/PriorityBadge";
import { useMarketSegmentDetail } from "@/hooks/useWorkspaceData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { MarketCompetitor, MarketStartupComparison, SegmentWithStartups } from "@/lib/workspace-types";

type LLMSegmentSummary = {
  marketPosition: string;
  bestPositionedStartup: string;
  mainCompetitorThreat: string;
  keyDiligenceQuestion: string;
  recommendedNextAction: string;
  comparativeInsight: string;
};

function useLLMSegmentSummary(segmentId: string | null) {
  return useQuery<LLMSegmentSummary | null>({
    queryKey: ["llm-segment-summary", segmentId],
    enabled: !!segmentId,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("summarize-segment", {
        body: { segmentId },
      });
      if (error) throw error;
      return (data?.summary ?? null) as LLMSegmentSummary | null;
    },
  });
}

type MarketSegmentDetailSheetProps = {
  segmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fallbackSegment?: SegmentWithStartups | null;
};

const toneClasses = {
  accent: "border-accent/25 bg-accent-soft/35 text-accent",
  success: "border-success/25 bg-success-soft/45 text-success",
  warning: "border-warning/25 bg-warning-soft/45 text-warning",
  danger: "border-danger/25 bg-danger-soft/45 text-danger",
  muted: "border-border bg-surface-muted text-muted-foreground",
};

function computeScore(startup: MarketStartupComparison): number {
  const p = startup.priority === "High" ? 30 : startup.priority === "Medium" ? 15 : 0;
  const opp = (startup.latestAnalysis?.opportunity_signals as string[] | null)?.length ?? 0;
  const risk = (startup.latestAnalysis?.risk_signals as string[] | null)?.length ?? 0;
  const highFu = startup.followups.filter((f) => f.priority === "High" && f.status === "open").length;
  const diff = startup.differentiation ? 10 : 0;
  return p + opp * 8 + diff - risk * 4 - highFu * 2;
}

export function MarketSegmentDetailSheet({
  segmentId,
  open,
  onOpenChange,
  fallbackSegment,
}: MarketSegmentDetailSheetProps) {
  const { data, isLoading, isError, error } = useMarketSegmentDetail(segmentId);
  const { data: llmSummary, isLoading: isLLMLoading } = useLLMSegmentSummary(segmentId);
  const segment = data?.segment ?? fallbackSegment ?? null;
  const startupCount = data?.startups.length ?? fallbackSegment?.startups?.length ?? 0;
  const competitorCount = data?.competitors.length ?? 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-background p-0 sm:max-w-2xl lg:max-w-4xl">
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-6 py-5 backdrop-blur">
          <SheetHeader className="space-y-3 pr-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <SheetTitle className="font-display text-2xl font-normal tracking-tight">
                  {segment?.name ?? "Market detail"}
                </SheetTitle>
                <SheetDescription className="mt-1 max-w-2xl">
                  {segment?.description ?? "Portfolio and competitor comparison."}
                </SheetDescription>
              </div>
              {segment && (
                <div className="flex flex-wrap items-center gap-2">
                  <TrendBadge value={segment.trend} />
                  <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs">
                    <Link to={`/startups?seg=${segment.id}`}>
                      <Users className="h-3.5 w-3.5" /> View startups
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="h-8 gap-1.5 px-2.5 text-xs">
                    <Link to="/inbox">
                      <NotebookPen className="h-3.5 w-3.5" /> Add note
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </SheetHeader>
        </div>

        <div className="space-y-5 px-6 py-5">
          {segment && (
            <div className="grid gap-2 sm:grid-cols-4">
              <CompactMetric label="Opportunity" value={segment.opportunity_score} tone="success" />
              <CompactMetric label="Crowdedness" value={segment.crowdedness_score} tone="warning" />
              <CompactMetric label="Startups" value={startupCount} tone="accent" />
              <CompactMetric label="Competitors" value={competitorCount} tone="muted" />
            </div>
          )}

          {isLoading && (
            <div className="grid gap-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-lg border border-border bg-surface-muted" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-danger/25 bg-danger-soft/35 px-4 py-3 text-sm text-danger">
              {error instanceof Error ? error.message : "Unable to load market detail."}
            </div>
          )}

          {data && (
            <>
              <InvestmentRead
                marketPosition={data.summary.marketPosition}
                bestPositionedStartup={data.summary.bestPositionedStartup}
                mainCompetitorThreat={data.summary.mainCompetitorThreat}
                keyDiligenceQuestion={data.summary.keyDiligenceQuestion}
                recommendedNextAction={data.summary.recommendedNextAction}
                llmSummary={llmSummary ?? null}
                isLoadingLLM={isLLMLoading}
              />

              <section>
                <SectionHeader icon={Building2} title="Portfolio comparison" count={data.startups.length} />
                <StartupComparisonTable
                  startups={data.startups}
                  bestStartupId={data.bestStartup?.id ?? null}
                />
              </section>

              <PortfolioPositioningChart startups={data.startups} />

              <CompetitorMap mainThreat={data.mainThreat} competitors={data.competitors} />

              <EvidenceSection
                startupAdvantages={data.summary.startupAdvantages}
                startupWeaknesses={data.summary.startupWeaknesses}
                competitorAdvantages={data.summary.competitorAdvantages}
                openQuestions={data.summary.openQuestions}
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CompactMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: keyof typeof toneClasses;
}) {
  return (
    <div className={cn("rounded-lg border px-3 py-2", toneClasses[tone])}>
      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</div>
      <div className="mt-0.5 font-mono text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function InvestmentRead({
  marketPosition,
  bestPositionedStartup,
  mainCompetitorThreat,
  keyDiligenceQuestion,
  recommendedNextAction,
  llmSummary,
  isLoadingLLM,
}: {
  marketPosition: string;
  bestPositionedStartup: string;
  mainCompetitorThreat: string;
  keyDiligenceQuestion: string;
  recommendedNextAction: string;
  llmSummary: LLMSegmentSummary | null;
  isLoadingLLM: boolean;
}) {
  const pos = llmSummary?.marketPosition ?? marketPosition;
  const best = llmSummary?.bestPositionedStartup ?? bestPositionedStartup;
  const threat = llmSummary?.mainCompetitorThreat ?? mainCompetitorThreat;
  const question = llmSummary?.keyDiligenceQuestion ?? keyDiligenceQuestion;
  const action = llmSummary?.recommendedNextAction ?? recommendedNextAction;

  return (
    <section className="rounded-lg border border-accent/25 bg-surface p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent-soft/40 text-accent">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Investment read</span>
            {llmSummary && (
              <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent">AI</span>
            )}
            {isLoadingLLM && !llmSummary && (
              <span className="text-[10px] text-muted-foreground animate-pulse">Generating AI analysis…</span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/85">{pos}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <ReadSignal icon={Target} title="Best positioned" body={best} tone="success" />
        <ReadSignal icon={Swords} title="Main threat" body={threat} tone="danger" />
        <ReadSignal icon={HelpCircle} title="Key question" body={question} tone="warning" />
        <ReadSignal icon={ArrowRight} title="Next action" body={action} tone="accent" />
        {llmSummary?.comparativeInsight && (
          <div className="lg:col-span-2">
            <ReadSignal icon={Lightbulb} title="Comparative insight" body={llmSummary.comparativeInsight} tone="muted" />
          </div>
        )}
      </div>
    </section>
  );
}

function ReadSignal({
  icon: Icon,
  title,
  body,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  tone: keyof typeof toneClasses;
}) {
  return (
    <div className="flex gap-2 rounded-lg border border-border bg-surface-muted p-3">
      <span className={cn("inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border", toneClasses[tone])}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
        <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-foreground/85">{body}</p>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, count }: { icon: LucideIcon; title: string; count: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{count}</span>
    </div>
  );
}

// ─── Portfolio Comparison Table (P0-1) ───────────────────────────────────────

function StartupComparisonTable({
  startups,
  bestStartupId,
}: {
  startups: MarketStartupComparison[];
  bestStartupId: string | null;
}) {
  if (startups.length === 0) {
    return (
      <div className="mt-3">
        <EmptyPanel>No startups mapped to this market yet.</EmptyPanel>
      </div>
    );
  }

  const maxOpp = Math.max(1, ...startups.map((s) => (s.latestAnalysis?.opportunity_signals as string[] | null)?.length ?? 0));
  const maxRisk = Math.max(1, ...startups.map((s) => (s.latestAnalysis?.risk_signals as string[] | null)?.length ?? 0));
  const ranked = [...startups].sort((a, b) => computeScore(b) - computeScore(a));

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface">
      {/* Table header – desktop only */}
      <div className="hidden border-b border-border bg-surface-muted px-4 py-2 sm:grid sm:grid-cols-[28px_1fr_auto_130px_130px_44px] sm:items-center sm:gap-3">
        <span />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Startup</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tags</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-success">Opportunities</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-warning">Risks</span>
        <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">F/U</span>
      </div>

      {ranked.map((startup, idx) => {
        const rank = idx + 1;
        const isBest = startup.id === bestStartupId;
        const opp = (startup.latestAnalysis?.opportunity_signals as string[] | null)?.length ?? 0;
        const risk = (startup.latestAnalysis?.risk_signals as string[] | null)?.length ?? 0;
        const openFu = startup.followups.filter((f) => f.status === "open").length;
        const oppPct = Math.round((opp / maxOpp) * 100);
        const riskPct = Math.round((risk / maxRisk) * 100);
        const firstOpp = (startup.latestAnalysis?.opportunity_signals as string[] | null)?.[0];
        const firstRisk = (startup.latestAnalysis?.risk_signals as string[] | null)?.[0];

        return (
          <article
            key={startup.id}
            className={cn(
              "border-b border-border p-4 last:border-b-0",
              isBest && "border-l-2 border-l-success bg-success/[0.02]",
            )}
          >
            {/* Desktop grid */}
            <div className="hidden sm:grid sm:grid-cols-[28px_1fr_auto_130px_130px_44px] sm:items-start sm:gap-3">
              <div className="flex items-center justify-center pt-0.5">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                    isBest ? "bg-success/20 text-success" : "bg-muted text-muted-foreground",
                  )}
                >
                  {isBest ? "★" : rank}
                </span>
              </div>

              <div className="min-w-0">
                <Link
                  to={`/startups/${startup.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold hover:text-accent"
                >
                  {startup.name} <ArrowUpRight className="h-3 w-3" />
                </Link>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {startup.summary ?? startup.differentiation ?? "—"}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                <PriorityBadge value={startup.priority} />
                <StageBadge value={startup.stage} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-success/15">
                    <div
                      className="h-full rounded-full bg-success/60 transition-all"
                      style={{ width: `${oppPct}%` }}
                    />
                  </div>
                  <span className="w-4 text-right font-mono text-xs font-semibold text-success">{opp}</span>
                </div>
                {firstOpp && (
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">{firstOpp}</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-warning/15">
                    <div
                      className="h-full rounded-full bg-warning/60 transition-all"
                      style={{ width: `${riskPct}%` }}
                    />
                  </div>
                  <span className="w-4 text-right font-mono text-xs font-semibold text-warning">{risk}</span>
                </div>
                {firstRisk && (
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">{firstRisk}</p>
                )}
              </div>

              <div className="pt-0.5 text-center">
                <span
                  className={cn(
                    "font-mono text-sm font-semibold",
                    openFu > 0 ? "text-warning" : "text-muted-foreground",
                  )}
                >
                  {openFu}
                </span>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="sm:hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                      isBest ? "bg-success/20 text-success" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isBest ? "★" : rank}
                  </span>
                  <Link to={`/startups/${startup.id}`} className="text-sm font-semibold hover:text-accent">
                    {startup.name} <ArrowUpRight className="inline h-3 w-3" />
                  </Link>
                </div>
                <div className="flex shrink-0 gap-1">
                  <PriorityBadge value={startup.priority} />
                  <StageBadge value={startup.stage} />
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-success">Opp</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-success/15">
                      <div className="h-full rounded-full bg-success/60" style={{ width: `${oppPct}%` }} />
                    </div>
                    <span className="font-mono text-xs text-success">{opp}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-warning">Risk</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-warning/15">
                      <div className="h-full rounded-full bg-warning/60" style={{ width: `${riskPct}%` }} />
                    </div>
                    <span className="font-mono text-xs text-warning">{risk}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">F/U</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-muted-foreground">{openFu}</div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

// ─── Portfolio Positioning Scatter Chart (P1-2) ───────────────────────────────

const SVG_W = 460;
const SVG_H = 180;
const PAD_L = 42;
const PAD_R = 20;
const PAD_T = 14;
const PAD_B = 30;
const PLOT_W = SVG_W - PAD_L - PAD_R;
const PLOT_H = SVG_H - PAD_T - PAD_B;

const DOT_COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(168 70% 48%)",
  "hsl(270 60% 60%)",
  "hsl(200 70% 55%)",
];

function jitter(seed: number) {
  return (((seed * 9301 + 49297) % 233280) / 233280 - 0.5) * 7;
}

function PortfolioPositioningChart({ startups }: { startups: MarketStartupComparison[] }) {
  if (startups.length < 2) return null;

  const maxOpp = Math.max(1, ...startups.map((s) => (s.latestAnalysis?.opportunity_signals as string[] | null)?.length ?? 0));
  const maxRisk = Math.max(1, ...startups.map((s) => (s.latestAnalysis?.risk_signals as string[] | null)?.length ?? 0));

  return (
    <section>
      <SectionHeader icon={BarChart2} title="Portfolio positioning" count={startups.length} />
      <div className="mt-3 rounded-lg border border-border bg-surface p-4">
        <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          X — risk signals &nbsp;·&nbsp; Y — opportunity signals &nbsp;·&nbsp; top-left = ideal
        </p>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full overflow-visible"
          style={{ height: SVG_H }}
        >
          {/* Quadrant backgrounds */}
          <rect x={PAD_L} y={PAD_T} width={PLOT_W / 2} height={PLOT_H / 2} fill="hsl(var(--success) / 0.04)" />
          <rect x={PAD_L + PLOT_W / 2} y={PAD_T} width={PLOT_W / 2} height={PLOT_H / 2} fill="hsl(var(--warning) / 0.04)" />
          <rect x={PAD_L + PLOT_W / 2} y={PAD_T + PLOT_H / 2} width={PLOT_W / 2} height={PLOT_H / 2} fill="hsl(var(--danger) / 0.03)" />

          {/* Axes */}
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="hsl(var(--border))" strokeWidth="1" />
          <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} stroke="hsl(var(--border))" strokeWidth="1" />

          {/* Centre guides */}
          <line x1={PAD_L + PLOT_W / 2} y1={PAD_T} x2={PAD_L + PLOT_W / 2} y2={PAD_T + PLOT_H} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 3" />
          <line x1={PAD_L} y1={PAD_T + PLOT_H / 2} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H / 2} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 3" />

          {/* Quadrant labels */}
          <text x={PAD_L + 6} y={PAD_T + 12} fontSize="8" fill="hsl(var(--success))" opacity="0.8">Low risk · High opp</text>
          <text x={PAD_L + PLOT_W / 2 + 6} y={PAD_T + 12} fontSize="8" fill="hsl(var(--warning))" opacity="0.8">High risk · High opp</text>
          <text x={PAD_L + 6} y={PAD_T + PLOT_H - 5} fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.7">Low risk · Low opp</text>
          <text x={PAD_L + PLOT_W / 2 + 6} y={PAD_T + PLOT_H - 5} fontSize="8" fill="hsl(var(--danger))" opacity="0.7">High risk · Low opp</text>

          {/* Axis labels */}
          <text x={PAD_L + PLOT_W / 2} y={SVG_H - 6} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">Risk signals →</text>
          <text
            x={11}
            y={PAD_T + PLOT_H / 2}
            textAnchor="middle"
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
            transform={`rotate(-90, 11, ${PAD_T + PLOT_H / 2})`}
          >
            Opp →
          </text>

          {/* Startup dots */}
          {startups.map((startup, i) => {
            const opp = (startup.latestAnalysis?.opportunity_signals as string[] | null)?.length ?? 0;
            const risk = (startup.latestAnalysis?.risk_signals as string[] | null)?.length ?? 0;
            const cx = PAD_L + (risk / maxRisk) * PLOT_W + jitter(i);
            const cy = PAD_T + PLOT_H - (opp / maxOpp) * PLOT_H + jitter(i * 3 + 1);
            const color = DOT_COLORS[i % DOT_COLORS.length];

            return (
              <g key={startup.id}>
                <circle cx={cx} cy={cy} r={6} fill={color} opacity="0.85" />
                <text x={cx + 9} y={cy + 4} fontSize="9" fill="hsl(var(--foreground))" opacity="0.9" fontWeight="500">
                  {startup.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

// ─── Competitor Map ───────────────────────────────────────────────────────────

function CompetitorMap({
  mainThreat,
  competitors,
}: {
  mainThreat: MarketCompetitor | null;
  competitors: MarketCompetitor[];
}) {
  const otherCompetitors = competitors.filter((competitor) => competitor.name !== mainThreat?.name);

  return (
    <section>
      <SectionHeader icon={Swords} title="Competitor map" count={competitors.length} />
      <div className="mt-3 rounded-lg border border-border bg-surface p-4">
        {!mainThreat && <EmptyPanel>No competitors mapped yet.</EmptyPanel>}
        {mainThreat && (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-danger">
                  Main threat
                </span>
                <h4 className="text-sm font-semibold">{mainThreat.name}</h4>
              </div>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                {mainThreat.descriptions[0] ?? mainThreat.description ?? "Most repeated mapped competitor in this market."}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mainThreat.startupNames.map((name) => (
                <span key={name} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                  vs {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {otherCompetitors.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Other mapped competitors</div>
            <div className="flex flex-wrap gap-1.5">
              {otherCompetitors.map((competitor) => (
                <span key={competitor.id} className="rounded-full border border-border bg-surface-muted px-2 py-1 text-[11px] text-foreground/85">
                  {competitor.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Evidence Section ─────────────────────────────────────────────────────────

function EvidenceSection({
  startupAdvantages,
  startupWeaknesses,
  competitorAdvantages,
  openQuestions,
}: {
  startupAdvantages: string[];
  startupWeaknesses: string[];
  competitorAdvantages: string[];
  openQuestions: string[];
}) {
  return (
    <Accordion type="single" collapsible className="rounded-lg border border-border bg-surface px-4">
      <AccordionItem value="evidence" className="border-b-0">
        <AccordionTrigger className="py-3 text-sm hover:no-underline">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent" /> Evidence
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-3 lg:grid-cols-2">
            <EvidenceList icon={CheckCircle2} title="Startup advantages" items={startupAdvantages} tone="success" />
            <EvidenceList icon={AlertTriangle} title="Risks to validate" items={startupWeaknesses} tone="warning" />
            <EvidenceList icon={Swords} title="Competitor strengths" items={competitorAdvantages} tone="accent" />
            <EvidenceList icon={HelpCircle} title="Open questions" items={openQuestions} tone="muted" />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function EvidenceList({
  icon: Icon,
  title,
  items,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
  tone: keyof typeof toneClasses;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-md border", toneClasses[tone])}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {title}
      </div>
      <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-foreground/85">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}

function EmptyPanel({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface-muted px-4 py-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
