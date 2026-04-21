import { Upload, Link2, CheckCircle, RefreshCw, FileText, Database } from "lucide-react";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const UploadSection = ({ fullPage = false }: { fullPage?: boolean }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const processCSV = useCallback(async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.trim().split("\n");
      if (lines.length < 2) { toast.error("CSV must have a header and data rows"); return; }
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const dateIdx = headers.findIndex(h => h.includes("date"));
      const merchantIdx = headers.findIndex(h => h.includes("merchant") || h.includes("name") || h.includes("description"));
      const amountIdx = headers.findIndex(h => h.includes("amount"));
      const typeIdx = headers.findIndex(h => h.includes("type"));

      if (amountIdx === -1) { toast.error("CSV must have an 'amount' column"); return; }

      let inserted = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map(c => c.trim());
        if (cols.length < 2) continue;
        const amount = parseFloat(cols[amountIdx]?.replace(/[₹,]/g, ""));
        if (isNaN(amount)) continue;
        const { error } = await supabase.from("transactions").insert({
          user_id: user.id,
          date: dateIdx >= 0 ? cols[dateIdx] : new Date().toISOString().split("T")[0],
          merchant: merchantIdx >= 0 ? cols[merchantIdx] : "Unknown",
          amount: Math.abs(amount),
          type: typeIdx >= 0 ? (cols[typeIdx]?.toLowerCase().includes("credit") ? "credit" : "debit") : (amount >= 0 ? "credit" : "debit"),
        });
        if (!error) inserted++;
      }
      toast.success(`Imported ${inserted} transactions`);
    } catch (e) {
      toast.error("Failed to parse CSV");
    } finally {
      setUploading(false);
    }
  }, [user]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) processCSV(file);
    else toast.error("Please upload a CSV file");
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.name.endsWith(".csv")) processCSV(file);
    else toast.error("Please upload a CSV file");
  };

  return (
    <div className={`glass rounded-xl p-5 ${fullPage ? "max-w-3xl mx-auto" : ""}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Data Integration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragOver ? "border-primary/50 bg-primary/5" : "border-border/30 hover:border-primary/30"
          }`}
        >
          <input type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
          {uploading ? (
            <RefreshCw className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          )}
          <p className="text-sm font-medium mb-1">{uploading ? "Processing..." : "Upload Statement"}</p>
          <p className="text-[11px] text-muted-foreground">Drag & drop CSV file</p>
        </label>
        <div className="space-y-3">
          <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-primary/15 hover:bg-primary/5 transition-colors">
            <Link2 className="w-4 h-4 text-primary" />
            <div className="text-left">
              <p className="text-xs font-medium">Connect Bank (AA)</p>
              <p className="text-[10px] text-muted-foreground">Open banking integration</p>
            </div>
          </button>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/15">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            <div className="flex-1">
              <p className="text-[11px] font-medium text-success">HDFC Connected</p>
              <p className="text-[9px] text-muted-foreground">Synced 2 min ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/20">
            <RefreshCw className="w-3.5 h-3.5 text-warning animate-spin" />
            <div className="flex-1">
              <p className="text-[11px] font-medium text-warning">SBI Syncing...</p>
              <p className="text-[9px] text-muted-foreground">142 transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
