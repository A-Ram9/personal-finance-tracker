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

## How I want you to work (I am learning)
- Before editing, explain the plan and the key concept in plain language, briefly.
- Keep changes small and focused on the current step. Don't refactor unrelated code.
- After editing, summarise what changed in each file and why, in 1–2 lines each.
- In each step, pick one meaningful function or piece of logic and leave it as a
  `TODO(me)` stub with hints instead of writing it. I will implement it.
- Don't add new dependencies without telling me why and asking first.
- Use plain, human UI copy. No jargon like "capital vector" or "velocity matrix".

## Current step
Step 0 — clean foundation (secrets, dependencies, gitignore, config).