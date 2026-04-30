import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Priority = "High" | "Medium" | "Low";
type Stage = "Pre-seed" | "Seed" | "Series A" | "Series B" | "Later";

type AnalyzeRequest = {
  noteId?: string;
};

type SegmentOption = {
  id: string;
  name: string;
};

const STAGE_HINTS: Array<[RegExp, Stage]> = [
  [/series\s*a/i, "Series A"],
  [/series\s*b/i, "Series B"],
  [/seed/i, "Seed"],
  [/pre-?seed|angel/i, "Pre-seed"],
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function guessName(text: string) {
  const match = text.match(/\b([A-Z][a-zA-Z0-9]{2,}(?:[A-Z][a-zA-Z0-9]+)?)\b/);
  return match?.[1] ?? "New Startup";
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

    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("id, raw_text")
      .eq("id", body.noteId)
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (noteError) throw noteError;
    if (!note) return json({ error: "Note not found" }, 404);

    const { data: segments, error: segmentsError } = await supabase
      .from("market_segments")
      .select("id, name")
      .eq("user_id", authData.user.id);

    if (segmentsError) throw segmentsError;

    const name = guessName(note.raw_text);
    const stage = guessStage(note.raw_text);
    const priority = guessPriority(note.raw_text);
    const segmentId = guessSegment(note.raw_text, segments ?? []);

    const { data: startup, error: startupError } = await supabase
      .from("startups")
      .insert({
        user_id: authData.user.id,
        name,
        stage,
        priority,
        segment_id: segmentId,
        status: "First call completed",
        source: "manual",
        summary: note.raw_text.slice(0, 220),
        differentiation: priority === "High"
          ? "Strong founder-market fit; clear wedge in segment."
          : "Differentiation needs sharper articulation.",
        target_customer: "TBD - extract on next call",
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
      ai_summary: `Auto-analyzed ${name}. ${note.raw_text.slice(0, 180)}`,
      risk_signals: priority === "Low"
        ? ["Crowded competitive set", "Differentiation unclear"]
        : ["Early customer concentration", "GTM strategy not yet validated"],
      opportunity_signals: priority === "High"
        ? ["Strong founder-market fit", "Tailwind in segment", "Clear wedge"]
        : ["Founder background relevant", "Segment momentum"],
    });

    if (analysisError) throw analysisError;

    const { error: followupError } = await supabase.from("follow_up_questions").insert([
      {
        user_id: authData.user.id,
        startup_id: startup.id,
        priority: "High",
        question: `What is ${name}'s defensible moat in this segment?`,
      },
      {
        user_id: authData.user.id,
        startup_id: startup.id,
        priority: "Medium",
        question: "Who are the first 10 paying customers and what's the NRR?",
      },
    ]);

    if (followupError) throw followupError;

    const { error: insightError } = await supabase.from("insights").insert({
      user_id: authData.user.id,
      startup_id: startup.id,
      segment_id: segmentId,
      type: priority === "Low" ? "crowded_market" : "whitespace",
      title: priority === "Low" ? `${name} sits in a crowded market` : `${name} fits a high-opportunity wedge`,
      content: priority === "Low"
        ? `Segment is saturated; ${name} needs a sharper data or workflow moat to stand out.`
        : `${name} aligns with your active thesis; worth moving to deeper diligence.`,
      confidence_score: priority === "High" ? 82 : 68,
      recommended_action: priority === "High" ? "Schedule partner intro call" : "Track and ask sharper follow-ups",
    });

    if (insightError) throw insightError;

    return json({ startup });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    return json({ error: message }, 500);
  }
});
