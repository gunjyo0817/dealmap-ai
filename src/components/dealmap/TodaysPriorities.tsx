import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, Layers, ArrowRight, Plus, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStartups, useSegments } from "@/hooks/useWorkspaceData";
import { cn } from "@/lib/utils";

type PriorityItem = {
  key: string;
  kind: "startup" | "segment";
  title: string;
  matchName: string;
  recommended: string;
  reason: string;
  accent: "accent" | "violet" | "warning";
  primaryLabel: string;
  primaryFallbackPath: string;
  secondaryLabel: string;
};

const ITEMS: PriorityItem[] = [
  {
    key: "carbongrid",
    kind: "startup",
    title: "CarbonGrid",
    matchName: "CarbonGrid",
    recommended: "Schedule partner review",
    reason:
      "High opportunity segment, strong climate investor signal, and already in partner review stage.",
    accent: "accent",
    primaryLabel: "Open startup",
    primaryFallbackPath: "/startups",
    secondaryLabel: "Add follow-up",
  },
  {
    key: "lexflow",
    kind: "startup",
    title: "LexFlow",
    matchName: "LexFlow",
    recommended: "Validate paid pilot conversion",
    reason:
      "Legal AI is crowded, but LexFlow's EU SMB wedge may still be differentiated.",
    accent: "violet",
    primaryLabel: "Open startup",
    primaryFallbackPath: "/startups",
    secondaryLabel: "Add follow-up",
  },
  {
    key: "sales-automation",
    kind: "segment",
    title: "Sales Automation",
    matchName: "Sales Automation",
    recommended: "Review crowdedness and defensibility",
    reason:
      "High crowdedness and weak differentiation across the current pipeline.",
    accent: "warning",
    primaryLabel: "Open segment",
    primaryFallbackPath: "/segments",
    secondaryLabel: "Add research note",
  },
];

const accentBar: Record<PriorityItem["accent"], string> = {
  accent: "bg-accent",
  violet: "bg-violet",
  warning: "bg-warning",
};

export function TodaysPriorities() {
  const { data: startups = [] } = useStartups();
  const { data: segments = [] } = useSegments();
  const [done, setDone] = useState<Record<string, boolean>>({});

  const resolvePath = (item: PriorityItem) => {
    if (item.kind === "startup") {
      const s = startups.find((x) => x.name === item.matchName);
      return s ? `/startups/${s.id}` : item.primaryFallbackPath;
    }
    // segments page lists all; deep linking not available, fall back
    return item.primaryFallbackPath;
  };

  return (
    <section>
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h2 className="font-display text-xl font-normal tracking-tight">Today's priorities</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          The most important deals and segments to act on today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ITEMS.map((item) => {
          const isDone = !!done[item.key];
          const Icon = item.kind === "startup" ? Building2 : Layers;
          return (
            <article
              key={item.key}
              className={cn(
                "relative overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-card transition",
                isDone && "opacity-60",
              )}
            >
              <div className={cn("absolute inset-x-0 top-0 h-1", accentBar[item.accent])} />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Icon className="h-3 w-3" />
                  {item.kind === "startup" ? "Startup" : "Segment"}
                </div>
                {isDone && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                    <Check className="h-3 w-3" /> Done
                  </span>
                )}
              </div>
              <h3 className="mt-1 text-base font-semibold">{item.title}</h3>
              <div className="mt-2 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Recommended action
                </span>
                <div className="mt-0.5 font-medium text-foreground">{item.recommended}</div>
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {item.reason}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Link to={resolvePath(item)}>
                  <Button size="sm" variant="default" className="h-7 gap-1 px-2.5 text-xs">
                    {item.primaryLabel} <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 px-2.5 text-xs"
                  onClick={() => toast.success(`${item.secondaryLabel} added`, { description: item.title })}
                >
                  <Plus className="h-3 w-3" /> {item.secondaryLabel}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2.5 text-xs text-muted-foreground"
                  onClick={() => {
                    setDone((d) => ({ ...d, [item.key]: !d[item.key] }));
                    toast(isDone ? "Marked active" : "Marked done", { description: item.title });
                  }}
                >
                  <Check className="h-3 w-3" /> {isDone ? "Undo" : "Mark done"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
