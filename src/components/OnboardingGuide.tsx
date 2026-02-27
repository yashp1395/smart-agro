import React, { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Sparkles, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: number;
  title: Record<Language, string>;
  description: Record<Language, string>;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right";
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: {
      en: "Welcome to Smart Agro AI!",
      hi: "स्मार्ट एग्रो AI में आपका स्वागत है!",
      mr: "स्मार्ट ॲग्रो AI मध्ये आपले स्वागत!",
    },
    description: {
      en: "Let us show you how to make the most of your farm with our intelligent tools.",
      hi: "आइए हम आपको दिखाएं कि हमारे बुद्धिमान टूल्स से अपने खेत का अधिकतम लाभ कैसे उठाएं।",
      mr: "आमच्या बुद्धिमान साधनांचा वापर करून तुमच्या शेताचा जास्तीत जास्त फायदा कसा घ्यायचा ते पाहू.",
    },
  },
  {
    id: 2,
    title: {
      en: "Check Weather Instantly",
      hi: "तुरंत मौसम देखें",
      mr: "त्वरित हवामान तपासा",
    },
    description: {
      en: "View real-time weather for your farm location and 7-day forecasts to plan your activities.",
      hi: "अपने खेत के स्थान के लिए रीयल-टाइम मौसम और 7 दिन का पूर्वानुमान देखें।",
      mr: "तुमच्या शेताच्या ठिकाणासाठी रिअल-टाइम हवामान आणि 7 दिवसांचा अंदाज पहा.",
    },
  },
  {
    id: 3,
    title: {
      en: "Scan for Crop Diseases",
      hi: "फसल रोगों की जांच करें",
      mr: "पिकांच्या रोगांची तपासणी करा",
    },
    description: {
      en: "Simply take a photo of your crop leaf and our AI will detect any diseases instantly.",
      hi: "बस अपनी फसल की पत्ती की फोटो लें और हमारा AI तुरंत किसी भी बीमारी का पता लगाएगा।",
      mr: "फक्त तुमच्या पिकाच्या पानाचा फोटो काढा आणि आमचा AI लगेच कोणत्याही रोगाचा शोध घेईल.",
    },
  },
  {
    id: 4,
    title: {
      en: "Get Market Prices",
      hi: "बाजार भाव प्राप्त करें",
      mr: "बाजारभाव मिळवा",
    },
    description: {
      en: "Access live prices from your nearest APMC mandi to sell at the best time.",
      hi: "सबसे अच्छे समय पर बेचने के लिए अपनी निकटतम APMC मंडी से लाइव कीमतें देखें।",
      mr: "सर्वोत्तम वेळी विकण्यासाठी तुमच्या जवळच्या APMC बाजारातून थेट किंमती पहा.",
    },
  },
  {
    id: 5,
    title: {
      en: "Talk to Our Assistant",
      hi: "हमारे सहायक से बात करें",
      mr: "आमच्या सहाय्यकाशी बोला",
    },
    description: {
      en: "Use the voice assistant (green button) to ask questions in Hindi, Marathi or English.",
      hi: "हिंदी, मराठी या अंग्रेज़ी में सवाल पूछने के लिए वॉइस असिस्टेंट (हरा बटन) का उपयोग करें।",
      mr: "हिंदी, मराठी किंवा इंग्रजीमध्ये प्रश्न विचारण्यासाठी व्हॉइस असिस्टंट (हिरवे बटण) वापरा.",
    },
  },
];

const ONBOARDING_KEY = "smart-agro-onboarding-completed";

const OnboardingGuide: React.FC = () => {
  const { language } = useLanguage();
  const lang = language as Language;
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  useEffect(() => {
    // Check if user has seen onboarding
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) {
      setIsOpen(true);
      setHasSeenOnboarding(false);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(ONBOARDING_KEY, "true");
    setHasSeenOnboarding(true);
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReopen = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const step = onboardingSteps[currentStep];

  if (!isOpen) {
    return (
      <Button
        onClick={handleReopen}
        variant="outline"
        size="sm"
        className="fixed bottom-24 left-6 z-50 bg-card shadow-lg border-primary/30 hover:bg-primary/5"
      >
        <HelpCircle className="h-4 w-4 mr-2 text-primary" />
        {lang === "hi" ? "मदद" : lang === "mr" ? "मदत" : "Help"}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <Card className="relative z-10 w-[90%] max-w-md mx-4 animate-scale-in shadow-2xl border-primary/20">
        <CardContent className="pt-6 pb-4">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-2 right-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Header icon */}
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg animate-bounce-slow">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex justify-center gap-1.5 mb-4">
            {onboardingSteps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === currentStep
                    ? "w-6 bg-primary"
                    : i < currentStep
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                )}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center space-y-3 mb-6">
            <h2 className="text-xl font-poppins font-bold text-foreground">
              {step.title[lang]}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {step.description[lang]}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="h-10"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {lang === "hi" ? "पीछे" : lang === "mr" ? "मागे" : "Back"}
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {onboardingSteps.length}
            </span>

            <Button onClick={handleNext} className="h-10 bg-primary">
              {currentStep === onboardingSteps.length - 1 ? (
                lang === "hi" ? "शुरू करें" : lang === "mr" ? "सुरू करा" : "Get Started"
              ) : (
                <>
                  {lang === "hi" ? "आगे" : lang === "mr" ? "पुढे" : "Next"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Skip link */}
          {currentStep < onboardingSteps.length - 1 && (
            <div className="text-center mt-4">
              <button
                onClick={handleClose}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
              >
                {lang === "hi" ? "छोड़ें" : lang === "mr" ? "वगळा" : "Skip tutorial"}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingGuide;
