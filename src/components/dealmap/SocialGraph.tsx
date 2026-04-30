import { useState } from "react";
import { GRAPH_NODES, GRAPH_EDGES, NODE_STYLE } from "@/lib/social-sourcing-data";
import { cn } from "@/lib/utils";

export function SocialGraph({ height = 460 }: { height?: number }) {
  const [hover, setHover] = useState<string | null>(null);

  const nodeMap = Object.fromEntries(GRAPH_NODES.map((n) => [n.id, n]));

  return (
    <div className="rounded-xl border border-border bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Social graph</div>
          <div className="text-[11px] text-muted-foreground">Demo social graph · CRM-derived relationship signals</div>
        </div>
        <Legend />
      </div>
      <div className="relative bg-grid" style={{ height }}>
        <svg className="absolute inset-0 h-full w-full">
          {GRAPH_EDGES.map((e, i) => {
            const a = nodeMap[e.from];
            const b = nodeMap[e.to];
            if (!a || !b) return null;
            const active = hover && (hover === e.from || hover === e.to);
            const stroke = e.strength === "High"
              ? "hsl(var(--accent))"
              : e.strength === "Medium"
              ? "hsl(var(--violet))"
              : "hsl(var(--border-strong))";
            return (
              <line
                key={i}
                x1={`${a.x}%`}
                y1={`${a.y}%`}
                x2={`${b.x}%`}
                y2={`${b.y}%`}
                stroke={stroke}
                strokeOpacity={active ? 0.95 : 0.45}
                strokeWidth={active ? 2 : 1.25}
                strokeDasharray={e.strength === "Medium" ? "4 3" : undefined}
              />
            );
          })}
        </svg>

        {GRAPH_NODES.map((n) => {
          const style = NODE_STYLE[n.type] ?? NODE_STYLE.founder;
          const active = hover === n.id;
          return (
            <div
              key={n.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
            >
              <div className={cn(
                "flex items-center gap-1.5 rounded-full border bg-surface px-2 py-1 shadow-card transition",
                active ? "border-accent ring-2 ring-accent/30" : "border-border-strong",
              )}>
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white"
                  style={{ background: style.color }}
                >
                  {style.icon}
                </span>
                <span className="whitespace-nowrap text-[10px] font-medium text-foreground">{n.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  const items: { label: string; type: keyof typeof NODE_STYLE }[] = [
    { label: "VC firm", type: "vc_firm" },
    { label: "Portfolio founder", type: "portfolio_founder" },
    { label: "Scout", type: "scout" },
    { label: "Angel", type: "angel" },
    { label: "Micro fund", type: "micro_fund" },
    { label: "Accelerator", type: "accelerator" },
    { label: "Founder", type: "founder" },
    { label: "Startup", type: "startup" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((i) => {
        const s = NODE_STYLE[i.type];
        return (
          <span key={i.type} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="flex h-3 w-3 items-center justify-center rounded-full text-[8px] text-white" style={{ background: s.color }}>{s.icon}</span>
            {i.label}
          </span>
        );
      })}
    </div>
  );
}