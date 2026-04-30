import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Priority = "High" | "Medium" | "Low";
type Stage = "Pre-seed" | "Seed" | "Series A" | "Series B" | "Later";
type InsightType = "trend" | "crowded_market" | "whitespace" | "similar_alert" | "follow_up" | "missing_competitor";
type NoteSource = "hubspot" | "granola" | "manual";

type AnalyzeRequest = {
  noteId?: string;
};

type SegmentOption = {
  id: string;
  name: string;
};

type NoteRow = {
  id: string;
  raw_text: string;
  source: NoteSource;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
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
  analysis: {
    summary: string;
    riskSignals: string[];
    opportunitySignals: string[];
  };
  followups: Array<{
    question: string;
    priority: string;
  }>;
  competitors: Array<{
    name: string;
    relationshipType: string;
    description: string;
  }>;
  insight: {
    type: string;
    title: string;
    content: string;
    confidenceScore: number;
    recommendedAction: string;
  };
};

type NormalizedAnalysis = {
  provider: "gemini" | "heuristic";
  model: string;
  segmentId: string | null;
  startup: {
    name: string;
    founder: string | null;
    stage: Stage;
    priority: Priority;
    targetCustomer: string;
    summary: string;
    differentiation: string;
  };
  analysis: {
    summary: string;
    riskSignals: string[];
    opportunitySignals: string[];
  };
  followups: Array<{
    question: string;
    priority: Priority;
  }>;
  competitors: Array<{
    name: string;
    relationshipType: string;
    description: string;
  }>;
  insight: {
    type: InsightType;
    title: string;
    content: string;
    confidenceScore: number;
    recommendedAction: string;
  };
};

const STAGES: readonly Stage[] = ["Pre-seed", "Seed", "Series A", "Series B", "Later"];
const PRIORITIES: readonly Priority[] = ["High", "Medium", "Low"];
const INSIGHT_TYPES: readonly InsightType[] = [
  "trend",
  "crowded_market",
  "whitespace",
  "similar_alert",
  "follow_up",
  "missing_competitor",
];

const STAGE_HINTS: Array<[RegExp, Stage]> = [
  [/series\s*a/i, "Series A"],
  [/series\s*b/i, "Series B"],
  [/seed/i, "Seed"],
  [/pre-?seed|angel/i, "Pre-seed"],
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}

function guessName(text: string, fallback?: string) {
  const m = text.match(/\b([A-Z][a-zA-Z0-9]{2,}(?:[A-Z][a-zA-Z0-9]+)?)\b/);
  return m?.[1] ?? fallback ?? "New Startup";
}

function guessStage(text: string): Stage {
  for (const [re, s] of STAGE_HINTS) if (re.test(text)) return s;
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
        properties: {
          question: { type: "STRING" },
          priority: { type: "STRING", enum: PRIORITIES },
        },
        required: ["question", "priority"],
        propertyOrdering: ["question", "priority"],
      },
    },
    competitors: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          relationshipType: { type: "STRING" },
          description: { type: "STRING" },
        },
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

function guessName(text: string) {
  const company = text.match(/^Company:\s*(.+)$/im)?.[1]?.trim();
  if (company) return company.slice(0, 120);
  const callTitle = text.match(/^([A-Z][a-zA-Z0-9]+(?:[A-Z][a-zA-Z0-9]+)?)\s+(?:founder|intro|partner)/im)?.[1];
  if (callTitle) return callTitle;
  const match = text.match(/\b([A-Z][a-zA-Z0-9]{2,}(?:[A-Z][a-zA-Z0-9]+)?)\b/);
  return match?.[1] ?? "New Startup";
}

