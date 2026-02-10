import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useLocation, Link } from "react-router-dom";
import {
  Sprout, ChevronRight, Globe, HelpCircle, User, ChevronDown, Bell,
} from "lucide-react";
import { Language } from "@/i18n/translations";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const langLabels: Record<Language, string> = { en: "English", hi: "हिंदी", mr: "मराठी" };

const routeNames: Record<string, string> = {
  "/": "nav.dashboard",
  "/soil": "nav.soil",
  "/crop": "nav.crop",
  "/disease": "nav.disease",
  "/yield": "nav.yield",
  "/market": "nav.market",
  "/schemes": "nav.schemes",
  "/reports": "nav.reports",
  "/settings": "nav.settings",
};

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const currentRoute = routeNames[location.pathname] || "nav.dashboard";

  return (
    <header className="h-[72px] bg-gradient-to-r from-primary to-primary/90 text-primary-foreground flex items-center px-6 justify-between shrink-0 z-50 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
          <Sprout className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-poppins font-bold tracking-tight leading-tight">{t("app.title")}</h1>
          <p className="text-[10px] text-primary-foreground/60 leading-tight">Intelligent Agriculture Platform</p>
        </div>
      </div>

      <nav className="flex items-center gap-1 text-sm text-primary-foreground/80">
        <Link to="/" className="hover:text-primary-foreground transition-colors">{t("common.home")}</Link>
        {location.pathname !== "/" && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="text-primary-foreground font-medium">{t(currentRoute)}</span>
          </>
        )}
      </nav>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl px-3 py-2 text-sm transition-colors">
            <Globe className="h-4 w-4" />
            {langLabels[language]}
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(Object.keys(langLabels) as Language[]).map((lang) => (
              <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)} className={language === lang ? "font-bold" : ""}>
                {langLabels[lang]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="relative p-2.5 rounded-xl hover:bg-primary-foreground/10 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
        </button>

        <button className="p-2.5 rounded-xl hover:bg-primary-foreground/10 transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl px-3 py-2 text-sm transition-colors">
            <div className="h-7 w-7 rounded-lg bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">RP</div>
            <span className="hidden lg:inline font-medium">Ravi Patil</span>
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>{t("common.profile")}</DropdownMenuItem>
            <DropdownMenuItem>{t("nav.settings")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
