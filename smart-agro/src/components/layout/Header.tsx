import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFarmLocation } from "@/contexts/FarmLocationContext";
import { useLocation, Link } from "react-router-dom";
import {
  Sprout, ChevronRight, Globe, HelpCircle, User, ChevronDown, Bell, Phone,
  MapPin, Navigation, Loader2,
} from "lucide-react";
import { Language } from "@/i18n/translations";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const langLabels: Record<Language, string> = { en: "English", hi: "हिंदी", mr: "मराठी" };
const langEmoji: Record<Language, string> = { en: "🇬🇧", hi: "🇮🇳", mr: "🇮🇳" };

const routeNames: Record<string, string> = {
  "/": "nav.dashboard",
  "/profile": "nav.profile",
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
  const { location: farmLocation, detectLocation, isDetecting } = useFarmLocation();
  const location = useLocation();
  const currentRoute = routeNames[location.pathname] || "nav.dashboard";

  return (
    <header className="h-[72px] bg-gradient-to-r from-primary via-primary to-green-600 text-primary-foreground flex items-center px-6 justify-between shrink-0 z-50 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-primary-foreground/15 flex items-center justify-center hover:bg-primary-foreground/25 transition-colors cursor-pointer">
          <Sprout className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-poppins font-bold tracking-tight leading-tight">{t("app.title")}</h1>
          <p className="text-[10px] text-primary-foreground/60 leading-tight">
            {language === "hi" ? "बुद्धिमान कृषि सहायक" : language === "mr" ? "बुद्धिमान शेती सहाय्यक" : "Intelligent Agriculture Platform"}
          </p>
        </div>
      </div>

      {/* Location Display in center */}
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={detectLocation}
              disabled={isDetecting}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2 text-sm transition-colors h-10"
            >
              {isDetecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span className="font-medium">
                {farmLocation.village ? `${farmLocation.village}, ` : ""}
                {farmLocation.district}
              </span>
              {farmLocation.isAutoDetected && (
                <span className="text-[9px] bg-green-400/30 px-1.5 py-0.5 rounded-full">GPS</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">
              {language === "hi" ? "खेत का स्थान" : language === "mr" ? "शेताचे स्थान" : "Farm Location"}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === "hi" ? "क्लिक करके फिर से पता लगाएं" : language === "mr" ? "पुन्हा शोधण्यासाठी क्लिक करा" : "Click to re-detect"}
            </p>
          </TooltipContent>
        </Tooltip>

        <nav className="flex items-center gap-1 text-sm text-primary-foreground/80">
          <Link to="/" className="hover:text-primary-foreground transition-colors px-2 py-1 rounded hover:bg-white/10">{t("common.home")}</Link>
          {location.pathname !== "/" && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-primary-foreground font-medium bg-white/10 px-2 py-1 rounded">{t(currentRoute)}</span>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Helpline Button - prominent for farmers */}
        <Tooltip>
          <TooltipTrigger asChild>
            <a 
              href="tel:18001801551" 
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 text-sm transition-colors touch-target"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden md:inline font-medium">1800-180-1551</span>
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Kisan Call Centre</p>
            <p className="text-xs text-muted-foreground">Toll Free 24x7</p>
          </TooltipContent>
        </Tooltip>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl px-3 py-2.5 text-sm transition-colors touch-target">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{langEmoji[language]}</span>
            {langLabels[language]}
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[140px]">
            {(Object.keys(langLabels) as Language[]).map((lang) => (
              <DropdownMenuItem 
                key={lang} 
                onClick={() => setLanguage(lang)} 
                className={`flex items-center gap-2 touch-target ${language === lang ? "font-bold bg-primary/10" : ""}`}
              >
                <span className="text-base">{langEmoji[lang]}</span>
                {langLabels[lang]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="relative p-2.5 rounded-xl hover:bg-primary-foreground/10 transition-colors touch-target">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-accent animate-pulse ring-2 ring-primary" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{language === "hi" ? "सूचनाएं" : language === "mr" ? "सूचना" : "Notifications"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Help */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-2.5 rounded-xl hover:bg-primary-foreground/10 transition-colors touch-target">
              <HelpCircle className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{language === "hi" ? "सहायता" : language === "mr" ? "मदत" : "Help"}</p>
          </TooltipContent>
        </Tooltip>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl px-3 py-2 text-sm transition-colors touch-target">
            <div className="h-8 w-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold shadow-inner">RP</div>
            <div className="hidden lg:block text-left">
              <span className="font-medium block leading-tight">Ravi Patil</span>
              <span className="text-[10px] text-primary-foreground/60 leading-tight">
                {language === "hi" ? "किसान" : language === "mr" ? "शेतकरी" : "Farmer"}
              </span>
            </div>
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[160px]">
            <DropdownMenuItem asChild className="touch-target">
              <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("common.profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="touch-target">
              <Link to="/settings" className="cursor-pointer flex items-center gap-2">
                ⚙️ {t("nav.settings")}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
