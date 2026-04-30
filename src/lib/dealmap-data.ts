export type Priority = "High" | "Medium" | "Low";
export type RiskLevel = "Low" | "Moderate" | "High";

export interface CRMRecord {
  startup: string;
  founder: string;
  segment: string;
  stage: string;
  lastMeeting: string;
  status: string;
  priority: Priority;
}

export interface Integration {
  name: string;
  description: string;
  status: "Connected" | "Ready";
  lastSync: string;
  records: number;
  accent: "accent" | "violet" | "teal";
}

export interface MarketSegment {
  name: string;
  summary: string;
  startups: string[];
  trend: "Hot" | "Crowded" | "Emerging" | "White-space";
  accent: "accent" | "violet" | "teal" | "warning";
}

export interface StartupProfile {
  name: string;
  segment: string;
  stage: string;
  customer: string;
  summary: string;
  differentiation: string;
  similar: string[];
  risk: RiskLevel;
  followUp: Priority;
}

export interface SimilarMemory {
  startup: string;
  insight: string;
  references: string[];
}

export const SAMPLE_NOTES = `Met with LexFlow, a pre-seed startup building an AI contract review assistant for small and mid-sized law firms in Europe. They position themselves as more affordable and workflow-focused than Harvey. Currently have 3 pilots in Germany, mostly unpaid. Main concern is whether the market is too crowded and how they will access legal document data.

Also reviewed PitchPilot, a seed-stage startup building AI outbound automation for B2B sales teams. Similar to Clay and Apollo, but they claim better personalization using CRM context. Strong founder-market fit, but differentiation may be weak.

CarbonGrid is building monitoring software for industrial energy usage and carbon reporting. They target mid-market manufacturing companies. Could fit climate tech and industrial SaaS. Need to understand whether this is more of a compliance tool or operational efficiency platform.`;

export const INTEGRATIONS: Integration[] = [
  {
    name: "HubSpot CRM",
    description: "Pipeline, contacts, and deal stages",
    status: "Connected",
    lastSync: "Synced 4 min ago",
    records: 128,
    accent: "accent",
  },
  {
    name: "Granola Notes",
    description: "Meeting transcripts and call summaries",
    status: "Connected",
    lastSync: "Synced 12 min ago",
    records: 47,
    accent: "violet",
  },
  {
    name: "Manual Notes",
    description: "Paste founder calls and partner reviews",
    status: "Ready",
    lastSync: "Awaiting input",
    records: 0,
    accent: "teal",
  },
];

export const CRM_RECORDS: CRMRecord[] = [
  {
    startup: "LexFlow",
    founder: "Anna Müller",
    segment: "Legal AI",
    stage: "Pre-seed",
    lastMeeting: "2 days ago",
    status: "First call completed",
    priority: "High",
  },
  {
    startup: "PitchPilot",
    founder: "Daniel Chen",
    segment: "Sales AI",
    stage: "Seed",
    lastMeeting: "1 week ago",
    status: "Follow-up needed",
    priority: "Medium",
  },
  {
    startup: "CarbonGrid",
    founder: "Sophie Weber",
    segment: "Climate Tech",
    stage: "Seed",
    lastMeeting: "Yesterday",
    status: "Partner review",
    priority: "High",
  },
  {
    startup: "DevLens",
    founder: "Max Klein",
    segment: "DevTools",
    stage: "Pre-seed",
    lastMeeting: "3 days ago",
    status: "Researching",
    priority: "Medium",
  },
];

export const MARKET_SEGMENTS: MarketSegment[] = [
  {
    name: "Legal AI",
    summary:
      "Contract review and legal workflow automation. Incumbents target AmLaw 100; opportunity in mid-market and EU compliance.",
    startups: ["LexFlow", "Harvey*", "Spellbook*", "Robin AI*"],
    trend: "Crowded",
    accent: "accent",
  },
  {
    name: "Sales Automation",
    summary:
      "AI outbound, enrichment, and CRM augmentation. Differentiation increasingly about data quality and workflow depth.",
    startups: ["PitchPilot", "Clay*", "Apollo*", "Common Room*"],
    trend: "Hot",
    accent: "violet",
  },
  {
    name: "Climate Tech",
    summary:
      "Industrial energy monitoring and CSRD-driven carbon reporting. Strong tailwind from EU regulation.",
    startups: ["CarbonGrid", "Watershed*", "Sweep*"],
    trend: "Emerging",
    accent: "teal",
  },
  {
    name: "DevTools",
    summary:
      "Developer observability and AI-assisted code intelligence. White-space in mid-market team workflows.",
    startups: ["DevLens", "Sentry*", "Linear*"],
    trend: "White-space",
    accent: "warning",
  },
];

