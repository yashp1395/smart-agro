import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { yieldForecastData } from "@/data/mockData";
import { Language } from "@/i18n/translations";

type Scenario = "good" | "average" | "poor";

const YieldForecast: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Language;
  const [scenario, setScenario] = useState<Scenario>("average");

  const data = yieldForecastData[scenario].map((item, i) => ({
    ...item,
    district: yieldForecastData.districtAvg[i]?.yield ?? 0,
  }));

  const expectedYield = yieldForecastData[scenario][yieldForecastData[scenario].length - 1].yield;
  const lastSeason = 17;
  const diff = expectedYield - lastSeason;

  const scenarioButtons: { key: Scenario; labelKey: string; color: string }[] = [
    { key: "good", labelKey: "yield.good", color: "bg-success text-success-foreground" },
    { key: "average", labelKey: "yield.average", color: "bg-info text-info-foreground" },
    { key: "poor", labelKey: "yield.poor", color: "bg-warning text-warning-foreground" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-poppins font-bold">{t("yield.title")}</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* Scenario */}
        <Card className="col-span-4 bg-card/95">
          <CardHeader>
            <CardTitle className="text-lg">{t("yield.scenario")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scenarioButtons.map((s) => (
              <Button
                key={s.key}
                onClick={() => setScenario(s.key)}
                variant={scenario === s.key ? "default" : "outline"}
                className={`w-full h-12 text-base ${scenario === s.key ? s.color : ""}`}
              >
                {t(s.labelKey)}
              </Button>
            ))}

            <div className="mt-6 text-center p-6 bg-primary/5 rounded-xl">
              <p className="text-sm text-muted-foreground">{t("yield.expected")}</p>
              <p className="text-4xl font-poppins font-bold text-primary mt-2">{expectedYield}</p>
              <p className="text-sm text-muted-foreground">{t("yield.quintal_acre")}</p>
              <div className={`mt-3 flex items-center justify-center gap-1 text-sm font-medium ${diff >= 0 ? "text-success" : "text-destructive"}`}>
                {diff >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {diff >= 0 ? "+" : ""}{diff.toFixed(1)} vs {t("yield.last_season")} ({lastSeason})
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="col-span-8 bg-card/95">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t("yield.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 13 }} label={{ value: t("yield.quintal_acre"), angle: -90, position: "insideLeft", style: { fontSize: 12 } }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Line type="monotone" dataKey="yield" name={t("yield.expected")} stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="district" name={t("yield.district_avg")} stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default YieldForecast;
