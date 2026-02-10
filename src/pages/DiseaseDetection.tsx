import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Search, AlertTriangle, Shield, Thermometer, Loader2 } from "lucide-react";
import { diseaseResult } from "@/data/mockData";
import { Language } from "@/i18n/translations";

const DiseaseDetection: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Language;
  const [uploaded, setUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleUpload = () => {
    setUploaded(true);
    setShowResult(false);
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setShowResult(true);
    }, 2500);
  };

  const riskColors = { low: "text-success bg-success/10", medium: "text-warning bg-warning/10", high: "text-destructive bg-destructive/10" };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-poppins font-bold">{t("disease.title")}</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* Upload */}
        <Card className="col-span-5 bg-card/95">
          <CardHeader>
            <CardTitle className="text-lg">{t("disease.upload")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onClick={handleUpload}
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
            >
              {uploaded ? (
                <div>
                  <span className="text-6xl">🌿</span>
                  <p className="mt-3 text-sm text-success font-medium">Image uploaded!</p>
                  <p className="text-xs text-muted-foreground mt-1">soybean_leaf_01.jpg</p>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="mt-3 text-sm text-muted-foreground">{t("disease.drag")}</p>
                </div>
              )}
            </div>
            {uploaded && !showResult && (
              <Button onClick={handleAnalyze} disabled={analyzing} className="w-full mt-4 h-12 bg-primary hover:bg-primary/90 text-base">
                {analyzing ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{t("common.loading")}</> : <><Search className="h-5 w-5 mr-2" />{t("disease.analyze")}</>}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        <div className="col-span-7 space-y-6">
          {showResult ? (
            <>
              <Card className="bg-card/95">
                <CardHeader>
                  <CardTitle className="text-lg">{t("disease.result")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <p className="text-xs text-muted-foreground uppercase">{t("disease.name")}</p>
                      <p className="font-poppins font-bold text-base mt-1">{diseaseResult.name[lang]}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <p className="text-xs text-muted-foreground uppercase">{t("disease.confidence")}</p>
                      <p className="font-inter font-bold text-2xl text-primary mt-1">{diseaseResult.confidence}%</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <p className="text-xs text-muted-foreground uppercase">{t("disease.risk")}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1 ${riskColors[diseaseResult.risk]}`}>
                        {t(`common.${diseaseResult.risk}`).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-info/5 rounded-lg border-l-4 border-info">
                    <Thermometer className="h-5 w-5 text-info shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-info uppercase">{t("disease.weather_influence")}</p>
                      <p className="text-sm mt-1">{diseaseResult.weatherInfluence[lang]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/95">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {t("disease.treatment")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {diseaseResult.treatment.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                      <p className="text-sm">{step[lang]}</p>
                    </div>
                  ))}
                  <div className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg border-l-4 border-warning mt-4">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-warning uppercase">{t("disease.safety")}</p>
                      <p className="text-sm mt-1">{diseaseResult.safety[lang]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-card/95 h-full flex items-center justify-center">
              <CardContent className="text-center py-16">
                <span className="text-6xl">🔬</span>
                <p className="mt-4 text-muted-foreground">{uploaded ? (lang === "hi" ? "विश्लेषण शुरू करने के लिए बटन दबाएं" : lang === "mr" ? "विश्लेषण सुरू करण्यासाठी बटण दाबा" : "Click Analyze to detect diseases") : (lang === "hi" ? "पहले फोटो अपलोड करें" : lang === "mr" ? "प्रथम फोटो अपलोड करा" : "Upload a crop image to start")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
