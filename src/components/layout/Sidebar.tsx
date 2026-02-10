import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FlaskConical, Wheat, Bug, TrendingUp,
  Store, FileText, Settings, ChevronLeft, ChevronRight, Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "nav.dashboard" },
  { path: "/soil", icon: FlaskConical, label: "nav.soil" },
  { path: "/crop", icon: Wheat, label: "nav.crop" },
  { path: "/disease", icon: Bug, label: "nav.disease" },
  { path: "/yield", icon: TrendingUp, label: "nav.yield" },
  { path: "/market", icon: Store, label: "nav.market" },
  { path: "/schemes", icon: Landmark, label: "nav.schemes" },
  { path: "/reports", icon: FileText, label: "nav.reports" },
  { path: "/settings", icon: Settings, label: "nav.settings" },
];

const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-secondary flex flex-col shrink-0 transition-all duration-300 relative shadow-xl",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <nav className="flex-1 py-4 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-all duration-200",
                "hover:bg-secondary-foreground/10 hover:translate-x-0.5",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md pl-2.5"
                  : "text-secondary-foreground/70 pl-2.5"
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{t(item.label)}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-8 bg-secondary border border-secondary text-secondary-foreground rounded-full p-1.5 shadow-lg hover:bg-primary hover:text-primary-foreground transition-all"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </aside>
  );
};

export default Sidebar;
