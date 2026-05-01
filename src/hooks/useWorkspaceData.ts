import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type {
  AnalysisRow,
  FollowUpWithStartup,
  MarketCompetitor,
  MarketSegmentDetail,
  MarketStartupComparison,
  InsightWithRelations,
  NoteWithStartup,
  SegmentWithStartups,
  StartupRow,
  StartupWithSegment,
} from "@/lib/workspace-types";

export function useStartups() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["startups", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("startups")
        .select("*, segment:market_segments(id, name, trend)")
        .order("last_interaction_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as StartupWithSegment[];
    },
  });
}

export function useSegments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["segments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("market_segments")
        .select("*, startups(id, name, stage, priority, status)")
        .order("opportunity_score", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SegmentWithStartups[];
    },
  });
}

export function useNotes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*, startup:startups(id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NoteWithStartup[];
    },
  });
}

export function useInsights() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["insights", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insights")
        .select("*, startup:startups(id, name), segment:market_segments(id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InsightWithRelations[];
    },
  });
}

export function useFollowUps() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["followups", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follow_up_questions")
        .select("*, startup:startups(id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FollowUpWithStartup[];
    },
  });
}

export function useMarketSegmentDetail(segmentId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["market-segment-detail", segmentId, user?.id],
    enabled: !!user && !!segmentId,
    queryFn: async () => {
      const [segmentQ, startupsQ, followupsQ, analysesQ, competitorsQ] = await Promise.all([
        supabase
          .from("market_segments")
          .select("*, startups(id, name, stage, priority, status)")
          .eq("id", segmentId!)
          .maybeSingle(),
        supabase.from("startups").select("*").eq("segment_id", segmentId!),
        supabase.from("follow_up_questions").select("*"),
        supabase.from("analyses").select("*"),
        supabase.from("competitors").select("*"),
      ]);

      if (segmentQ.error) throw segmentQ.error;
      if (startupsQ.error) throw startupsQ.error;
      if (followupsQ.error) throw followupsQ.error;
      if (analysesQ.error) throw analysesQ.error;
      if (competitorsQ.error) throw competitorsQ.error;
      if (!segmentQ.data) throw new Error("Segment not found");

      const startups = (startupsQ.data ?? []) as StartupRow[];
      const followups = followupsQ.data ?? [];
      const analyses = (analysesQ.data ?? []) as AnalysisRow[];
      const competitors = competitorsQ.data ?? [];

      const comparison: MarketStartupComparison[] = startups.map((startup) => {
        const startupFollowups = followups.filter((f) => f.startup_id === startup.id);
        const startupAnalyses = analyses
          .filter((a) => a.startup_id === startup.id)
          .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
        return {
          ...startup,
          followups: startupFollowups,
          latestAnalysis: startupAnalyses[0] ?? null,
        };
      });

      const competitorMap = new Map<string, MarketCompetitor>();
      for (const competitor of competitors) {
        if (!competitor.startup_id || !comparison.some((s) => s.id === competitor.startup_id)) continue;
        const startupName = comparison.find((s) => s.id === competitor.startup_id)?.name ?? "Unknown";
        const key = competitor.name.trim().toLowerCase();
        const existing = competitorMap.get(key);
        if (existing) {
          if (!existing.startupNames.includes(startupName)) existing.startupNames.push(startupName);
          if (competitor.description && !existing.descriptions.includes(competitor.description)) {
            existing.descriptions.push(competitor.description);
          }
        } else {
          competitorMap.set(key, {
            ...competitor,
            startupNames: [startupName],
            descriptions: competitor.description ? [competitor.description] : [],
          });
        }
      }
      const competitorList = Array.from(competitorMap.values());

      const score = (startup: MarketStartupComparison) => {
        const p = startup.priority === "High" ? 30 : startup.priority === "Medium" ? 15 : 0;
        const opp = (startup.latestAnalysis?.opportunity_signals as string[] | null)?.length ?? 0;
        const risk = (startup.latestAnalysis?.risk_signals as string[] | null)?.length ?? 0;
        const highFu = startup.followups.filter((f) => f.priority === "High" && f.status === "open").length;
        const diff = startup.differentiation ? 10 : 0;
        return p + opp * 8 + diff - risk * 4 - highFu * 2;
      };

      const bestStartup = [...comparison].sort((a, b) => score(b) - score(a))[0] ?? null;
      const mainThreat = [...competitorList].sort((a, b) => b.startupNames.length - a.startupNames.length)[0] ?? null;

      const startupAdvantages = comparison
        .flatMap((s) => ((s.latestAnalysis?.opportunity_signals as string[] | null) ?? []).slice(0, 2))
        .filter(Boolean)
        .slice(0, 4);
      const startupWeaknesses = comparison
        .flatMap((s) => ((s.latestAnalysis?.risk_signals as string[] | null) ?? []).slice(0, 2))
        .filter(Boolean)
        .slice(0, 4);
      const competitorAdvantages = competitorList
        .flatMap((c) => c.descriptions.slice(0, 1))
        .filter(Boolean)
        .slice(0, 4);
      const openQuestions = comparison
        .flatMap((s) => s.followups.filter((f) => f.status === "open").map((f) => f.question))
        .slice(0, 4);

      const summary = {
        marketPosition:
          segmentQ.data.description ??
          `${segmentQ.data.name} shows ${segmentQ.data.trend ?? "mixed"} momentum with ${comparison.length} mapped startups.`,
        bestPositionedStartup: bestStartup?.name ?? "No clear winner yet",
        mainCompetitorThreat: mainThreat?.name ?? "No dominant external threat mapped",
        keyDiligenceQuestion: openQuestions[0] ?? "What is the most defensible wedge in this segment?",
        recommendedNextAction: bestStartup
          ? `Prioritize follow-up with ${bestStartup.name} and validate the highest-risk assumption.`
          : "Collect more transcripts in this segment before prioritizing.",
        startupAdvantages,
        startupWeaknesses,
        competitorAdvantages,
        openQuestions,
      };

      return {
        segment: segmentQ.data as SegmentWithStartups,
        startups: comparison,
        competitors: competitorList,
        bestStartup,
        mainThreat,
        summary,
      } satisfies MarketSegmentDetail;
    },
  });
}
