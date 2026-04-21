import TopNav from "@/components/TopNav";
import PaymentIntelligence from "@/components/PaymentIntelligence";
import TransactionTable from "@/components/TransactionTable";

const PaymentsPage = () => (
  <div className="min-h-screen bg-background">
    <TopNav />
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-20 pb-12 space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Payments Intelligence</h2>
        <p className="text-sm text-muted-foreground mt-1">Track payment flows, rails, and patterns</p>
      </div>
      <PaymentIntelligence />
      <TransactionTable />
    </main>
  </div>
);

export default PaymentsPage;
