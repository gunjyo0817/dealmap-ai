# DealMap AI

DealMap AI is a deal-flow workspace for early-stage VC teams. It turns meeting transcripts, intro notes, and CRM inputs into a structured market map and actionable follow-ups.

## Product Goals

- Convert fragmented notes into structured startup profiles.
- Give the team one shared workspace to track pipeline, segments, risks, and priorities.
- Reduce manual ops work so partners and analysts spend time on decisions, not data cleanup.

## Current Features

### 1) Authentication and Workspace Data Isolation

- Email/password and Google OAuth sign-in.
- Supabase Auth + Postgres backend with user-scoped workspace queries.

### 2) Dashboard

- Shows pipeline stage distribution, recently added startups, and recent AI insights.
- Combines follow-up and segment data for daily prioritization.

### 3) Startups (Pipeline List Management)

- Startup table view.
- Search and multi-filter support by segment, stage, and priority.
- Drill into startup detail pages.

### 4) Notes / Inbox (Ingestion + Analysis)

- Paste notes manually or upload files (`txt` / `md` / `csv` / `json` / `docx` / `pdf`).
- Save notes to inbox only, or run "Analyze and import" directly.
- `analyze-note` tries the Supabase Edge Function first, then automatically falls back to the local heuristic analyzer.

### 5) Market Map

- Three views: Board / Matrix / Table.
- Segment-level opportunity vs. crowdedness visualization with segment detail drilldowns.
- Side-by-side view of internal pipeline and external competitors (currently system-provided mapping data).

### 6) Settings

- Workspace, account, AI preference, and notification settings UI.
- Demo-oriented data export / clear / reset actions.

## Tech Stack

- Frontend: Vite + React + TypeScript + React Router + TanStack Query
- UI: Tailwind + shadcn/ui + Radix
- Data/Auth: Supabase (Auth, Postgres, Functions)
- Charts: Recharts

## Prerequisites

- Node.js 20+
- npm 10+
- Optional: Supabase CLI (for local DB and function development)

## Quick Start (Remote Supabase)

1. Install dependencies

   ```bash
   npm install
   ```

2. Create the env file

   ```bash
   cp .env.example .env
   ```

3. Set required `.env` values

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

4. Start the frontend

   ```bash
   npm run dev
   ```

If port `8080` is unavailable, use:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

## Local Supabase (Recommended for Reproducible Development)

1. Install Supabase CLI (macOS)

   ```bash
   brew install supabase/tap/supabase
   ```

2. Start the local Supabase stack

   ```bash
   supabase start
   ```

3. Rebuild and apply migrations

   ```bash
   supabase db reset
   ```

4. Get local URL/key values

   ```bash
   supabase status
   ```

5. Update `.env`

- `VITE_SUPABASE_URL` = local API URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` = local anon key

6. Start the frontend

   ```bash
   npm run dev
   ```

## Gemini Analysis Function (`analyze-note`)

`supabase/functions/analyze-note` analyzes raw notes. If `GEMINI_API_KEY` is set, it uses Gemini. If not, it falls back to the local analyzer.

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

## Available Scripts

- `npm run dev`: start local dev server
- `npm run build`: create production build
- `npm run preview`: preview production build
- `npm run lint`: run ESLint
- `npm test`: run Vitest once
- `npm run test:watch`: run Vitest in watch mode

## Supabase Schema

- Migrations live in `supabase/migrations`
- Apply locally with `supabase db reset`
- Apply to a linked remote project with `supabase db push`
