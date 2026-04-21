import { useState, useEffect, useRef } from "react";
import { Bell, Check, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="w-3 h-3 text-info" />,
  warning: <AlertTriangle className="w-3 h-3 text-warning" />,
  success: <CheckCircle className="w-3 h-3 text-success" />,
};

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unread.length === 0) return;
    for (const id of unread) {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mock notifications if empty
  const displayNotifications = notifications.length > 0 ? notifications : [
    { id: "m1", title: "Anomaly Detected", message: "₹15,000 to Unknown Merchant flagged", type: "warning", read: false, created_at: new Date().toISOString() },
    { id: "m2", title: "Savings Goal", message: "You're on track for ₹15L by March", type: "success", read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: "m3", title: "Monthly Report", message: "December spending report is ready", type: "info", read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  ];
  const displayUnread = notifications.length > 0 ? unreadCount : 2;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-1.5 rounded-lg hover:bg-muted transition-colors">
        <Bell className="w-4 h-4 text-muted-foreground" />
        {displayUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center px-0.5">
            {displayUnread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 glass-strong rounded-xl border border-border/30 shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-border/20 flex items-center justify-between">
            <span className="text-xs font-semibold">Notifications</span>
            {displayUnread > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-primary hover:underline flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {displayNotifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-border/10 hover:bg-muted/30 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">{typeIcons[n.type] || typeIcons.info}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{n.message}</p>
                  </div>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
