import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, Gauge } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  subtitle?: string;
  delay?: number;
}

const MetricCard = ({ title, value, change, changeType, icon, subtitle, delay = 0 }: MetricCardProps) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`glass rounded-xl p-5 transition-all duration-700 hover:glow-primary hover-lift ${visible ? "animate-pop-in" : "opacity-0"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-primary/8 border border-primary/10 hover:animate-squash">{icon}</div>
        <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
          changeType === "positive" ? "bg-success/10 text-success" : changeType === "negative" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
        }`}>
          {changeType === "positive" ? <ArrowUpRight className="w-2.5 h-2.5" /> : changeType === "negative" ? <ArrowDownRight className="w-2.5 h-2.5" /> : null}
          {change}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <p className="text-xl font-bold tracking-tight">{value}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
};

const CashFlowGauge = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => { const t = setTimeout(() => setProgress(72), 600); return () => clearTimeout(t); }, []);

  return (
    <div className="glass rounded-xl p-5 transition-all duration-700 hover:glow-accent hover-lift animate-pop-in" style={{ animationDelay: "400ms" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-accent/8 border border-accent/10 animate-breathe"><Gauge className="w-4 h-4 text-accent" /></div>
        <span className="text-[10px] text-muted-foreground">Financial Health</span>
      </div>
      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
        <div className="absolute top-0 left-0 h-full gradient-shimmer rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xl font-bold">72<span className="text-xs text-muted-foreground">/100</span></p>
          <p className="text-[10px] text-muted-foreground">Score</p>
        </div>
        <div className="text-right">
          <p className="text-base font-semibold text-success">42d</p>
          <p className="text-[10px] text-muted-foreground">Days to Zero</p>
        </div>
      </div>
    </div>
  );
};

const MetricCards = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
    <MetricCard title="Total Balance" value="₹12,84,520" change="+8.2%" changeType="positive" icon={<Wallet className="w-4 h-4 text-primary" />} subtitle="Across 3 accounts" delay={0} />
    <MetricCard title="Income Flow" value="₹3,45,000" change="+12.5%" changeType="positive" icon={<TrendingUp className="w-4 h-4 text-success" />} subtitle="This month" delay={100} />
    <MetricCard title="Expense Burn" value="₹1,82,340" change="+4.1%" changeType="negative" icon={<TrendingDown className="w-4 h-4 text-destructive" />} subtitle="₹6,078/day" delay={200} />
    <MetricCard title="Savings Rate" value="47.1%" change="+3.2%" changeType="positive" icon={<PiggyBank className="w-4 h-4 text-primary" />} subtitle="Above 40% target" delay={300} />
    <CashFlowGauge />
  </div>
);

export default MetricCards;
