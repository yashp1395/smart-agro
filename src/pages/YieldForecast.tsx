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

  const scenarioButtons: { key: Scenario; labelKey: string; activeColor: string; inactiveColor: string }[] = [
    { key: "good", labelKey: "yield.good", activeColor: "bg-emerald-600 text-white hover:bg-emerald-700", inactiveColor: "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200" },
    { key: "average", labelKey: "yield.average", activeColor: "bg-blue-600 text-white hover:bg-blue-700", inactiveColor: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200" },
    { key: "poor", labelKey: "yield.poor", activeColor: "bg-amber-500 text-white hover:bg-amber-600", inactiveColor: "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-poppins font-bold text-gray-800">{t("yield.title")}</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* Weather Scenario Selection */}
        <Card className="col-span-12 lg:col-span-4 bg-white shadow-lg border-l-4 border-l-primary">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <CardTitle className="text-lg font-semibold text-gray-800">{t("yield.scenario")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {scenarioButtons.map((s) => (
              <Button
                key={s.key}
                onClick={() => setScenario(s.key)}
                variant="outline"
                className={`w-full h-14 text-base font-medium transition-all duration-200 border-2 ${
                  scenario === s.key ? s.activeColor : s.inactiveColor
                }`}
              >
                {t(s.labelKey)}
              </Button>
            ))}

            <div className="mt-6 text-center p-6 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 rounded-xl border border-green-200 shadow-inner">
              <p className="text-sm font-medium text-gray-600">{t("yield.expected")}</p>
              <p className="text-5xl font-poppins font-bold text-emerald-700 mt-2 drop-shadow-sm">{expectedYield}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">{t("yield.quintal_acre")}</p>
              <div className={`mt-4 flex items-center justify-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full ${diff >= 0 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                {diff >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {diff >= 0 ? "+" : ""}{diff.toFixed(1)} vs {t("yield.last_season")} ({lastSeason})
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yield Chart */}
        <Card className="col-span-12 lg:col-span-8 bg-white shadow-lg border-t-4 border-t-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {t("yield.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" tick={{ fontSize: 13, fill: "#333" }} />
                <YAxis tick={{ fontSize: 13, fill: "#333" }} label={{ value: t("yield.quintal_acre"), angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "#555" } }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #ccc", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} />
                <Legend />
                <Line type="monotone" dataKey="yield" name={t("yield.expected")} stroke="#059669" strokeWidth={3} dot={{ r: 5, fill: "#059669" }} activeDot={{ r: 8, fill: "#10b981" }} />
                <Line type="monotone" dataKey="district" name={t("yield.district_avg")} stroke="#6366f1" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: "#6366f1" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default YieldForecast;
