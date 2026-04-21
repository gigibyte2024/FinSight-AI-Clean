import TopNav from "@/components/TopNav";
import AIAssistant from "@/components/AIAssistant";

const AssistantPage = () => (
  <div className="min-h-screen bg-background">
    <TopNav />
    <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-12">
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight">AI Financial Assistant</h2>
        <p className="text-sm text-muted-foreground mt-1">Ask anything about your finances</p>
      </div>
      <AIAssistant fullPage />
    </main>
  </div>
);

export default AssistantPage;
