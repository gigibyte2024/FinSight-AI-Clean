import TopNav from "@/components/TopNav";
import MetricCards from "@/components/MetricCards";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import TransactionTable from "@/components/TransactionTable";
import AIAssistant from "@/components/AIAssistant";
import SmartInsights from "@/components/SmartInsights";
import heroAbstract from "@/assets/hero-abstract.jpg";

const Index = () => (
  <div className="min-h-screen bg-background">
    <TopNav />
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-18 pb-12 space-y-5">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden h-40 mt-2 animate-pop-in hover-lift">
        <img src={heroAbstract} alt="Financial data visualization" className="w-full h-full object-cover opacity-50 animate-breathe" width={1920} height={800} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent flex items-center px-8">
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-2xl font-bold tracking-tight mb-1">Financial Command Center</h2>
            <p className="text-sm text-muted-foreground">Real-time intelligence across all accounts</p>
          </div>
        </div>
      </div>

      <MetricCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <AnalyticsCharts />
          <TransactionTable />
        </div>
        <div className="space-y-5">
          <AIAssistant />
          <SmartInsights />
        </div>
      </div>
    </main>
  </div>
);

export default Index;
