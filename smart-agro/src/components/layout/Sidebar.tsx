import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FlaskConical, Wheat, Bug, TrendingUp,
  Store, FileText, Settings, ChevronLeft, ChevronRight, Landmark, UserCircle,
  Sprout, Cloud,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "nav.dashboard", emoji: "🏠" },
  { path: "/weather", icon: Cloud, label: "nav.weather", emoji: "🌤️" },
  { path: "/profile", icon: UserCircle, label: "nav.profile", emoji: "👤" },
  { path: "/soil", icon: FlaskConical, label: "nav.soil", emoji: "🧪" },
  { path: "/crop", icon: Wheat, label: "nav.crop", emoji: "🌾" },
  { path: "/disease", icon: Bug, label: "nav.disease", emoji: "🔬" },
  { path: "/yield", icon: TrendingUp, label: "nav.yield", emoji: "📈" },
  { path: "/market", icon: Store, label: "nav.market", emoji: "🏪" },
  { path: "/schemes", icon: Landmark, label: "nav.schemes", emoji: "🏛️" },
  { path: "/reports", icon: FileText, label: "nav.reports", emoji: "📄" },
  { path: "/settings", icon: Settings, label: "nav.settings", emoji: "⚙️" },
];

const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-black flex flex-col shrink-0 transition-all duration-300 relative shadow-2xl border-r border-white/10 overflow-y-auto scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-black",
        collapsed ? "w-[72px]" : "w-[280px]"
      )}
      style={{ maxHeight: '100vh' }}
    >
      {/* Logo section when collapsed */}
      {collapsed && (
        <div className="py-4 flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-green-600/80 flex items-center justify-center shadow-lg">
            <Sprout className="h-6 w-6 text-white" />
          </div>
        </div>
      )}
      
      <nav className="flex-1 py-4 space-y-2 px-3">
        {navItems.map((item) => (
          <Tooltip key={item.path} delayDuration={collapsed ? 0 : 500}>
            <TooltipTrigger asChild>
              <NavLink
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-4 rounded-xl text-[16px] font-semibold transition-all duration-200",
                    "hover:bg-white/15 hover:translate-x-1 group touch-target",
                    isActive
                      ? "bg-green-600/30 text-white shadow-lg border-l-4 border-green-500"
                      : "text-white/90 hover:text-white bg-white/5"
                  )
                }
              >
                <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-green-600/20 group-hover:bg-green-600/30 transition-colors">
                  <item.icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                  {/* Show emoji badge when collapsed */}
                  {collapsed && (
                    <span className="absolute -top-1 -right-1 text-sm">
                      {item.emoji}
                    </span>
                  )}
                </div>
                {!collapsed && (
                  <span className="truncate flex items-center gap-3">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-white drop-shadow-sm">{t(item.label)}</span>
                  </span>
                )}
              </NavLink>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="font-medium text-base">
                <span className="flex items-center gap-2">
                  {item.emoji} {t(item.label)}
                </span>
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </nav>

      {/* Bottom help section
      {!collapsed && (
        <div className="p-4 mx-3 mb-4 bg-green-600/20 rounded-xl border border-green-500/30 shadow-inner">
          <p className="text-white text-sm leading-relaxed font-medium">
            💡 Tip: Use voice assistant for quick help in Hindi, Marathi!
          </p>
        </div>
      )} */}

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-8 bg-green-600 border-2 border-white text-white rounded-full p-2 shadow-xl hover:bg-green-500 hover:scale-110 transition-all"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
};

export default Sidebar;
