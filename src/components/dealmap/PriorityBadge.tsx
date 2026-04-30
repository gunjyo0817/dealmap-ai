import { cn } from "@/lib/utils";

export function PriorityBadge({ value }: { value: "High" | "Medium" | "Low" | string | null }) {
  const cls = value === "High"
    ? "bg-danger-soft text-danger"
    : value === "Medium"
    ? "bg-warning-soft text-warning"
    : "bg-muted text-muted-foreground";
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", cls)}>{value ?? "—"}</span>;
}

export function StatusBadge({ value }: { value: string | null }) {
  return <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{value ?? "—"}</span>;
}

export function StageBadge({ value }: { value: string | null }) {
  return <span className="inline-flex items-center rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">{value ?? "—"}</span>;
}

export function TrendBadge({ value }: { value: string | null }) {
  const map: Record<string, string> = {
    Hot: "bg-danger-soft text-danger",
    Crowded: "bg-warning-soft text-warning",
    Emerging: "bg-teal-soft text-teal",
    "White-space": "bg-success-soft text-success",
  };
  const cls = map[value ?? ""] ?? "bg-muted text-muted-foreground";
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", cls)}>{value ?? "—"}</span>;
}