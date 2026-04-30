import { CheckCircle2, Database, FileText, NotebookPen } from "lucide-react";
import { INTEGRATIONS, type Integration } from "@/lib/dealmap-data";
import { Pill } from "./Badge";
import { cn } from "@/lib/utils";

const ICONS = {
  "HubSpot CRM": Database,
  "Granola Notes": FileText,
  "Manual Notes": NotebookPen,
} as const;

const accentBg: Record<Integration["accent"], string> = {
  accent: "bg-accent-soft text-accent",
  violet: "bg-violet-soft text-violet",
  teal: "bg-teal-soft text-teal",
};

export function IntegrationCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {INTEGRATIONS.map((it) => {
        const Icon = ICONS[it.name as keyof typeof ICONS] ?? Database;
        return (
          <div
            key={it.name}
            className="group rounded-xl border border-border bg-surface p-5 shadow-card transition hover:border-border-strong hover:shadow-card-md"
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  accentBg[it.accent],
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <Pill
                tone={it.status === "Connected" ? "success" : "neutral"}
                dot
              >
                {it.status === "Connected" ? "Demo connected" : "Ready"}
              </Pill>
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold text-foreground">
                {it.name}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {it.description}
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                {it.lastSync}
              </span>
              <span className="font-mono text-[11px] tabular-nums text-foreground/70">
                {it.records} records
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}