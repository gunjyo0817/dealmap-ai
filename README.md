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

Create a local `.env` from the example and fill in the Supabase publishable key:

```bash
cp .env.example .env
```

```bash
npm run dev
```

If port `8080` is unavailable, run:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

## Gemini Analysis Function

`supabase/functions/analyze-note` analyzes raw Deal Inbox notes. It uses Gemini when `GEMINI_API_KEY` is set, and falls back to the local heuristic analyzer when no key is present.

Keep Gemini keys out of the Vite `.env`. The browser only needs `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, and `VITE_SUPABASE_PUBLISHABLE_KEY`; Gemini belongs in Supabase Edge Function secrets.

Set Supabase project secrets:

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
