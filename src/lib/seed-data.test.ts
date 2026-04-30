import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {},
}));

import { GRANOLA_DEMO_TRANSCRIPTS } from "@/lib/seed-data";

describe("Granola demo transcripts", () => {
  it("keeps four VC call transcripts ready for inbox seeding", () => {
    expect(GRANOLA_DEMO_TRANSCRIPTS).toHaveLength(4);
    expect(GRANOLA_DEMO_TRANSCRIPTS.map((note) => note.title)).toEqual([
      "Granola transcript - MedScribe AI founder call",
      "Granola transcript - FinOps Copilot founder call",
      "Granola transcript - EvalStack founder call",
      "Granola transcript - ClauseIQ founder call",
    ]);
  });

  it("includes extraction headers used by the analysis flow", () => {
    for (const note of GRANOLA_DEMO_TRANSCRIPTS) {
      expect(note.source).toBe("granola");
      expect(note.raw_text).toMatch(/^Company:\s.+$/m);
      expect(note.raw_text).toMatch(/^Founder:\s.+$/m);
      expect(note.raw_text).toMatch(/^Stage:\s.+$/m);
      expect(note.raw_text).toMatch(/^Segment:\s.+$/m);
    }
  });
});
