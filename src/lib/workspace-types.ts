import type { Tables } from "@/integrations/supabase/types";

export type StartupRow = Tables<"startups">;
export type SegmentRow = Tables<"market_segments">;
export type NoteRow = Tables<"notes">;
export type InsightRow = Tables<"insights">;
export type FollowUpRow = Tables<"follow_up_questions">;
export type CompetitorRow = Tables<"competitors">;
export type AnalysisRow = Tables<"analyses">;

export type StartupSegment = Pick<SegmentRow, "id" | "name" | "trend">;
export type SegmentStartup = Pick<StartupRow, "id" | "name" | "stage" | "priority" | "status">;
export type StartupReference = Pick<StartupRow, "id" | "name">;
export type InsightSegment = Pick<SegmentRow, "id" | "name">;

export type StartupWithSegment = StartupRow & {
  segment: StartupSegment | null;
};

export type SegmentWithStartups = SegmentRow & {
  startups: SegmentStartup[] | null;
};

export type NoteWithStartup = NoteRow & {
  startup: StartupReference | null;
};

export type InsightWithRelations = InsightRow & {
  startup: StartupReference | null;
  segment: InsightSegment | null;
};

export type FollowUpWithStartup = FollowUpRow & {
  startup: StartupReference | null;
};

export type MarketStartupComparison = StartupRow & {
  followups: FollowUpRow[];
  latestAnalysis: AnalysisRow | null;
};

export type MarketCompetitor = CompetitorRow & {
  startupNames: string[];
  descriptions: string[];
};

export type MarketSegmentSummary = {
  marketPosition: string;
  bestPositionedStartup: string;
  mainCompetitorThreat: string;
  keyDiligenceQuestion: string;
  recommendedNextAction: string;
  startupAdvantages: string[];
  startupWeaknesses: string[];
  competitorAdvantages: string[];
  openQuestions: string[];
};

export type MarketSegmentDetail = {
  segment: SegmentWithStartups;
  startups: MarketStartupComparison[];
  competitors: MarketCompetitor[];
  bestStartup: MarketStartupComparison | null;
  mainThreat: MarketCompetitor | null;
  summary: MarketSegmentSummary;
};
