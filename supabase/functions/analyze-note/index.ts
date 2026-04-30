import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Priority = "High" | "Medium" | "Low";
type Stage = "Pre-seed" | "Seed" | "Series A" | "Series B" | "Later";

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
  return "Pre-seed";
}

function guessPriority(text: string): Priority {
  if (/crowded|saturat|pass/i.test(text)) return "Low";
  if (/strong|exciting|tailwind|founder.?market fit|unique/i.test(text)) return "High";
  return "Medium";
}

function guessSegment(text: string, segments: { id: string; name: string }[]) {
  const t = text.toLowerCase();
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
});
