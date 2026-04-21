import { Users, CreditCard } from "lucide-react";

const topPayees = [
  { name: "Swiggy", amount: 12400, txns: 24, avatar: "🍔" },
  { name: "Zomato", amount: 8900, txns: 18, avatar: "🍕" },
  { name: "Amazon", amount: 7200, txns: 6, avatar: "📦" },
  { name: "Rahul Sharma", amount: 3200, txns: 5, avatar: "👤" },
  { name: "Uber India", amount: 2800, txns: 12, avatar: "🚗" },
];

const subscriptions = [
  { name: "Netflix", amount: 649, status: "active", nextDate: "Jan 15" },
  { name: "SIP - Axis MF", amount: 10000, status: "active", nextDate: "Jan 5" },
  { name: "Home EMI", amount: 22000, status: "active", nextDate: "Jan 1" },
  { name: "Gym", amount: 2000, status: "paused", nextDate: "—" },
];

const PaymentIntelligence = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Payees</h3>
      </div>
      <div className="space-y-2.5">
        {topPayees.map((p, i) => (
          <div key={p.name} className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground w-3 font-mono">#{i + 1}</span>
            <span className="text-sm">{p.avatar}</span>
            <div className="flex-1">
              <p className="text-xs font-medium">{p.name}</p>
              <p className="text-[9px] text-muted-foreground">{p.txns} txns</p>
            </div>
            <p className="text-xs font-semibold">₹{p.amount.toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subscriptions & NACH</h3>
      </div>
      <div className="space-y-2">
        {subscriptions.map((s) => (
          <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/15 hover:bg-muted/25 transition-colors">
            <div>
              <p className="text-xs font-medium">{s.name}</p>
              <p className="text-[9px] text-muted-foreground">Next: {s.nextDate}</p>
            </div>
            <div className="text-right flex items-center gap-2">
              <p className="text-xs font-semibold">₹{s.amount.toLocaleString("en-IN")}</p>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${s.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{s.status}</span>
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-border/15 flex justify-between text-[11px]">
          <span className="text-muted-foreground">Total mandates</span>
          <span className="font-semibold">₹34,649</span>
        </div>
      </div>
    </div>
  </div>
);

export default PaymentIntelligence;
