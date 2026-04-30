# dealmap-ai

Vite + React + TypeScript frontend backed by Supabase (Auth + Postgres + RLS).

## Prerequisites

- Node.js 20+
- npm 10+
- Optional for local DB: Supabase CLI

## Quick start (remote Supabase)

1. Install dependencies:
   - `npm install`
2. Copy env file:
   - `cp .env.example .env`
3. Set required env vars in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Start app:
   - `npm run dev`

## Local Supabase (recommended for reproducible dev)

1. Install Supabase CLI (macOS):
   - `brew install supabase/tap/supabase`
2. Start local stack:
   - `supabase start`
3. Apply migrations (rebuild local DB):
   - `supabase db reset`
4. Get local API URL/key:
   - `supabase status`
5. Set `.env`:
   - `VITE_SUPABASE_URL` = local API URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = local anon key
6. Run frontend:
   - `npm run dev`

## Available scripts

- `npm run dev`: start local dev server
- `npm run build`: production build
- `npm run preview`: preview production build
- `npm run lint`: run ESLint
- `npm test`: run test suite once
- `npm run test:watch`: run tests in watch mode

## Supabase schema

Database migrations live in `supabase/migrations`.

Apply them with:
- local: `supabase db reset`
- linked remote project: `supabase db push`

## Current status and next backend steps

The app currently has:
- Real Supabase Auth + DB integration
- Frontend pages and CRUD flows
- Mock analysis logic for AI-like outputs

The app does not yet have:
- A dedicated backend service
- Real AI analysis pipeline (current flow uses `src/lib/mock-analyze.ts`)
- Real CRM connectors (HubSpot/Granola APIs are not fully wired end-to-end)

### Minimum path to “truly running” product

1. Replace mock analysis with Supabase Edge Function:
   - Add function under `supabase/functions/analyze-note`
   - Call it from `src/pages/DealInbox.tsx` instead of `mockAnalyzeNote`
   - Serve locally with `supabase functions serve analyze-note --no-verify-jwt`
   - Deploy with `supabase functions deploy analyze-note`
2. Add secrets for external AI provider in Supabase function env.
3. Persist structured analysis output in existing tables (`analyses`, `insights`).
4. Add integration token storage + sync jobs for external CRMs.
5. Add E2E tests for auth -> create note -> analyze -> view insight.
# DealMap AI

VC deal-flow workspace built with Vite, React, Supabase, and Supabase Edge Functions.

## Local Checks

```bash
npm install
npm run lint
npm test
npm run build
```

## Run The App

```bash
npm run dev
```

If port `8080` is unavailable, run:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

## Gemini Analysis Function

`supabase/functions/analyze-note` analyzes raw Deal Inbox notes. It uses Gemini when `GEMINI_API_KEY` is set, and falls back to the local heuristic analyzer when no key is present.

Set production secrets:

```bash
npx supabase secrets set GEMINI_API_KEY=your_key --project-ref hljhwjqjhdweimehxqym
```

Optional model override:

```bash
npx supabase secrets set GEMINI_MODEL=gemini-2.5-flash --project-ref hljhwjqjhdweimehxqym
```

Deploy the function:

```bash
npx supabase functions deploy analyze-note --project-ref hljhwjqjhdweimehxqym
```
