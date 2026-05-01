import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

const responseSchema = {
  type: "OBJECT",
  properties: {
    marketPosition: { type: "STRING" },
    bestPositionedStartup: { type: "STRING" },
    mainCompetitorThreat: { type: "STRING" },
    keyDiligenceQuestion: { type: "STRING" },
    recommendedNextAction: { type: "STRING" },
    comparativeInsight: { type: "STRING" },
  },
  required: [
    "marketPosition",
    "bestPositionedStartup",
    "mainCompetitorThreat",
    "keyDiligenceQuestion",
    "recommendedNextAction",
    "comparativeInsight",
  ],
  propertyOrdering: [
    "marketPosition",
    "bestPositionedStartup",
    "mainCompetitorThreat",
    "keyDiligenceQuestion",
    "recommendedNextAction",
    "comparativeInsight",
  ],
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
    const { segmentId } = body as { segmentId?: string };
    if (!segmentId) return json({ error: "segmentId is required" }, 400);

    // Fetch segment
    const { data: segment, error: segmentError } = await supabase
      .from("market_segments")
      .select("*")
      .eq("id", segmentId)
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (segmentError) throw segmentError;
    if (!segment) return json({ error: "Segment not found" }, 404);

    // Fetch startups in segment
    const { data: startups, error: startupsError } = await supabase
      .from("startups")
      .select("id, name, priority, stage, summary, differentiation, target_customer")
      .eq("segment_id", segmentId)
      .eq("user_id", authData.user.id);

    if (startupsError) throw startupsError;

    const startupRows = startups ?? [];
    const startupIds = startupRows.map((s) => s.id);

    type AnalysisRow = { startup_id: string; opportunity_signals: unknown; risk_signals: unknown };
    type CompetitorRow = { startup_id: string; name: string; relationship_type: string | null; description: string | null };

    let analyses: AnalysisRow[] = [];
    let competitors: CompetitorRow[] = [];

    if (startupIds.length) {
      const [analysesQ, competitorsQ] = await Promise.all([
        supabase
          .from("analyses")
          .select("startup_id, opportunity_signals, risk_signals")
          .in("startup_id", startupIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("competitors")
          .select("startup_id, name, relationship_type, description")
          .in("startup_id", startupIds),
      ]);
      if (!analysesQ.error) analyses = (analysesQ.data ?? []) as AnalysisRow[];
      if (!competitorsQ.error) competitors = (competitorsQ.data ?? []) as CompetitorRow[];
    }

    // Build per-startup context
    const latestByStartup = new Map<string, AnalysisRow>();
    for (const a of analyses) {
      if (a.startup_id && !latestByStartup.has(a.startup_id)) latestByStartup.set(a.startup_id, a);
    }

    const uniqueCompetitors = [...new Set(competitors.map((c) => c.name))].slice(0, 8);

    const startupDescriptions = startupRows
      .map((s) => {
        const analysis = latestByStartup.get(s.id);
        const opps = (Array.isArray(analysis?.opportunity_signals) ? analysis!.opportunity_signals : [])
          .slice(0, 3)
          .join("; ");
        const risks = (Array.isArray(analysis?.risk_signals) ? analysis!.risk_signals : [])
          .slice(0, 3)
          .join("; ");
        return [
          `**${s.name}** (${s.priority ?? "Medium"} priority, ${s.stage ?? "Unknown"} stage)`,
          s.differentiation ? `  Differentiation: ${s.differentiation}` : null,
          opps ? `  Opportunity signals: ${opps}` : null,
          risks ? `  Risk signals: ${risks}` : null,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");

    const prompt = [
      "You are a senior VC deal-flow analyst. Below is data about a market segment and the portfolio startups in it.",
      "Write a concise investment read. Be specific, reference startup names, and give sharp VC-quality opinions.",
      "Avoid generic filler sentences. Your output will be shown directly to investment team members.",
      "",
      `**Segment:** ${segment.name}`,
      `**Opportunity score:** ${segment.opportunity_score}/100`,
      `**Crowdedness score:** ${segment.crowdedness_score}/100`,
      `**Trend:** ${segment.trend ?? "Unknown"}`,
      segment.description ? `**Description:** ${segment.description}` : null,
      "",
      "**Portfolio startups:**",
      startupDescriptions || "No startups mapped yet.",
      uniqueCompetitors.length ? `\n**Known competitors:** ${uniqueCompetitors.join(", ")}` : null,
      "",
      "Respond in JSON with these fields:",
      "- marketPosition: 2-3 sentence market read referencing the opportunity/crowdedness scores and portfolio positioning",
      "- bestPositionedStartup: startup name + 1-sentence reason, or 'No startup mapped yet'",
      "- mainCompetitorThreat: competitor name + 1-sentence threat assessment, or 'No competitor mapped yet'",
      "- keyDiligenceQuestion: the single most important open question for the team right now",
      "- recommendedNextAction: a specific, concrete next step (e.g., 'Advance X to partner review' or 'Map 2 more competitors before deciding')",
      "- comparativeInsight: a unique 1-2 sentence observation comparing startups to each other or to the competitive landscape that the template analysis would miss",
    ]
      .filter(Boolean)
      .join("\n");

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return json({ error: "GEMINI_API_KEY not configured" }, 500);

    const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: "application/json", responseSchema },
        }),
      },
    );

    const geminiBody = (await geminiRes.json()) as GeminiResponse;
    if (!geminiRes.ok) {
      throw new Error(`Gemini request failed: ${geminiBody.error?.message ?? geminiRes.statusText}`);
    }

    const text = geminiBody.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
    if (!text) throw new Error("Gemini returned an empty response");

    const summary = JSON.parse(text);
    return json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to summarize segment";
    return json({ error: message }, 500);
  }
});
