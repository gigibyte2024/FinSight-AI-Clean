"""CSV parsing + Pandas helpers."""
import io
import pandas as pd


REQUIRED_ANY = {"amount"}


def parse_csv(file_bytes: bytes) -> pd.DataFrame:
    """Read CSV and normalize columns: date, merchant, description, amount, type."""
    df = pd.read_csv(io.BytesIO(file_bytes))
    df.columns = [c.strip().lower() for c in df.columns]

    # Best-effort column detection
    col_map = {}
    for c in df.columns:
        if "date" in c: col_map[c] = "date"
        elif any(k in c for k in ("merchant", "name", "payee")): col_map[c] = "merchant"
        elif "desc" in c or "narration" in c: col_map[c] = "description"
        elif "amount" in c or "amt" in c: col_map[c] = "amount"
        elif "type" in c: col_map[c] = "type"
        elif "category" in c: col_map[c] = "category"
    df = df.rename(columns=col_map)

    if "amount" not in df.columns:
        raise ValueError("CSV must contain an 'amount' column")

    # Defaults
    if "date" not in df.columns:
        df["date"] = pd.Timestamp.today().strftime("%Y-%m-%d")
    if "merchant" not in df.columns:
        df["merchant"] = df.get("description", "Unknown")
    if "description" not in df.columns:
        df["description"] = df["merchant"]

    # Clean amount
    df["amount"] = (
        df["amount"].astype(str)
        .str.replace(r"[₹,$,\s]", "", regex=True)
        .astype(float)
    )

    if "type" not in df.columns:
        df["type"] = df["amount"].apply(lambda x: "credit" if x >= 0 else "debit")
    df["amount"] = df["amount"].abs()

    df["date"] = pd.to_datetime(df["date"], errors="coerce").dt.strftime("%Y-%m-%d")
    df = df.dropna(subset=["date"])

    return df[["date", "merchant", "description", "amount", "type"]]


def load_user_df(rows: list[dict]) -> pd.DataFrame:
    if not rows:
        return pd.DataFrame(columns=["date", "merchant", "description", "amount", "type", "category"])
    df = pd.DataFrame(rows)
    df["date"] = pd.to_datetime(df["date"])
    df["amount"] = df["amount"].astype(float)
    return df


def summarize(df: pd.DataFrame) -> dict:
    """Compact summary used by the AI assistant (manual RAG)."""
    if df.empty:
        return {"empty": True}

    debits = df[df["type"] == "debit"]
    credits = df[df["type"] == "credit"]
    by_cat = debits.groupby("category")["amount"].sum().sort_values(ascending=False)
    by_month = (
        debits.assign(month=debits["date"].dt.strftime("%Y-%m"))
        .groupby("month")["amount"].sum().sort_index()
    )
    top_merchants = debits.groupby("merchant")["amount"].sum().nlargest(5)

    return {
        "total_spent": round(debits["amount"].sum(), 2),
        "total_income": round(credits["amount"].sum(), 2),
        "transaction_count": int(len(df)),
        "spending_by_category": {k: round(v, 2) for k, v in by_cat.items()},
        "spending_by_month": {k: round(v, 2) for k, v in by_month.items()},
        "top_merchants": {k: round(v, 2) for k, v in top_merchants.items()},
        "date_range": [df["date"].min().strftime("%Y-%m-%d"),
                       df["date"].max().strftime("%Y-%m-%d")],
    }
