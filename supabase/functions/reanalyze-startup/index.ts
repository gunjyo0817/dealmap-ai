import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Priority = "High" | "Medium" | "Low";
type Stage = "Pre-seed" | "Seed" | "Series A" | "Series B" | "Later";
type InsightType = "trend" | "crowded_market" | "whitespace" | "similar_alert" | "follow_up" | "missing_competitor";

type SegmentOption = { id: string; name: string };

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

type LlmAnalysis = {
  startup: {
    name: string;
    founder: string;
    stage: string;
    priority: string;
    segmentName: string;
    targetCustomer: string;
    summary: string;
    differentiation: string;
  };
  analysis: { summary: string; riskSignals: string[]; opportunitySignals: string[] };
  followups: Array<{ question: string; priority: string }>;
  competitors: Array<{ name: string; relationshipType: string; description: string }>;
  insight: { type: string; title: string; content: string; confidenceScore: number; recommendedAction: string };
};

type NormalizedAnalysis = {
  provider: "gemini" | "heuristic";
  model: string;
  segmentId: string | null;
  startup: { name: string; founder: string | null; stage: Stage; priority: Priority; targetCustomer: string; summary: string; differentiation: string };
  analysis: { summary: string; riskSignals: string[]; opportunitySignals: string[] };
  followups: Array<{ question: string; priority: Priority }>;
  competitors: Array<{ name: string; relationshipType: string; description: string }>;
  insight: { type: InsightType; title: string; content: string; confidenceScore: number; recommendedAction: string };
};

const STAGES: readonly Stage[] = ["Pre-seed", "Seed", "Series A", "Series B", "Later"];
const PRIORITIES: readonly Priority[] = ["High", "Medium", "Low"];
const INSIGHT_TYPES: readonly InsightType[] = ["trend", "crowded_market", "whitespace", "similar_alert", "follow_up", "missing_competitor"];
const STAGE_HINTS: Array<[RegExp, Stage]> = [
  [/series\s*a/i, "Series A"],
  [/series\s*b/i, "Series B"],
  [/seed/i, "Seed"],
  [/pre-?seed|angel/i, "Pre-seed"],
];

const responseSchema = {
  type: "OBJECT",
  properties: {
    startup: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING" },
        founder: { type: "STRING" },
        stage: { type: "STRING", enum: STAGES },
        priority: { type: "STRING", enum: PRIORITIES },
        segmentName: { type: "STRING" },
        targetCustomer: { type: "STRING" },
        summary: { type: "STRING" },
        differentiation: { type: "STRING" },
      },
      required: ["name", "founder", "stage", "priority", "segmentName", "targetCustomer", "summary", "differentiation"],
      propertyOrdering: ["name", "founder", "stage", "priority", "segmentName", "targetCustomer", "summary", "differentiation"],
    },
    analysis: {
      type: "OBJECT",
      properties: {
        summary: { type: "STRING" },
        riskSignals: { type: "ARRAY", items: { type: "STRING" } },
        opportunitySignals: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["summary", "riskSignals", "opportunitySignals"],
      propertyOrdering: ["summary", "riskSignals", "opportunitySignals"],
    },
    followups: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { question: { type: "STRING" }, priority: { type: "STRING", enum: PRIORITIES } },
        required: ["question", "priority"],
        propertyOrdering: ["question", "priority"],
      },
    },
    competitors: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { name: { type: "STRING" }, relationshipType: { type: "STRING" }, description: { type: "STRING" } },
        required: ["name", "relationshipType", "description"],
        propertyOrdering: ["name", "relationshipType", "description"],
      },
    },
    insight: {
      type: "OBJECT",
      properties: {
        type: { type: "STRING", enum: INSIGHT_TYPES },
        title: { type: "STRING" },
        content: { type: "STRING" },
        confidenceScore: { type: "INTEGER" },
        recommendedAction: { type: "STRING" },
      },
      required: ["type", "title", "content", "confidenceScore", "recommendedAction"],
      propertyOrdering: ["type", "title", "content", "confidenceScore", "recommendedAction"],
    },
  },
  required: ["startup", "analysis", "followups", "competitors", "insight"],
  propertyOrdering: ["startup", "analysis", "followups", "competitors", "insight"],
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function asText(value: unknown, fallback: string, max = 400) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return (trimmed || fallback).slice(0, max);
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function guessName(text: string) {
  const company = text.match(/^Company:\s*(.+)$/im)?.[1]?.trim();
  if (company) return company.slice(0, 120);
  const match = text.match(/\b([A-Z][a-zA-Z0-9]{2,}(?:[A-Z][a-zA-Z0-9]+)?)\b/);
  return match?.[1] ?? "New Startup";
}

