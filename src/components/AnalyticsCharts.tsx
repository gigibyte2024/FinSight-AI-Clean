import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";

const spendingData = [
  { name: "Food & Dining", value: 42000, color: "hsl(40, 50%, 55%)" },
  { name: "Shopping", value: 28000, color: "hsl(40, 30%, 45%)" },
  { name: "Transport", value: 15000, color: "hsl(145, 40%, 40%)" },
  { name: "Bills", value: 22000, color: "hsl(200, 50%, 45%)" },
  { name: "Entertainment", value: 12000, color: "hsl(220, 10%, 40%)" },
  { name: "Other", value: 8000, color: "hsl(220, 10%, 30%)" },
];

const monthlyExpense = [
  { month: "Jul", amount: 145000 }, { month: "Aug", amount: 162000 },
  { month: "Sep", amount: 138000 }, { month: "Oct", amount: 175000 },
  { month: "Nov", amount: 158000 }, { month: "Dec", amount: 182340 },
];

const balanceTrajectory = [
  { month: "Jul", balance: 980000 }, { month: "Aug", balance: 1020000 },
  { month: "Sep", balance: 1085000 }, { month: "Oct", balance: 1120000 },
  { month: "Nov", balance: 1195000 }, { month: "Dec", balance: 1284520 },
];

const paymentRails = [
  { rail: "UPI", count: 142, amount: 85000 },
  { rail: "NEFT", count: 8, amount: 245000 },
  { rail: "Card", count: 34, amount: 62000 },
  { rail: "NACH", count: 6, amount: 45000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs border border-border/30">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">₹{(payload[0].value / 1000).toFixed(0)}K</p>
    </div>
  );
};

const AnalyticsCharts = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    <div className="glass rounded-xl p-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Spending Distribution</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="50%" height={160}>
          <PieChart>
            <Pie data={spendingData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
              {spendingData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5">
          {spendingData.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-[11px]">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-medium ml-auto">₹{(item.value / 1000).toFixed(0)}K</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="glass rounded-xl p-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Monthly Expenses</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={monthlyExpense}>
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" fill="hsl(40, 50%, 55%)" radius={[3, 3, 0, 0]} opacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="glass rounded-xl p-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Balance Trajectory</h3>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={balanceTrajectory}>
          <defs>
            <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(40, 50%, 55%)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(40, 50%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 14%)" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 100000}L`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="balance" stroke="hsl(40, 50%, 55%)" fill="url(#balGrad)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    <div className="glass rounded-xl p-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Payment Rails</h3>
      <div className="space-y-3">
        {paymentRails.map((rail) => {
          const pct = (rail.amount / paymentRails.reduce((a, b) => a + b.amount, 0)) * 100;
          return (
            <div key={rail.rail}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-medium">{rail.rail}</span>
                <span className="text-muted-foreground">{rail.count} txns · ₹{(rail.amount / 1000).toFixed(0)}K</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full gradient-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default AnalyticsCharts;
