import { useState, useEffect } from "react";
import { Shield, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SecurityPinModalProps {
  open: boolean;
  onVerified: () => void;
  onClose: () => void;
}

const SecurityPinModal = ({ open, onVerified, onClose }: SecurityPinModalProps) => {
  const { user } = useAuth();
  const [pin, setPin] = useState(["", "", "", ""]);
  const [checking, setChecking] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"verify" | "set">("verify");

  useEffect(() => {
    if (open && user) checkIfPinSet();
  }, [open, user]);

  const checkIfPinSet = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("security_pin")
      .eq("user_id", user!.id)
      .maybeSingle();
    if (data?.security_pin) {
      setHasPin(true);
      setMode("verify");
    } else {
      setHasPin(false);
      setMode("set");
    }
  };

  const handleInput = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) {
      const next = document.getElementById(`pin-${index + 1}`);
      next?.focus();
    }
    if (newPin.every((d) => d !== "") && newPin.join("").length === 4) {
      setTimeout(() => submitPin(newPin.join("")), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prev = document.getElementById(`pin-${index - 1}`);
      prev?.focus();
    }
  };

  const submitPin = async (pinValue: string) => {
    setChecking(true);
    if (mode === "set") {
      const { error } = await supabase
        .from("profiles")
        .update({ security_pin: pinValue })
        .eq("user_id", user!.id);
      if (error) toast.error("Failed to set PIN");
      else {
        toast.success("Security PIN set!");
        onVerified();
      }
    } else {
      const { data } = await supabase
        .from("profiles")
        .select("security_pin")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (data?.security_pin === pinValue) {
        onVerified();
      } else {
        toast.error("Incorrect PIN");
        setPin(["", "", "", ""]);
        document.getElementById("pin-0")?.focus();
      }
    }
    setChecking(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="glass-strong rounded-2xl p-8 w-full max-w-sm mx-4 relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold">{mode === "set" ? "Set Security PIN" : "Enter PIN"}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {mode === "set" ? "Create a 4-digit PIN to protect sensitive data" : "Enter your 4-digit security PIN"}
          </p>
        </div>
        <div className="flex justify-center gap-3 mb-6">
          {pin.map((digit, i) => (
            <input
              key={i}
              id={`pin-${i}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold bg-muted/50 border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              autoFocus={i === 0}
            />
          ))}
        </div>
        {checking && (
          <div className="flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityPinModal;
