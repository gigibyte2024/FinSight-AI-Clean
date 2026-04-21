import { useState } from "react";
import { Search, ArrowUpRight, ArrowDownRight, AlertTriangle } from "lucide-react";

interface Transaction {
  id: number; date: string; merchant: string; category: string; rail: string; amount: number; type: "credit" | "debit"; flagged?: boolean;
}

const transactions: Transaction[] = [
  { id: 1, date: "2024-12-15", merchant: "Amazon India", category: "Shopping", rail: "Card", amount: 4599, type: "debit" },
  { id: 2, date: "2024-12-15", merchant: "Salary - TCS", category: "Income", rail: "NEFT", amount: 345000, type: "credit" },
  { id: 3, date: "2024-12-14", merchant: "Swiggy", category: "Food", rail: "UPI", amount: 845, type: "debit" },
  { id: 4, date: "2024-12-14", merchant: "Netflix", category: "Entertainment", rail: "NACH", amount: 649, type: "debit" },
  { id: 5, date: "2024-12-13", merchant: "Rahul Sharma", category: "Transfer", rail: "UPI", amount: 2500, type: "debit" },
  { id: 6, date: "2024-12-13", merchant: "Unknown Merchant", category: "Uncategorized", rail: "UPI", amount: 15000, type: "debit", flagged: true },
  { id: 7, date: "2024-12-12", merchant: "Uber India", category: "Transport", rail: "UPI", amount: 342, type: "debit" },
  { id: 8, date: "2024-12-12", merchant: "Freelance Payment", category: "Income", rail: "IMPS", amount: 25000, type: "credit" },
  { id: 9, date: "2024-12-11", merchant: "Jio Recharge", category: "Bills", rail: "UPI", amount: 299, type: "debit" },
  { id: 10, date: "2024-12-10", merchant: "SIP - Mutual Fund", category: "Investment", rail: "NACH", amount: 10000, type: "debit" },
];

const railColors: Record<string, string> = {
  UPI: "border-primary/20 text-primary/80",
  NEFT: "border-accent/20 text-accent/80",
  Card: "border-warning/20 text-warning/80",
  NACH: "border-info/20 text-info/80",
  IMPS: "border-success/20 text-success/80",
};

const TransactionTable = () => {
  const [search, setSearch] = useState("");
  const filtered = transactions.filter(t => t.merchant.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border/20 flex flex-col sm:flex-row gap-3 justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transactions</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-[11px] bg-muted/30 border border-border/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground w-48" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead><tr className="border-b border-border/15">
            <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Date</th>
            <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Merchant</th>
            <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Category</th>
            <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Rail</th>
            <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Amount</th>
          </tr></thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-border/8 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5 text-muted-foreground">{t.date}</td>
                <td className="px-4 py-2.5 font-medium flex items-center gap-1.5">
                  {t.merchant}
                  {t.flagged && <AlertTriangle className="w-3 h-3 text-warning" />}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{t.category}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-1.5 py-0.5 rounded border text-[9px] font-medium ${railColors[t.rail] || "border-border/20 text-muted-foreground"}`}>{t.rail}</span>
                </td>
                <td className={`px-4 py-2.5 text-right font-semibold ${t.type === "credit" ? "text-success" : "text-destructive"}`}>
                  <span className="flex items-center justify-end gap-1">
                    {t.type === "credit" ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                    ₹{t.amount.toLocaleString("en-IN")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
