import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Cloud, Droplets, Wind, Thermometer, Sun, CloudRain, CloudSnow,
  AlertTriangle, Loader2, MapPin, Calendar, Clock, RefreshCw,
  Sunrise, Sunset, Eye, Gauge, Umbrella
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFarmLocation } from "@/contexts/FarmLocationContext";
import { useWeather, getWeatherIcon, getWeatherDescription, formatWeatherDate, formatTime } from "@/hooks/useWeather";
import { Language } from "@/i18n/translations";

const Weather: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Language;
  const { location: farmLocation } = useFarmLocation();
  
  const [searchCity, setSearchCity] = useState("");
  
  const { weather, loading, error, refetch, dataSource } = useWeather(
    farmLocation ? {
      latitude: farmLocation.latitude,
      longitude: farmLocation.longitude,
      skipGeolocation: true,
    } : undefined
  );

  const getWeatherIconComponent = (code: number, size: string = "h-8 w-8") => {
    const icon = getWeatherIcon(code);
    // Map emoji to Lucide icons for better styling
    if (icon.includes("☀") || icon.includes("🌤")) return <Sun className={`${size} text-yellow-500`} />;
    if (icon.includes("🌧") || icon.includes("🌦")) return <CloudRain className={`${size} text-blue-500`} />;
    if (icon.includes("❄") || icon.includes("🌨")) return <CloudSnow className={`${size} text-blue-300`} />;
    if (icon.includes("⛈")) return <CloudRain className={`${size} text-purple-500`} />;
    if (icon.includes("☁") || icon.includes("⛅")) return <Cloud className={`${size} text-gray-500`} />;
    if (icon.includes("🌫")) return <Cloud className={`${size} text-gray-400`} />;
    return <Sun className={`${size} text-yellow-400`} />;
  };

  const getFarmingAdvice = () => {
    if (!weather) return [];
    
    const temp = weather.current.temperature;
    const humidity = weather.current.humidity;
    const rainChance = weather.daily[0]?.precipitationProbability || 0;
    const advice: { icon: string; text: string; type: "warning" | "success" | "info" }[] = [];
    
    // Temperature advice
    if (temp > 38) {
      advice.push({
        icon: "🌡️",
        text: lang === "hi" 
          ? "अत्यधिक गर्मी: सिंचाई बढ़ाएं, दोपहर में खेत का काम न करें।"
          : lang === "mr"
          ? "अति उष्णता: सिंचन वाढवा, दुपारी शेतकाम टाळा."
          : "Extreme heat: Increase irrigation, avoid field work during midday.",
        type: "warning"
      });
    } else if (temp > 32) {
      advice.push({
        icon: "☀️",
        text: lang === "hi"
          ? "गर्म मौसम: पर्याप्त पानी दें, स्प्रे सुबह या शाम करें।"
          : lang === "mr"
          ? "उष्ण हवामान: पुरेसे पाणी द्या, सकाळी किंवा संध्याकाळी फवारणी करा."
          : "Warm weather: Ensure adequate water, spray early morning or evening.",
        type: "info"
      });
    } else if (temp < 10) {
      advice.push({
        icon: "❄️",
        text: lang === "hi"
          ? "ठंडा मौसम: पाला-संवेदनशील फसलों को ढकें।"
          : lang === "mr"
          ? "थंड हवामान: दंव-संवेदनशील पिकांना झाका."
          : "Cold weather: Cover frost-sensitive crops.",
        type: "warning"
      });
    } else {
      advice.push({
        icon: "✅",
        text: lang === "hi"
          ? "तापमान खेती के लिए अनुकूल है।"
          : lang === "mr"
          ? "तापमान शेतीसाठी अनुकूल आहे."
          : "Temperature is optimal for farming activities.",
        type: "success"
      });
    }
    
    // Humidity advice
    if (humidity > 85) {
      advice.push({
        icon: "💧",
        text: lang === "hi"
          ? "उच्च आर्द्रता: फफूंद रोगों पर नज़र रखें।"
          : lang === "mr"
          ? "जास्त आर्द्रता: बुरशीजन्य रोगांवर लक्ष ठेवा."
          : "High humidity: Monitor for fungal diseases like powdery mildew.",
        type: "warning"
      });
    } else if (humidity < 30) {
      advice.push({
        icon: "🏜️",
        text: lang === "hi"
          ? "कम आर्द्रता: सिंचाई बढ़ाएं, मल्चिंग करें।"
          : lang === "mr"
          ? "कमी आर्द्रता: सिंचन वाढवा, आच्छादन करा."
          : "Low humidity: Increase irrigation, consider mulching.",
        type: "warning"
      });
    }
    
    // Rain advice
    if (rainChance > 60) {
      advice.push({
        icon: "🌧️",
        text: lang === "hi"
          ? "बारिश की संभावना: उर्वरक/कीटनाशक स्प्रे टालें।"
          : lang === "mr"
          ? "पावसाची शक्यता: खत/कीटकनाशक फवारणी टाळा."
          : "Rain expected: Postpone fertilizer/pesticide application.",
        type: "info"
      });
    }
    
    // Check forecast for extended rain
    const rainyDays = weather.daily.filter(d => d.precipitationProbability > 50).length;
    if (rainyDays >= 3) {
      advice.push({
        icon: "📅",
        text: lang === "hi"
          ? `इस सप्ताह ${rainyDays} दिन बारिश की संभावना। फसल कटाई जल्दी करें।`
          : lang === "mr"
          ? `या आठवड्यात ${rainyDays} दिवस पावसाची शक्यता. पीक काढणी लवकर करा.`
          : `Rain expected on ${rainyDays} days this week. Complete harvesting soon.`,
        type: "info"
      });
    }
    
    return advice;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Cloud className="h-7 w-7 text-blue-500" />
            {lang === "hi" ? "मौसम रिपोर्ट" : lang === "mr" ? "हवामान अहवाल" : "Weather Report"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {lang === "hi" 
              ? "आपके खेत के लिए विस्तृत मौसम जानकारी"
              : lang === "mr"
              ? "तुमच्या शेतासाठी सविस्तर हवामान माहिती"
              : "Detailed weather information for your farm"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dataSource && (
            <Badge variant="outline" className="text-xs">
              {dataSource === "indianapi" ? "🇮🇳 IMD Data" : dataSource === "open-meteo" ? "Open-Meteo" : "Offline"}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {lang === "hi" ? "रीफ्रेश" : lang === "mr" ? "रिफ्रेश" : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{error}</p>
            <p className="text-xs mt-1">
              {lang === "hi" 
                ? "कृपया इंटरनेट कनेक्शन जांचें।"
                : lang === "mr"
                ? "कृपया इंटरनेट कनेक्शन तपासा."
                : "Please check your internet connection."}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : weather ? (
        <>
          {/* Current Weather - Hero Card */}
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white overflow-hidden border-0">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Left: Location & Current */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-blue-100 mb-2">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg font-medium">
                      {weather.location.name}, {weather.location.district}
                    </span>
                    <Badge className="bg-white/20 text-white border-0 ml-2">
                      {weather.location.state}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-7xl font-bold">
                      {weather.current.temperature}°
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {getWeatherIconComponent(weather.current.weatherCode, "h-12 w-12")}
                        <span className="text-4xl">{getWeatherIcon(weather.current.weatherCode)}</span>
                      </div>
                      <p className="text-xl mt-1">
                        {getWeatherDescription(weather.current.weatherCode, lang)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 text-blue-100">
                    <span className="flex items-center gap-1">
                      <Thermometer className="h-4 w-4" />
                      {lang === "hi" ? "महसूस:" : lang === "mr" ? "वाटते:" : "Feels:"} {weather.current.feelsLike}°C
                    </span>
                    <span className="flex items-center gap-1">
                      <Sunrise className="h-4 w-4" />
                      {weather.daily[0]?.sunrise ? formatTime(weather.daily[0].sunrise) : "--"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sunset className="h-4 w-4" />
                      {weather.daily[0]?.sunset ? formatTime(weather.daily[0].sunset) : "--"}
                    </span>
                  </div>
                </div>
                
                {/* Right: Today's Range */}
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-blue-100 text-sm mb-2">
                    {lang === "hi" ? "आज का तापमान" : lang === "mr" ? "आजचे तापमान" : "Today's Range"}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-300">{weather.daily[0]?.maxTemp}°</p>
                      <p className="text-xs text-blue-200">{lang === "hi" ? "अधिकतम" : lang === "mr" ? "कमाल" : "High"}</p>
                    </div>
                    <div className="h-12 w-px bg-white/30" />
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-300">{weather.daily[0]?.minTemp}°</p>
                      <p className="text-xs text-blue-200">{lang === "hi" ? "न्यूनतम" : lang === "mr" ? "किमान" : "Low"}</p>
                    </div>
                  </div>
                  {weather.daily[0]?.precipitationProbability > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-blue-100">
                      <Umbrella className="h-4 w-4" />
                      <span className="text-sm">
                        {lang === "hi" ? "बारिश:" : lang === "mr" ? "पाऊस:" : "Rain:"} {weather.daily[0].precipitationProbability}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                icon: Droplets, 
                color: "text-blue-500", 
                bg: "bg-blue-50", 
                label: lang === "hi" ? "आर्द्रता" : lang === "mr" ? "आर्द्रता" : "Humidity", 
                value: `${weather.current.humidity}%`,
                subtext: weather.current.humidity > 80 ? "🔴 High" : weather.current.humidity < 30 ? "🟡 Low" : "🟢 Normal"
              },
              { 
                icon: Wind, 
                color: "text-gray-500", 
                bg: "bg-gray-50", 
                label: lang === "hi" ? "हवा" : lang === "mr" ? "वारा" : "Wind", 
                value: `${weather.current.windSpeed} km/h`,
                subtext: weather.current.windSpeed > 30 ? "Strong" : "Light"
              },
              { 
                icon: Gauge, 
                color: "text-purple-500", 
                bg: "bg-purple-50", 
                label: lang === "hi" ? "दबाव" : lang === "mr" ? "दाब" : "Pressure", 
                value: `${weather.current.pressure} hPa`,
                subtext: weather.current.pressure > 1015 ? "High" : "Normal"
              },
              { 
                icon: Eye, 
                color: "text-green-500", 
                bg: "bg-green-50", 
                label: lang === "hi" ? "दृश्यता" : lang === "mr" ? "दृश्यमानता" : "Visibility", 
                value: `${weather.current.visibility} km`,
                subtext: weather.current.visibility > 8 ? "Good" : "Limited"
              },
            ].map((item, idx) => (
              <Card key={idx} className={`${item.bg} border-0`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-bold">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.subtext}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Farming Advisory */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                🌾 {lang === "hi" ? "खेती सलाह" : lang === "mr" ? "शेती सल्ला" : "Farming Advisory"}
              </CardTitle>
              <CardDescription>
                {lang === "hi" 
                  ? "मौसम के आधार पर आज की सिफारिशें"
                  : lang === "mr"
                  ? "हवामानावर आधारित आजच्या शिफारसी"
                  : "Today's recommendations based on weather conditions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {getFarmingAdvice().map((advice, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border flex items-start gap-3 ${
                      advice.type === "warning" ? "bg-yellow-50 border-yellow-200" :
                      advice.type === "success" ? "bg-green-50 border-green-200" :
                      "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <span className="text-2xl">{advice.icon}</span>
                    <p className="text-sm text-gray-700">{advice.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                {lang === "hi" ? "7 दिन का पूर्वानुमान" : lang === "mr" ? "7 दिवसांचा अंदाज" : "7-Day Forecast"}
              </CardTitle>
              <CardDescription>
                {lang === "hi" 
                  ? "अपनी खेती गतिविधियों की योजना बनाएं"
                  : lang === "mr"
                  ? "तुमच्या शेती कार्यांचे नियोजन करा"
                  : "Plan your farming activities ahead"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weather.daily.map((day, idx) => (
                  <div 
                    key={day.date}
                    className={`text-center p-3 rounded-xl transition-all hover:shadow-md ${
                      idx === 0 
                        ? "bg-blue-50 border-2 border-blue-200" 
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${idx === 0 ? "text-blue-600" : ""}`}>
                      {idx === 0 
                        ? (lang === "hi" ? "आज" : lang === "mr" ? "आज" : "Today")
                        : formatWeatherDate(day.date, lang).split(",")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(day.date).toLocaleDateString(
                        lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN",
                        { day: "numeric", month: "short" }
                      )}
                    </p>
                    
                    <div className="text-3xl my-2">{getWeatherIcon(day.weatherCode)}</div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {getWeatherDescription(day.weatherCode, lang).split(" ")[0]}
                    </p>
                    
                    <div className="space-y-1">
                      <p className="text-base">
                        <span className="font-bold text-red-500">{day.maxTemp}°</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-blue-500">{day.minTemp}°</span>
                      </p>
                      
                      {day.precipitationProbability > 10 && (
                        <p className="text-xs text-blue-500 flex items-center justify-center gap-1">
                          💧 {day.precipitationProbability}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* UV Index */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  {lang === "hi" ? "UV इंडेक्स" : lang === "mr" ? "UV निर्देशांक" : "UV Index"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`text-4xl font-bold ${
                    weather.current.uvIndex > 7 ? "text-red-500" :
                    weather.current.uvIndex > 5 ? "text-orange-500" :
                    weather.current.uvIndex > 2 ? "text-yellow-500" :
                    "text-green-500"
                  }`}>
                    {weather.current.uvIndex}
                  </div>
                  <div>
                    <p className="font-medium">
                      {weather.current.uvIndex > 7 
                        ? (lang === "hi" ? "बहुत अधिक" : lang === "mr" ? "अति उच्च" : "Very High")
                        : weather.current.uvIndex > 5
                        ? (lang === "hi" ? "उच्च" : lang === "mr" ? "उच्च" : "High")
                        : weather.current.uvIndex > 2
                        ? (lang === "hi" ? "मध्यम" : lang === "mr" ? "मध्यम" : "Moderate")
                        : (lang === "hi" ? "कम" : lang === "mr" ? "कमी" : "Low")
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {weather.current.uvIndex > 5 
                        ? (lang === "hi" ? "दोपहर में छाया में रहें" : lang === "mr" ? "दुपारी सावलीत राहा" : "Seek shade during midday")
                        : (lang === "hi" ? "खेत में काम करना सुरक्षित" : lang === "mr" ? "शेतात काम करणे सुरक्षित" : "Safe for outdoor work")
                      }
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500">
                  <div 
                    className="h-full w-2 bg-white rounded-full shadow-md transform -translate-y-0"
                    style={{ marginLeft: `${Math.min(weather.current.uvIndex * 10, 95)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sun Times */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  {lang === "hi" ? "सूर्य का समय" : lang === "mr" ? "सूर्य वेळ" : "Sun Times"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-around">
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                      <Sunrise className="h-6 w-6 text-orange-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {lang === "hi" ? "सूर्योदय" : lang === "mr" ? "सूर्योदय" : "Sunrise"}
                    </p>
                    <p className="text-lg font-bold">
                      {weather.daily[0]?.sunrise ? formatTime(weather.daily[0].sunrise) : "--"}
                    </p>
                  </div>
                  <div className="h-16 w-px bg-border" />
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                      <Sunset className="h-6 w-6 text-purple-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {lang === "hi" ? "सूर्यास्त" : lang === "mr" ? "सूर्यास्त" : "Sunset"}
                    </p>
                    <p className="text-lg font-bold">
                      {weather.daily[0]?.sunset ? formatTime(weather.daily[0].sunset) : "--"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Source Footer */}
          <div className="text-center py-2 text-sm text-muted-foreground">
            {lang === "hi" 
              ? `अंतिम अपडेट: ${weather.lastUpdated.toLocaleString("hi-IN")} • स्रोत: ${dataSource === "indianapi" ? "भारतीय मौसम विभाग (IMD)" : "Open-Meteo"}`
              : lang === "mr"
              ? `शेवटचे अपडेट: ${weather.lastUpdated.toLocaleString("mr-IN")} • स्रोत: ${dataSource === "indianapi" ? "भारतीय हवामान खाते (IMD)" : "Open-Meteo"}`
              : `Last updated: ${weather.lastUpdated.toLocaleString("en-IN")} • Source: ${dataSource === "indianapi" ? "India Meteorological Department (IMD)" : "Open-Meteo"}`
            }
          </div>
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Cloud className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {lang === "hi" ? "मौसम डेटा उपलब्ध नहीं" : lang === "mr" ? "हवामान डेटा उपलब्ध नाही" : "Weather data unavailable"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {lang === "hi" 
                ? "कृपया पुनः प्रयास करें या इंटरनेट कनेक्शन जांचें।"
                : lang === "mr"
                ? "कृपया पुन्हा प्रयत्न करा किंवा इंटरनेट कनेक्शन तपासा."
                : "Please try again or check your internet connection."}
            </p>
            <Button onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {lang === "hi" ? "पुनः प्रयास करें" : lang === "mr" ? "पुन्हा प्रयत्न करा" : "Try Again"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Weather;
