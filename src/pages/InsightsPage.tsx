import TopNav from "@/components/TopNav";
import SmartInsights from "@/components/SmartInsights";
import AnalyticsCharts from "@/components/AnalyticsCharts";

const InsightsPage = () => (
  <div className="min-h-screen bg-background">
    <TopNav />
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-20 pb-12 space-y-5">
      <SmartInsights fullPage />
      <AnalyticsCharts />
    </main>
  </div>
);

export default InsightsPage;
