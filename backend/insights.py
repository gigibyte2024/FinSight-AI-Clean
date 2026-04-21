"""Financial health score (rule-based) + simple anomaly detection."""
import pandas as pd


def health_score(df: pd.DataFrame) -> dict:
    if df.empty:
        return {"score": 0, "breakdown": {}, "tip": "Upload transactions to compute your score."}

    income = df.loc[df["type"] == "credit", "amount"].sum()
    expense = df.loc[df["type"] == "debit", "amount"].sum()

    # 1) Savings ratio (50 pts)
    savings_ratio = (income - expense) / income if income > 0 else 0
    savings_pts = max(0, min(50, savings_ratio * 100))

    # 2) Spending stability month-to-month (30 pts)
    debits = df[df["type"] == "debit"].copy()
    debits["month"] = debits["date"].dt.strftime("%Y-%m")
    monthly = debits.groupby("month")["amount"].sum()
    if len(monthly) >= 2 and monthly.mean() > 0:
        cv = monthly.std() / monthly.mean()
        stability_pts = max(0, 30 - cv * 30)
    else:
        stability_pts = 15

    # 3) Category diversification (20 pts)
    n_cats = debits["category"].nunique()
    diversity_pts = min(20, n_cats * 4)

    score = round(savings_pts + stability_pts + diversity_pts)

    if score >= 75: tip = "Excellent — keep saving and investing the surplus."
    elif score >= 50: tip = "Decent. Try to reduce your top discretionary category."
    else: tip = "At risk. Track expenses weekly and set a savings goal."

    return {
        "score": score,
        "breakdown": {
            "savings": round(savings_pts, 1),
            "stability": round(stability_pts, 1),
            "diversity": round(diversity_pts, 1),
        },
        "tip": tip,
    }


def anomalies(df: pd.DataFrame, z_threshold: float = 2.5) -> list[dict]:
    """Flag debits that are far above the mean (mean + z*std)."""
    debits = df[df["type"] == "debit"]
    if len(debits) < 5:
        return []
    mean = debits["amount"].mean()
    std = debits["amount"].std() or 1.0
    cutoff = mean + z_threshold * std
    flagged = debits[debits["amount"] > cutoff].sort_values("amount", ascending=False)
    return [
        {
            "date": r["date"].strftime("%Y-%m-%d"),
            "merchant": r["merchant"],
            "amount": round(float(r["amount"]), 2),
            "category": r["category"],
            "reason": f"Amount > {round(cutoff,2)} (mean+{z_threshold}σ)",
        }
        for _, r in flagged.head(10).iterrows()
    ]
