import React, { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Sun,
  Bug,
  Leaf,
  CloudRain,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FarmingTip {
  id: number;
  icon: React.ElementType;
  title: Record<Language, string>;
  content: Record<Language, string>;
  category: "water" | "sun" | "pest" | "soil" | "weather" | "season";
  color: string;
}

const farmingTips: FarmingTip[] = [
  {
    id: 1,
    icon: Droplets,
    title: {
      en: "Morning Watering",
      hi: "सुबह पानी देना",
      mr: "सकाळी पाणी देणे",
    },
    content: {
      en: "Water your crops early morning (6-8 AM) to reduce evaporation and fungal diseases. Avoid evening watering.",
      hi: "पानी का वाष्पीकरण कम करने और फफूंद रोगों से बचने के लिए सुबह 6-8 बजे पानी दें। शाम को पानी देने से बचें।",
      mr: "पाण्याचे बाष्पीभवन कमी करण्यासाठी आणि बुरशीजन्य रोग टाळण्यासाठी सकाळी 6-8 वाजता पाणी द्या.",
    },
    category: "water",
    color: "bg-blue-500",
  },
  {
    id: 2,
    icon: Bug,
    title: {
      en: "Natural Pest Control",
      hi: "प्राकृतिक कीट नियंत्रण",
      mr: "नैसर्गिक कीड नियंत्रण",
    },
    content: {
      en: "Use neem oil spray to control common pests naturally. Mix 2ml neem oil in 1 liter water and spray weekly.",
      hi: "सामान्य कीटों को प्राकृतिक रूप से नियंत्रित करने के लिए नीम तेल का उपयोग करें। 1 लीटर पानी में 2ml नीम तेल मिलाकर साप्ताहिक स्प्रे करें।",
      mr: "सामान्य कीड नैसर्गिकपणे नियंत्रित करण्यासाठी कडुलिंबाचे तेल वापरा. 1 लिटर पाण्यात 2ml तेल मिसळा.",
    },
    category: "pest",
    color: "bg-red-500",
  },
  {
    id: 3,
    icon: Leaf,
    title: {
      en: "Healthy Soil Tips",
      hi: "स्वस्थ मिट्टी सुझाव",
      mr: "निरोगी माती टिप्स",
    },
    content: {
      en: "Add compost or green manure to improve soil fertility. Rotate crops to prevent nutrient depletion.",
      hi: "मिट्टी की उर्वरता बढ़ाने के लिए कम्पोस्ट या हरी खाद डालें। पोषक तत्वों की कमी रोकने के लिए फसल चक्र अपनाएं।",
      mr: "मातीची सुपीकता वाढवण्यासाठी कंपोस्ट किंवा हिरवळीचे खत घाला. पोषक तत्वांची कमतरता टाळण्यासाठी पीक फेरपालट करा.",
    },
    category: "soil",
    color: "bg-amber-600",
  },
  {
    id: 4,
    icon: Sun,
    title: {
      en: "Protect from Heat",
      hi: "गर्मी से बचाव",
      mr: "उष्णतेपासून संरक्षण",
    },
    content: {
      en: "Use mulching to keep soil cool and retain moisture. Cover young plants during extreme heat with shade nets.",
      hi: "मिट्टी को ठंडा रखने और नमी बनाए रखने के लिए मल्चिंग करें। अत्यधिक गर्मी में पौधों को शेड नेट से ढकें।",
      mr: "माती थंड ठेवण्यासाठी आणि आर्द्रता टिकवण्यासाठी मल्चिंग करा. तीव्र उष्णतेत रोपांना शेड नेटने झाका.",
    },
    category: "sun",
    color: "bg-orange-500",
  },
  {
    id: 5,
    icon: CloudRain,
    title: {
      en: "Monsoon Preparation",
      hi: "मानसून की तैयारी",
      mr: "पावसाळ्याची तयारी",
    },
    content: {
      en: "Create proper drainage channels before monsoon. Check for waterlogging areas and prepare raised beds.",
      hi: "मानसून से पहले उचित जल निकासी व्यवस्था करें। जलभराव वाले क्षेत्रों की जांच करें और उठी हुई क्यारियां बनाएं।",
      mr: "पावसाळ्यापूर्वी योग्य पाण्याचा निचरा तयार करा. पाणी साचणाऱ्या जागांची तपासणी करा.",
    },
    category: "weather",
    color: "bg-cyan-500",
  },
  {
    id: 6,
    icon: Calendar,
    title: {
      en: "Right Time to Sow",
      hi: "बुवाई का सही समय",
      mr: "पेरणीची योग्य वेळ",
    },
    content: {
      en: "Check local agriculture calendar for best sowing dates. Sowing at right time increases yield by 20-30%.",
      hi: "सही बुवाई तारीखों के लिए स्थानीय कृषि कैलेंडर देखें। सही समय पर बुवाई से उपज 20-30% बढ़ती है।",
      mr: "योग्य पेरणी तारखांसाठी स्थानिक कृषी दिनदर्शिका तपासा. योग्य वेळी पेरणीने उत्पादन 20-30% वाढते.",
    },
    category: "season",
    color: "bg-green-600",
  },
];

const FarmingTipsCarousel: React.FC = () => {
  const { language } = useLanguage();
  const lang = language as Language;
  const [currentTip, setCurrentTip] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate tips
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % farmingTips.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTip = () => {
    setIsAutoPlaying(false);
    setCurrentTip((prev) => (prev + 1) % farmingTips.length);
  };

  const prevTip = () => {
    setIsAutoPlaying(false);
    setCurrentTip((prev) => (prev - 1 + farmingTips.length) % farmingTips.length);
  };

  const tip = farmingTips[currentTip];
  const Icon = tip.icon;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-card border-primary/20 overflow-hidden relative group">
      <CardContent className="pt-5 pb-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-primary">
            {lang === "hi"
              ? "आज की खेती टिप"
              : lang === "mr"
              ? "आजची शेती टिप"
              : "Today's Farming Tip"}
          </span>
          <div className="flex-1" />
          <div className="flex gap-1">
            {farmingTips.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentTip(i);
                  setIsAutoPlaying(false);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentTip
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </div>

        {/* Tip Content */}
        <div className="relative min-h-[100px]">
          <div
            key={tip.id}
            className="animate-fade-in flex gap-4"
          >
            <div
              className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-lg",
                tip.color
              )}
            >
              <Icon className="h-7 w-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-poppins font-bold text-base mb-1.5">
                {tip.title[lang]}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tip.content[lang]}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevTip}
            className="h-8 px-3 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {lang === "hi" ? "पिछला" : lang === "mr" ? "मागील" : "Previous"}
          </Button>
          
          <span className="text-xs text-muted-foreground">
            {currentTip + 1} / {farmingTips.length}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={nextTip}
            className="h-8 px-3 text-muted-foreground hover:text-foreground"
          >
            {lang === "hi" ? "अगला" : lang === "mr" ? "पुढील" : "Next"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmingTipsCarousel;