function guessStage(text: string): Stage {
  for (const [pattern, stage] of STAGE_HINTS) if (pattern.test(text)) return stage;
  return "Pre-seed";
}

function guessPriority(text: string): Priority {
  if (/crowded|saturat|pass/i.test(text)) return "Low";
  if (/strong|exciting|tailwind|founder.?market fit|unique/i.test(text)) return "High";
  return "Medium";
}

function guessSegment(text: string, segments: SegmentOption[]) {
  const map: Record<string, RegExp> = {
    "Legal AI": /legal|contract|law/i,
    "Sales Automation": /sales|outbound|sdr|crm|gong/i,
    "Climate Tech": /climate|carbon|energy|grid|emission/i,
    DevTools: /devtool|developer|engineering|observab|platform/i,
    "Vertical Healthcare AI": /clinic|health|medical|pharma|patient/i,
  };
  for (const segment of segments) {
    const pattern = map[segment.name];
    if (pattern?.test(text)) return segment.id;
  }
  return null;
}

function normalizeStage(value: unknown, rawText: string): Stage {
  if (typeof value === "string") {
    const stage = STAGES.find((s) => s.toLowerCase() === value.trim().toLowerCase());
    if (stage) return stage;
  }
  return guessStage(rawText);
}

function normalizePriority(value: unknown, rawText: string): Priority {
  if (typeof value === "string") {
    const p = PRIORITIES.find((p) => p.toLowerCase() === value.trim().toLowerCase());
    if (p) return p;
  }
  return guessPriority(rawText);
}

function normalizeInsightType(value: unknown, priority: Priority): InsightType {
  if (typeof value === "string") {
    const t = INSIGHT_TYPES.find((t) => t === value.trim());
    if (t) return t;
  }
  return priority === "Low" ? "crowded_market" : "whitespace";
}

function clampConfidence(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) return 70;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function compactStrings(values: unknown, fallback: string[]) {
  if (!Array.isArray(values)) return fallback;
  const items = values.filter((i): i is string => typeof i === "string").map((i) => i.trim()).filter(Boolean).slice(0, 6);
  return items.length ? items : fallback;
}

function segmentIdForName(segmentName: string, segments: SegmentOption[]) {
  const normalized = segmentName.trim().toLowerCase();
  if (!normalized) return null;
  return segments.find((s) => s.name.toLowerCase() === normalized)?.id ?? null;
}

function normalizeAnalysis(raw: LlmAnalysis, combinedText: string, segments: SegmentOption[], provider: "gemini" | "heuristic", model: string): NormalizedAnalysis {
  const name = asText(raw.startup?.name, guessName(combinedText), 120);
  const stage = normalizeStage(raw.startup?.stage, combinedText);
  const priority = normalizePriority(raw.startup?.priority, combinedText);
  const segmentId = segmentIdForName(asText(raw.startup?.segmentName, "", 120), segments) ?? guessSegment(combinedText, segments);

  const followups = Array.isArray(raw.followups)
    ? raw.followups
      .map((f) => ({ question: asText(f.question, "", 240), priority: normalizePriority(f.priority, combinedText) }))
      .filter((f) => f.question)
      .slice(0, 5)
    : [];

  const competitors = Array.isArray(raw.competitors)
    ? raw.competitors
      .map((c) => ({ name: asText(c.name, "", 120), relationshipType: asText(c.relationshipType, "Competitor", 120), description: asText(c.description, "", 400) }))
      .filter((c) => c.name)
      .slice(0, 6)
    : [];

  const risks = priority === "Low" ? ["Crowded competitive set", "Differentiation unclear"] : ["Early customer concentration", "GTM strategy not yet validated"];
  const opportunities = priority === "High" ? ["Strong founder-market fit", "Tailwind in segment", "Clear wedge"] : ["Founder background relevant", "Segment momentum"];

  return {
    provider,
    model,
    segmentId,
    startup: {
      name,
      founder: emptyToNull(asText(raw.startup?.founder, "", 120)),
      stage,
      priority,
      targetCustomer: asText(raw.startup?.targetCustomer, "TBD - extract on next call", 220),
      summary: asText(raw.startup?.summary, combinedText.slice(0, 220), 600),
      differentiation: asText(raw.startup?.differentiation, "Differentiation needs sharper articulation.", 500),
    },
    analysis: {
      summary: asText(raw.analysis?.summary, `Synthesized analysis of ${name}.`, 800),
      riskSignals: compactStrings(raw.analysis?.riskSignals, risks),
      opportunitySignals: compactStrings(raw.analysis?.opportunitySignals, opportunities),
    },
    followups: followups.length
      ? followups
      : [
        { priority: "High", question: `What is ${name}'s defensible moat in this segment?` },
        { priority: "Medium", question: "Who are the first 10 paying customers and what's the NRR?" },
      ],
    competitors,
    insight: {
      type: normalizeInsightType(raw.insight?.type, priority),
      title: asText(raw.insight?.title, priority === "Low" ? `${name} sits in a crowded market` : `${name} fits a high-opportunity wedge`, 180),
      content: asText(raw.insight?.content, priority === "Low" ? `Segment is saturated; ${name} needs a sharper moat.` : `${name} aligns with your active thesis.`, 600),
      confidenceScore: clampConfidence(raw.insight?.confidenceScore),
      recommendedAction: asText(raw.insight?.recommendedAction, priority === "High" ? "Schedule partner intro call" : "Track and ask sharper follow-ups", 220),
    },
  };
}

