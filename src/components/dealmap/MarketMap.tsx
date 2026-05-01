import {
  Lightbulb,
  TrendingUp,
  Layers,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Building2,
  Brain,
} from "lucide-react";
import {
  INSIGHTS,
  MARKET_SEGMENTS,
  SIMILAR_MEMORY,
  STARTUP_PROFILES,
  type MarketSegment,
  type StartupProfile,
} from "@/lib/dealmap-data";
import { Pill } from "./Badge";
import { cn } from "@/lib/utils";

function trendTone(t: MarketSegment["trend"]) {
  switch (t) {
    case "Hot":
      return "danger" as const;
    case "Crowded":
      return "warning" as const;
    case "Emerging":
      return "teal" as const;
    case "White-space":
      return "success" as const;
  }
}

const accentBar: Record<MarketSegment["accent"], string> = {
  accent: "bg-accent",
  violet: "bg-violet",
  teal: "bg-teal",
  warning: "bg-warning",
};

function riskTone(r: StartupProfile["risk"]) {
  return r === "High" ? "danger" : r === "Moderate" ? "warning" : "success";
}
function priorityTone(p: StartupProfile["followUp"]) {
  return p === "High" ? "danger" : p === "Medium" ? "warning" : "neutral";
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  count,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {typeof count === "number" && (
        <span className="font-mono text-[11px] text-muted-foreground">
          {count} {count === 1 ? "item" : "items"}
        </span>
      )}
    </div>
  );
}

export function MarketMap() {
  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Segments */}
      <section>
        <SectionHeader
          icon={Layers}
          title="Market segments"
          description="Auto-clustered from your CRM and notes"
          count={MARKET_SEGMENTS.length}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {MARKET_SEGMENTS.map((s) => (
            <div
              key={s.name}
              className="relative overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-card transition hover:border-border-strong hover:shadow-card-md"
            >
              <div
                className={cn("absolute inset-x-0 top-0 h-1", accentBar[s.accent])}
              />
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">
                  {s.name}
                </h4>
                <Pill tone={trendTone(s.trend)} dot>
                  {s.trend}
                </Pill>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {s.summary}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s.startups.length} startups
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.startups.map((name) => (
                  <span
                    key={name}
                    className="rounded-md border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-foreground/80"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Profiles */}
      <section>
        <SectionHeader
          icon={Building2}
          title="Startup profiles"
          description="Structured deep-dives generated from notes"
          count={STARTUP_PROFILES.length}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {STARTUP_PROFILES.map((p) => (
            <article
              key={p.name}
              className="rounded-xl border border-border bg-surface p-5 shadow-card transition hover:border-border-strong hover:shadow-card-md"
            >
              <header className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-xl font-normal tracking-tight text-foreground">
                      {p.name}
                    </h4>
                    <Pill>{p.stage}</Pill>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {p.segment} · {p.customer}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Pill tone={riskTone(p.risk)} dot>
                    {p.risk} risk
                  </Pill>
                  <Pill tone={priorityTone(p.followUp)}>
                    Follow-up: {p.followUp}
                  </Pill>
                </div>
              </header>

              <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                {p.summary}
              </p>

              <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Differentiation
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-foreground/80">
                    {p.differentiation}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Similar companies
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.similar.map((c) => (
                      <span
                        key={c}
                        className="rounded-md border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-foreground/80"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Insights */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-card lg:col-span-2">
          <SectionHeader
            icon={Lightbulb}
            title="Market insight panel"
            description="What the data is telling you right now"
          />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2 rounded-lg border border-accent/20 bg-accent-soft/60 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                <TrendingUp className="h-3.5 w-3.5" />
                Market trend
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                {INSIGHTS.trend}
              </p>
            </div>

            <InsightList
              icon={Layers}
              title="Crowded segments"
              tone="warning"
              items={INSIGHTS.crowded}
            />
            <InsightList
              icon={Sparkles}
              title="White-space opportunities"
              tone="success"
              items={INSIGHTS.whitespace}
            />
            <InsightList
              icon={AlertTriangle}
              title="Missing competitors"
              tone="violet"
              items={INSIGHTS.missingCompetitors}
              className="md:col-span-2"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <SectionHeader
            icon={HelpCircle}
            title="Recommended follow-ups"
            description="Sharper questions for your next call"
            count={INSIGHTS.followUps.length}
          />
          <ol className="space-y-3">
            {INSIGHTS.followUps.map((q, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-lg border border-border bg-surface-muted p-3"
              >
                <span className="font-mono text-[11px] font-semibold text-accent">
                  Q{i + 1}
                </span>
                <span className="text-xs leading-relaxed text-foreground/90">
                  {q}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Similar memory */}
      <section>
        <SectionHeader
          icon={Brain}
          title="Similar startup memory"
          description="Pattern-matched against your historical pipeline"
          count={SIMILAR_MEMORY.length}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {SIMILAR_MEMORY.map((m) => (
            <div
              key={m.startup}
              className="rounded-xl border border-border bg-surface p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">
                  {m.startup}
                </div>
                <div className="flex gap-1.5">
                  {m.references.map((r) => (
                    <span
                      key={r}
                      className="rounded-md border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-foreground/70"
                    >
                      ↔ {r}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-3 font-['Instrument_Serif',serif] text-lg italic leading-snug text-foreground/85">
                "{m.insight}"
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function InsightList({
  icon: Icon,
  title,
  items,
  tone,
  className,
}: {
  icon: typeof Sparkles;
  title: string;
  items: string[];
  tone: "warning" | "success" | "violet";
  className?: string;
}) {
  const toneText = {
    warning: "text-warning",
    success: "text-success",
    violet: "text-violet",
  }[tone];

  return (
    <div className={cn("rounded-lg border border-border bg-surface-muted p-4", className)}>
      <div className={cn("flex items-center gap-2 text-xs font-semibold", toneText)}>
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map((it) => (
          <li
            key={it}
            className="flex gap-2 text-xs leading-relaxed text-foreground/85"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}