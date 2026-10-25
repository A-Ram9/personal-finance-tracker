# FinTrack

Personal finance tracker I built originally with Gemini. I'm now redesigning it
step by step to make it distinctive AND to learn the concepts properly.

## Stack
- frontend/: React 19 (Create React App), MUI v5, Recharts, framer-motion
- backend/: Flask + SQLite, JWT auth, optional local Ollama (llama3) for "FinGan" chat
- Amounts are stored in INR; the UI converts to INR/USD/NPR/OMR

## Running locally
- Backend: cd backend && python app.py  (port 5000)
- Frontend: cd frontend && npm start     (port 3000)

## How I want you to work
- I'm focused on building the finished product; you write all the code.
- For bigger changes, show a short plan first and wait for my approval.
- Explain the key concept behind each change in 2–3 plain sentences,
  as if teaching a beginner. Skip explanations for trivial edits.
- After editing, summarise what changed in each file in one line.
- Don't leave TODO(me) stubs; implement everything.
- Don't add new dependencies without telling me why and asking first.
- Use plain, human UI copy. No jargon like "capital vector" or "velocity matrix".

## Current step
Step 2 — theme: cream/cherry tokens, fonts, light mode by default (finishing polish)

## Step order
- Step 3 — copy: rewrite jargon into plain UI copy; spell the name "FinTrack" everywhere (login says "Fintrack")
- Step 3b — MUI upgrade (5.10 doesn't support React 19; until then install with `npm install --legacy-peer-deps`)
- Step 4 — layout, built on the upgraded MUI API