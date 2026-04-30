import { supabase } from "@/integrations/supabase/client";

const SEGMENTS = [
  { name: "Legal AI", description: "Contract review and legal workflow automation. Incumbents target AmLaw 100; opportunity in mid-market and EU compliance.", crowdedness_score: 78, opportunity_score: 62, trend: "Crowded" },
  { name: "Sales Automation", description: "AI outbound, enrichment, and CRM augmentation. Differentiation increasingly about data quality and workflow depth.", crowdedness_score: 88, opportunity_score: 55, trend: "Hot" },
  { name: "Climate Tech", description: "Industrial energy monitoring and CSRD-driven carbon reporting. Strong tailwind from EU regulation.", crowdedness_score: 42, opportunity_score: 84, trend: "Emerging" },
  { name: "DevTools", description: "Developer observability and AI-assisted code intelligence. White-space in mid-market team workflows.", crowdedness_score: 35, opportunity_score: 78, trend: "White-space" },
  { name: "Vertical Healthcare AI", description: "AI-native workflow tools for clinics, pharma ops, and diagnostics. Long sales cycles but durable contracts.", crowdedness_score: 48, opportunity_score: 81, trend: "Emerging" },
];

type Stage = "Pre-seed" | "Seed" | "Series A";
type Priority = "High" | "Medium" | "Low";
type Status = "First call completed" | "Follow-up needed" | "Partner review" | "Researching" | "Tracking";
type Source = "hubspot" | "granola" | "manual";

const STARTUPS: Array<{
  name: string; founder: string; segment: string; stage: Stage;
  target_customer: string; summary: string; differentiation: string;
  status: Status; priority: Priority; source: Source; daysAgo: number;
}> = [
  { name: "LexFlow", founder: "Anna Müller", segment: "Legal AI", stage: "Pre-seed", target_customer: "Small & mid-sized EU law firms", summary: "AI contract review assistant tuned for European civil-law jurisdictions and SMB workflows.", differentiation: "Workflow-first UX and pricing 5–8x below Harvey; native German + French legal corpora.", status: "First call completed", priority: "High", source: "hubspot", daysAgo: 2 },
  { name: "PitchPilot", founder: "Daniel Chen", segment: "Sales Automation", stage: "Seed", target_customer: "B2B sales teams (50–500 reps)", summary: "AI outbound engine that personalizes sequences using live CRM signals and intent data.", differentiation: "Tighter CRM-native loop than Clay; weaker moat — mostly orchestration on top of OpenAI.", status: "Follow-up needed", priority: "Medium", source: "granola", daysAgo: 7 },
  { name: "CarbonGrid", founder: "Sophie Weber", segment: "Climate Tech", stage: "Seed", target_customer: "Mid-market industrial manufacturers", summary: "Real-time energy and emissions monitoring with CSRD-ready reporting.", differentiation: "Sits between operational efficiency and compliance — needs sharper positioning.", status: "Partner review", priority: "High", source: "manual", daysAgo: 1 },
  { name: "DevLens", founder: "Max Klein", segment: "DevTools", stage: "Pre-seed", target_customer: "Engineering teams of 20–200", summary: "Code intelligence layer that maps service ownership and change-risk across monorepos.", differentiation: "Underexplored intersection of internal-dev-platform and incident analytics.", status: "Researching", priority: "Medium", source: "hubspot", daysAgo: 3 },
  { name: "ClariMed", founder: "Dr. Priya Shah", segment: "Vertical Healthcare AI", stage: "Seed", target_customer: "Mid-size specialty clinics in EU/UK", summary: "Clinical documentation copilot purpose-built for specialty outpatient workflows.", differentiation: "Specialty-tuned templates; faster onboarding than Abridge for non-acute settings.", status: "First call completed", priority: "High", source: "granola", daysAgo: 5 },
  { name: "OrbitOps", founder: "Tomás Rivera", segment: "DevTools", stage: "Seed", target_customer: "Platform teams at 200–2000 person companies", summary: "Internal developer platform with AI-assisted runbook generation.", differentiation: "Bottom-up adoption model vs. enterprise-only Backstage competitors.", status: "Tracking", priority: "Low", source: "hubspot", daysAgo: 14 },
  { name: "GreenLedger", founder: "Astrid Berg", segment: "Climate Tech", stage: "Pre-seed", target_customer: "Mid-market manufacturers in DACH", summary: "Scope 3 emissions ledger with verifiable supplier attestations.", differentiation: "Cryptographic supplier proofs vs. self-reported spreadsheets.", status: "Researching", priority: "Medium", source: "manual", daysAgo: 9 },
  { name: "BriefStack", founder: "Olivia Park", segment: "Legal AI", stage: "Seed", target_customer: "Litigation boutiques in US/UK", summary: "Brief and motion drafting AI fine-tuned on case law citations.", differentiation: "Citation-grounded outputs reduce hallucination risk vs. generic copilots.", status: "Follow-up needed", priority: "Medium", source: "hubspot", daysAgo: 11 },
];

