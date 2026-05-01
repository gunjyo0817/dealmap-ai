import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StageBadge, StatusBadge } from "@/components/dealmap/PriorityBadge";
import { ArrowLeft, Sparkles, Plus, AlertTriangle, Lightbulb, MessageSquare, CheckCircle2, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { StartupSocialSection } from "@/components/dealmap/StartupSocialSection";
import { AIRecommendation } from "@/components/dealmap/AIRecommendation";

export default function StartupDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["startup-detail", id],
    enabled: !!id && !!user,
    queryFn: async () => {
      const [startupQ, notesQ, compsQ, fusQ, insQ, anasQ] = await Promise.all([
        supabase.from("startups").select("*, segment:market_segments(id, name, trend)").eq("id", id!).maybeSingle(),
        supabase.from("notes").select("*").eq("startup_id", id!).order("created_at", { ascending: false }),
        supabase.from("competitors").select("*").eq("startup_id", id!),
        supabase.from("follow_up_questions").select("*").eq("startup_id", id!).order("created_at", { ascending: false }),
        supabase.from("insights").select("*").eq("startup_id", id!).order("created_at", { ascending: false }),
        supabase.from("analyses").select("*").eq("startup_id", id!).order("created_at", { ascending: false }),
      ]);
      return {
        startup: startupQ.data,
        notes: notesQ.data ?? [],
        competitors: compsQ.data ?? [],
        followups: fusQ.data ?? [],
        insights: insQ.data ?? [],
        analyses: anasQ.data ?? [],
      };
    },
  });

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!data?.startup) return <div className="p-6 text-sm text-muted-foreground">Startup not found.</div>;
  const s = data.startup;
  const segment = s.segment as { id: string; name: string; trend: string | null } | null;
  const latestAnalysis = data.analyses[0];
  const topInsight = data.insights[0];
  const risks = (latestAnalysis?.risk_signals ?? []) as string[];
  const opportunities = (latestAnalysis?.opportunity_signals ?? []) as string[];
  const highPriorityQuestions = data.followups.filter((f) => f.priority === "High" && f.status === "open");
  const whyNow =
    topInsight?.content ??
    (segment?.trend
      ? `${segment.name} is marked ${segment.trend.toLowerCase()}, making timing and wedge validation the key diligence question.`
      : s.summary ?? "Review the latest call notes to validate timing.");
  const nextAction =
    topInsight?.recommended_action ??
    (s.priority === "High"
      ? "Schedule a partner review and validate the highest-risk assumption."
      : "Keep tracking and ask sharper diligence questions before partner review.");

  const addNote = async () => {
    if (!newNote.trim() || !user) return;
    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      startup_id: s.id,
      source: "manual",
      title: `Note · ${new Date().toLocaleDateString()}`,
      raw_text: newNote.trim(),
      status: "unprocessed",
    });
    if (error) return toast.error(error.message);
    await supabase.from("startups").update({ last_interaction_at: new Date().toISOString() }).eq("id", s.id);
    toast.success("Note added");
    setNewNote("");
    qc.invalidateQueries({ queryKey: ["startup-detail", id] });
    qc.invalidateQueries({ queryKey: ["startups"] });
    qc.invalidateQueries({ queryKey: ["notes"] });
  };

  const reanalyze = async () => {
    if (!user || !id) return;
    setAnalyzing(true);
    try {
      const { error } = await supabase.functions.invoke("reanalyze-startup", {
        body: { startupId: id },
      });
      if (error) throw error;
      toast.success("Re-analyzed", { description: "All transcripts synthesized into updated profile." });
      qc.invalidateQueries({ queryKey: ["startup-detail", id] });
      qc.invalidateQueries({ queryKey: ["startups"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Re-analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>

      {/* Top */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl font-normal tracking-tight">{s.name}</h1>
              <PriorityBadge value={s.priority} />
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{s.summary ?? "No summary yet."}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {segment && <Link to={`/segments`} className="inline-flex items-center rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">{segment.name}</Link>}
              <StageBadge value={s.stage} />
              <StatusBadge value={s.status} />
              <span className="text-xs text-muted-foreground">· {s.founder ?? "Unknown founder"}</span>
            </div>
          </div>
          <Button onClick={reanalyze} disabled={analyzing} className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> {analyzing ? "Analyzing…" : "Re-analyze"}
          </Button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Target customer</div>
            <div className="mt-1 text-sm">{s.target_customer ?? "—"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Differentiation</div>
            <div className="mt-1 text-sm">{s.differentiation ?? "—"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Last interaction</div>
            <div className="mt-1 text-sm">{s.last_interaction_at ? formatDistanceToNow(new Date(s.last_interaction_at), { addSuffix: true }) : "—"}</div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> Why now
          </div>
          <p className="mt-2 line-clamp-5 text-sm leading-relaxed text-foreground/85">{whyNow}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> What we like
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground/85">
            {(opportunities.length ? opportunities : [s.differentiation ?? "Differentiation needs review"]).slice(0, 3).map((item) => (
              <li key={item} className="leading-relaxed">· {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Risks to validate
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground/85">
            {(risks.length ? risks : highPriorityQuestions.map((q) => q.question)).slice(0, 3).map((item) => (
              <li key={item} className="leading-relaxed">· {item}</li>
            ))}
            {!risks.length && highPriorityQuestions.length === 0 && <li>· No major risks captured yet.</li>}
          </ul>
        </div>
        <div className="rounded-xl border border-accent/25 bg-accent-soft/35 p-4 shadow-card">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
            <ArrowRight className="h-3.5 w-3.5" /> Next action
          </div>
          <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{nextAction}</p>
          <div className="mt-3 text-xs text-muted-foreground">
            {highPriorityQuestions.length} high-priority questions open · {data.competitors.length} competitors mapped
          </div>
        </div>
      </section>

      <AIRecommendation startupName={s.name} />

      {/* Middle */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold"><Lightbulb className="h-4 w-4 text-accent" /> Insights</h3>
          <div className="space-y-2.5">
            {data.insights.length === 0 && <div className="text-xs text-muted-foreground">No insights yet — re-analyze to generate.</div>}
            {data.insights.map((i) => (
              <div key={i.id} className="rounded-lg border border-border bg-surface-muted px-3 py-2.5">
                <div className="mb-0.5 flex items-center justify-between">
                  <span className="text-sm font-medium">{i.title}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{i.type.replace("_", " ")}</span>
                </div>
                <div className="text-xs text-muted-foreground">{i.content}</div>
                {i.recommended_action && <div className="mt-1.5 text-xs text-accent">→ {i.recommended_action}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold"><AlertTriangle className="h-4 w-4 text-warning" /> Signals & competitors</h3>
          {data.analyses[0] && (
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-danger">Risks</div>
                <ul className="mt-1 space-y-1 text-xs">{data.analyses[0].risk_signals?.map((r: string) => <li key={r}>· {r}</li>)}</ul>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-success">Opportunities</div>
                <ul className="mt-1 space-y-1 text-xs">{data.analyses[0].opportunity_signals?.map((r: string) => <li key={r}>· {r}</li>)}</ul>
              </div>
            </div>
          )}
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Competitors</div>
          <div className="mt-2 space-y-2">
            {data.competitors.length === 0 && <div className="text-xs text-muted-foreground">No competitors mapped yet.</div>}
            {data.competitors.map((c) => (
              <div key={c.id} className="rounded-lg border border-border px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.relationship_type}</span>
                </div>
                {c.description && <div className="mt-0.5 text-xs text-muted-foreground">{c.description}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <h3 className="mb-3 text-sm font-semibold">Follow-up questions</h3>
        <div className="space-y-2">
          {data.followups.length === 0 && <div className="text-xs text-muted-foreground">No open follow-ups.</div>}
          {data.followups.map((f) => (
            <div key={f.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface-muted px-3 py-2">
              <span className="text-sm">{f.question}</span>
              <div className="flex shrink-0 items-center gap-2">
                <PriorityBadge value={f.priority} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <StartupSocialSection startupName={s.name} />

      {/* Bottom: notes timeline */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold"><MessageSquare className="h-4 w-4" /> Notes & timeline</h3>
        <div className="mb-4 space-y-2">
          <Textarea rows={3} value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a meeting note or update…" />
          <div className="flex justify-end">
            <Button size="sm" onClick={addNote} disabled={!newNote.trim()} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add note</Button>
          </div>
        </div>
        <div className="space-y-3">
          {data.notes.length === 0 && <div className="text-xs text-muted-foreground">No notes yet.</div>}
          {data.notes.map((n) => (
            <div key={n.id} className="border-l-2 border-accent/30 pl-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{n.title ?? "Note"}</span>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })} · {n.source}</span>
              </div>
              <div className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{n.raw_text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
