import { supabase } from "@/integrations/supabase/client";

const SEGMENTS = [
  { name: "Legal AI", description: "Contract review and legal workflow automation. Incumbents target AmLaw 100; opportunity in mid-market and EU compliance.", crowdedness_score: 78, opportunity_score: 62, trend: "Crowded" },
  { name: "Sales Automation", description: "AI outbound, enrichment, and CRM augmentation. Differentiation increasingly about data quality and workflow depth.", crowdedness_score: 88, opportunity_score: 55, trend: "Hot" },
  { name: "Climate Tech", description: "Industrial energy monitoring and CSRD-driven carbon reporting. Strong tailwind from EU regulation.", crowdedness_score: 42, opportunity_score: 84, trend: "Emerging" },
  { name: "DevTools", description: "Developer observability and AI-assisted code intelligence. White-space in mid-market team workflows.", crowdedness_score: 35, opportunity_score: 78, trend: "White-space" },
  { name: "Vertical Healthcare AI", description: "AI-native workflow tools for clinics, pharma ops, and diagnostics. Long sales cycles but durable contracts.", crowdedness_score: 48, opportunity_score: 81, trend: "Emerging" },
  { name: "Finance Automation", description: "AI-native finance operations, close automation, reconciliation, and cross-system reporting for modern SaaS teams.", crowdedness_score: 58, opportunity_score: 79, trend: "Emerging" },
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
    title: "Granola transcript - MedScribe AI founder call",
    raw_text: `VC Call Transcript - MedScribe AI
Source: Granola
Company: MedScribe AI
Founder: Maya Patel
Stage: Seed
Segment: Vertical Healthcare AI

Participants:
- Investor: Rachel, Associate at Northstar Ventures
- Founder: Maya Patel, CEO of MedScribe AI

Rachel: Thanks for taking the time today, Maya. To start, can you give me the quick version of what MedScribe AI does?
Maya: Of course. MedScribe AI is an AI scribe for outpatient clinics. We listen to the doctor-patient conversation, generate structured clinical notes, and push those notes directly into the EHR. Our goal is to reduce the amount of time doctors spend on documentation after clinic hours.

Rachel: Why outpatient clinics specifically?
Maya: We started there because outpatient doctors see a very high volume of patients, but they usually don't have the same administrative support as large hospital systems. A lot of physicians spend two to three hours every evening finishing notes. That burnout problem is very real.

Rachel: What does the workflow look like for the doctor?
Maya: The doctor starts the visit, opens our app, and records the conversation with patient consent. After the visit, MedScribe generates a SOAP note, diagnosis summary, and follow-up plan. The doctor can review and edit it, then send it into the EHR. We currently support Athena and are building deeper Epic integration.

Rachel: Got it. Where are you in terms of traction?
Maya: We are live with 12 outpatient clinics. Eight are paying customers and four are in pilots. We are currently at about $42k in MRR. Usage has been strong. Doctors are saving around six hours per week on average.

Rachel: How long have the paid customers been active?
Maya: The oldest paid customer has been with us for five months. Most of the others converted in the last two months, so retention data is still early. But we haven't had any churn yet.

Rachel: What is the pricing model?
Maya: We charge per provider per month. Our average contract is around $550 per provider per month. Larger clinics get volume discounts.

Rachel: This is obviously a crowded space. How do you think about differentiation?
Maya: Yes, AI scribe is crowded. Our differentiation is workflow depth for outpatient clinics. Most products generate generic notes. We are building specialty-specific templates and deeper EHR workflows. For example, dermatology, primary care, and orthopedics all need different note structures.

Rachel: What is your background?
Maya: I was a product manager at Epic for four years, focused on clinical documentation workflows. My cofounder was an ML engineer at Nuance. We both saw how much time was wasted on documentation and how hard it is to fit generic tools into clinical workflows.

Rachel: Are you fundraising right now?
Maya: Yes. We are raising a $2M seed round. We have about $600k soft-circled from angels and healthcare operators. We want to use the round to expand EHR integrations and hire two ML engineers.

Rachel: What milestones would you want to hit with that round?
Maya: We want to reach $150k MRR, prove six-month retention, and expand from 12 clinics to 50 clinics. We also want to show that our documentation quality is specialty-specific, not just generic transcription.

Rachel: What should we pay attention to if we continue diligence?
Maya: Retention and EHR integration depth. Those are the two biggest things. If doctors keep using us after the initial novelty period, and if we reduce workflow friction, we think this becomes a durable product.

Rachel: That makes sense. What would be the best next step?
Maya: I can send over our clinic cohort data and a few anonymized before-and-after note examples. We should have updated pilot conversion numbers next week.

Rachel: Great. Let's reconnect next week after you have that pilot data.`,
  },
  {
    source: "granola" as const,
    title: "Granola transcript - FinOps Copilot founder call",
    raw_text: `VC Call Transcript - FinOps Copilot
Source: Granola
Company: FinOps Copilot
Founder: Elena Rossi
Stage: Seed
Segment: Finance Automation

Participants:
- Investor: Rachel, Associate at Northstar Ventures
- Founder: Elena Rossi, CEO of FinOps Copilot

Rachel: Elena, thanks for joining. Can you give me the overview of FinOps Copilot?
Elena: Absolutely. FinOps Copilot is an AI finance operations assistant for SaaS companies. We automate repetitive finance workflows like invoice follow-up, revenue reconciliation, expense categorization, and monthly reporting.

Rachel: Who is the main user?
Elena: Our main user is the finance lead at a 50 to 500 person SaaS company. Usually they have a small finance team, maybe one controller and one analyst, but they are dealing with a growing number of tools: Stripe, QuickBooks, NetSuite, Ramp, Brex, and internal spreadsheets.

Rachel: What is the wedge?
Elena: Our wedge is revenue reconciliation. SaaS companies often have payments in Stripe, contracts in Salesforce, invoices in QuickBooks, and manual spreadsheets tying everything together. We use AI agents to reconcile mismatches and flag exceptions.

Rachel: How painful is that problem?
Elena: Very painful. One of our customers was spending three full days every month reconciling revenue before close. With FinOps Copilot, that went down to about four hours.

Rachel: Where are you on traction?
Elena: We are at $55k MRR across 14 paying customers. Most are Series A to Series C SaaS companies. Our average ACV is around $48k, and sales cycles are about 30 to 45 days.

Rachel: That's strong. How much of the workflow is actually automated?
Elena: Today, we automate about 60 to 70 percent of the reconciliation workflow. For anything uncertain, the system flags the issue and asks for human approval. We don't want to be fully autonomous where accuracy matters.

Rachel: What integrations do you support?
Elena: Stripe, QuickBooks, NetSuite, Salesforce, Ramp, and Brex. We started with Stripe and QuickBooks, but NetSuite has become more important for larger customers.

Rachel: How do you compete with existing finance automation tools?
Elena: Most tools are system-of-record focused. We are not trying to replace NetSuite or QuickBooks. We sit on top of them as an AI operations layer. The key difference is that we can reason across multiple systems and explain why numbers don't match.

Rachel: What is your background?
Elena: I was head of finance at a Series B SaaS company before starting FinOps Copilot. My cofounder built data infrastructure at Plaid. We lived this problem ourselves.

Rachel: Are you currently raising?
Elena: Yes. We are raising a $2.5M seed. We already have $1.1M committed from operators and one micro fund. We are looking for a lead who understands vertical workflow software.

Rachel: What are the main risks?
Elena: The biggest risk is scope creep. Finance workflows can become very broad. We are trying to stay focused on revenue reconciliation and close workflows before expanding.

Rachel: What would you use the round for?
Elena: Engineering and go-to-market. We need to deepen integrations and hire our first sales lead. We are seeing more inbound than we can handle.

Rachel: What should we follow up on?
Elena: I can send customer references, a product demo recording, and our retention cohorts. We have one larger customer expanding from $40k to $95k ACV next month.

Rachel: Great. This feels like something we should discuss in our partner meeting.`,
  },
  {
    source: "granola" as const,
    title: "Granola transcript - EvalStack founder call",
    raw_text: `VC Call Transcript - EvalStack
Source: Granola
Company: EvalStack
Founder: Tom Becker
Stage: Pre-seed
Segment: DevTools

Participants:
- Investor: Rachel, Associate at Northstar Ventures
- Founder: Tom Becker, Founder of EvalStack

Rachel: Tom, good to meet you. Can you start with what EvalStack does?
Tom: Sure. EvalStack is an open-source evaluation framework for teams building LLM applications. We help developers test prompts, agents, retrieval pipelines, and model outputs before they ship to production.

Rachel: What problem are you solving?
Tom: A lot of teams are building AI features, but they don't know whether the system is getting better or worse. They change a prompt or switch models and rely on vibes. EvalStack gives them structured evals, regression tests, and production monitoring.

Rachel: Who uses it today?
Tom: Mostly AI engineers and product engineers at startups. We are seeing usage from companies building customer support agents, internal copilots, and RAG-based search tools.

Rachel: Is it open source?
Tom: Yes. The core framework is open source. We launched six weeks ago and have around 1.8k GitHub stars. We also have about 350 active weekly users based on package downloads and telemetry from opt-in users.

Rachel: Do you have revenue?
Tom: Not yet. We are pre-revenue. We are testing a hosted version with five design partners. The hosted product includes dashboards, team collaboration, eval history, and production monitoring.

Rachel: What do people use instead today?
Tom: Mostly internal scripts, spreadsheets, or lightweight prompt testing tools. Larger companies build internal eval platforms, but most startups don't have the time.

Rachel: Why will this become a company and not just a library?
Tom: The library is the wedge. The real value is in the hosted workflow: versioning evals, comparing models, monitoring drift, and sharing results across engineering and product teams. Once evals become part of CI/CD for AI apps, the system of record matters.

Rachel: What is your background?
Tom: I was an ML infrastructure engineer at Datadog. Before that I worked on testing infrastructure at a developer tools company. My cofounder previously worked on LLM deployment tooling at an AI startup.

Rachel: Are you raising right now?
Tom: Not immediately. We may raise a pre-seed in the next three to four months. Right now we want to prove that open-source usage converts into hosted demand.

Rachel: What would make you decide to raise?
Tom: If we get 20 design partners using the hosted product and at least five willing to pay, we would raise. We want to avoid raising before we understand the buyer.

Rachel: Who is the buyer?
Tom: That is still being tested. In smaller startups, it is usually the CTO or head of engineering. In larger companies, it might be AI platform teams.

Rachel: What are the main risks?
Tom: Monetization is the biggest one. Developer love does not always convert into budget. Also, the AI evaluation space is moving very quickly.

Rachel: What should we do next?
Tom: I can share our GitHub repo, usage metrics, and a list of design partner profiles. I'd also love feedback on whether investors are seeing evaluation become a board-level issue.

Rachel: Definitely. I'd like to stay close, especially before you start fundraising.`,
  },
  {
    source: "granola" as const,
    title: "Granola transcript - ClauseIQ founder call",
    raw_text: `VC Call Transcript - ClauseIQ
Source: Granola
Company: ClauseIQ
Founder: Marcus Lee
Stage: Seed
Segment: Legal AI

Participants:
- Investor: Rachel, Associate at Northstar Ventures
- Founder: Marcus Lee, CEO of ClauseIQ

Rachel: Marcus, thanks for taking the call. What is ClauseIQ?
Marcus: ClauseIQ is an AI legal research assistant for boutique law firms. We help lawyers find relevant case law, summarize legal arguments, and draft research memos faster.

Rachel: Why focus on boutique firms?
Marcus: Large law firms already have expensive research tools and internal knowledge teams. Boutique firms have the same research needs but much smaller teams and tighter budgets. They need speed and leverage.

Rachel: What is the main workflow?
Marcus: A lawyer enters a legal question, uploads any relevant case files or documents, and ClauseIQ returns relevant cases, summaries, citations, and suggested arguments. The lawyer can then turn that into a research memo.

Rachel: How do you handle accuracy? Legal research has a high bar.
Marcus: We don't allow unsupported answers. Every generated claim needs to link back to source material. We also show confidence levels and separate verified case references from AI-generated summaries.

Rachel: Are users paying today?
Marcus: Yes. We are at about $25k MRR across 18 boutique law firms. Most customers are paying between $800 and $2,000 per month depending on seat count.

Rachel: How did you acquire those customers?
Marcus: Mostly founder-led sales. I was a lawyer before starting the company, so I had a network of small firm partners. We also get referrals because the legal community is fairly tight.

Rachel: What is your retention like?
Marcus: Still early. Our first paying cohort has been active for four months. Usage is strongest among litigation teams. Transactional lawyers use it less frequently.

Rachel: How are you different from larger legal tech platforms?
Marcus: We are not trying to replace Westlaw or Lexis. We are building the AI workflow layer on top of legal research. Our customers still use primary research databases, but ClauseIQ helps them move from question to memo faster.

Rachel: What is your team background?
Marcus: I practiced litigation for five years. My cofounder was an NLP researcher at a legal tech company. We both felt the first generation of legal AI tools was too broad and not workflow-specific enough.

Rachel: Are you fundraising?
Marcus: Yes. We are raising a $2.8M seed round. We have $900k committed from angels and legal tech operators. We want to hire two engineers and one customer success lead.

Rachel: What are your biggest concerns right now?
Marcus: Differentiation and trust. Legal AI is crowded, and lawyers are skeptical. We need to keep proving accuracy and workflow value.

Rachel: What would you want from an investor besides capital?
Marcus: Help with positioning and introductions to legal operators. Also, we want a board member who understands vertical SaaS and trust-heavy markets.

Rachel: Makes sense. Can you send over customer references and usage data?
Marcus: Yes, I can send anonymized usage cohorts and two customer references this week.

Rachel: Great. I'll compare this with a few other legal AI companies we've seen and follow up.`,
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
