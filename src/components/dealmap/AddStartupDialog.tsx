import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useSegments } from "@/hooks/useWorkspaceData";
import { toast } from "sonner";

export function AddStartupDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: segments } = useSegments();
  const [name, setName] = useState("");
  const [founder, setFounder] = useState("");
  const [segmentId, setSegmentId] = useState<string>("");
  const [stage, setStage] = useState("Pre-seed");
  const [priority, setPriority] = useState("Medium");
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setName(""); setFounder(""); setSegmentId(""); setStage("Pre-seed"); setPriority("Medium"); setSummary("");
    }
  }, [open]);

  const submit = async () => {
    if (!user || !name.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("startups").insert({
      user_id: user.id,
      name: name.trim(),
      founder: founder.trim() || null,
      segment_id: segmentId || null,
      stage: stage as "Pre-seed",
      priority: priority as "Medium",
      summary: summary.trim() || null,
      status: "New",
      source: "manual",
      last_interaction_at: new Date().toISOString(),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`${name} added`);
    qc.invalidateQueries({ queryKey: ["startups"] });
    qc.invalidateQueries({ queryKey: ["segments"] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add startup</DialogTitle>
          <DialogDescription>Create a new startup record in your workspace.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Startup name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. LexFlow" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Founder</Label>
              <Input value={founder} onChange={(e) => setFounder(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Pre-seed", "Seed", "Series A", "Series B", "Later"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Segment</Label>
              <Select value={segmentId} onValueChange={setSegmentId}>
                <SelectTrigger><SelectValue placeholder="Choose segment" /></SelectTrigger>
                <SelectContent>
                  {(segments ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["High", "Medium", "Low"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>One-line summary</Label>
            <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What does it do, for whom?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !name.trim()}>Add startup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}