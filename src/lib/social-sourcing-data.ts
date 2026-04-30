// Mock social sourcing data for DealMap AI
// Demo social graph + CRM-derived relationship signals. No external scraping.

export type PersonType = "founder" | "angel" | "scout" | "portfolio_founder" | "investor" | "operator";
export type OrgType = "startup" | "micro_fund" | "accelerator" | "vc_firm";
export type SignalType =
  | "Angel activity"
  | "Micro fund activity"
  | "Accelerator / climate investor activity"
  | "Scout referral"
  | "Portfolio founder intro";
export type SignalStrength = "Low" | "Medium" | "High";
export type SignalSource = "CRM notes + demo social graph" | "demo social graph" | "Mock investor network";

export interface Person {
  id: string;
  name: string;
  role: string;
  organization: string;
  type: PersonType;
}

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
}

export interface Relationship {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type:
    | "introduced by"
    | "invested in"
    | "advised by"
    | "connected to"
    | "referred by"
    | "recently interacted with";
  strength: SignalStrength;
  last_interaction_at: string;
}

export interface SocialSignal {
  id: string;
  startup_id: string;
  startup_name: string;
  founder_name: string;
  signal_type: SignalType;
  signal_source: SignalSource;
  signal_strength: SignalStrength;
  detected_at: string; // ISO
  why_it_matters: string;
  suggested_action: string;
  badges: SocialBadge[];
  social_signal_score: number;
}

export type SocialBadge =
  | "Rising signal"
  | "Warm intro available"
  | "Angel activity"
  | "Micro fund activity"
  | "Scout referral"
  | "Climate investor activity"
  | "High signal";

export interface IntroPath {
  id: string;
  startup_id: string;
  startup_name: string;
  path_nodes: string[]; // human-readable chain
  path_strength: SignalStrength;
  relationship_distance: number; // hops
  suggested_intro_message: string;
}

export interface RisingFounderAlert {
  startup_id: string;
  startup_name: string;
  segment: string;
  activity_increase_pct: number;
  recent_signals: string[];
  recommended_action: string;
}

// ── Organizations ─────────────────────────────────────────────────────────
export const ORGS: Organization[] = [
  { id: "org_dealmap", name: "DealMap VC", type: "vc_firm" },
  { id: "org_lexflow", name: "LexFlow", type: "startup" },
  { id: "org_pitchpilot", name: "PitchPilot", type: "startup" },
  { id: "org_carbongrid", name: "CarbonGrid", type: "startup" },
  { id: "org_seedbridge", name: "SeedBridge Capital", type: "micro_fund" },
  { id: "org_greenseed", name: "GreenSeed Ventures", type: "micro_fund" },
  { id: "org_climateaccel", name: "Climate Accelerator", type: "accelerator" },
];

// ── People ────────────────────────────────────────────────────────────────
export const PEOPLE: Person[] = [
  { id: "p_anna", name: "Anna Müller", role: "Founder & CEO", organization: "LexFlow", type: "founder" },
  { id: "p_daniel", name: "Daniel Chen", role: "Founder & CEO", organization: "PitchPilot", type: "founder" },
  { id: "p_sophie", name: "Sophie Weber", role: "Founder & CEO", organization: "CarbonGrid", type: "founder" },
  { id: "p_legaltech_angel", name: "LegalTech Angel", role: "Angel investor", organization: "Independent", type: "angel" },
  { id: "p_saas_angel", name: "SaaS Angel", role: "Angel investor", organization: "Independent", type: "angel" },
  { id: "p_climate_angel", name: "Climate Operator Angel", role: "Operator angel", organization: "Independent", type: "angel" },
  { id: "p_portfolio_founder", name: "Marcus Lange", role: "Portfolio founder", organization: "DealMap VC portfolio", type: "portfolio_founder" },
  { id: "p_scout", name: "Lena Park", role: "Scout", organization: "DealMap VC scout network", type: "scout" },
];

// ── Relationships ─────────────────────────────────────────────────────────
const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400e3).toISOString();

