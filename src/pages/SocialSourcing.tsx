import { Link } from "react-router-dom";
import { StatCard } from "@/components/dealmap/StatCard";
import { SocialBadge } from "@/components/dealmap/SocialBadge";
import { SocialGraph } from "@/components/dealmap/SocialGraph";
import { PathChain } from "@/components/dealmap/StartupSocialSection";
import {
  SIGNALS, INTRO_PATHS, RISING_ALERTS, SOCIAL_METRICS,
} from "@/lib/social-sourcing-data";
import { Activity, Users, Briefcase, Network, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const SIGNAL_SOURCE_LABELS: Record<string, string[]> = {
  sig_lexflow: ["CRM notes", "Meeting transcript", "Demo investor network"],
  sig_pitchpilot: ["Manual relationship", "Demo investor network"],
  sig_carbongrid: ["Meeting transcript", "Demo investor network"],
};
function sourceLabelsFor(id: string): string[] {
  return SIGNAL_SOURCE_LABELS[id] ?? ["CRM notes", "Demo investor network"];
}

export default function SocialSourcing() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-normal tracking-tight">Social Sourcing</h1>
            <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Demo social graph</span>
          </div>
          <p className="text-sm text-muted-foreground">Relationship intelligence — detect founders gaining angel, micro fund and accelerator attention.</p>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            Signals are derived from CRM notes, meeting transcripts, manually added relationships, and demo investor network data.
          </p>
        </div>
      </header>

      {/* 1. Overview cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="New founder signals" value={SOCIAL_METRICS.new_founder_signals} hint="detected" icon={<Activity className="h-3.5 w-3.5" />} accent="accent" />
        <StatCard label="Angel connections" value={SOCIAL_METRICS.angel_connections_week} hint="this week" icon={<Sparkles className="h-3.5 w-3.5" />} accent="violet" />
        <StatCard label="Micro fund interactions" value={SOCIAL_METRICS.micro_fund_interactions} hint="last 7 days" icon={<Briefcase className="h-3.5 w-3.5" />} accent="warning" />
        <StatCard label="Warm intro paths" value={SOCIAL_METRICS.warm_intro_paths} hint="found" icon={<Users className="h-3.5 w-3.5" />} accent="teal" />
        <StatCard label="Rising in network" value={SOCIAL_METRICS.rising_network_startups} hint="startups gaining activity" icon={<TrendingUp className="h-3.5 w-3.5" />} accent="accent" />
      </div>

      {/* 2. Signal feed + 5. Rising alerts */}
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Signal feed</h2>
            <span className="text-[11px] text-muted-foreground">CRM-derived relationship signals · Mock investor network</span>
          </div>
          <div className="space-y-3">
            {SIGNALS.map((sig) => (
              <article key={sig.id} className="rounded-xl border border-border bg-surface p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">{sig.startup_name}</h3>
                      <span className="text-xs text-muted-foreground">· {sig.founder_name}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      <span>Type: <span className="font-medium text-foreground">{sig.signal_type}</span></span>
                      <span>· Source: {sig.signal_source}</span>
                      <span>· Detected {formatDistanceToNow(new Date(sig.detected_at), { addSuffix: true })}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {sourceLabelsFor(sig.id).map((lbl) => (
                        <span
                          key={lbl}
                          className="rounded-md border border-border bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {lbl}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl font-semibold text-foreground">{sig.social_signal_score}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">signal score</div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <SocialBadge value={sig.signal_strength === "High" ? "High signal" : "Rising signal"} />
                  {sig.badges.map((b) => <SocialBadge key={b} value={b} />)}
                </div>

                <p className="mt-3 text-sm text-foreground/85"><span className="text-[11px] uppercase tracking-wider text-muted-foreground">Why it matters · </span>{sig.why_it_matters}</p>
                <div className="mt-2 rounded-lg border border-accent/20 bg-accent-soft/60 px-3 py-2 text-xs text-accent">
                  → {sig.suggested_action}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-accent" /> Rising founder alerts</h2>
          <div className="space-y-3">
            {RISING_ALERTS.map((a) => (
              <div key={a.startup_id} className="rounded-xl border border-border bg-surface p-4 shadow-card">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-sm font-semibold">{a.startup_name}</div>
                    <div className="text-[11px] text-muted-foreground">{a.segment}</div>
                  </div>
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">+{a.activity_increase_pct}%</span>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-foreground/80">
                  {a.recent_signals.map((s) => <li key={s}>· {s}</li>)}
                </ul>
                <div className="mt-2 rounded-md border border-border bg-surface-muted px-2.5 py-1.5 text-[11px] text-foreground/85">
                  → {a.recommended_action}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* 3. Social Graph */}
      <SocialGraph height={480} />

      {/* 4. Warm intro paths */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold"><Network className="h-4 w-4 text-violet" /> Warm intro paths</h2>
          <span className="text-[11px] text-muted-foreground">Best paths through your demo network</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {INTRO_PATHS.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-surface p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{p.startup_name}</div>
                <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">{p.path_strength} · {p.relationship_distance} hops</span>
              </div>
              <div className="mt-3">
                <PathChain nodes={p.path_nodes} />
              </div>
              <div className="mt-3 rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs italic text-foreground/80">
                "{p.suggested_intro_message}"
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-dashed border-border bg-surface-muted p-4 text-center text-[11px] text-muted-foreground">
        This view uses a demo social graph and CRM-derived relationship signals. No external scraping or private social data is used.
        <Link to="/market-map" className="ml-2 inline-flex items-center gap-1 text-accent hover:underline">Back to Market Map <ArrowRight className="h-3 w-3" /></Link>
      </div>
    </div>
  );
}