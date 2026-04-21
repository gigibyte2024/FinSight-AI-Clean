import { useState } from "react";
import { Bell, Activity, User, ChevronDown, LogOut, Menu, X } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Payments", path: "/payments" },
  { label: "Insights", path: "/insights" },
  { label: "AI Assistant", path: "/assistant" },
  { label: "Upload", path: "/upload" },
  { label: "Settings", path: "/settings" },
];

const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/30">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
        <div className="flex items-center gap-4 lg:gap-8">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileNav(!mobileNav)}>
            {mobileNav ? <X className="w-4 h-4 text-muted-foreground" /> : <Menu className="w-4 h-4 text-muted-foreground" />}
          </button>
          <h1 className="text-lg font-bold gradient-text tracking-tight cursor-pointer hover:animate-squash" onClick={() => navigate("/")}>FinSight AI</h1>
          <div className="flex items-center gap-0.5">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`anticipate px-3 py-1.5 text-xs font-medium rounded-md transition-all relative ${
                  location.pathname === item.path ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                {location.pathname === item.path && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 gradient-shimmer rounded-full animate-scale-in" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
            <Activity className="w-2.5 h-2.5 text-success animate-pulse" />
            <span className="text-[10px] font-medium text-success">Live</span>
          </div>
          <NotificationDropdown />
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted transition-colors">
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email?.split("@")[0]}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 glass-strong rounded-lg border border-border/30 py-1 shadow-xl">
                <button onClick={() => { signOut(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile navigation drawer */}
      {mobileNav && (
        <div className="lg:hidden border-t border-border/30 glass-strong px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileNav(false); }}
              className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                location.pathname === item.path
                  ? "text-foreground bg-muted/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default TopNav;
