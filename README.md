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
npx supabase secrets set GEMINI_API_KEY=your_key --project-ref mtrhovqspqbeidbyqliz
```

Optional model override:

```bash
npx supabase secrets set GEMINI_MODEL=gemini-2.5-flash --project-ref mtrhovqspqbeidbyqliz
```

Deploy the function:

```bash
npx supabase functions deploy analyze-note --project-ref mtrhovqspqbeidbyqliz
```
