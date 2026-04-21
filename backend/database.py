"""Tiny SQLite layer. Stores uploaded transactions per user_id (string token)."""
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).parent / "finsight.db"


def init_db() -> None:
    with get_conn() as c:
        c.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     TEXT NOT NULL,
            date        TEXT NOT NULL,
            merchant    TEXT NOT NULL,
            description TEXT,
            amount      REAL NOT NULL,
            type        TEXT NOT NULL,        -- 'debit' or 'credit'
            category    TEXT DEFAULT 'Other',
            created_at  TEXT DEFAULT CURRENT_TIMESTAMP
        )""")
        c.execute("CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id)")


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def insert_transactions(user_id: str, rows: list[dict]) -> int:
    with get_conn() as c:
        cur = c.executemany(
            """INSERT INTO transactions
               (user_id, date, merchant, description, amount, type, category)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            [(user_id, r["date"], r["merchant"], r.get("description", ""),
              r["amount"], r["type"], r.get("category", "Other")) for r in rows],
        )
        return cur.rowcount


def fetch_transactions(user_id: str) -> list[dict]:
    with get_conn() as c:
        rows = c.execute(
            "SELECT * FROM transactions WHERE user_id=? ORDER BY date DESC",
            (user_id,),
        ).fetchall()
        return [dict(r) for r in rows]


def clear_transactions(user_id: str) -> int:
    with get_conn() as c:
        cur = c.execute("DELETE FROM transactions WHERE user_id=?", (user_id,))
        return cur.rowcount
