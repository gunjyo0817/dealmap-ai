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

type ExistingStartup = {
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
  matchedStartupId: string;
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
  matchedStartupId: string | null;
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

const responseSchema = {
  type: "OBJECT",
  properties: {
    matchedStartupId: { type: "STRING" },
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
  required: ["matchedStartupId", "startup", "analysis", "followups", "competitors", "insight"],
  propertyOrdering: ["matchedStartupId", "startup", "analysis", "followups", "competitors", "insight"],
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
  const matchedStartupId = typeof raw.matchedStartupId === "string" && raw.matchedStartupId.trim()
    ? raw.matchedStartupId.trim()
    : null;
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
    matchedStartupId,
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

function heuristicMatchStartup(name: string, existingStartups: ExistingStartup[]): string | null {
  const lowerName = name.toLowerCase().trim();
  if (!lowerName) return null;
  return existingStartups.find((s) => {
    const sn = s.name.toLowerCase().trim();
    return sn === lowerName || sn.includes(lowerName) || lowerName.includes(sn);
  })?.id ?? null;
}

function heuristicAnalysis(rawText: string, segments: SegmentOption[], existingStartups: ExistingStartup[]): NormalizedAnalysis {
  const name = guessName(rawText);
  const priority = guessPriority(rawText);
  const segmentId = guessSegment(rawText, segments);
  const segmentName = segments.find((segment) => segment.id === segmentId)?.name ?? "";
  const competitors = heuristicCompetitors(rawText);
  const matchedId = heuristicMatchStartup(name, existingStartups);

  return normalizeAnalysis({
    matchedStartupId: matchedId ?? "",
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

async function analyzeWithGemini(rawText: string, segments: SegmentOption[], existingStartups: ExistingStartup[]) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return null;

  const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
  const segmentList = segments.length
    ? segments.map((segment) => `- ${segment.name}`).join("\n")
    : "- No existing segment";

  const startupList = existingStartups.length
    ? existingStartups.map((s) => `- ID: ${s.id} | Name: ${s.name}`).join("\n")
    : "- None";

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
    "Existing startups already in our CRM (ID | Name):",
    startupList,
    "",
    "If the transcript is about one of the existing startups above, set matchedStartupId to that startup's exact ID.",
    "If the company in the transcript is NOT in the list above, set matchedStartupId to an empty string.",
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

    const { data: existingStartupsData, error: existingStartupsError } = await supabase
      .from("startups")
      .select("id, name")
      .eq("user_id", authData.user.id);

    if (existingStartupsError) throw existingStartupsError;

    const segmentOptions = (segments ?? []) as SegmentOption[];
    const existingStartupOptions = (existingStartupsData ?? []) as ExistingStartup[];

    let analysis = null as NormalizedAnalysis | null;

    try {
      analysis = await analyzeWithGemini(note.raw_text, segmentOptions, existingStartupOptions);
    } catch (geminiError) {
      console.error(geminiError);
    }

    analysis ??= heuristicAnalysis(note.raw_text, segmentOptions, existingStartupOptions);

    // Validate matchedStartupId against actual DB records to prevent hallucination
    const validatedMatchId = analysis.matchedStartupId &&
      existingStartupOptions.some((s) => s.id === analysis!.matchedStartupId)
      ? analysis.matchedStartupId
      : null;

    let startup: Record<string, unknown>;
    let isNew: boolean;

    if (validatedMatchId) {
      // UPDATE existing startup with fresh data from transcript
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
        .eq("id", validatedMatchId)
        .eq("user_id", authData.user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      startup = updatedStartup as Record<string, unknown>;
      isNew = false;
    } else {
      // INSERT new startup
      const { data: newStartup, error: startupError } = await supabase
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
      startup = newStartup as Record<string, unknown>;
      isNew = true;
    }

    const startupId = startup.id as string;

    // Link note to startup and mark analyzed
    const { error: noteUpdateError } = await supabase
      .from("notes")
      .update({ startup_id: startupId, status: "analyzed" })
      .eq("id", note.id)
      .eq("user_id", authData.user.id);

    if (noteUpdateError) throw noteUpdateError;

    // Insert new analysis entry
    const { error: analysisError } = await supabase.from("analyses").insert({
      user_id: authData.user.id,
      startup_id: startupId,
      note_id: note.id,
      ai_summary: analysis.analysis.summary,
      risk_signals: analysis.analysis.riskSignals,
      opportunity_signals: analysis.analysis.opportunitySignals,
    });

    if (analysisError) throw analysisError;

    // Insert new follow-up questions
    const { error: followupError } = await supabase.from("follow_up_questions").insert(
      analysis.followups.map((followup) => ({
        user_id: authData.user.id,
        startup_id: startupId,
        priority: followup.priority,
        question: followup.question,
      })),
    );

    if (followupError) throw followupError;

    // Insert competitors, deduplicating by name when updating an existing startup
    if (analysis.competitors.length) {
      let competitorsToInsert = analysis.competitors;

      if (!isNew) {
        const { data: existingCompetitors } = await supabase
          .from("competitors")
          .select("name")
          .eq("startup_id", startupId)
          .eq("user_id", authData.user.id);

        const existingNames = new Set(
          (existingCompetitors ?? []).map((c: { name: string }) => c.name.toLowerCase()),
        );
        competitorsToInsert = analysis.competitors.filter((c) => !existingNames.has(c.name.toLowerCase()));
      }

      if (competitorsToInsert.length) {
        const { error: competitorError } = await supabase.from("competitors").insert(
          competitorsToInsert.map((competitor) => ({
            user_id: authData.user.id,
            startup_id: startupId,
            name: competitor.name,
            relationship_type: competitor.relationshipType,
            description: competitor.description,
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

    return json({
      startup,
      provider: analysis.provider,
      model: analysis.model,
      isNew,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    return json({ error: message }, 500);
  }
});
