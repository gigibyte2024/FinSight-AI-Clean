import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import TopNav from "@/components/TopNav";
import SecurityPinModal from "@/components/SecurityPinModal";
import { User, Smartphone, Plus, Trash2, Star, Save, Loader2, Sun, Moon, Shield, Camera, Lock } from "lucide-react";

interface LinkedUpi {
  id: string;
  upi_id: string;
  label: string;
  is_primary: boolean;
}

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  security_pin: string | null;
}

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile>({ display_name: "", avatar_url: "", security_pin: null });
  const [upis, setUpis] = useState<LinkedUpi[]>([]);
  const [newUpi, setNewUpi] = useState("");
  const [newLabel, setNewLabel] = useState("Personal");
  const [saving, setSaving] = useState(false);
  const [addingUpi, setAddingUpi] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUpis();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, security_pin")
      .eq("user_id", user!.id)
      .maybeSingle();
    if (data) setProfile(data);
    setLoading(false);
  };

  const fetchUpis = async () => {
    const { data } = await supabase
      .from("linked_upis")
      .select("id, upi_id, label, is_primary")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: true });
    if (data) setUpis(data);
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: profile.display_name })
      .eq("user_id", user!.id);
    if (error) toast.error("Failed to save profile");
    else toast.success("Profile updated");
    setSaving(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Max 2MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user!.id);
    setProfile({ ...profile, avatar_url: avatarUrl });
    toast.success("Profile picture updated");
    setUploading(false);
  };

  const removePin = async () => {
    await supabase.from("profiles").update({ security_pin: null }).eq("user_id", user!.id);
    setProfile({ ...profile, security_pin: null });
    toast.success("Security PIN removed");
  };

  const addUpi = async () => {
    if (!newUpi.trim() || !newUpi.includes("@")) {
      toast.error("Enter a valid UPI ID (e.g. name@upi)");
      return;
    }
    setAddingUpi(true);
    const { error } = await supabase
      .from("linked_upis")
      .insert({ user_id: user!.id, upi_id: newUpi.trim(), label: newLabel, is_primary: upis.length === 0 });
    if (error) toast.error("Failed to add UPI");
    else {
      toast.success("UPI linked successfully");
      setNewUpi("");
      setNewLabel("Personal");
      fetchUpis();
    }
    setAddingUpi(false);
  };

  const removeUpi = async (id: string) => {
    const { error } = await supabase.from("linked_upis").delete().eq("id", id);
    if (error) toast.error("Failed to remove UPI");
    else {
      toast.success("UPI removed");
      fetchUpis();
    }
  };

  const setPrimary = async (id: string) => {
    await supabase.from("linked_upis").update({ is_primary: false }).eq("user_id", user!.id);
    await supabase.from("linked_upis").update({ is_primary: true }).eq("id", id);
    toast.success("Primary UPI updated");
    fetchUpis();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="max-w-[800px] mx-auto px-4 sm:px-6 pt-20 pb-12 space-y-6">
        <h2 className="text-xl font-bold tracking-tight">Settings</h2>

        {/* Profile Section */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Profile</h3>
          </div>
          <div className="space-y-4">
            {/* Avatar upload */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border-2 border-border/30">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full gradient-primary flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-foreground" />
                  ) : (
                    <Camera className="w-4 h-4 text-foreground" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploading} />
                </label>
              </div>
              <div>
                <p className="text-sm font-medium">{profile.display_name || user?.email?.split("@")[0]}</p>
                <p className="text-[10px] text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Display Name</label>
              <input
                type="text"
                value={profile.display_name || ""}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-muted/50 border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                placeholder="Your name"
              />
            </div>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Profile
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Sun className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Appearance</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-[10px] text-muted-foreground">Switch between light and dark mode</p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/20">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${theme === "light" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                <Sun className="w-3 h-3" /> Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${theme === "dark" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                <Moon className="w-3 h-3" /> Dark
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Security PIN</p>
                <p className="text-[10px] text-muted-foreground">
                  {profile.security_pin ? "PIN is set — required for sensitive actions" : "No PIN set — add one to protect sensitive data"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {profile.security_pin && (
                  <button
                    onClick={removePin}
                    className="px-3 py-1.5 text-xs rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Remove
                  </button>
                )}
                <button
                  onClick={() => setShowPinModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Lock className="w-3 h-3" />
                  {profile.security_pin ? "Change PIN" : "Set PIN"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Linked UPIs */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Smartphone className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Linked UPI Accounts</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Link your UPI IDs to track transactions and get insights across all your payment accounts.</p>

          {upis.length > 0 && (
            <div className="space-y-2 mb-5">
              {upis.map((upi) => (
                <div key={upi.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/15">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                      <Smartphone className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{upi.upi_id}</p>
                      <p className="text-[10px] text-muted-foreground">{upi.label}{upi.is_primary && " · Primary"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!upi.is_primary && (
                      <button onClick={() => setPrimary(upi.id)} className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-primary" title="Set as primary">
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {upi.is_primary && (
                      <span className="p-1.5"><Star className="w-3.5 h-3.5 text-primary fill-primary" /></span>
                    )}
                    <button onClick={() => removeUpi(upi.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive" title="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text" value={newUpi} onChange={(e) => setNewUpi(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm bg-muted/50 border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
              placeholder="yourname@upi"
            />
            <select value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
              className="px-3 py-2.5 text-sm bg-muted/50 border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
            >
              <option value="Personal">Personal</option>
              <option value="Business">Business</option>
              <option value="Savings">Savings</option>
              <option value="Other">Other</option>
            </select>
            <button onClick={addUpi} disabled={addingUpi}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {addingUpi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Link UPI
            </button>
          </div>
        </div>
      </main>

      <SecurityPinModal
        open={showPinModal}
        onVerified={() => { setShowPinModal(false); fetchProfile(); }}
        onClose={() => setShowPinModal(false)}
      />
    </div>
  );
};

export default SettingsPage;
