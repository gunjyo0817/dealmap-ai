import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function ImportCRMDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user || !text.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      source: "manual",
      raw_text: text.trim(),
      title: `Pasted note · ${new Date().toLocaleDateString()}`,
      status: "unprocessed",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Imported to Deal Inbox", { description: "Open the inbox to analyze and assign." });
    qc.invalidateQueries({ queryKey: ["notes"] });
    onOpenChange(false);
    setText("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import notes to Deal Inbox</DialogTitle>
          <DialogDescription>Paste meeting notes. They will land in your inbox ready to analyze.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste meeting notes…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !text.trim()}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}