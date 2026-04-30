import { useStartups, useSegments, useFollowUps, useInsights, useNotes } from "@/hooks/useWorkspaceData";
import { StatCard } from "@/components/dealmap/StatCard";
import { Building2, Layers, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PriorityBadge, StageBadge, TrendBadge } from "@/components/dealmap/PriorityBadge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatDistanceToNow } from "date-fns";

const STAGE_ORDER = ["Pre-seed", "Seed", "Series A", "Series B", "Later"];

export default function Dashboard() {
  const { data: startups = [] } = useStartups();
  const { data: segments = [] } = useSegments();
  const { data: followups = [] } = useFollowUps();
  const { data: insights = [] } = useInsights();
  const { data: notes = [] } = useNotes();

  const highFollowups = followups.filter((f) => f.priority === "High" && f.status === "open");
  const crowded = segments.filter((s) => (s.crowdedness_score ?? 0) >= 70);

  const stageData = STAGE_ORDER.map((s) => ({ stage: s, count: startups.filter((x) => x.stage === s).length }));
  const segData = segments.map((s) => ({ name: s.name, value: (s.startups as any[])?.length ?? 0 }));
  const PIE_COLORS = ["hsl(var(--accent))", "hsl(var(--violet))", "hsl(var(--teal))", "hsl(var(--warning))", "hsl(var(--success))"];

  const priorityData = [
    { label: "High", count: startups.filter((s) => s.priority === "High").length, color: "hsl(var(--danger))" },
    { label: "Medium", count: startups.filter((s) => s.priority === "Medium").length, color: "hsl(var(--warning))" },
    { label: "Low", count: startups.filter((s) => s.priority === "Low").length, color: "hsl(var(--muted-foreground))" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-normal tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your deal flow intelligence.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Startups" value={startups.length} hint="across your workspace" icon={<Building2 className="h-3.5 w-3.5" />} accent="accent" />
        <StatCard label="Segments" value={segments.length} hint={`${crowded.length} crowded`} icon={<Layers className="h-3.5 w-3.5" />} accent="violet" />
        <StatCard label="High follow-ups" value={highFollowups.length} hint="open & high priority" icon={<AlertTriangle className="h-3.5 w-3.5" />} accent="warning" />
        <StatCard label="AI insights" value={insights.length} hint="generated this period" icon={<Sparkles className="h-3.5 w-3.5" />} accent="teal" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-card lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Deal stage pipeline</h3>
            <span className="text-xs text-muted-foreground">{startups.length} total</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageData}>
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "hsl(var(--accent-soft))" }} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold">Segment distribution</h3>
          {segData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={segData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {segData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">No data</div>}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold">Follow-up priority</h3>
          <div className="space-y-2.5">
            {priorityData.map((p) => {
              const total = priorityData.reduce((a, x) => a + x.count, 0) || 1;
              const pct = (p.count / total) * 100;
              return (
                <div key={p.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{p.label}</span><span className="text-muted-foreground">{p.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-card lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recently added startups</h3>
            <Link to="/startups" className="text-xs text-accent hover:underline inline-flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="divide-y divide-border">
            {startups.slice(0, 5).map((s) => (
              <Link key={s.id} to={`/startups/${s.id}`} className="flex items-center justify-between py-2.5 hover:bg-surface-muted -mx-2 px-2 rounded">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{s.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{(s.segment as any)?.name ?? "Unsegmented"} · {s.founder ?? "—"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StageBadge value={s.stage} />
                  <PriorityBadge value={s.priority} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Top market opportunities</h3>
            <Link to="/segments" className="text-xs text-accent hover:underline">Segments</Link>
          </div>
          <div className="space-y-2.5">
            {[...segments].sort((a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0)).slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-muted px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">Opportunity {s.opportunity_score} · Crowdedness {s.crowdedness_score}</div>
                </div>
                <TrendBadge value={s.trend} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent AI insights</h3>
            <Link to="/insights" className="text-xs text-accent hover:underline">All insights</Link>
          </div>
          <div className="space-y-2.5">
            {insights.slice(0, 4).map((i) => (
              <div key={i.id} className="rounded-lg border border-border bg-surface-muted px-3 py-2.5">
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{i.title}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{i.type.replace("_", " ")}</span>
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">{i.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent notes analyzed</h3>
          <Link to="/notes" className="text-xs text-accent hover:underline">All notes</Link>
        </div>
        <div className="divide-y divide-border">
          {notes.slice(0, 5).map((n) => (
            <div key={n.id} className="flex items-center justify-between py-2.5">
              <div className="min-w-0">
                <div className="truncate text-sm">{n.title ?? "Untitled note"}</div>
                <div className="truncate text-xs text-muted-foreground">{(n.startup as any)?.name ?? "Unassigned"} · {n.source}</div>
              </div>
              <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</div>
            </div>
          ))}
          {notes.length === 0 && <div className="py-6 text-center text-xs text-muted-foreground">No notes yet — import or paste to start building memory.</div>}
        </div>
      </div>
    </div>
  );
}