import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, hint, icon, accent }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode; accent?: "accent" | "violet" | "teal" | "warning" }) {
  const accentClass = {
    accent: "bg-accent-soft text-accent",
    violet: "bg-violet-soft text-violet",
    teal: "bg-teal-soft text-teal",
    warning: "bg-warning-soft text-warning",
  }[accent ?? "accent"];
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        {icon && <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", accentClass)}>{icon}</div>}
      </div>
      <div className="mt-2 font-display text-3xl font-normal tracking-tight text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}