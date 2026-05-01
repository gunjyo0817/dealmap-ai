import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  User,
  Plug,
  Sparkles,
  Shield,
  Bell,
  Database,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof SettingsIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <header className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-muted/40 px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();

  // Workspace
  const [ws, setWs] = useState({
    name: "DealMap AI",
    type: "VC Firm",
    currency: "EUR",
    region: "Europe",
  });

  // Account
  const [acct, setAcct] = useState({
    name: user?.user_metadata?.full_name ?? "Alex Becker",
    email: user?.email ?? "alex@dealmap.ai",
    role: "Partner",
  });

  // AI prefs
  const [ai, setAi] = useState({
    depth: "Standard",
    externalCompetitors: true,
    followUps: true,
    recommendations: true,
  });

  // Notifications
  const [notif, setNotif] = useState({
    highPriority: true,
    crowdedness: false,
    missingCompetitors: true,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <h1 className="font-display text-3xl font-normal tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Workspace, account, integrations, AI preferences, data, and notifications.
        </p>
      </header>

      {/* A. Workspace */}
      <Section icon={SettingsIcon} title="Workspace settings" description="Defaults for your VC workspace.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Workspace name">
            <Input value={ws.name} onChange={(e) => setWs({ ...ws, name: e.target.value })} />
          </Field>
          <Field label="Workspace type">
            <Select value={ws.type} onValueChange={(v) => setWs({ ...ws, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VC Firm">VC Firm</SelectItem>
                <SelectItem value="Angel Syndicate">Angel Syndicate</SelectItem>
                <SelectItem value="Accelerator">Accelerator</SelectItem>
                <SelectItem value="Scout Network">Scout Network</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default currency">
            <Select value={ws.currency} onValueChange={(v) => setWs({ ...ws, currency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default region">
            <Select value={ws.region} onValueChange={(v) => setWs({ ...ws, region: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe">Europe</SelectItem>
                <SelectItem value="North America">North America</SelectItem>
                <SelectItem value="Global">Global</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => toast.success("Workspace settings saved")}>Save workspace settings</Button>
        </div>
      </Section>

      {/* B. Account */}
      <Section icon={User} title="Account settings" description="Your profile and role.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="User name">
            <Input value={acct.name} onChange={(e) => setAcct({ ...acct, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={acct.email} onChange={(e) => setAcct({ ...acct, email: e.target.value })} />
          </Field>
          <Field label="Role">
            <Select value={acct.role} onValueChange={(v) => setAcct({ ...acct, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Partner">Partner</SelectItem>
                <SelectItem value="Analyst">Analyst</SelectItem>
                <SelectItem value="Scout">Scout</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => toast.success("Account settings saved")}>Save account settings</Button>
        </div>
      </Section>

      {/* C. Integrations */}
      <Section icon={Plug} title="Integrations" description="Configure note sources.">
        <div className="grid gap-3 md:grid-cols-1">
          <IntegrationCard
            name="Manual Notes"
            statusLabel="Ready"
            statusTone="muted"
            sub="Paste or type notes"
            buttonLabel="Add note source"
            onClick={() => toast.success("Note source added")}
          />
        </div>
      </Section>

      {/* D. AI preferences */}
      <Section icon={Sparkles} title="AI preferences" description="How DealMap AI analyzes your notes.">
        <div className="space-y-3">
          <Field label="Default analysis depth">
            <Select value={ai.depth} onValueChange={(v) => setAi({ ...ai, depth: v })}>
              <SelectTrigger className="md:w-72"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Quick">Quick</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Deep">Deep</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <ToggleRow
            label="Include external competitors"
            description="Map external incumbents alongside your pipeline."
            value={ai.externalCompetitors}
            onChange={(v) => setAi({ ...ai, externalCompetitors: v })}
          />
          <ToggleRow
            label="Generate follow-up questions"
            value={ai.followUps}
            onChange={(v) => setAi({ ...ai, followUps: v })}
          />
          <ToggleRow
            label="Generate AI recommendation"
            value={ai.recommendations}
            onChange={(v) => setAi({ ...ai, recommendations: v })}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => toast.success("AI preferences saved")}>Save AI preferences</Button>
        </div>
      </Section>

      {/* E. Data & Privacy */}
      <Section icon={Shield} title="Data & privacy" description="How your workspace data is handled.">
        <div className="rounded-lg border border-dashed border-border bg-surface-muted/40 p-3 text-xs text-muted-foreground">
          DealMap AI uses demo data in this prototype. In production, workspace data
          would be isolated per user and organization.
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => toast.success("Workspace data exported", { description: "dealmap-export.json" })}
          >
            <Database className="h-3.5 w-3.5" /> Export workspace data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast("Demo data cleared", { description: "All demo records removed (mock)." })}
          >
            Clear demo data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Seed data reset", { description: "Demo workspace restored." })}
          >
            Reset seed data
          </Button>
        </div>
      </Section>

      {/* F. Notifications */}
      <Section icon={Bell} title="Notification preferences" description="What DealMap AI alerts you about.">
        <div className="space-y-3">
          <ToggleRow label="High-priority follow-up reminders" value={notif.highPriority} onChange={(v) => setNotif({ ...notif, highPriority: v })} />
          <ToggleRow label="Segment crowdedness alerts" value={notif.crowdedness} onChange={(v) => setNotif({ ...notif, crowdedness: v })} />
          <ToggleRow label="Missing competitor alerts" value={notif.missingCompetitors} onChange={(v) => setNotif({ ...notif, missingCompetitors: v })} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => toast.success("Notification settings saved")}>Save notification settings</Button>
        </div>
      </Section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function IntegrationCard({
  name, statusLabel, statusTone, sub, buttonLabel, onClick,
}: {
  name: string; statusLabel: string; statusTone: "muted";
  sub: string; buttonLabel: string; onClick: () => void;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface-muted/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">{name}</div>
        <span
          className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
        >
          {statusLabel}
        </span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
      <div className="mt-3">
        <Button size="sm" variant="outline" className="w-full" onClick={onClick}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}