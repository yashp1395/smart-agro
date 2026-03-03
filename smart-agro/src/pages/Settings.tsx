import React, { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFarmLocation, maharashtraLocations } from "@/contexts/FarmLocationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Globe, Scale, MapPin, Wifi, RefreshCw, Save, CheckCircle, Loader2, Navigation, AlertCircle } from "lucide-react";
import { Language } from "@/i18n/translations";
import { toast } from "@/hooks/use-toast";


const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { location, setDistrict, detectLocation, isDetecting, error: locationError } = useFarmLocation();
  const [unit, setUnit] = useState("quintal");
  const [sensorPaired, setSensorPaired] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);


  const handleDetectLocation = async () => {
    await detectLocation();
    if (!locationError) {
      toast({ title: t("settings.location_detected") });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-poppins font-bold">{t("settings.title")}</h1>

      <div className="grid grid-cols-2 gap-6 max-w-4xl">
        {/* Language */}
        <Card className="bg-card/95">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-info" />
              {t("settings.language")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="mr">मराठी</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Units */}
        <Card className="bg-card/95">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              {t("settings.units")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kg</SelectItem>
                <SelectItem value="quintal">Quintal</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Farm Location - Full Width */}
        <Card className="bg-card/95 col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-destructive" />
                {t("settings.farm_location")}
              </span>
              {location.isAutoDetected && (
                <Badge variant="secondary" className="text-xs">
                  <Navigation className="h-3 w-3 mr-1" />
                  {t("settings.auto_detected")}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Location Display */}
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("settings.current_location")}</p>
                  <p className="text-xl font-bold mt-1">
                    {location.village ? `${location.village}, ` : ""}
                    {location.district}
                  </p>
                  {location.taluka && (
                    <p className="text-sm text-muted-foreground">{location.taluka}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    📍 {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="shrink-0"
                >
                  {isDetecting ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4 mr-1.5" />
                  )}
                  {t("settings.detect_gps")}
                </Button>
              </div>
              {locationError && (
                <div className="mt-3 flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {locationError}
                </div>
              )}
            </div>

            {/* District Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("settings.select_district")}</label>
              <Select value={location.district} onValueChange={setDistrict}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder={t("settings.select_district")} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {maharashtraLocations.map((loc) => (
                    <SelectItem key={loc.district} value={loc.district}>
                      {loc.district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {t("settings.location_note")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sensor */}
        <Card className="bg-card/95">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wifi className="h-5 w-5 text-success" />
              {t("settings.sensor")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sensorPaired ? <CheckCircle className="h-5 w-5 text-success" /> : <Wifi className="h-5 w-5 text-muted-foreground" />}
                <span className="text-base">{sensorPaired ? "NPK Sensor v2.1" : "Not paired"}</span>
              </div>
              <Switch checked={sensorPaired} onCheckedChange={setSensorPaired} />
            </div>
          </CardContent>
        </Card>

        {/* Refresh */}
        <Card className="bg-card/95">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-accent-foreground" />
              {t("settings.refresh")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-base">{language === "hi" ? "स्वचालित रिफ्रेश (हर 5 मिनट)" : language === "mr" ? "स्वयंचलित रिफ्रेश (दर 5 मिनिटांनी)" : "Auto refresh (every 5 minutes)"}</span>
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={() => toast({ title: t("settings.saved") })} className="h-12 px-8 text-base bg-primary hover:bg-primary/90">
        <Save className="h-5 w-5 mr-2" />
        {t("settings.save")}
      </Button>
    </div>
  );
};

export default Settings;
