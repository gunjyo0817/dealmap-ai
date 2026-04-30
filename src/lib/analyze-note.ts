import { supabase } from "@/integrations/supabase/client";
import { analyzeNoteToStartup } from "@/lib/mock-analyze";
import type { StartupRow } from "@/lib/workspace-types";

export async function analyzeNote(noteId: string, userId: string) {
  try {
    const { data, error } = await supabase.functions.invoke<{ startup: StartupRow }>("analyze-note", {
      body: { noteId },
    });

    if (error) throw error;
    if (!data?.startup) throw new Error("Analysis did not return a startup");

    return data.startup;
  } catch (error) {
    console.warn("Falling back to local note analyzer", error);

    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("raw_text, source")
      .eq("id", noteId)
      .eq("user_id", userId)
      .maybeSingle();

    if (noteError) throw noteError;
    if (!note) throw error instanceof Error ? error : new Error("Analysis failed");

    return analyzeNoteToStartup({
      userId,
      noteId,
      rawText: note.raw_text,
      source: note.source,
    });
  }
}