const COMPETITORS: Record<string, Array<{ name: string; relationship_type: string; description: string }>> = {
  LexFlow: [
    { name: "Harvey", relationship_type: "Direct (enterprise)", description: "AmLaw-100 focused; expensive; overkill for SMB EU firms." },
    { name: "Spellbook", relationship_type: "Direct (SMB)", description: "Word-native contract assistant. Strong in NA, weak EU presence." },
    { name: "Robin AI", relationship_type: "Adjacent", description: "UK-focused contract negotiation; broader scope." },
  ],
  PitchPilot: [
    { name: "Clay", relationship_type: "Direct", description: "Best-in-class data enrichment; PitchPilot rides on top of similar primitives." },
    { name: "Apollo", relationship_type: "Direct", description: "Database + sequencing combo; massive distribution moat." },
  ],
  CarbonGrid: [
    { name: "Watershed", relationship_type: "Adjacent", description: "Enterprise carbon accounting; less operational/sensor focus." },
    { name: "Sweep", relationship_type: "Direct", description: "European compliance-first competitor." },
  ],
  DevLens: [
    { name: "Swarmia", relationship_type: "Adjacent", description: "Engineering analytics; doesn't focus on service ownership graph." },
    { name: "Sentry", relationship_type: "Adjacent", description: "Errors and observability; different wedge." },
  ],
  ClariMed: [
    { name: "Abridge", relationship_type: "Direct", description: "Acute-care leader; less specialty depth." },
    { name: "Nabla", relationship_type: "Direct", description: "EU footprint; primary care focus." },
  ],
  OrbitOps: [
    { name: "Backstage", relationship_type: "Direct (OSS)", description: "Enterprise-heavy IDP; complex setup." },
  ],
  GreenLedger: [
    { name: "Persefoni", relationship_type: "Adjacent", description: "Enterprise-grade carbon accounting." },
  ],
  BriefStack: [
    { name: "Harvey", relationship_type: "Adjacent", description: "Broader legal AI; less litigation-specific." },
  ],
};

const FOLLOWUPS: Record<string, Array<{ question: string; priority: Priority }>> = {
  LexFlow: [
    { question: "How will you access proprietary legal corpora at scale?", priority: "High" },
    { question: "What's the path from unpaid pilots to paid contracts?", priority: "High" },
    { question: "Why won't Harvey or Spellbook drop pricing to compete in EU SMB?", priority: "Medium" },
  ],
  PitchPilot: [
    { question: "What is the defensible moat beyond GPT orchestration?", priority: "High" },
    { question: "What is NRR on the first 10 paying customers?", priority: "High" },
  ],
  CarbonGrid: [
    { question: "Is the wedge compliance reporting or operational efficiency?", priority: "High" },
    { question: "Which buyer signs the first $100k contract?", priority: "High" },
  ],
  DevLens: [
    { question: "What's the wedge product vs. Sentry/Swarmia?", priority: "Medium" },
    { question: "Which customer profile converts fastest?", priority: "Medium" },
  ],
  ClariMed: [
    { question: "How are HIPAA/GDPR claims being independently audited?", priority: "High" },
    { question: "What's the integration story with EHRs in target specialties?", priority: "Medium" },
  ],
};

const INSIGHTS: Array<{
  type: "trend" | "crowded_market" | "whitespace" | "similar_alert" | "follow_up" | "missing_competitor";
  title: string; content: string; confidence_score: number; recommended_action: string;
  segmentName?: string; startupName?: string;
}> = [
  { type: "trend", title: "EU-native vertical AI is consolidating", content: "AI vertical SaaS is consolidating around workflow depth and proprietary data access. EU-native plays gain an edge as CSRD and AI Act compliance accelerate.", confidence_score: 84, recommended_action: "Prioritize sourcing in EU for Legal AI, Climate, and Healthcare AI." },
  { type: "whitespace", title: "Mid-market legal tech in non-English EU", content: "LexFlow occupies a clear gap: civil-law jurisdictions underserved by Harvey/Spellbook.", confidence_score: 78, recommended_action: "Move LexFlow to active diligence.", segmentName: "Legal AI", startupName: "LexFlow" },
  { type: "crowded_market", title: "AI SDR / outbound automation is saturated", content: "13+ funded competitors; differentiation is data, not workflow.", confidence_score: 88, recommended_action: "Pass on PitchPilot unless data moat clarified.", segmentName: "Sales Automation", startupName: "PitchPilot" },
  { type: "missing_competitor", title: "Persefoni not yet mapped against CarbonGrid", content: "Persefoni operates one layer up but increasingly bundles operational data.", confidence_score: 72, recommended_action: "Add Persefoni to CarbonGrid competitor map.", startupName: "CarbonGrid" },
  { type: "follow_up", title: "3 high-priority follow-ups overdue", content: "LexFlow, CarbonGrid, ClariMed each have unanswered High-priority questions.", confidence_score: 95, recommended_action: "Schedule founder calls this week." },
];

