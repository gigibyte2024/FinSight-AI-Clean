import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  chart?: ChartData;
}

interface ChartData {
  type: "pie" | "bar" | "area";
  data: any[];
  dataKey: string;
  nameKey?: string;
  title: string;
}

const suggestedQueries = [
  "Biggest expense this month?",
  "UPI payment summary",
  "Any anomalies?",
  "Savings trend",
  "Monthly spending breakdown",
  "Balance trajectory",
];

const chartColors = [
  "hsl(40, 50%, 55%)", "hsl(40, 30%, 45%)", "hsl(145, 40%, 40%)",
  "hsl(200, 50%, 45%)", "hsl(220, 10%, 40%)", "hsl(0, 50%, 45%)",
];

const spendingPie: ChartData = {
  type: "pie",
  title: "Spending by Category",
  data: [
    { name: "Food & Dining", value: 42000 }, { name: "Shopping", value: 28000 },
    { name: "Transport", value: 15000 }, { name: "Bills", value: 22000 },
    { name: "Entertainment", value: 12000 }, { name: "Other", value: 8000 },
  ],
  dataKey: "value",
  nameKey: "name",
};

const monthlyBar: ChartData = {
  type: "bar",
  title: "Monthly Expenses (₹)",
  data: [
    { month: "Jul", amount: 145000 }, { month: "Aug", amount: 162000 },
    { month: "Sep", amount: 138000 }, { month: "Oct", amount: 175000 },
    { month: "Nov", amount: 158000 }, { month: "Dec", amount: 182340 },
  ],
  dataKey: "amount",
  nameKey: "month",
};

const savingsArea: ChartData = {
  type: "area",
  title: "Savings Rate Trend (%)",
  data: [
    { month: "Jul", rate: 38 }, { month: "Aug", rate: 41 },
    { month: "Sep", rate: 45 }, { month: "Oct", rate: 42 },
    { month: "Nov", rate: 44 }, { month: "Dec", rate: 47.1 },
  ],
  dataKey: "rate",
  nameKey: "month",
};

const upiBar: ChartData = {
  type: "bar",
  title: "UPI Top Payees (₹)",
  data: [
    { name: "Swiggy", amount: 12400 }, { name: "Zomato", amount: 8900 },
    { name: "Amazon", amount: 6200 }, { name: "Rahul", amount: 3200 },
    { name: "Uber", amount: 2800 },
  ],
  dataKey: "amount",
  nameKey: "name",
};

const balanceArea: ChartData = {
  type: "area",
  title: "Balance Trajectory (₹)",
  data: [
    { month: "Jul", balance: 980000 }, { month: "Aug", balance: 1020000 },
    { month: "Sep", balance: 1085000 }, { month: "Oct", balance: 1120000 },
    { month: "Nov", balance: 1195000 }, { month: "Dec", balance: 1284520 },
  ],
  dataKey: "balance",
  nameKey: "month",
};

const mockResponses: Record<string, { text: string; chart?: ChartData }> = {
  default: { text: "Your savings rate of 47.1% is above the recommended 30% threshold. Your financial health score is 72/100 — trending upward over the last 3 months.", chart: savingsArea },
  expense: { text: "Your biggest category is **Food & Dining** at ₹42,000 (33% of spend). Shopping follows at ₹28,000. Food spending increased 15% vs last month.", chart: spendingPie },
  upi: { text: "**142 UPI transactions** this month totaling ₹85,000. Top payees: Swiggy (24 txns), Zomato (18 txns), Amazon (12 txns).", chart: upiBar },
  anomal: { text: "⚠️ **1 anomalous transaction detected:**\n\n₹15,000 to Unknown Merchant via UPI at 2:14 AM on Dec 13. Flagged due to unusual timing + amount + unknown payee." },
  saving: { text: "Savings trend (6 months): Jul: 38% → Aug: 41% → Sep: 45% → Oct: 42% → Nov: 44% → **Dec: 47.1%**\n\nAt this rate, you'll hit ₹15L savings by March 2025.", chart: savingsArea },
  spending: { text: "December monthly spending: ₹1,82,340 (+4.1% vs Nov). Largest increase in Food & Dining (+₹4,200). Here's the 6-month breakdown:", chart: monthlyBar },
  balance: { text: "Your balance has grown steadily from ₹9.8L in July to ₹12.84L in December — a 31% increase over 6 months.", chart: balanceArea },
};

