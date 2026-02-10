import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Cloud, Droplets, Wind, Thermometer, TrendingUp, TrendingDown,
  AlertTriangle, Info, ShieldAlert, ArrowRight, Leaf, Store, Wheat,
  Sun, CloudRain,
} from "lucide-react";
import { weatherData, soilData, cropRecommendation, marketPrices, alerts } from "@/data/mockData";
import { Language } from "@/i18n/translations";
import farmerField from "@/assets/farmer-field.jpg";

const Dashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const lang = language as Language;

  const getLocalizedCropName = (item: { name: string; nameHi: string; nameMr: string }) =>
    lang === "hi" ? item.nameHi : lang === "mr" ? item.nameMr : item.name;

  return (
    <div className="space-y-6">
      {/* Hero welcome banner */}
      <div className="relative rounded-2xl overflow-hidden h-44 group">
        <img
          src={farmerField}
          alt="Farm landscape"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/60 to-transparent" />
        <div className="relative z-10 flex items-center h-full px-8">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium flex items-center gap-1.5">
              <Sun className="h-4 w-4" />
              {weatherData.temperature}°C · {weatherData.humidity}% {t("dash.humidity")}
            </p>
            <h1 className="text-3xl font-poppins font-bold text-primary-foreground mt-1">
              {t("dash.welcome")}, Ravi! 🌾
            </h1>
            <p className="text-primary-foreground/70 mt-1 text-sm max-w-md">
              {t("dash.summary_line")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Weather */}
        <Card
          className="col-span-4 cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card/95 backdrop-blur-sm border-border/50"
          onClick={() => navigate("/yield")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-info/10 flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-info" />
                </div>
                {t("dash.weather")}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Thermometer, color: "text-destructive", bg: "bg-destructive/10", label: t("dash.temp"), value: `${weatherData.temperature}°C` },
                { icon: Droplets, color: "text-info", bg: "bg-info/10", label: t("dash.humidity"), value: `${weatherData.humidity}%` },
                { icon: Wind, color: "text-muted-foreground", bg: "bg-muted", label: t("dash.wind"), value: `${weatherData.wind} ${t("common.kmph")}` },
                { icon: CloudRain, color: "text-info", bg: "bg-info/10", label: t("dash.rain"), value: `${weatherData.rainChance}%` },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30">
                  <div className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground leading-tight">{item.label}</p>
                    <p className="text-lg font-inter font-bold leading-tight">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Soil Health */}
        <Card
          className="col-span-4 cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card/95 backdrop-blur-sm border-border/50"
          onClick={() => navigate("/soil")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-warning" />
                </div>
                {t("dash.soil")}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: t("dash.nitrogen"), value: soilData.nitrogen, color: soilData.nitrogen < 50 ? "bg-warning" : "bg-success" },
              { label: t("dash.phosphorus"), value: soilData.phosphorus, color: "bg-success" },
              { label: t("dash.potassium"), value: soilData.potassium, color: "bg-accent" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-inter font-bold text-foreground">{item.value}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{t("dash.ph")}</span>
                <span className="font-inter font-bold">{soilData.ph}</span>
              </div>
              <div className="h-3 bg-gradient-to-r from-destructive via-success to-info rounded-full relative">
                <div
                  className="absolute h-5 w-1.5 bg-foreground rounded-full top-1/2 -translate-y-1/2 shadow-md"
                  style={{ left: `${((soilData.ph - 3) / 11) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crop Recommendation */}
        <Card
          className="col-span-4 cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card/95 backdrop-blur-sm border-border/50"
          onClick={() => navigate("/crop")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wheat className="h-5 w-5 text-primary" />
                </div>
                {t("dash.crop_rec")}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-3 p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t("dash.primary_crop")}</p>
              <p className="text-2xl font-poppins font-bold text-primary mt-0.5">{getLocalizedCropName(cropRecommendation.primary)}</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <p className="text-sm font-inter text-success font-semibold">{cropRecommendation.primary.suitability}% match</p>
              </div>
            </div>
            <div className="text-center mb-3 p-2.5 bg-muted/40 rounded-xl">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t("dash.intercrop")}</p>
              <p className="text-lg font-medium mt-0.5">{getLocalizedCropName(cropRecommendation.intercrop)}</p>
            </div>
            <div className="text-sm text-muted-foreground bg-primary/5 p-2.5 rounded-xl border border-primary/5">
              <p className="font-semibold text-primary text-xs mb-1">💡 {t("dash.why")}</p>
              <p className="text-xs leading-relaxed">{cropRecommendation.reason[lang]}</p>
            </div>
          </CardContent>
        </Card>

        {/* Market */}
        <Card
          className="col-span-7 cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card/95 backdrop-blur-sm border-border/50"
          onClick={() => navigate("/market")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Store className="h-5 w-5 text-accent-foreground" />
                </div>
                {t("dash.market")}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t("dash.mandi")}: <span className="font-semibold text-foreground">Nagpur APMC</span>
            </p>
            <div className="space-y-2">
              {marketPrices.map((item) => (
                <div key={item.crop} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors">
                  <span className="font-medium">{lang === "hi" ? item.cropHi : lang === "mr" ? item.cropMr : item.crop}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-inter font-bold text-lg">₹{item.price}<span className="text-xs text-muted-foreground font-normal">/qtl</span></span>
                    <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full ${
                      item.trend === "up" ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
                    }`}>
                      {item.trend === "up" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="col-span-5 bg-card/95 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              {t("dash.alerts")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border-l-4 transition-colors hover:shadow-sm ${
                  alert.type === "danger" ? "bg-destructive/5 border-destructive" :
                  alert.type === "warning" ? "bg-warning/5 border-warning" :
                  "bg-info/5 border-info"
                }`}
              >
                {alert.type === "danger" ? <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" /> :
                 alert.type === "warning" ? <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" /> :
                 <Info className="h-5 w-5 text-info shrink-0 mt-0.5" />}
                <p className="text-sm leading-relaxed">{alert.message[lang]}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
