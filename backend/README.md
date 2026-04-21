# FinSight AI — Python Backend

A standalone **FastAPI + Pandas + scikit-learn + Matplotlib + OpenAI** backend
that complements the FinSight AI frontend. Runs locally; the frontend stays
unchanged.

## Stack

| Concern        | Tool |
|----------------|------|
| Web framework  | FastAPI + Uvicorn |
| Data           | Pandas, NumPy |
| ML             | scikit-learn (TF-IDF + Multinomial Naive Bayes) |
| Charts         | Matplotlib (PNG responses) |
| AI assistant   | OpenAI (manual RAG via Pandas summary) |
| Storage        | SQLite (one file: `finsight.db`) |
| Auth           | Reads Supabase JWT `sub` claim from the frontend |

## Project layout

```
backend/
├── main.py        FastAPI routes
├── database.py    SQLite helpers
├── utils.py       CSV parsing + Pandas summarization
├── model.py       Naive Bayes transaction categorizer
├── charts.py      Matplotlib pie / line / bar
├── chatbot.py     OpenAI-powered assistant (manual RAG)
├── insights.py    Financial health score + anomaly detection
├── requirements.txt
├── .env.example
└── sample_transactions.csv
```

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install python-dotenv            # for loading .env
cp .env.example .env                 # then paste your OPENAI_API_KEY
uvicorn main:app --reload --port 8000
```

Open Swagger UI: http://localhost:8000/docs

## Endpoints

| Method | Path                | Purpose                                  |
|--------|---------------------|------------------------------------------|
| POST   | `/upload`           | Upload a CSV; auto-categorize + store    |
| GET    | `/analyze`          | JSON summary (totals, by category, etc.) |
| GET    | `/insights`         | Financial health score + anomalies       |
| GET    | `/charts/category`  | Pie chart PNG                            |
| GET    | `/charts/monthly`   | Line chart PNG                           |
| GET    | `/charts/income`    | Income-vs-expense bar PNG                |
| POST   | `/chat`             | `{ "question": "..." }` → AI answer      |

All endpoints accept `Authorization: Bearer <supabase_jwt>` from the
frontend; without it they default to a `demo-user` so you can explore
from `/docs`.

## Quick test (no frontend)

```bash
# 1. Upload sample data
curl -F "file=@sample_transactions.csv" http://localhost:8000/upload

# 2. Get summary
curl http://localhost:8000/analyze

# 3. Get the pie chart
curl http://localhost:8000/charts/category -o pie.png

# 4. Ask the AI
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Where did I spend the most last month?"}'
```

## How each "advanced" piece works (interview cheat-sheet)

- **Manual RAG**: `utils.summarize()` builds a compact JSON view of the user's
  data with Pandas (`groupby`, pivots). That JSON is injected into the
  OpenAI system prompt — the model only answers from that context.
- **ML categorization**: `model.py` trains a TF-IDF + Multinomial Naive Bayes
  pipeline on a small seed dataset at startup, then predicts a category
  for each transaction description on upload.
- **Financial health score**: rule-based weighting of savings ratio (50%),
  monthly spending stability via coefficient of variation (30%), and
  category diversification (20%).
- **Anomaly detection**: flags debits with `amount > mean + 2.5σ`.

## Wiring it to the frontend (optional)

The frontend UI is untouched. To connect it, in any component call:

```ts
const token = (await supabase.auth.getSession()).data.session?.access_token;
const res = await fetch("http://localhost:8000/analyze", {
  headers: { Authorization: `Bearer ${token}` },
});
```

For local dev set `VITE_BACKEND_URL=http://localhost:8000` and read it via
`import.meta.env.VITE_BACKEND_URL`.
```
