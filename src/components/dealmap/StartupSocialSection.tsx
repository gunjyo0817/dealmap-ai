import { Link } from "react-router-dom";
import { Network, ArrowRight, Sparkles } from "lucide-react";
import { findIntroPathByStartupName, findSignalByStartupName } from "@/lib/social-sourcing-data";
import { SocialBadge } from "./SocialBadge";

export function StartupSocialSection({ startupName }: { startupName?: string | null }) {
  const signal = findSignalByStartupName(startupName);
  const path = findIntroPathByStartupName(startupName);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Network className="h-4 w-4 text-violet" /> Social sourcing
        </h3>
        <Link to="/social-sourcing" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          View social sourcing <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {!signal && !path && (
        <div className="rounded-lg border border-dashed border-border bg-surface-muted px-3 py-4 text-xs text-muted-foreground">
          No social signals detected for this startup yet.
          <span className="ml-1 italic">Demo social graph.</span>
        </div>
      )}

      {(signal || path) && (
        <div className="grid gap-4 md:grid-cols-2">
          {signal && (
            <div className="space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Social signal score</span>
                <span className="font-mono text-2xl font-semibold text-foreground">{signal.social_signal_score}<span className="text-xs text-muted-foreground"> / 100</span></span>
              </div>
              <div className="flex flex-wrap gap-1">
                {signal.badges.map((b) => <SocialBadge key={b} value={b} />)}
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Recent activity</div>
                <ul className="mt-1 space-y-1 text-xs text-foreground/85">
                  <li>· Mentioned by {signal.signal_type.toLowerCase()} contacts</li>
                  <li>· Source: {signal.signal_source}</li>
                  <li>· Detected: {new Date(signal.detected_at).toLocaleDateString()}</li>
                </ul>
              </div>
              <div className="rounded-lg border border-accent/20 bg-accent-soft/60 px-3 py-2 text-xs text-accent">
                <Sparkles className="mr-1 inline h-3 w-3" /> Suggested: {signal.suggested_action}
              </div>
            </div>
          )}

          {path && (
            <div className="space-y-2.5">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Warm intro path</div>
              <PathChain nodes={path.path_nodes} />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Path strength: <span className="font-medium text-foreground">{path.path_strength}</span></span>
                <span>{path.relationship_distance} hops</span>
              </div>
              <div className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs italic text-foreground/80">
                "{path.suggested_intro_message}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PathChain({ nodes }: { nodes: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {nodes.map((n, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <span className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium">{n}</span>
          {i < nodes.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
        </span>
      ))}
    </div>
  );
}