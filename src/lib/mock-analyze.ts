import { supabase } from "@/integrations/supabase/client";

// Deterministic mock analysis: turns a raw note into a startup + analysis +
// a couple of follow-up questions + an insight. Structured so a real
// /api/analyze edge function can drop in later.

type Priority = "High" | "Medium" | "Low";
type Stage = "Pre-seed" | "Seed" | "Series A" | "Series B" | "Later";
type Source = "hubspot" | "granola" | "manual";

const STAGE_HINTS: Array<[RegExp, Stage]> = [
  [/series\s*a/i, "Series A"],
  [/series\s*b/i, "Series B"],
  [/pre-?seed|angel/i, "Pre-seed"],
  [/seed/i, "Seed"],
];

function headerValue(text: string, label: string) {
  return text.match(new RegExp(`^${label}:\\s*(.+)$`, "im"))?.[1]?.trim();
}

function guessName(text: string, fallback?: string) {
  const company = headerValue(text, "Company");
  if (company) return company.slice(0, 120);
  // Capitalized multi-letter token, often a company name
  const m = text.match(/\b([A-Z][a-zA-Z0-9]{2,}(?:[A-Z][a-zA-Z0-9]+)?)\b/);
  return m?.[1] ?? fallback ?? "New Startup";
}

function guessFounder(text: string) {
  const founder = headerValue(text, "Founder");
  if (founder) return founder.slice(0, 120);
  return text.match(/\bFounder:\s*([^,\n]+)/i)?.[1]?.trim() ?? null;
}

function guessStage(text: string): Stage {
  const stageHeader = headerValue(text, "Stage");
  const stage = stageHeader
    ? STAGE_HINTS.find(([re]) => re.test(stageHeader))?.[1]
    : null;
  if (stage) return stage;
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
  const segmentHeader = headerValue(text, "Segment")?.toLowerCase();
  if (segmentHeader) {
    const exact = segments.find((seg) => seg.name.toLowerCase() === segmentHeader);
    if (exact) return exact.id;
  }

  const map: Record<string, RegExp> = {
    "Legal AI": /legal|contract|law/i,
    "Finance Automation": /finance|finops|reconciliation|revenue|invoice|quickbooks|netsuite|stripe/i,
    "Sales Automation": /sales|outbound|sdr|crm|gong/i,
    "Climate Tech": /climate|carbon|energy|grid|emission/i,
    "DevTools": /devtool|developer|engineering|observab|platform/i,
    "Vertical Healthcare AI": /clinic|health|medical|pharma|patient/i,
  };
  for (const seg of segments) {
    const re = map[seg.name];
    if (re && re.test(t)) return seg.id;
  }
  return null;
}

export async function analyzeNoteToStartup(opts: {
  userId: string;
  noteId: string;
  rawText: string;
  source?: Source;
}) {
  const { userId, noteId, rawText, source = "manual" } = opts;

  const { data: segs = [] } = await supabase
    .from("market_segments")
    .select("id, name")
    .eq("user_id", userId);

  const name = guessName(rawText);
  const stage = guessStage(rawText);
  const priority = guessPriority(rawText);
  const segment_id = guessSegment(rawText, segs ?? []);

  // Create the startup
  const { data: startup, error: stErr } = await supabase
    .from("startups")
    .insert({
      user_id: userId,
      name,
      founder: guessFounder(rawText),
      stage,
      priority,
      segment_id,
      status: "First call completed",
      source,
      summary: rawText.slice(0, 220),
      differentiation: priority === "High" ? "Strong founder-market fit; clear wedge in segment." : "Differentiation needs sharper articulation.",
      target_customer: "TBD — extract on next call",
      last_interaction_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (stErr || !startup) throw stErr;

  // Link the note to the startup, mark analyzed
  await supabase
    .from("notes")
    .update({ startup_id: startup.id, status: "analyzed" })
    .eq("id", noteId);

  // Analysis row
  await supabase.from("analyses").insert({
    user_id: userId,
    startup_id: startup.id,
    note_id: noteId,
    ai_summary: `Auto-analyzed ${name}. ${rawText.slice(0, 180)}`,
    risk_signals: priority === "Low"
      ? ["Crowded competitive set", "Differentiation unclear"]
      : ["Early customer concentration", "GTM strategy not yet validated"],
    opportunity_signals: priority === "High"
      ? ["Strong founder-market fit", "Tailwind in segment", "Clear wedge"]
      : ["Founder background relevant", "Segment momentum"],
  });

  // Follow-ups
  await supabase.from("follow_up_questions").insert([
    { user_id: userId, startup_id: startup.id, priority: "High", question: `What is ${name}'s defensible moat in this segment?` },
    { user_id: userId, startup_id: startup.id, priority: "Medium", question: `Who are the first 10 paying customers and what's the NRR?` },
  ]);

  // Insight
  await supabase.from("insights").insert({
    user_id: userId,
    startup_id: startup.id,
    segment_id,
    type: priority === "Low" ? "crowded_market" : "whitespace",
    title: priority === "Low" ? `${name} sits in a crowded market` : `${name} fits a high-opportunity wedge`,
    content: priority === "Low"
      ? `Segment is saturated; ${name} needs a sharper data or workflow moat to stand out.`
      : `${name} aligns with your active thesis; worth moving to deeper diligence.`,
    confidence_score: priority === "High" ? 82 : 68,
    recommended_action: priority === "High" ? "Schedule partner intro call" : "Track and ask sharper follow-ups",
  });

  return startup;
}
