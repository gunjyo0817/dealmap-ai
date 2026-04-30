import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStartups, useSegments } from "@/hooks/useWorkspaceData";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge, StageBadge, StatusBadge } from "@/components/dealmap/PriorityBadge";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";

export default function StartupsPage() {
  const { data: startups = [], isLoading } = useStartups();
  const { data: segments = [] } = useSegments();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [seg, setSeg] = useState("all");
  const [stage, setStage] = useState("all");
  const [priority, setPriority] = useState("all");

  useEffect(() => { setQ(params.get("q") ?? ""); }, [params]);

  const filtered = useMemo(() => startups.filter((s) => {
    if (q && !`${s.name} ${s.founder ?? ""} ${s.summary ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (seg !== "all" && s.segment_id !== seg) return false;
    if (stage !== "all" && s.stage !== stage) return false;
    if (priority !== "all" && s.priority !== priority) return false;
    return true;
  }), [startups, q, seg, stage, priority]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-normal tracking-tight">Startups</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {startups.length} in your workspace.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-9 pl-9 bg-surface" />
        </div>
        <Select value={seg} onValueChange={setSeg}>
          <SelectTrigger className="h-9 w-44 bg-surface"><SelectValue placeholder="Segment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All segments</SelectItem>
            {segments.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="h-9 w-36 bg-surface"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {["Pre-seed", "Seed", "Series A", "Series B", "Later"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="h-9 w-36 bg-surface"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {["High", "Medium", "Low"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Startup</th>
              <th className="px-4 py-2.5 text-left font-medium">Segment</th>
              <th className="px-4 py-2.5 text-left font-medium">Stage</th>
              <th className="px-4 py-2.5 text-left font-medium">Founder</th>
              <th className="px-4 py-2.5 text-left font-medium">Customer</th>
              <th className="px-4 py-2.5 text-left font-medium">Priority</th>
              <th className="px-4 py-2.5 text-left font-medium">Status</th>
              <th className="px-4 py-2.5 text-left font-medium">Last interaction</th>
              <th className="px-4 py-2.5 text-left font-medium">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={9} className="px-4 py-10 text-center text-xs text-muted-foreground">Loading…</td></tr>}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-xs text-muted-foreground">No startups match these filters.</td></tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-surface-muted">
                <td className="px-4 py-3">
                  <Link to={`/startups/${s.id}`} className="font-medium text-foreground hover:text-accent">{s.name}</Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{(s.segment as any)?.name ?? "—"}</td>
                <td className="px-4 py-3"><StageBadge value={s.stage} /></td>
                <td className="px-4 py-3 text-muted-foreground">{s.founder ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-[180px]">{s.target_customer ?? "—"}</td>
                <td className="px-4 py-3"><PriorityBadge value={s.priority} /></td>
                <td className="px-4 py-3"><StatusBadge value={s.status} /></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{s.last_interaction_at ? formatDistanceToNow(new Date(s.last_interaction_at), { addSuffix: true }) : "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{s.source ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}