export const RELATIONSHIPS: Relationship[] = [
  { id: "r1", source_id: "org_dealmap", target_id: "p_portfolio_founder", relationship_type: "invested in", strength: "High", last_interaction_at: daysAgo(40) },
  { id: "r2", source_id: "p_portfolio_founder", target_id: "p_legaltech_angel", relationship_type: "connected to", strength: "High", last_interaction_at: daysAgo(12) },
  { id: "r3", source_id: "p_legaltech_angel", target_id: "p_anna", relationship_type: "advised by", strength: "High", last_interaction_at: daysAgo(2) },
  { id: "r4", source_id: "p_anna", target_id: "org_lexflow", relationship_type: "invested in", strength: "High", last_interaction_at: daysAgo(2) },
  { id: "r5", source_id: "p_legaltech_angel", target_id: "org_seedbridge", relationship_type: "connected to", strength: "Medium", last_interaction_at: daysAgo(8) },
  { id: "r6", source_id: "org_seedbridge", target_id: "p_anna", relationship_type: "recently interacted with", strength: "High", last_interaction_at: daysAgo(3) },
  { id: "r7", source_id: "p_saas_angel", target_id: "p_daniel", relationship_type: "advised by", strength: "Medium", last_interaction_at: daysAgo(7) },
  { id: "r8", source_id: "p_daniel", target_id: "org_pitchpilot", relationship_type: "invested in", strength: "High", last_interaction_at: daysAgo(7) },
  { id: "r9", source_id: "org_climateaccel", target_id: "p_sophie", relationship_type: "introduced by", strength: "High", last_interaction_at: daysAgo(1) },
  { id: "r10", source_id: "p_sophie", target_id: "org_carbongrid", relationship_type: "invested in", strength: "High", last_interaction_at: daysAgo(1) },
  { id: "r11", source_id: "org_climateaccel", target_id: "org_greenseed", relationship_type: "connected to", strength: "Medium", last_interaction_at: daysAgo(14) },
  { id: "r12", source_id: "org_greenseed", target_id: "p_sophie", relationship_type: "recently interacted with", strength: "High", last_interaction_at: daysAgo(2) },
  { id: "r13", source_id: "p_scout", target_id: "p_daniel", relationship_type: "referred by", strength: "Medium", last_interaction_at: daysAgo(10) },
];

// ── Signals ───────────────────────────────────────────────────────────────
export const SIGNALS: SocialSignal[] = [
  {
    id: "sig_lexflow",
    startup_id: "org_lexflow",
    startup_name: "LexFlow",
    founder_name: "Anna Müller",
    signal_type: "Angel activity",
    signal_source: "CRM notes + demo social graph",
    signal_strength: "High",
    detected_at: daysAgo(2),
    why_it_matters:
      "Founder recently appeared in conversations with two legal-tech angels and one micro fund.",
    suggested_action: "Prioritize follow-up before the round becomes competitive.",
    badges: ["Rising signal", "Warm intro available", "Angel activity"],
    social_signal_score: 86,
  },
  {
    id: "sig_pitchpilot",
    startup_id: "org_pitchpilot",
    startup_name: "PitchPilot",
    founder_name: "Daniel Chen",
    signal_type: "Micro fund activity",
    signal_source: "demo social graph",
    signal_strength: "Medium",
    detected_at: daysAgo(7),
    why_it_matters:
      "Founder is connected to early-stage SaaS investors and sales-tech operators.",
    suggested_action: "Ask for intro through shared SaaS angel network.",
    badges: ["Micro fund activity", "Scout referral"],
    social_signal_score: 71,
  },
  {
    id: "sig_carbongrid",
    startup_id: "org_carbongrid",
    startup_name: "CarbonGrid",
    founder_name: "Sophie Weber",
    signal_type: "Accelerator / climate investor activity",
    signal_source: "demo social graph",
    signal_strength: "High",
    detected_at: daysAgo(1),
    why_it_matters:
      "Founder is receiving attention from climate-focused micro funds and industrial operators.",
    suggested_action: "Schedule partner review.",
    badges: ["Climate investor activity", "High signal", "Warm intro available"],
    social_signal_score: 83,
  },
];

