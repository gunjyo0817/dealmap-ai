import { cn } from "@/lib/utils";
import { Activity, Users, Sparkles, Briefcase, Telescope, Leaf, Flame } from "lucide-react";
import type { SocialBadge as SocialBadgeType } from "@/lib/social-sourcing-data";

const STYLES: Record<SocialBadgeType, { tone: string; Icon: any }> = {
  "Rising signal":            { tone: "bg-accent-soft text-accent border-accent/30",           Icon: Activity },
  "Warm intro available":     { tone: "bg-success/10 text-success border-success/30",          Icon: Users },
  "Angel activity":           { tone: "bg-violet/10 text-violet border-violet/30",             Icon: Sparkles },
  "Micro fund activity":      { tone: "bg-warning/10 text-warning border-warning/30",          Icon: Briefcase },
  "Scout referral":           { tone: "bg-teal/10 text-teal border-teal/30",                   Icon: Telescope },
  "Climate investor activity":{ tone: "bg-success/10 text-success border-success/30",          Icon: Leaf },
  "High signal":              { tone: "bg-danger/10 text-danger border-danger/30",             Icon: Flame },
};

export function SocialBadge({ value, size = "sm" }: { value: SocialBadgeType; size?: "xs" | "sm" }) {
  const s = STYLES[value];
  if (!s) return null;
  const Icon = s.Icon;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border font-medium",
      s.tone,
      size === "xs" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-[11px]",
    )}>
      <Icon className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {value}
    </span>
  );
}