export const STARTUP_PROFILES: StartupProfile[] = [
  {
    name: "LexFlow",
    segment: "Legal AI",
    stage: "Pre-seed",
    customer: "Small & mid-sized EU law firms",
    summary:
      "AI contract review assistant tuned for European civil-law jurisdictions and SMB workflows.",
    differentiation:
      "Workflow-first UX and pricing 5–8x below Harvey; native German + French legal corpora.",
    similar: ["Harvey", "Spellbook", "Robin AI"],
    risk: "Moderate",
    followUp: "High",
  },
  {
    name: "PitchPilot",
    segment: "Sales Automation",
    stage: "Seed",
    customer: "B2B sales teams (50–500 reps)",
    summary:
      "AI outbound engine that personalizes sequences using live CRM signals and intent data.",
    differentiation:
      "Tighter CRM-native loop than Clay; weaker moat — mostly orchestration on top of OpenAI.",
    similar: ["Clay", "Apollo", "Outreach"],
    risk: "High",
    followUp: "Medium",
  },
  {
    name: "CarbonGrid",
    segment: "Climate Tech",
    stage: "Seed",
    customer: "Mid-market industrial manufacturers",
    summary:
      "Real-time energy and emissions monitoring with CSRD-ready reporting.",
    differentiation:
      "Sits between operational efficiency and compliance — needs sharper positioning.",
    similar: ["Watershed", "Sweep", "Persefoni"],
    risk: "Moderate",
    followUp: "High",
  },
  {
    name: "DevLens",
    segment: "DevTools",
    stage: "Pre-seed",
    customer: "Engineering teams of 20–200",
    summary:
      "Code intelligence layer that maps service ownership and change-risk across monorepos.",
    differentiation:
      "Underexplored intersection of internal-dev-platform and incident analytics.",
    similar: ["Sentry", "Swarmia", "LinearB"],
    risk: "Low",
    followUp: "Medium",
  },
];

export const SIMILAR_MEMORY: SimilarMemory[] = [
  {
    startup: "LexFlow",
    insight:
      "Similar to Harvey, but targets smaller law firms and focuses more on workflow automation than research.",
    references: ["Harvey", "Spellbook"],
  },
  {
    startup: "PitchPilot",
    insight:
      "Resembles Clay and Apollo, but focuses on investor and partnership outreach instead of pure sales teams.",
    references: ["Clay", "Apollo"],
  },
  {
    startup: "CarbonGrid",
    insight:
      "Closest to Watershed in narrative, but operates one layer deeper at the industrial sensor / SCADA level.",
    references: ["Watershed", "Sweep"],
  },
  {
    startup: "DevLens",
    insight:
      "Echoes early Swarmia, with a sharper focus on service ownership graphs rather than DORA metrics.",
    references: ["Swarmia", "LinearB"],
  },
];

export const INSIGHTS = {
  trend:
    "AI vertical SaaS continues to consolidate around workflow depth and proprietary data access. EU-native plays gain an edge as CSRD and AI Act compliance accelerate.",
  crowded: ["Legal AI (US-focused)", "AI SDR / outbound automation", "General-purpose AI copilots"],
  whitespace: [
    "Mid-market legal tech in non-English EU jurisdictions",
    "Service-ownership graphs for engineering teams",
    "CSRD-compliant industrial emissions monitoring",
  ],
  missingCompetitors: [
    "Robin AI (Legal AI — UK)",
    "Common Room (Sales — community-led)",
    "Persefoni (Carbon accounting — enterprise)",
    "Swarmia (DevTools — engineering analytics)",
  ],
  followUps: [
    "LexFlow: How will you access proprietary legal corpora at scale, and what's the path from unpaid pilots to paid contracts?",
    "PitchPilot: What is the defensible moat beyond GPT orchestration, and what's net revenue retention on the first 10 paying customers?",
    "CarbonGrid: Is the wedge compliance reporting or operational efficiency? Which buyer signs the first $100k contract?",
    "DevLens: What's the wedge product vs. Sentry/Swarmia, and which customer profile converts fastest?",
  ],
};