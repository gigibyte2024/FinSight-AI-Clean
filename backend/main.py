"""FinSight AI — FastAPI backend.

Run:
    cd backend
    pip install -r requirements.txt
    cp .env.example .env   # add your OPENAI_API_KEY
    uvicorn main:app --reload --port 8000

Auth: the frontend authenticates against Supabase. This backend trusts the
Supabase JWT only enough to extract the user id ('sub' claim) — it does NOT
re-verify the signature, which is fine for a local dev / portfolio backend.
For production you would verify with the Supabase JWT secret.
"""
from __future__ import annotations

import base64
import json
import os
from typing import Optional

from dotenv import load_dotenv  # type: ignore
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

from database import init_db, insert_transactions, fetch_transactions, clear_transactions
from utils import parse_csv, load_user_df, summarize
from model import get_categorizer
from charts import category_pie, monthly_trend_line, income_vs_expense_bar
from chatbot import answer as ai_answer
from insights import health_score, anomalies


app = FastAPI(title="FinSight AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # dev only — tighten for prod
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    init_db()
    get_categorizer()  # warm the model


# ---------- auth ----------

def current_user(authorization: Optional[str] = Header(default=None)) -> str:
    """Extract user id from the Supabase JWT 'sub' claim.

    Falls back to a 'demo' user when no token is sent so the API stays
    explorable from /docs.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        return "demo-user"
    token = authorization.split(" ", 1)[1]
    try:
        payload_b64 = token.split(".")[1]
        payload_b64 += "=" * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        return str(payload.get("sub") or "demo-user")
    except Exception:
        return "demo-user"


# ---------- schemas ----------

class ChatRequest(BaseModel):
    question: str


# ---------- endpoints ----------

@app.get("/")
def root():
    return {"service": "FinSight AI Backend", "status": "ok"}


@app.post("/upload")
async def upload(file: UploadFile = File(...), user_id: str = Depends(current_user)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Please upload a .csv file")
    raw = await file.read()
    try:
        df = parse_csv(raw)
    except Exception as e:
        raise HTTPException(400, f"CSV parse error: {e}")

    cat = get_categorizer()
    df["category"] = cat.predict_many(df["description"].tolist())

    clear_transactions(user_id)  # replace previous upload
    n = insert_transactions(user_id, df.to_dict(orient="records"))
    return {"inserted": n, "categories": df["category"].value_counts().to_dict()}


@app.get("/analyze")
def analyze(user_id: str = Depends(current_user)):
    rows = fetch_transactions(user_id)
    df = load_user_df(rows)
    return {"summary": summarize(df), "rows": len(rows)}


@app.get("/insights")
def insights(user_id: str = Depends(current_user)):
    df = load_user_df(fetch_transactions(user_id))
    return {"health": health_score(df), "anomalies": anomalies(df)}


@app.get("/charts/{kind}")
def chart(kind: str, user_id: str = Depends(current_user)):
    df = load_user_df(fetch_transactions(user_id))
    if kind == "category":   png = category_pie(df)
    elif kind == "monthly":  png = monthly_trend_line(df)
    elif kind == "income":   png = income_vs_expense_bar(df)
    else: raise HTTPException(404, "Unknown chart kind")
    return Response(content=png, media_type="image/png")


@app.post("/chat")
def chat(req: ChatRequest, user_id: str = Depends(current_user)):
    df = load_user_df(fetch_transactions(user_id))
    summary = summarize(df)
    try:
        text = ai_answer(req.question, summary)
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    return {"answer": text, "context_used": summary}