function heuristicAnalysis(combinedText: string, segments: SegmentOption[]): NormalizedAnalysis {
  const name = guessName(combinedText);
  const priority = guessPriority(combinedText);
  const segmentId = guessSegment(combinedText, segments);
  const segmentName = segments.find((s) => s.id === segmentId)?.name ?? "";

  return normalizeAnalysis({
    startup: {
      name,
      founder: combinedText.match(/^Founder:\s*(.+)$/im)?.[1]?.trim() ?? "",
      stage: guessStage(combinedText),
      priority,
      segmentName,
      targetCustomer: "TBD - extract on next call",
      summary: combinedText.slice(0, 220),
      differentiation: priority === "High" ? "Strong founder-market fit; clear wedge in segment." : "Differentiation needs sharper articulation.",
    },
    analysis: {
      summary: `Synthesized ${name} from all available transcripts.`,
      riskSignals: priority === "Low" ? ["Crowded competitive set", "Differentiation unclear"] : ["Early customer concentration", "GTM not yet validated"],
      opportunitySignals: priority === "High" ? ["Strong founder-market fit", "Tailwind in segment", "Clear wedge"] : ["Founder background relevant", "Segment momentum"],
    },
    followups: [
      { priority: "High", question: `What is ${name}'s defensible moat in this segment?` },
      { priority: "Medium", question: "Who are the first 10 paying customers and what's the NRR?" },
    ],
    competitors: [],
    insight: {
      type: priority === "Low" ? "crowded_market" : "whitespace",
      title: priority === "Low" ? `${name} sits in a crowded market` : `${name} fits a high-opportunity wedge`,
      content: priority === "Low" ? `Segment is saturated; ${name} needs a sharper moat.` : `${name} aligns with your active thesis; worth deeper diligence.`,
      confidenceScore: priority === "High" ? 82 : 68,
      recommendedAction: priority === "High" ? "Schedule partner intro call" : "Track and ask sharper follow-ups",
    },
  }, combinedText, segments, "heuristic", "local-heuristic");
}

