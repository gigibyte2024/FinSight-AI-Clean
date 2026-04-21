"""AI assistant: manual RAG.

We compute a structured summary of the user's data with Pandas, hand it
to OpenAI as system context, and let the model answer the question.
"""
import json
import os
from openai import OpenAI

_client: OpenAI | None = None


def _client_once() -> OpenAI:
    global _client
    if _client is None:
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            raise RuntimeError("OPENAI_API_KEY is not set")
        _client = OpenAI(api_key=key)
    return _client


SYSTEM_PROMPT = """You are FinSight AI, a friendly personal finance assistant.
You will receive the user's transaction summary as JSON. Answer their question
using ONLY the data provided. Be concise (2-4 sentences), use the user's
currency symbol if present in merchants, and round numbers sensibly.
If the data does not contain the answer, say so honestly."""


def answer(question: str, summary: dict) -> str:
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    client = _client_once()
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "system", "content": f"USER_DATA_SUMMARY:\n{json.dumps(summary)}"},
            {"role": "user", "content": question},
        ],
        temperature=0.3,
    )
    return resp.choices[0].message.content or ""
