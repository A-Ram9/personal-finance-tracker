# FinTrack

A personal finance tracker. Log income and expenses, see where your money goes,
and ask FinGan (an optional local AI assistant) questions about your spending.

- **frontend/**: React (Create React App), MUI, Recharts
- **backend/**: Flask + SQLite, login with JWT tokens

## Requirements

- Python 3.10+
- Node.js 18+
- Optional: [Ollama](https://ollama.com) with the `llama3` model, for FinGan chat

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env         # macOS/Linux: cp .env.example .env
```

Open `backend/.env` and set `SECRET_KEY` to a random value:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Start it:

```bash
python app.py                  # runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install --legacy-peer-deps
copy .env.example .env         # macOS/Linux: cp .env.example .env
npm start                      # opens http://localhost:3000
```

`REACT_APP_API_URL` in `frontend/.env` tells the app where the backend is.
Restart `npm start` after changing it.

### 3. FinGan (optional)

```bash
ollama pull llama3
```

Keep Ollama running while you use the app. Everything else works without it.

## Tests

```bash
cd frontend
npm test
```