async function analyzeWithGemini(combinedText: string, segments: SegmentOption[]) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return null;

  const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
  const segmentList = segments.length ? segments.map((s) => `- ${s.name}`).join("\n") : "- No existing segment";

  const prompt = [
    "You are a VC deal-flow analyst synthesizing multiple call transcripts for a single startup.",
    "The transcripts below are from multiple meetings with the same company, ordered oldest to newest.",
    "Extract the most accurate and up-to-date startup profile across all transcripts.",
    "Where information conflicts, prefer the most recent or most detailed source.",
    "Use only the transcripts as evidence. If a field is unknown, use an empty string or a conservative placeholder.",
    "For segmentName, choose exactly one existing segment name from the list when clearly applicable; otherwise use an empty string.",
    "Keep summaries concise and useful for an early-stage VC team.",
    "",
    "Existing segments:",
    segmentList,
    "",
    "Transcripts (oldest → newest):",
    combinedText,
  ].join("\n");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json", responseSchema },
    }),
  });

  const body = await response.json() as GeminiResponse;
  if (!response.ok) throw new Error(`Gemini request failed: ${body.error?.message ?? response.statusText}`);

  const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty response");

  return normalizeAnalysis(JSON.parse(text) as LlmAnalysis, combinedText, segments, "gemini", model);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const { startupId } = body as { startupId?: string };
    if (!startupId) return json({ error: "startupId is required" }, 400);

    // Verify startup belongs to this user
    const { data: startupData, error: startupFetchError } = await supabase
      .from("startups")
      .select("id, name")
      .eq("id", startupId)
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (startupFetchError) throw startupFetchError;
    if (!startupData) return json({ error: "Startup not found" }, 404);

    // Fetch all notes for this startup, oldest first
    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("raw_text, created_at")
      .eq("startup_id", startupId)
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: true });

    if (notesError) throw notesError;
    if (!notes?.length) return json({ error: "No transcripts linked to this startup" }, 400);

    // Combine all transcripts with separators
    const combinedText = notes
      .map((n, i) => `--- Transcript ${i + 1} ---\n${n.raw_text}`)
      .join("\n\n");

    // Fetch segments
    const { data: segments, error: segmentsError } = await supabase
      .from("market_segments")
      .select("id, name")
      .eq("user_id", authData.user.id);

    if (segmentsError) throw segmentsError;
    const segmentOptions = (segments ?? []) as SegmentOption[];

    let analysis: NormalizedAnalysis | null = null;
    try {
      analysis = await analyzeWithGemini(combinedText, segmentOptions);
    } catch (geminiError) {
      console.error(geminiError);
    }
    analysis ??= heuristicAnalysis(combinedText, segmentOptions);

    // Update startup with synthesized data from all transcripts
    const { data: updatedStartup, error: updateError } = await supabase
      .from("startups")
      .update({
        name: analysis.startup.name,
        founder: analysis.startup.founder,
        stage: analysis.startup.stage,
        priority: analysis.startup.priority,
        ...(analysis.segmentId ? { segment_id: analysis.segmentId } : {}),
        summary: analysis.startup.summary,
        differentiation: analysis.startup.differentiation,
        target_customer: analysis.startup.targetCustomer,
        last_interaction_at: new Date().toISOString(),
      })
      .eq("id", startupId)
      .eq("user_id", authData.user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Insert new analysis entry (synthesis of all transcripts)
    const { error: analysisError } = await supabase.from("analyses").insert({
      user_id: authData.user.id,
      startup_id: startupId,
      ai_summary: analysis.analysis.summary,
      risk_signals: analysis.analysis.riskSignals,
      opportunity_signals: analysis.analysis.opportunitySignals,
    });

    if (analysisError) throw analysisError;

    // Insert new follow-up questions
    const { error: followupError } = await supabase.from("follow_up_questions").insert(
      analysis.followups.map((f) => ({
        user_id: authData.user.id,
        startup_id: startupId,
        priority: f.priority,
        question: f.question,
      })),
    );

    if (followupError) throw followupError;

    // Insert competitors, deduplicating against existing ones
    if (analysis.competitors.length) {
      const { data: existingCompetitors } = await supabase
        .from("competitors")
        .select("name")
        .eq("startup_id", startupId)
        .eq("user_id", authData.user.id);

      const existingNames = new Set(
        (existingCompetitors ?? []).map((c: { name: string }) => c.name.toLowerCase()),
      );
      const newCompetitors = analysis.competitors.filter((c) => !existingNames.has(c.name.toLowerCase()));

      if (newCompetitors.length) {
        const { error: competitorError } = await supabase.from("competitors").insert(
          newCompetitors.map((c) => ({
            user_id: authData.user.id,
            startup_id: startupId,
            name: c.name,
            relationship_type: c.relationshipType,
            description: c.description,
          })),
        );
        if (competitorError) throw competitorError;
      }
    }

    // Insert new insight
    const { error: insightError } = await supabase.from("insights").insert({
      user_id: authData.user.id,
      startup_id: startupId,
      segment_id: analysis.segmentId,
      type: analysis.insight.type,
      title: analysis.insight.title,
      content: analysis.insight.content,
      confidence_score: analysis.insight.confidenceScore,
      recommended_action: analysis.insight.recommendedAction,
    });

    if (insightError) throw insightError;

    return json({ startup: updatedStartup, provider: analysis.provider, model: analysis.model });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Re-analysis failed";
    return json({ error: message }, 500);
  }
});
