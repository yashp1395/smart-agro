import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Globe, Scale, MapPin, Wifi, RefreshCw, Save, CheckCircle } from "lucide-react";
import { Language } from "@/i18n/translations";
import { toast } from "@/hooks/use-toast";

const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [unit, setUnit] = useState("quintal");
  const [village, setVillage] = useState("Warud, Amravati");
  const [sensorPaired, setSensorPaired] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

        {/* Location */}
        <Card className="bg-card/95">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-destructive" />
              {t("settings.location")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={village} onChange={(e) => setVillage(e.target.value)} className="h-12 text-base" />
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
        <Card className="bg-card/95 col-span-2">
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