function guessFounder(text: string) {
  const founder = text.match(/^Founder:\s*(.+)$/im)?.[1]?.trim();
  if (founder) return founder.slice(0, 120);
  const from = text.match(/\b(?:met|spoke with|joined by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)?.[1];
  return from ?? "";
}

function guessStage(text: string): Stage {
  for (const [pattern, stage] of STAGE_HINTS) {
    if (pattern.test(text)) return stage;
  }
  return "Pre-seed";
}

function guessPriority(text: string): Priority {
  if (/crowded|saturat|pass/i.test(text)) return "Low";
  if (/strong|exciting|tailwind|founder.?market fit|unique/i.test(text)) return "High";
  return "Medium";
}

function guessSegment(text: string, segments: { id: string; name: string }[]) {
  const t = text.toLowerCase();
  if (/strong|exciting|tailwind|founder.?market fit|unique|paid pilot|commercial deployment|roi|why now/i.test(text)) return "High";
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
  for (const seg of segments) {
    const re = map[seg.name];
    if (re && re.test(t)) return seg.id;

  for (const segment of segments) {
    const pattern = map[segment.name];
    if (pattern?.test(text)) return segment.id;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authHeader = req.headers.get("Authorization");

  if (!url || !anonKey || !authHeader) {
    return jsonResponse(400, { error: "Missing runtime configuration or auth header" });
  }

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const body = await req.json().catch(() => null);
  const noteId = body?.noteId;
  const rawText = body?.rawText;

  if (!noteId || !rawText || typeof noteId !== "string" || typeof rawText !== "string") {
    return jsonResponse(400, { error: "Invalid payload: noteId and rawText are required" });
  }

  const { data: segs = [] } = await supabase
    .from("market_segments")
    .select("id, name")
    .eq("user_id", user.id);

  const name = guessName(rawText);
  const stage = guessStage(rawText);
  const priority = guessPriority(rawText);
  const segmentId = guessSegment(rawText, segs ?? []);

  const { data: startup, error: startupError } = await supabase
    .from("startups")
    .insert({
      user_id: user.id,
      name,
      stage,
      priority,
      segment_id: segmentId,
      status: "First call completed",
      source: "manual",
      summary: rawText.slice(0, 220),
      differentiation:
        priority === "High"
          ? "Strong founder-market fit; clear wedge in segment."
          : "Differentiation needs sharper articulation.",
      target_customer: "TBD — extract on next call",
      last_interaction_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (startupError || !startup) {
    return jsonResponse(500, { error: startupError?.message ?? "Failed to create startup" });
  }

  const { error: noteUpdateError } = await supabase
    .from("notes")
    .update({ startup_id: startup.id, status: "analyzed" })
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (noteUpdateError) {
    return jsonResponse(500, { error: noteUpdateError.message });
  }

  const { error: analysisError } = await supabase.from("analyses").insert({
    user_id: user.id,
    startup_id: startup.id,
    note_id: noteId,
    ai_summary: `Auto-analyzed ${name}. ${rawText.slice(0, 180)}`,
    risk_signals:
      priority === "Low"
        ? ["Crowded competitive set", "Differentiation unclear"]
        : ["Early customer concentration", "GTM strategy not yet validated"],
    opportunity_signals:
      priority === "High"
        ? ["Strong founder-market fit", "Tailwind in segment", "Clear wedge"]
        : ["Founder background relevant", "Segment momentum"],
  });

  if (analysisError) {
    return jsonResponse(500, { error: analysisError.message });
  }

  const { error: followUpsError } = await supabase.from("follow_up_questions").insert([
    {
      user_id: user.id,
      startup_id: startup.id,
      priority: "High",
      question: `What is ${name}'s defensible moat in this segment?`,
    },
    {
      user_id: user.id,
      startup_id: startup.id,
      priority: "Medium",
      question: "Who are the first 10 paying customers and what's the NRR?",
    },
  ]);

  if (followUpsError) {
    return jsonResponse(500, { error: followUpsError.message });
  }

  const { error: insightError } = await supabase.from("insights").insert({
    user_id: user.id,
    startup_id: startup.id,
    segment_id: segmentId,
    type: priority === "Low" ? "crowded_market" : "whitespace",
    title: priority === "Low" ? `${name} sits in a crowded market` : `${name} fits a high-opportunity wedge`,
    content:
      priority === "Low"
        ? `Segment is saturated; ${name} needs a sharper data or workflow moat to stand out.`
        : `${name} aligns with your active thesis; worth moving to deeper diligence.`,
    confidence_score: priority === "High" ? 82 : 68,
    recommended_action: priority === "High" ? "Schedule partner intro call" : "Track and ask sharper follow-ups",
  });

  if (insightError) {
    return jsonResponse(500, { error: insightError.message });
  }

  return jsonResponse(200, {
    ok: true,
    startup,
  });
function targetCustomerFor(segmentName: string) {
  const map: Record<string, string> = {
    "Legal AI": "Legal teams and law firms",
    "Sales Automation": "B2B sales managers and revenue teams",
    "Climate Tech": "European utilities and industrial operators",
    DevTools: "Engineering and platform teams",
    "Vertical Healthcare AI": "Specialty healthcare operators",
  };
  return map[segmentName] ?? "TBD - extract on next call";
}

function heuristicCompetitors(rawText: string) {
  const candidates = [
    ["FlexPower", "Direct", "Mentioned as a broader VPP/grid flexibility platform."],
    ["KrakenFlex", "Direct", "Mentioned as a broader VPP platform with adjacent utility workflows."],
    ["Google Classroom", "Adjacent", "Could bundle grading and classroom workflow features."],
    ["Canvas", "Adjacent", "Learning management incumbent that could bundle AI grading."],
    ["Gong", "Direct", "Sales call system-of-record that may absorb coaching workflows."],
    ["Chorus", "Direct", "Sales conversation intelligence incumbent."],
    ["Harvey", "Direct", "Legal AI incumbent with strong enterprise distribution."],
    ["Clay", "Direct", "Sales automation and enrichment competitor."],
    ["Apollo", "Direct", "Sales database and sequencing incumbent."],
  ];

  return candidates
    .filter(([name]) => rawText.toLowerCase().includes(name.toLowerCase()))
    .map(([name, relationshipType, description]) => ({ name, relationshipType, description }))
    .slice(0, 5);
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

function normalizeStage(value: unknown, rawText: string): Stage {
  if (typeof value === "string") {
    const stage = STAGES.find((candidate) => candidate.toLowerCase() === value.trim().toLowerCase());
    if (stage) return stage;
  }
  return guessStage(rawText);
}

function normalizePriority(value: unknown, rawText: string): Priority {
  if (typeof value === "string") {
    const priority = PRIORITIES.find((candidate) => candidate.toLowerCase() === value.trim().toLowerCase());
    if (priority) return priority;
  }
  return guessPriority(rawText);
}

function normalizeInsightType(value: unknown, priority: Priority): InsightType {
  if (typeof value === "string") {
    const type = INSIGHT_TYPES.find((candidate) => candidate === value.trim());
    if (type) return type;
  }
  return priority === "Low" ? "crowded_market" : "whitespace";
}

function clampConfidence(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) return 70;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function compactStrings(values: unknown, fallback: string[]) {
  if (!Array.isArray(values)) return fallback;
  const items = values
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
  return items.length ? items : fallback;
}

function segmentIdForName(segmentName: string, segments: SegmentOption[]) {
  const normalized = segmentName.trim().toLowerCase();
  if (!normalized) return null;
  return segments.find((segment) => segment.name.toLowerCase() === normalized)?.id ?? null;
}

function normalizeAnalysis(
  raw: LlmAnalysis,
  rawText: string,
  segments: SegmentOption[],
  provider: "gemini" | "heuristic",
  model: string,
): NormalizedAnalysis {
  const name = asText(raw.startup?.name, guessName(rawText), 120);
  const stage = normalizeStage(raw.startup?.stage, rawText);
  const priority = normalizePriority(raw.startup?.priority, rawText);
  const segmentId = segmentIdForName(asText(raw.startup?.segmentName, "", 120), segments) ?? guessSegment(rawText, segments);
  const risks = priority === "Low"
    ? ["Crowded competitive set", "Differentiation unclear"]
    : ["Early customer concentration", "GTM strategy not yet validated"];
  const opportunities = priority === "High"
    ? ["Strong founder-market fit", "Tailwind in segment", "Clear wedge"]
    : ["Founder background relevant", "Segment momentum"];

  const followups = Array.isArray(raw.followups)
    ? raw.followups
      .map((followup) => ({
        question: asText(followup.question, "", 240),
        priority: normalizePriority(followup.priority, rawText),
      }))
      .filter((followup) => followup.question)
      .slice(0, 5)
    : [];

  const competitors = Array.isArray(raw.competitors)
    ? raw.competitors
      .map((competitor) => ({
        name: asText(competitor.name, "", 120),
        relationshipType: asText(competitor.relationshipType, "Competitor", 120),
        description: asText(competitor.description, "", 400),
      }))
      .filter((competitor) => competitor.name)
      .slice(0, 6)
    : [];

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
      summary: asText(raw.startup?.summary, rawText.slice(0, 220), 600),
      differentiation: asText(raw.startup?.differentiation, "Differentiation needs sharper articulation.", 500),
    },
    analysis: {
      summary: asText(raw.analysis?.summary, `Auto-analyzed ${name}. ${rawText.slice(0, 180)}`, 800),
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
      title: asText(
        raw.insight?.title,
        priority === "Low" ? `${name} sits in a crowded market` : `${name} fits a high-opportunity wedge`,
        180,
      ),
      content: asText(
        raw.insight?.content,
        priority === "Low"
          ? `Segment is saturated; ${name} needs a sharper data or workflow moat to stand out.`
          : `${name} aligns with your active thesis; worth moving to deeper diligence.`,
        600,
      ),
      confidenceScore: clampConfidence(raw.insight?.confidenceScore),
      recommendedAction: asText(
        raw.insight?.recommendedAction,
        priority === "High" ? "Schedule partner intro call" : "Track and ask sharper follow-ups",
        220,
      ),
    },
  };
}

function heuristicAnalysis(rawText: string, segments: SegmentOption[]): NormalizedAnalysis {
  const name = guessName(rawText);
  const priority = guessPriority(rawText);
  const segmentId = guessSegment(rawText, segments);
  const segmentName = segments.find((segment) => segment.id === segmentId)?.name ?? "";
  const competitors = heuristicCompetitors(rawText);

  return normalizeAnalysis({
    startup: {
      name,
      founder: guessFounder(rawText),
      stage: guessStage(rawText),
      priority,
      segmentName,
      targetCustomer: targetCustomerFor(segmentName),
      summary: rawText.slice(0, 220),
      differentiation: priority === "High"
        ? "Strong founder-market fit; clear wedge in segment."
        : "Differentiation needs sharper articulation.",
    },
    analysis: {
      summary: `Auto-analyzed ${name}. ${rawText.slice(0, 180)}`,
      riskSignals: priority === "Low"
        ? ["Crowded competitive set", "Differentiation unclear"]
        : ["Early customer concentration", "GTM strategy not yet validated"],
      opportunitySignals: priority === "High"
        ? ["Strong founder-market fit", "Tailwind in segment", "Clear wedge"]
        : ["Founder background relevant", "Segment momentum"],
    },
    followups: [
      { priority: "High", question: `What is ${name}'s defensible moat in this segment?` },
      { priority: "Medium", question: "Who are the first 10 paying customers and what's the NRR?" },
    ],
    competitors,
    insight: {
      type: priority === "Low" ? "crowded_market" : "whitespace",
      title: priority === "Low" ? `${name} sits in a crowded market` : `${name} fits a high-opportunity wedge`,
      content: priority === "Low"
        ? `Segment is saturated; ${name} needs a sharper data or workflow moat to stand out.`
        : `${name} aligns with your active thesis; worth moving to deeper diligence.`,
      confidenceScore: priority === "High" ? 82 : 68,
      recommendedAction: priority === "High" ? "Schedule partner intro call" : "Track and ask sharper follow-ups",
    },
  }, rawText, segments, "heuristic", "local-heuristic");
}

async function analyzeWithGemini(rawText: string, segments: SegmentOption[]) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return null;

  const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
  const segmentList = segments.length
    ? segments.map((segment) => `- ${segment.name}`).join("\n")
    : "- No existing segment";

  const prompt = [
    "You are a VC deal-flow analyst.",
    "Extract a structured startup profile from the note.",
    "Use only the note as evidence. If a field is unknown, use an empty string or a conservative placeholder.",
    "For segmentName, choose exactly one existing segment name from the list when clearly applicable; otherwise use an empty string.",
    "Keep summaries concise and useful for an early-stage VC team.",
    "",
    "Existing segments:",
    segmentList,
    "",
    "Raw note:",
    rawText,
  ].join("\n");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema,
      },
    }),
  });

  const body = await response.json() as GeminiResponse;
  if (!response.ok) {
    throw new Error(`Gemini request failed: ${body.error?.message ?? response.statusText}`);
  }

  const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty response");

  return normalizeAnalysis(JSON.parse(text) as LlmAnalysis, rawText, segments, "gemini", model);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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

    const body = await req.json() as AnalyzeRequest;
    if (!body.noteId) return json({ error: "noteId is required" }, 400);

    const { data: noteData, error: noteError } = await supabase
      .from("notes")
      .select("id, raw_text, source")
      .eq("id", body.noteId)
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (noteError) throw noteError;
    const note = noteData as NoteRow | null;
    if (!note) return json({ error: "Note not found" }, 404);

    const { data: segments, error: segmentsError } = await supabase
      .from("market_segments")
      .select("id, name")
      .eq("user_id", authData.user.id);

    if (segmentsError) throw segmentsError;

    const segmentOptions = (segments ?? []) as SegmentOption[];
    let analysis = null as NormalizedAnalysis | null;

    try {
      analysis = await analyzeWithGemini(note.raw_text, segmentOptions);
    } catch (geminiError) {
      console.error(geminiError);
    }

    analysis ??= heuristicAnalysis(note.raw_text, segmentOptions);

    const { data: startup, error: startupError } = await supabase
      .from("startups")
      .insert({
        user_id: authData.user.id,
        name: analysis.startup.name,
        founder: analysis.startup.founder,
        stage: analysis.startup.stage,
        priority: analysis.startup.priority,
        segment_id: analysis.segmentId,
        status: "First call completed",
        source: note.source,
        summary: analysis.startup.summary,
        differentiation: analysis.startup.differentiation,
        target_customer: analysis.startup.targetCustomer,
        last_interaction_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (startupError) throw startupError;

    const { error: noteUpdateError } = await supabase
      .from("notes")
      .update({ startup_id: startup.id, status: "analyzed" })
      .eq("id", note.id)
      .eq("user_id", authData.user.id);

    if (noteUpdateError) throw noteUpdateError;

    const { error: analysisError } = await supabase.from("analyses").insert({
      user_id: authData.user.id,
      startup_id: startup.id,
      note_id: note.id,
      ai_summary: analysis.analysis.summary,
      risk_signals: analysis.analysis.riskSignals,
      opportunity_signals: analysis.analysis.opportunitySignals,
    });

    if (analysisError) throw analysisError;

    const { error: followupError } = await supabase.from("follow_up_questions").insert(
      analysis.followups.map((followup) => ({
        user_id: authData.user.id,
        startup_id: startup.id,
        priority: followup.priority,
        question: followup.question,
      })),
    );

    if (followupError) throw followupError;

    if (analysis.competitors.length) {
      const { error: competitorError } = await supabase.from("competitors").insert(
        analysis.competitors.map((competitor) => ({
          user_id: authData.user.id,
          startup_id: startup.id,
          name: competitor.name,
          relationship_type: competitor.relationshipType,
          description: competitor.description,
        })),
      );

      if (competitorError) throw competitorError;
    }

    const { error: insightError } = await supabase.from("insights").insert({
      user_id: authData.user.id,
      startup_id: startup.id,
      segment_id: analysis.segmentId,
      type: analysis.insight.type,
      title: analysis.insight.title,
      content: analysis.insight.content,
      confidence_score: analysis.insight.confidenceScore,
      recommended_action: analysis.insight.recommendedAction,
    });

    if (insightError) throw insightError;

    return json({
      startup,
      provider: analysis.provider,
      model: analysis.model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    return json({ error: message }, 500);
  }
});
