"""Tiny ML categorizer: TF-IDF + Multinomial Naive Bayes.

Trained on a small built-in seed dataset at startup. Good enough to
demo 'ML transaction categorization' on a resume.
"""
from __future__ import annotations
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

# (description, category) seed examples
SEED = [
    ("swiggy order food delivery", "Food & Dining"),
    ("zomato dinner", "Food & Dining"),
    ("dominos pizza", "Food & Dining"),
    ("starbucks coffee", "Food & Dining"),
    ("restaurant lunch", "Food & Dining"),
    ("uber ride", "Transport"),
    ("ola cab", "Transport"),
    ("metro card recharge", "Transport"),
    ("petrol pump fuel", "Transport"),
    ("amazon shopping order", "Shopping"),
    ("flipkart purchase", "Shopping"),
    ("myntra clothing", "Shopping"),
    ("electricity bill payment", "Bills"),
    ("water bill", "Bills"),
    ("internet broadband bill", "Bills"),
    ("mobile recharge airtel jio", "Bills"),
    ("netflix subscription", "Entertainment"),
    ("spotify music", "Entertainment"),
    ("bookmyshow movie ticket", "Entertainment"),
    ("salary credit", "Income"),
    ("interest credited", "Income"),
    ("rent payment landlord", "Housing"),
    ("apollo pharmacy medicine", "Healthcare"),
    ("hospital consultation", "Healthcare"),
    ("atm cash withdrawal", "Cash"),
    ("upi transfer to friend", "Transfer"),
]


class Categorizer:
    def __init__(self) -> None:
        self.pipe = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
            ("clf", MultinomialNB()),
        ])
        X = [t for t, _ in SEED]
        y = [c for _, c in SEED]
        self.pipe.fit(X, y)

    def predict(self, text: str) -> str:
        if not text or not text.strip():
            return "Other"
        return str(self.pipe.predict([text.lower()])[0])

    def predict_many(self, texts: list[str]) -> list[str]:
        cleaned = [(t or "").lower() for t in texts]
        return [str(c) for c in self.pipe.predict(cleaned)]


_singleton: Categorizer | None = None


def get_categorizer() -> Categorizer:
    global _singleton
    if _singleton is None:
        _singleton = Categorizer()
    return _singleton
