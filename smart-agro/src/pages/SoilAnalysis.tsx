import React, { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download, FlaskConical, Droplets, Leaf, AlertCircle, CheckCircle } from "lucide-react";
import { soilData } from "@/data/mockData";
import { Language } from "@/i18n/translations";
import { toast } from "@/hooks/use-toast";

const SoilAnalysis: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Language;
  const [calibrated, setCalibrated] = useState(true);
  const [npk, setNpk] = useState({ n: soilData.nitrogen, p: soilData.phosphorus, k: soilData.potassium });

  useEffect(() => {
    const interval = setInterval(() => {
      setNpk({
        n: Math.max(20, Math.min(90, npk.n + (Math.random() - 0.5) * 4)),
        p: Math.max(20, Math.min(90, npk.p + (Math.random() - 0.5) * 3)),
        k: Math.max(20, Math.min(90, npk.k + (Math.random() - 0.5) * 3)),
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [npk]);

  const CircularGauge = ({ value, label, color }: { value: number; label: string; color: string }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
      <div className="flex flex-col items-center">
        <svg width="120" height="120" className="drop-shadow-sm">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 60 60)" className="transition-all duration-1000" />
          <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold font-inter fill-foreground">
            {Math.round(value)}%
          </text>
        </svg>
        <p className="text-sm font-medium mt-1">{label}</p>
      </div>
    );
  };

  const conditions = [
    { key: "soil.n_low", icon: <AlertCircle className="h-5 w-5 text-warning" />, status: "warning" as const },
    { key: "soil.p_good", icon: <CheckCircle className="h-5 w-5 text-success" />, status: "good" as const },
    { key: "soil.k_medium", icon: <AlertCircle className="h-5 w-5 text-accent" />, status: "medium" as const },
    { key: "soil.ph_note", icon: <Droplets className="h-5 w-5 text-info" />, status: "info" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-poppins font-bold">{t("soil.title")}</h1>
        <Button onClick={() => toast({ title: t("soil.export"), description: "PDF report generated (simulated)" })} className="bg-primary hover:bg-primary/90 h-11">
          <Download className="h-4 w-4 mr-2" />
          {t("soil.export")}
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Live Sensor Data */}
        <Card className="col-span-7 bg-card/95">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                {t("soil.live")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("soil.calibration")}</span>
                <Switch checked={calibrated} onCheckedChange={setCalibrated} />
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${calibrated ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                  {calibrated ? t("soil.calibrated") : t("soil.not_calibrated")}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around">
              <CircularGauge value={npk.n} label={t("dash.nitrogen")} color="hsl(var(--warning))" />
              <CircularGauge value={npk.p} label={t("dash.phosphorus")} color="hsl(var(--success))" />
              <CircularGauge value={npk.k} label={t("dash.potassium")} color="hsl(var(--accent))" />
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium mb-2">{t("dash.ph")}</p>
              <div className="h-4 bg-gradient-to-r from-destructive via-success to-info rounded-full relative">
                <div className="absolute h-6 w-2 bg-foreground rounded-full top-1/2 -translate-y-1/2 shadow" style={{ left: `${((soilData.ph - 3) / 11) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>3 (Acidic)</span>
                <span className="font-bold text-foreground">pH {soilData.ph}</span>
                <span>14 (Alkaline)</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">Auto-updating every 3 seconds • {new Date().toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Condition Summary */}
        <Card className="col-span-5 bg-card/95">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              {t("soil.condition")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conditions.map((c) => (
              <div key={c.key} className={`flex items-start gap-3 p-3 rounded-lg ${
                c.status === "warning" ? "bg-warning/5 border-l-4 border-warning" :
                c.status === "good" ? "bg-success/5 border-l-4 border-success" :
                c.status === "medium" ? "bg-accent/5 border-l-4 border-accent" :
                "bg-info/5 border-l-4 border-info"
              }`}>
                {c.icon}
                <p className="text-sm">{t(c.key)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* What This Means */}
        <Card className="col-span-12 bg-card/95">
          <CardHeader>
            <CardTitle className="text-lg">{t("soil.what_means")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              {lang === "hi"
                ? "आपकी मिट्टी में नाइट्रोजन की कमी है जो फसल वृद्धि को प्रभावित कर सकती है। दलहनी फसलें (जैसे सोयाबीन, अरहर) लगाने से मिट्टी में प्राकृतिक रूप से नाइट्रोजन बढ़ेगा। फॉस्फोरस का स्तर अच्छा है। पोटैशियम मध्यम है - पोटाश खाद से सुधार होगा। pH थोड़ा अम्लीय है, चूना डालने से संतुलन बनेगा।"
                : lang === "mr"
                ? "तुमच्या मातीत नायट्रोजनची कमतरता आहे जी पिकाच्या वाढीवर परिणाम करू शकते. कडधान्य पिके (जसे सोयाबीन, तूर) लावल्याने मातीत नैसर्गिकरित्या नायट्रोजन वाढेल. फॉस्फरसची पातळी चांगली आहे. पोटॅशियम मध्यम आहे — पोटॅश खताने सुधारणा होईल. pH किंचित आम्लधर्मी आहे, चुना वापरल्याने संतुलन साधले जाईल."
                : "Your soil has a nitrogen deficiency that can affect crop growth. Planting legume crops (like soybean, pigeon pea) will naturally increase nitrogen in the soil. Phosphorus levels are adequate — no immediate action needed. Potassium is moderate — adding potash fertilizer will improve it. pH is slightly acidic — applying lime will help balance it. Overall, your soil is suitable for Kharif crops with minor amendments."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SoilAnalysis;