export async function seedDemoDataIfEmpty(userId: string) {
  const { count } = await supabase.from("startups").select("id", { count: "exact", head: true }).eq("user_id", userId);
  if ((count ?? 0) > 0) return false;

  // Insert segments
  const { data: segs, error: segErr } = await supabase
    .from("market_segments")
    .insert(SEGMENTS.map((s) => ({ ...s, user_id: userId })))
    .select();
  if (segErr) throw segErr;
  const segByName = new Map(segs!.map((s) => [s.name, s.id]));

  // Insert startups
  const startupRows = STARTUPS.map((s) => ({
    user_id: userId,
    name: s.name,
    founder: s.founder,
    stage: s.stage,
    segment_id: segByName.get(s.segment) ?? null,
    target_customer: s.target_customer,
    summary: s.summary,
    differentiation: s.differentiation,
    status: s.status,
    priority: s.priority,
    source: s.source,
    last_interaction_at: new Date(Date.now() - s.daysAgo * 86400_000).toISOString(),
  }));
  const { data: starts, error: stErr } = await supabase.from("startups").insert(startupRows).select();
  if (stErr) throw stErr;
  const stByName = new Map(starts!.map((s) => [s.name, s.id]));

  // Notes
  const noteRows = STARTUPS.slice(0, 6).map((s) => ({
    user_id: userId,
    startup_id: stByName.get(s.name)!,
    source: s.source,
    title: `Call notes — ${s.name}`,
    raw_text: `Met with ${s.name} (founder ${s.founder}). ${s.summary} ${s.differentiation}`,
    status: "analyzed" as const,
  }));
  await supabase.from("notes").insert(noteRows);

  // Competitors
  const compRows = Object.entries(COMPETITORS).flatMap(([name, comps]) =>
    comps.map((c) => ({ ...c, user_id: userId, startup_id: stByName.get(name)! })),
  ).filter((r) => r.startup_id);
  if (compRows.length) await supabase.from("competitors").insert(compRows);

  // Follow-ups
  const fuRows = Object.entries(FOLLOWUPS).flatMap(([name, qs]) =>
    qs.map((q) => ({ ...q, user_id: userId, startup_id: stByName.get(name)! })),
  ).filter((r) => r.startup_id);
  if (fuRows.length) await supabase.from("follow_up_questions").insert(fuRows);

  // Insights
  const insightRows = INSIGHTS.map((i) => ({
    user_id: userId,
    type: i.type,
    title: i.title,
    content: i.content,
    confidence_score: i.confidence_score,
    recommended_action: i.recommended_action,
    segment_id: i.segmentName ? segByName.get(i.segmentName) ?? null : null,
    startup_id: i.startupName ? stByName.get(i.startupName) ?? null : null,
  }));
  await supabase.from("insights").insert(insightRows);

  // Analyses (one per analyzed note)
  const analysisRows = STARTUPS.slice(0, 6).map((s) => ({
    user_id: userId,
    startup_id: stByName.get(s.name)!,
    ai_summary: s.summary,
    risk_signals: [s.differentiation.includes("weak") || s.differentiation.includes("crowded") ? "Differentiation unclear" : "Execution risk in early customer base"],
    opportunity_signals: ["Founder-market fit", "Tailwind from regulation or AI shift"],
  }));
  await supabase.from("analyses").insert(analysisRows);

  // Inbox: a couple of unprocessed notes (no startup yet) to triage
  await supabase.from("notes").insert([
    {
      user_id: userId,
      source: "granola" as const,
      title: "Intro call — NorthBeam (climate)",
      raw_text: "Met Jonas from NorthBeam. They build grid-edge battery optimization software for European utilities. Founder ex-Tesla Energy. 2 paid pilots in NL. Concerned about long sales cycles. Could fit Climate Tech segment.",
      status: "unprocessed" as const,
    },
    {
      user_id: userId,
      source: "hubspot" as const,
      title: "Inbound — RubricAI",
      raw_text: "RubricAI is a vertical AI tool for K-12 teachers to grade open-ended assignments. Bottoms-up adoption, $19/seat. Founders are 2x edtech operators. New segment for us — adjacent to Vertical Healthcare AI thesis.",
      status: "unprocessed" as const,
    },
    {
      user_id: userId,
      source: "manual" as const,
      title: "Cold inbound — Stratify",
      raw_text: "Stratify is building AI sales coaching from call recordings. Sales Automation segment is crowded. Need to assess if voice-native is enough of a wedge vs Gong incumbents.",
      status: "unprocessed" as const,
    },
  ]);

  return true;
}