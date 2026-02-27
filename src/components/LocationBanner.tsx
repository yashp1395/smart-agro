import React, { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFarmLocation } from "@/contexts/FarmLocationContext";
import { Language } from "@/i18n/translations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Navigation,
  Loader2,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LocationBanner: React.FC = () => {
  const { language } = useLanguage();
  const lang = language as Language;
  const { location, detectLocation, isDetecting, error } = useFarmLocation();
  const [dismissed, setDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if user has already set location
  const hasLocation = location.isAutoDetected || location.district !== "Nagpur";

  // Auto-detect on first visit if no location set
  useEffect(() => {
    const hasAskedBefore = localStorage.getItem("smartagro_location_asked");
    if (!hasAskedBefore && !location.isAutoDetected) {
      // Don't auto-detect, just show the banner
      localStorage.setItem("smartagro_location_asked", "true");
    }
  }, [location.isAutoDetected]);

  // Show success message briefly after detection
  useEffect(() => {
    if (location.isAutoDetected && !showSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setDismissed(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [location.isAutoDetected, showSuccess]);

  const handleDetect = async () => {
    await detectLocation();
  };

  // Don't show if dismissed or already has auto-detected location
  if (dismissed && !error) return null;

  const texts = {
    title: {
      en: "Enable Location for Better Experience",
      hi: "बेहतर अनुभव के लिए स्थान सक्षम करें",
      mr: "चांगल्या अनुभवासाठी स्थान सक्षम करा",
    },
    description: {
      en: "Get accurate weather, market prices & crop advice for your farm",
      hi: "अपने खेत के लिए सटीक मौसम, बाजार भाव और फसल सलाह प्राप्त करें",
      mr: "तुमच्या शेतासाठी अचूक हवामान, बाजारभाव आणि पीक सल्ला मिळवा",
    },
    button: {
      en: "Detect My Location",
      hi: "मेरा स्थान पता लगाएं",
      mr: "माझे स्थान शोधा",
    },
    detecting: {
      en: "Detecting location...",
      hi: "स्थान पता लगा रहे हैं...",
      mr: "स्थान शोधत आहे...",
    },
    success: {
      en: "Location detected!",
      hi: "स्थान मिल गया!",
      mr: "स्थान सापडले!",
    },
    currentLocation: {
      en: "Your farm location",
      hi: "आपके खेत का स्थान",
      mr: "तुमच्या शेताचे स्थान",
    },
  };

  // Show success state
  if (showSuccess && location.isAutoDetected) {
    return (
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 mb-4 animate-scale-in">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">{texts.success[lang]}</p>
            <p className="text-white/90 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {location.village && `${location.village}, `}
              {location.district}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    );
  }

  // Show prompt to detect location
  if (!hasLocation) {
    return (
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 mb-4 animate-slide-down">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center animate-pulse-slow">
            <MapPin className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">{texts.title[lang]}</p>
            <p className="text-white/80 text-sm">{texts.description[lang]}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDetect}
              disabled={isDetecting}
              className="bg-white text-blue-600 hover:bg-white/90 font-semibold h-12 px-6 touch-target"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {texts.detecting[lang]}
                </>
              ) : (
                <>
                  <Navigation className="h-5 w-5 mr-2" />
                  {texts.button[lang]}
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDismissed(true)}
              className="text-white hover:bg-white/20 h-12 w-12"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};

export default LocationBanner;