const getResponse = (input: string): { text: string; chart?: ChartData } => {
  const l = input.toLowerCase();
  if (l.includes("expense") || l.includes("biggest")) return mockResponses.expense;
  if (l.includes("upi")) return mockResponses.upi;
  if (l.includes("anomal") || l.includes("unusual")) return mockResponses.anomal;
  if (l.includes("saving") || l.includes("trend")) return mockResponses.saving;
  if (l.includes("spending") || l.includes("breakdown")) return mockResponses.spending;
  if (l.includes("balance") || l.includes("trajectory")) return mockResponses.balance;
  return mockResponses.default;
};

const MiniTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-2 py-1 text-[10px] border border-border/30">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{typeof payload[0].value === "number" && payload[0].value > 1000 ? `₹${(payload[0].value / 1000).toFixed(0)}K` : payload[0].value}</p>
    </div>
  );
};

const InlineChart = ({ chart }: { chart: ChartData }) => (
  <div className="mt-2 p-3 rounded-lg bg-background/50 border border-border/20">
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{chart.title}</p>
    <ResponsiveContainer width="100%" height={120}>
      {chart.type === "pie" ? (
        <PieChart>
          <Pie data={chart.data} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey={chart.dataKey} strokeWidth={0}>
            {chart.data.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
          </Pie>
          <Tooltip content={<MiniTooltip />} />
        </PieChart>
      ) : chart.type === "bar" ? (
        <BarChart data={chart.data}>
          <XAxis dataKey={chart.nameKey} tick={{ fontSize: 9, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => v > 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
          <Tooltip content={<MiniTooltip />} />
          <Bar dataKey={chart.dataKey} fill="hsl(40, 50%, 55%)" radius={[2, 2, 0, 0]} opacity={0.8} />
        </BarChart>
      ) : (
        <AreaChart data={chart.data}>
          <defs>
            <linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(40, 50%, 55%)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(40, 50%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey={chart.nameKey} tick={{ fontSize: 9, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => v > 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`} />
          <Tooltip content={<MiniTooltip />} />
          <Area type="monotone" dataKey={chart.dataKey} stroke="hsl(40, 50%, 55%)" fill="url(#miniGrad)" strokeWidth={1.5} />
        </AreaChart>
      )}
    </ResponsiveContainer>
    {chart.type === "pie" && (
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {chart.data.map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-1 text-[9px]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: chartColors[i % chartColors.length] }} />
            <span className="text-muted-foreground">{item[chart.nameKey!]}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const AIAssistant = ({ fullPage = false }: { fullPage?: boolean }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", content: "Hello! I'm your AI financial assistant. Ask me about spending patterns, anomalies, savings, or anything about your finances. I'll show you charts and insights!" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content: text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const resp = getResponse(text);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: resp.text, chart: resp.chart }]);
      setTyping(false);
    }, 1200);
  };

  return (
    <div className={`glass rounded-xl flex flex-col ${fullPage ? "h-[calc(100vh-8rem)]" : "h-[460px]"}`}>
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
        <div className="p-1.5 rounded-lg gradient-primary"><Sparkles className="w-3 h-3 text-primary-foreground" /></div>
        <h3 className="text-xs font-semibold">AI Assistant</h3>
        <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">Online</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3 h-3 text-primary" />
              </div>
            )}
            <div className={`${fullPage ? "max-w-[70%]" : "max-w-[80%]"}`}>
              <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                msg.role === "user" ? "gradient-primary text-primary-foreground" : "bg-muted/50 border border-border/20"
              }`}>{msg.content}</div>
              {msg.chart && <InlineChart chart={msg.chart} />}
            </div>
            {msg.role === "user" && (
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3 h-3 text-accent" />
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Bot className="w-3 h-3 text-primary" /></div>
            <div className="bg-muted/50 border border-border/20 px-4 py-2.5 rounded-xl flex gap-1">
              {[0, 150, 300].map((d) => <span key={d} className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-border/30">
        <div className="flex flex-wrap gap-1 mb-2">
          {suggestedQueries.map((q) => (
            <button key={q} onClick={() => send(q)} className="text-[10px] px-2 py-1 rounded-full border border-primary/20 text-primary/80 hover:bg-primary/10 transition-colors">{q}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Ask anything…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)}
            className="flex-1 px-3 py-2 text-xs bg-muted/50 border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground" />
          <button onClick={() => send(input)} className="p-2 rounded-lg gradient-primary hover:opacity-90 transition-opacity">
            <Send className="w-3 h-3 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
