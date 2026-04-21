import { TrendingUp, AlertTriangle, CreditCard, Shield, Zap } from "lucide-react";
import insightsBg from "@/assets/insights-bg.jpg";

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  severity: "info" | "warning" | "alert";
}

const severityStyles = { info: "border-info/15", warning: "border-warning/15", alert: "border-destructive/15" };
const severityBadge = { info: "bg-info/10 text-info", warning: "bg-warning/10 text-warning", alert: "bg-destructive/10 text-destructive" };

const InsightCard = ({ icon, title, description, severity }: InsightCardProps) => (
  <div className={`rounded-xl border p-4 bg-card/40 transition-all hover:bg-card/60 ${severityStyles[severity]}`}>
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-medium">{title}</p>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${severityBadge[severity]}`}>{severity}</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

const SmartInsights = ({ fullPage = false }: { fullPage?: boolean }) => (
  <div className={fullPage ? "space-y-6" : ""}>
    {fullPage && (
      <div className="relative rounded-2xl overflow-hidden h-48 mb-6">
        <img src={insightsBg} alt="Financial insights" className="w-full h-full object-cover opacity-40" loading="lazy" width={1200} height={600} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent flex items-center px-8">
          <div>
            <h2 className="text-xl font-bold mb-1">Smart Insights</h2>
            <p className="text-sm text-muted-foreground">AI-powered analysis of your financial patterns</p>
          </div>
        </div>
      </div>
    )}
    <div className={`glass rounded-xl p-5 ${fullPage ? "" : ""}`}>
      {!fullPage && (
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Insights</h3>
        </div>
      )}
      <div className="space-y-2.5">
        <InsightCard icon={<TrendingUp className="w-3.5 h-3.5 text-warning" />} title="Expenses increased 20% this month" description="Driven by Shopping (+₹8K) and Food (+₹5K)." severity="warning" />
        <InsightCard icon={<CreditCard className="w-3.5 h-3.5 text-info" />} title="4 active auto-debits detected" description="Netflix, SIP Mutual Fund, Gym, Internet — totaling ₹13.8K/month." severity="info" />
        <InsightCard icon={<AlertTriangle className="w-3.5 h-3.5 text-destructive" />} title="Unusual transaction at 2:14 AM" description="₹15,000 to unknown merchant via UPI. Review recommended." severity="alert" />
        <InsightCard icon={<Shield className="w-3.5 h-3.5 text-info" />} title="Credit utilization healthy at 28%" description="₹14K of ₹50K limit. Keep below 30% for optimal credit score." severity="info" />
      </div>
    </div>
  </div>
);

export default SmartInsights;
