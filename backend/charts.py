"""Matplotlib chart generation -> PNG bytes."""
import io
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd


def _fig_to_png(fig) -> bytes:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", dpi=110)
    plt.close(fig)
    buf.seek(0)
    return buf.read()


def category_pie(df: pd.DataFrame) -> bytes:
    debits = df[df["type"] == "debit"]
    by_cat = debits.groupby("category")["amount"].sum().sort_values(ascending=False)
    fig, ax = plt.subplots(figsize=(6, 6))
    if by_cat.empty:
        ax.text(0.5, 0.5, "No data", ha="center", va="center")
    else:
        ax.pie(by_cat.values, labels=by_cat.index, autopct="%1.1f%%", startangle=90)
        ax.set_title("Spending by Category")
    return _fig_to_png(fig)


def monthly_trend_line(df: pd.DataFrame) -> bytes:
    debits = df[df["type"] == "debit"].copy()
    debits["month"] = debits["date"].dt.strftime("%Y-%m")
    by_month = debits.groupby("month")["amount"].sum().sort_index()
    fig, ax = plt.subplots(figsize=(8, 4))
    if by_month.empty:
        ax.text(0.5, 0.5, "No data", ha="center", va="center")
    else:
        ax.plot(by_month.index, by_month.values, marker="o", linewidth=2)
        ax.set_title("Monthly Spending Trend")
        ax.set_ylabel("Amount")
        ax.grid(alpha=0.3)
        plt.xticks(rotation=45)
    return _fig_to_png(fig)


def income_vs_expense_bar(df: pd.DataFrame) -> bytes:
    df2 = df.copy()
    df2["month"] = df2["date"].dt.strftime("%Y-%m")
    pivot = df2.pivot_table(index="month", columns="type",
                            values="amount", aggfunc="sum").fillna(0).sort_index()
    fig, ax = plt.subplots(figsize=(8, 4))
    if pivot.empty:
        ax.text(0.5, 0.5, "No data", ha="center", va="center")
    else:
        pivot.plot(kind="bar", ax=ax)
        ax.set_title("Income vs Expense")
        ax.set_ylabel("Amount")
        plt.xticks(rotation=45)
    return _fig_to_png(fig)
