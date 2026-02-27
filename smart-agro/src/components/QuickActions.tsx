import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Camera,
  CloudSun,
  Leaf,
  Store,
  Plus,
  X,
  Wheat,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const actions = [
    {
      icon: Camera,
      label: t("quick.scan_disease"),
      color: "bg-red-500 hover:bg-red-600",
      path: "/disease",
      description: t("quick.scan_disease_desc"),
    },
    {
      icon: CloudSun,
      label: t("quick.check_weather"),
      color: "bg-blue-500 hover:bg-blue-600",
      path: "/",
      description: t("quick.check_weather_desc"),
    },
    {
      icon: Leaf,
      label: t("quick.soil_check"),
      color: "bg-amber-500 hover:bg-amber-600",
      path: "/soil",
      description: t("quick.soil_check_desc"),
    },
    {
      icon: Store,
      label: t("quick.market_prices"),
      color: "bg-green-600 hover:bg-green-700",
      path: "/market",
      description: t("quick.market_prices_desc"),
    },
    {
      icon: Wheat,
      label: t("quick.crop_advice"),
      color: "bg-purple-500 hover:bg-purple-600",
      path: "/crop",
      description: t("quick.crop_advice_desc"),
    },
    {
      icon: HelpCircle,
      label: t("quick.help"),
      color: "bg-gray-500 hover:bg-gray-600",
      path: "/schemes",
      description: t("quick.help_desc"),
    },
  ];

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Action buttons - shown when menu is open */}
      <div
        className={cn(
          "flex flex-col-reverse gap-3 mb-4 transition-all duration-300",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {actions.map((action, index) => (
          <Tooltip key={action.label}>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  navigate(action.path);
                  setIsOpen(false);
                }}
                className={cn(
                  "h-14 w-14 rounded-full shadow-lg text-white transition-all duration-300 hover:scale-110",
                  action.color
                )}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                  transform: isOpen ? "scale(1)" : "scale(0)",
                }}
              >
                <action.icon className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[200px]">
              <p className="font-semibold">{action.label}</p>
              <p className="text-xs text-muted-foreground">
                {action.description}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Main FAB button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "h-16 w-16 rounded-full shadow-xl transition-all duration-300 hover:scale-105",
              isOpen
                ? "bg-gray-700 hover:bg-gray-800 rotate-45"
                : "bg-primary hover:bg-primary/90 animate-pulse-slow"
            )}
          >
            {isOpen ? (
              <X className="h-7 w-7 text-white" />
            ) : (
              <Plus className="h-7 w-7 text-white" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{isOpen ? t("common.close") : t("quick.actions")}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default QuickActions;
