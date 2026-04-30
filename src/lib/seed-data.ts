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

export const GRANOLA_DEMO_TRANSCRIPTS = [
  {
    source: "granola" as const,
    title: "Granola transcript - NorthBeam founder call",
    raw_text: `NorthBeam founder call
Source: Granola
Company: NorthBeam
Founder: Jonas Richter
Stage: Seed
Segment: Climate Tech

Alex: Thanks for joining. Give us the crisp version of NorthBeam.
Jonas: NorthBeam builds grid-edge battery optimization software for European utilities and large commercial storage operators. We predict congestion windows, dispatch batteries automatically, and produce audit-ready reports for grid operators.

Alex: What's live today?
Jonas: Two paid pilots in the Netherlands, one unpaid pilot with a German municipal utility, and EUR 18k MRR from the first commercial deployment. The early ROI is a 7-11% uplift in battery revenue and fewer manual dispatch overrides.

Maya: Why now?
Jonas: More renewables are creating grid volatility, utilities are under pressure to defer capex, and the EU flexibility market is finally opening. The software budget is moving from innovation teams into grid operations.

Alex: Who do you compete with?
Jonas: FlexPower and KrakenFlex show up. They are broader VPP platforms. Our wedge is grid-edge optimization for utilities that already own or control storage assets.

Maya: What worries us?
Jonas: Sales cycles are long. We need to prove the wedge is software budget, not a consulting motion. Also integration with utility SCADA systems can slow deployment.

Alex: Next step?
Jonas: We'd like introductions to two DACH utilities and feedback on whether we should raise EUR 2.5m now or after the German pilot converts.`,
  },
  {
    source: "granola" as const,
    title: "Granola transcript - RubricAI intro call",
    raw_text: `RubricAI intro call
Source: Granola
Company: RubricAI
Founder: Maya Desai
Stage: Pre-seed
Segment: Vertical AI

Alex: What are you building?
Maya: RubricAI helps K-12 teachers grade open-ended assignments with AI. We generate rubric-aligned feedback, show evidence for each score, and let teachers edit before posting to Google Classroom.

Maya: We have 420 teachers using the free product, 38 paying teachers at $19 per month, and two school districts evaluating a paid pilot. The founders previously scaled assessment products at an edtech company.

Alex: What is the wedge?
Maya: We are not trying to be a full LMS. We start with English and social studies writing assignments where teachers spend 5-7 hours a week grading. Our model is tuned on teacher-edited feedback, not generic essay scoring.

Alex: Market concern?
Maya: Procurement can be slow, student privacy requirements are real, and Google or Canvas could bundle similar features. We need to show bottoms-up teacher adoption can convert into district contracts.

Maya: Next call should dig into privacy architecture, teacher retention, and whether we can own the workflow before incumbents move.`,
  },
  {
    source: "granola" as const,
    title: "Granola transcript - Stratify partner screen",
    raw_text: `Stratify partner screen
Source: Granola
Company: Stratify
Founder: Lina Hofmann
Stage: Seed
Segment: Sales Automation

Alex: Summarize Stratify.
Lina: Stratify analyzes sales call recordings and turns them into coaching plans for frontline managers. We plug into Gong and Zoom, identify missed discovery moments, and generate manager-ready coaching snippets.

Alex: Traction?
Lina: Six design partners, two converted to paid at $4k ACV, and 11 more teams in trial. The best users are mid-market sales managers with 8-15 reps.

Maya: Sales automation is very crowded. Why does this win?
Lina: Gong is system-of-record, not coaching workflow. We focus on manager behavior change, weekly coaching rituals, and rep-specific improvement plans.

Alex: Risks?
Maya: This may be a feature inside Gong or Chorus. ACVs look low for the sales motion. We need proof that managers come back weekly and that the coaching loop changes rep performance.

Lina: Next step is to share retention cohorts and manager engagement by team size.`,
  },
] satisfies Array<{ source: "granola"; title: string; raw_text: string }>;

export async function ensureGranolaDemoInbox(userId: string) {
  const titles = GRANOLA_DEMO_TRANSCRIPTS.map((n) => n.title);
  const { data: existing, error: existingErr } = await supabase
    .from("notes")
    .select("title")
    .eq("user_id", userId)
    .in("title", titles);
  if (existingErr) throw existingErr;

  const existingTitles = new Set((existing ?? []).map((n) => n.title));
  const missing = GRANOLA_DEMO_TRANSCRIPTS.filter((n) => !existingTitles.has(n.title));
  if (!missing.length) return 0;

  const { error } = await supabase.from("notes").insert(
    missing.map((n) => ({
      user_id: userId,
      source: n.source,
      title: n.title,
      raw_text: n.raw_text,
      status: "unprocessed" as const,
    })),
  );
  if (error) throw error;
  return missing.length;
}

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

  // Inbox: Granola-style VC call transcripts to triage during the demo.
  await ensureGranolaDemoInbox(userId);

  return true;
}