// ── Intro paths ───────────────────────────────────────────────────────────
export const INTRO_PATHS: IntroPath[] = [
  {
    id: "ip_lexflow",
    startup_id: "org_lexflow",
    startup_name: "LexFlow",
    path_nodes: ["DealMap VC", "Portfolio Founder (Marcus Lange)", "LegalTech Angel", "Anna Müller"],
    path_strength: "High",
    relationship_distance: 3,
    suggested_intro_message:
      "Can you introduce us to Anna? We're interested in learning more about LexFlow's EU legal workflow wedge.",
  },
  {
    id: "ip_pitchpilot",
    startup_id: "org_pitchpilot",
    startup_name: "PitchPilot",
    path_nodes: ["DealMap VC", "Scout (Lena Park)", "SaaS Angel", "Daniel Chen"],
    path_strength: "Medium",
    relationship_distance: 3,
    suggested_intro_message:
      "Lena — would love a warm intro to Daniel at PitchPilot. We're tracking the AI sales-coaching wedge.",
  },
  {
    id: "ip_carbongrid",
    startup_id: "org_carbongrid",
    startup_name: "CarbonGrid",
    path_nodes: ["DealMap VC", "Climate Accelerator", "GreenSeed Ventures", "Sophie Weber"],
    path_strength: "High",
    relationship_distance: 3,
    suggested_intro_message:
      "Hi — could you connect us with Sophie at CarbonGrid? We'd like to discuss her industrial carbon monitoring wedge.",
  },
];

// ── Rising founder alerts ─────────────────────────────────────────────────
export const RISING_ALERTS: RisingFounderAlert[] = [
  {
    startup_id: "org_lexflow",
    startup_name: "LexFlow",
    segment: "Legal AI",
    activity_increase_pct: 42,
    recent_signals: [
      "Mentioned by 2 angels",
      "Connected to 1 micro fund",
      "Added to 3 CRM watchlists",
    ],
    recommended_action: "Move to high-priority follow-up.",
  },
  {
    startup_id: "org_carbongrid",
    startup_name: "CarbonGrid",
    segment: "Climate / Industrial SaaS",
    activity_increase_pct: 31,
    recent_signals: [
      "Intro by Climate Accelerator",
      "Recent interaction with GreenSeed Ventures",
      "Operator angel inbound",
    ],
    recommended_action: "Schedule partner review this week.",
  },
  {
    startup_id: "org_pitchpilot",
    startup_name: "PitchPilot",
    segment: "Sales AI",
    activity_increase_pct: 18,
    recent_signals: [
      "Scout referral",
      "SaaS angel advisor signal",
    ],
    recommended_action: "Request warm intro through scout network.",
  },
];

// ── Top metrics ───────────────────────────────────────────────────────────
export const SOCIAL_METRICS = {
  new_founder_signals: 18,
  angel_connections_week: 7,
  micro_fund_interactions: 5,
  warm_intro_paths: 4,
  rising_network_startups: 3,
};

// ── Lookup helpers ────────────────────────────────────────────────────────
export function findSignalByStartupName(name?: string | null): SocialSignal | undefined {
  if (!name) return undefined;
  const n = name.toLowerCase();
  return SIGNALS.find((s) => s.startup_name.toLowerCase() === n);
}

export function findIntroPathByStartupName(name?: string | null): IntroPath | undefined {
  if (!name) return undefined;
  const n = name.toLowerCase();
  return INTRO_PATHS.find((p) => p.startup_name.toLowerCase() === n);
}

// ── Graph node positions (for the SVG visualization) ──────────────────────
export interface GraphNode {
  id: string;
  label: string;
  type: PersonType | OrgType;
  x: number; // 0..100
  y: number; // 0..100
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
  strength: SignalStrength;
}

