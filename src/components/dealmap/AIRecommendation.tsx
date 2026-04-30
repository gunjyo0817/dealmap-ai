import { Sparkles, AlertTriangle, ArrowRight, Plus, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Rec = {
  recommendation: string;
  reasons: string[];
  key_risk: string;
  next_action: string;
  primary_action_label: string;
};

const RECS: Record<string, Rec> = {
  CarbonGrid: {
    recommendation: "Continue to partner review",
    reasons: [
      "High opportunity segment",
      "Strong climate investor signal",
      "Regulatory tailwind from CSRD",
      "Need to validate whether buyer pain is compliance or operational efficiency",
    ],
    key_risk: "Positioning overlaps with Watershed and Sweep.",
    next_action:
      "Schedule partner review and ask for paid pilot or first $100k contract evidence.",
    primary_action_label: "Move to partner review",
  },
  LexFlow: {
    recommendation: "Follow up, but validate differentiation",
    reasons: [
      "Legal AI is a crowded category",
      "EU SMB legal workflow is a possible wedge",
      "Need proof of paid pilot conversion",
    ],
    key_risk: "May be too close to Harvey, Spellbook, and other legal AI incumbents.",
    next_action:
      "Ask about paid pilots, proprietary legal data access, and workflow depth.",
    primary_action_label: "Move to follow-up",
  },
};

function defaultRec(name: string): Rec {
  return {
    recommendation: "Track and gather more signal",
    reasons: [
      "Limited interaction history so far",
      "Segment dynamics still being mapped",
      "Founder signal not yet strong enough for partner review",
    ],
    key_risk: "Insufficient differentiation evidence in current notes.",
    next_action: `Schedule a follow-up call with ${name} and capture deeper differentiation notes.`,
    primary_action_label: "Move to follow-up",
  };
}

export function AIRecommendation({ startupName }: { startupName: string }) {
  const rec = RECS[startupName] ?? defaultRec(startupName);
  return (
    <section className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent-soft/60 to-violet-soft/30 p-5 shadow-card">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-accent">AI recommendation</div>
            <h3 className="font-display text-xl font-normal tracking-tight">{rec.recommendation}</h3>
          </div>
        </div>
      </header>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Reasoning</div>
          <ul className="mt-1.5 space-y-1">
            {rec.reasons.map((r) => (
              <li key={r} className="flex gap-2 text-xs leading-relaxed text-foreground/85">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-warning">
              <AlertTriangle className="h-3 w-3" /> Key risk
            </div>
            <p className="mt-1 text-xs leading-relaxed text-foreground/85">{rec.key_risk}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Next action
            </div>
            <p className="mt-1 text-xs leading-relaxed text-foreground/90">{rec.next_action}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => toast.success(rec.primary_action_label, { description: startupName })}
        >
          <ArrowRight className="h-3.5 w-3.5" /> {rec.primary_action_label}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5"
          onClick={() => toast.success("Follow-up added", { description: startupName })}
        >
          <Plus className="h-3.5 w-3.5" /> Add follow-up
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-muted-foreground"
          onClick={() => toast(`Marked as pass`, { description: startupName })}
        >
          <X className="h-3.5 w-3.5" /> Mark as pass
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5"
          onClick={() => toast.success("Memo exported", { description: `${startupName}.pdf` })}
        >
          <Download className="h-3.5 w-3.5" /> Export memo
        </Button>
      </div>
    </section>
  );
}