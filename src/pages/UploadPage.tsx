import TopNav from "@/components/TopNav";
import UploadSection from "@/components/UploadSection";

const UploadPage = () => (
  <div className="min-h-screen bg-background">
    <TopNav />
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-20 pb-12">
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight">Upload & Connect</h2>
        <p className="text-sm text-muted-foreground mt-1">Import bank statements or connect via Account Aggregator</p>
      </div>
      <UploadSection fullPage />
    </main>
  </div>
);

export default UploadPage;