// Hand-laid layout for clarity (left → right flow from VC firm to startups)
export const GRAPH_NODES: GraphNode[] = [
  { id: "org_dealmap", label: "DealMap VC", type: "vc_firm", x: 8, y: 50 },

  { id: "p_portfolio_founder", label: "Marcus Lange (Portfolio)", type: "portfolio_founder", x: 28, y: 22 },
  { id: "p_scout", label: "Lena Park (Scout)", type: "scout", x: 28, y: 78 },

  { id: "p_legaltech_angel", label: "LegalTech Angel", type: "angel", x: 50, y: 12 },
  { id: "p_saas_angel", label: "SaaS Angel", type: "angel", x: 50, y: 60 },
  { id: "org_climateaccel", label: "Climate Accelerator", type: "accelerator", x: 50, y: 88 },

  { id: "org_seedbridge", label: "SeedBridge Capital", type: "micro_fund", x: 70, y: 28 },
  { id: "org_greenseed", label: "GreenSeed Ventures", type: "micro_fund", x: 70, y: 78 },

  { id: "p_anna", label: "Anna Müller", type: "founder", x: 86, y: 18 },
  { id: "p_daniel", label: "Daniel Chen", type: "founder", x: 86, y: 50 },
  { id: "p_sophie", label: "Sophie Weber", type: "founder", x: 86, y: 86 },

  { id: "org_lexflow", label: "LexFlow", type: "startup", x: 96, y: 8 },
  { id: "org_pitchpilot", label: "PitchPilot", type: "startup", x: 96, y: 50 },
  { id: "org_carbongrid", label: "CarbonGrid", type: "startup", x: 96, y: 96 },
];

export const GRAPH_EDGES: GraphEdge[] = [
  { from: "org_dealmap", to: "p_portfolio_founder", label: "invested in", strength: "High" },
  { from: "org_dealmap", to: "p_scout", label: "scout network", strength: "Medium" },
  { from: "p_portfolio_founder", to: "p_legaltech_angel", label: "connected to", strength: "High" },
  { from: "p_legaltech_angel", to: "p_anna", label: "advised by", strength: "High" },
  { from: "p_legaltech_angel", to: "org_seedbridge", label: "connected to", strength: "Medium" },
  { from: "org_seedbridge", to: "p_anna", label: "recently interacted", strength: "High" },
  { from: "p_anna", to: "org_lexflow", label: "founder of", strength: "High" },
  { from: "p_scout", to: "p_saas_angel", label: "connected to", strength: "Medium" },
  { from: "p_saas_angel", to: "p_daniel", label: "advised by", strength: "Medium" },
  { from: "p_daniel", to: "org_pitchpilot", label: "founder of", strength: "High" },
  { from: "org_climateaccel", to: "p_sophie", label: "introduced by", strength: "High" },
  { from: "org_climateaccel", to: "org_greenseed", label: "connected to", strength: "Medium" },
  { from: "org_greenseed", to: "p_sophie", label: "recently interacted", strength: "High" },
  { from: "p_sophie", to: "org_carbongrid", label: "founder of", strength: "High" },
];

export const NODE_STYLE: Record<string, { color: string; ring: string; icon: string }> = {
  vc_firm:           { color: "hsl(var(--primary))",      ring: "ring-primary/40",      icon: "🏛" },
  portfolio_founder: { color: "hsl(var(--accent))",       ring: "ring-accent/40",       icon: "★" },
  scout:             { color: "hsl(var(--teal))",         ring: "ring-teal/40",         icon: "🔭" },
  angel:             { color: "hsl(var(--violet))",       ring: "ring-violet/40",       icon: "👼" },
  micro_fund:        { color: "hsl(var(--warning))",      ring: "ring-warning/40",      icon: "💼" },
  accelerator:       { color: "hsl(var(--success))",      ring: "ring-success/40",      icon: "🚀" },
  founder:           { color: "hsl(var(--foreground))",   ring: "ring-foreground/30",   icon: "🧑‍💼" },
  startup:           { color: "hsl(var(--accent))",       ring: "ring-accent/50",       icon: "▣" },
  investor:          { color: "hsl(var(--violet))",       ring: "ring-violet/40",       icon: "💰" },
  operator:          { color: "hsl(var(--teal))",         ring: "ring-teal/40",         icon: "⚙" },
};