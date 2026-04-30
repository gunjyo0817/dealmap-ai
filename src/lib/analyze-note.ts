import { supabase } from "@/integrations/supabase/client";
import type { StartupRow } from "@/lib/workspace-types";

export async function analyzeNote(noteId: string) {
  const { data, error } = await supabase.functions.invoke<{ startup: StartupRow }>("analyze-note", {
    body: { noteId },
  });

  if (error) throw error;
  if (!data?.startup) throw new Error("Analysis did not return a startup");

  return data.startup;
}
