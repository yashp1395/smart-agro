import React, { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, ArrowUp, ArrowDown, Sprout, Loader2, AlertCircle, FlaskConical, Thermometer, CloudRain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { yieldForecastData, soilData, weatherData } from "@/data/mockData";
import { Language } from "@/i18n/translations";
import { useCropPrediction, INDIAN_STATES, CROP_TYPES, CROPS } from "@/hooks/useCropPrediction";
import { useWeather } from "@/hooks/useWeather";
import { toast } from "@/hooks/use-toast";

type Scenario = "good" | "average" | "poor";

// Conversion factor: 1 hectare = 2.47105 acres
const HECTARE_TO_ACRE = 2.47105;

const YieldForecast: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Language;
  const [scenario, setScenario] = useState<Scenario>("average");
  
  // Weather hook for real-time weather data
  const { weather } = useWeather();
  
  // Crop Prediction State
  const { predict, result, loading, error, clearResult } = useCropPrediction();
  const [useSensorData, setUseSensorData] = useState(true);
  const [areaInAcres, setAreaInAcres] = useState(5); // Default 5 acres
  
  // NPK state with simulated sensor data
  const [npk, setNpk] = useState({ n: soilData.nitrogen, p: soilData.phosphorus, k: soilData.potassium });
  
  const [predictionForm, setPredictionForm] = useState({
    N: npk.n,
    P: npk.p,
    K: npk.k,
    pH: soilData.ph,
    rainfall: weather?.daily?.reduce((sum, d) => sum + (d.precipitationSum || 0), 0) || 850,
    temperature: weather?.current?.temperature || weatherData.temperature,
    Area_in_hectares: areaInAcres / HECTARE_TO_ACRE, // Convert acres to hectares for API
    State_Name: "Maharashtra",
    Crop_Type: "Kharif",
    Crop: "Soyabean",
  });

  // Update form when sensor data or weather changes
  useEffect(() => {
    if (useSensorData) {
      setPredictionForm(prev => ({
        ...prev,
        N: npk.n,
        P: npk.p,
        K: npk.k,
        pH: soilData.ph,
      }));
    }
  }, [npk, useSensorData]);
  
  // Update weather data in form when available
  useEffect(() => {
    if (weather) {
      const totalRainfall = weather.daily?.reduce((sum, d) => sum + (d.precipitationSum || 0), 0) || 850;
      setPredictionForm(prev => ({
        ...prev,
        temperature: weather.current?.temperature || prev.temperature,
        rainfall: totalRainfall,
      }));
    }
  }, [weather]);
  
  // Update area conversion when acres change
  useEffect(() => {
    setPredictionForm(prev => ({
      ...prev,
      Area_in_hectares: areaInAcres / HECTARE_TO_ACRE,
    }));
  }, [areaInAcres]);

  // Simulate sensor data updates
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

  const handlePredict = async () => {
    await predict(predictionForm);
    if (!error) {
      toast({
        title: t("predict.result"),
        description: lang === "hi" ? "पूर्वानुमान सफलतापूर्वक पूरा हुआ" : lang === "mr" ? "अंदाज यशस्वीपणे पूर्ण" : "Prediction completed successfully",
      });
    }
  };

  const filteredCrops = CROPS.filter(c => c.type === predictionForm.Crop_Type || predictionForm.Crop_Type === "Whole Year");

  // Calculate yield in acres from result
  const yieldPerAcre = result?.yield_per_hectare ? result.yield_per_hectare / HECTARE_TO_ACRE : 0;

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

        {/* Crop Yield Prediction from Soil Analysis */}
        <Card className="col-span-12 lg:col-span-7 bg-white shadow-lg border-t-4 border-t-emerald-500">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                {t("predict.title")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("predict.use_sensor")}</span>
                <Switch checked={useSensorData} onCheckedChange={setUseSensorData} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {lang === "hi" 
                ? "NPK, तापमान और मौसम के रुझान का उपयोग करके एकड़ में उपज का पूर्वानुमान करें"
                : lang === "mr"
                ? "NPK, तापमान आणि हवामान ट्रेंड वापरून एकरमध्ये उत्पादनाचा अंदाज लावा"
                : "Predict yield in acres using NPK, temperature, and weather trends"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Current Weather & Sensor Info */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                <Thermometer className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-orange-700">{Math.round(predictionForm.temperature)}°C</div>
                <div className="text-xs text-orange-600">{t("predict.temperature").split(" ")[0]}</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <CloudRain className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-700">{Math.round(predictionForm.rainfall)}mm</div>
                <div className="text-xs text-blue-600">{t("predict.rainfall").split(" ")[0]}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <FlaskConical className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-700">{soilData.ph}</div>
                <div className="text-xs text-green-600">pH</div>
              </div>
            </div>

            {/* NPK Display */}
            {useSensorData && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {lang === "hi" ? "लाइव सेंसर NPK डेटा" : lang === "mr" ? "लाइव्ह सेन्सर NPK डेटा" : "Live Sensor NPK Data"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-yellow-100 rounded p-2">
                    <div className="text-lg font-bold text-yellow-700">{Math.round(npk.n)}%</div>
                    <div className="text-xs text-yellow-600">N</div>
                  </div>
                  <div className="bg-green-100 rounded p-2">
                    <div className="text-lg font-bold text-green-700">{Math.round(npk.p)}%</div>
                    <div className="text-xs text-green-600">P</div>
                  </div>
                  <div className="bg-purple-100 rounded p-2">
                    <div className="text-lg font-bold text-purple-700">{Math.round(npk.k)}%</div>
                    <div className="text-xs text-purple-600">K</div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* NPK & pH - Manual input when sensor is off */}
              {!useSensorData && (
                <>
                  <div className="space-y-2">
                    <Label>{t("dash.nitrogen")} (N)</Label>
                    <Input
                      type="number"
                      value={Math.round(predictionForm.N)}
                      onChange={(e) => setPredictionForm(prev => ({ ...prev, N: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("dash.phosphorus")} (P)</Label>
                    <Input
                      type="number"
                      value={Math.round(predictionForm.P)}
                      onChange={(e) => setPredictionForm(prev => ({ ...prev, P: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("dash.potassium")} (K)</Label>
                    <Input
                      type="number"
                      value={Math.round(predictionForm.K)}
                      onChange={(e) => setPredictionForm(prev => ({ ...prev, K: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("dash.ph")}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={predictionForm.pH}
                      onChange={(e) => setPredictionForm(prev => ({ ...prev, pH: parseFloat(e.target.value) }))}
                    />
                  </div>
                </>
              )}

              {/* Area in Acres */}
              <div className="space-y-2">
                <Label>
                  {lang === "hi" ? "खेत क्षेत्र (एकड़)" : lang === "mr" ? "शेत क्षेत्र (एकर)" : "Farm Area (acres)"}
                </Label>
                <Input
                  type="number"
                  step="0.5"
                  value={areaInAcres}
                  onChange={(e) => setAreaInAcres(parseFloat(e.target.value))}
                />
              </div>
              
              {/* State */}
              <div className="space-y-2">
                <Label>{t("predict.state")}</Label>
                <Select value={predictionForm.State_Name} onValueChange={(v) => setPredictionForm(prev => ({ ...prev, State_Name: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Crop Type */}
              <div className="space-y-2">
                <Label>{t("predict.crop_type")}</Label>
                <Select value={predictionForm.Crop_Type} onValueChange={(v) => setPredictionForm(prev => ({ ...prev, Crop_Type: v, Crop: "" }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CROP_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label[lang]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Crop Selection */}
              <div className="space-y-2">
                <Label>{t("predict.crop")}</Label>
                <Select value={predictionForm.Crop} onValueChange={(v) => setPredictionForm(prev => ({ ...prev, Crop: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("predict.crop")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCrops.map(crop => (
                      <SelectItem key={crop.value} value={crop.value}>{crop.label[lang]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Predict Button */}
            <Button
              onClick={handlePredict}
              disabled={loading || !predictionForm.Crop}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("predict.predicting")}
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t("predict.button")}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Prediction Result */}
        <Card className="col-span-12 lg:col-span-5 bg-white shadow-lg border-t-4 border-t-amber-500">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-lg">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              {t("predict.result")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {result && result.success ? (
              <div className="space-y-4">
                {/* Yield per Acre - Primary Result */}
                <div className="text-center p-6 bg-gradient-to-br from-emerald-100 to-green-50 rounded-xl border border-emerald-200 shadow-inner">
                  <div className="text-sm font-medium text-emerald-600 mb-1">
                    {lang === "hi" ? "प्रति एकड़ उपज" : lang === "mr" ? "प्रति एकर उत्पादन" : "Yield per Acre"}
                  </div>
                  <div className="text-4xl font-bold text-emerald-700 mb-1">
                    {yieldPerAcre.toFixed(2)}
                  </div>
                  <div className="text-sm text-emerald-600">
                    {lang === "hi" ? "टन/एकड़" : lang === "mr" ? "टन/एकर" : "tons/acre"}
                  </div>
                </div>

                {/* Total Production */}
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700 mb-1">
                    {result.production.toLocaleString()} {t("predict.tons")}
                  </div>
                  <div className="text-sm text-blue-600">
                    {t("predict.production")} ({areaInAcres} {lang === "hi" ? "एकड़" : lang === "mr" ? "एकर" : "acres"})
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <div className="text-muted-foreground">{t("predict.crop")}</div>
                    <div className="font-semibold">{CROPS.find(c => c.value === result.crop)?.label[lang] || result.crop}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <div className="text-muted-foreground">
                      {lang === "hi" ? "क्षेत्र" : lang === "mr" ? "क्षेत्र" : "Area"}
                    </div>
                    <div className="font-semibold">{areaInAcres} {lang === "hi" ? "एकड़" : lang === "mr" ? "एकर" : "acres"}</div>
                  </div>
                </div>

                <Button variant="outline" onClick={clearResult} className="w-full">
                  {t("predict.try_again")}
                </Button>
              </div>
            ) : result && !result.success ? (
              <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <div className="text-lg font-medium text-red-700 mb-2">{t("predict.error")}</div>
                <div className="text-sm text-red-600 mb-4">
                  {t("predict.error_connect")}
                </div>
                <Button variant="outline" onClick={clearResult}>
                  {t("predict.try_again")}
                </Button>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Sprout className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm">
                  {lang === "hi"
                    ? "फसल और खेत की जानकारी दर्ज करें फिर 'उपज का पूर्वानुमान करें' पर क्लिक करें"
                    : lang === "mr"
                    ? "पीक आणि शेताची माहिती प्रविष्ट करा आणि 'उत्पादन अंदाज करा' वर क्लिक करा"
                    : "Enter crop and farm details, then click 'Predict Yield' to see results in acres"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default YieldForecast;
