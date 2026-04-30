# Runtime next steps (mock -> real)

## Goal

Move from frontend-only demo behavior to real end-to-end data + analysis pipeline.

## 1) Replace mock analysis path

- Current mock entrypoint: `src/lib/mock-analyze.ts`
- Current usage: `src/pages/DealInbox.tsx`

### Change

- Create Supabase Edge Function `analyze-note`.
- Input contract:
  - `noteId: string`
  - `content: string`
  - `startupId?: string`
- Output contract:
  - `summary: string`
  - `priority: "low" | "medium" | "high"`
  - `confidence: number`
  - `followUpQuestions: string[]`
  - `insights: { title: string; body: string; type: string }[]`

## 2) Wire frontend to edge function

- In `src/pages/DealInbox.tsx`:
  - Replace direct `mockAnalyzeNote(...)` call with `supabase.functions.invoke("analyze-note", ...)`.
  - Keep optimistic/loading/error states unchanged.

## 3) Persist output in existing schema

- Write outputs into:
  - `analyses`
  - `follow_up_questions`
  - `insights`
- Preserve RLS ownership with authenticated user id.

## 4) Add integration layer (CRM/social)

- Current integration cards and social sourcing are mostly demo data.
- Add:
  - OAuth token table(s)
  - refresh token handling
  - webhook ingest function
  - periodic sync job

## 5) Guardrails and tests

- Add tests for:
  - auth-protected data access
  - invoke analysis function success/failure
  - rendering insights after persisted analysis
