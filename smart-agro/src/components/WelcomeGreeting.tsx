import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { Sun, Moon, Sunrise, Sunset, Sparkles } from "lucide-react";

interface WelcomeGreetingProps {
  farmerName?: string;
}

const WelcomeGreeting: React.FC<WelcomeGreetingProps> = ({ farmerName = "Ravi" }) => {
  const { language } = useLanguage();
  const lang = language as Language;
  
  const hour = new Date().getHours();
  
  // Determine time of day
  const getTimeOfDay = () => {
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };
  
  const timeOfDay = getTimeOfDay();
  
  // Get greeting based on time
  const greetings: Record<string, Record<Language, string>> = {
    morning: {
      en: "Good Morning",
      hi: "सुप्रभात",
      mr: "सुप्रभात",
    },
    afternoon: {
      en: "Good Afternoon", 
      hi: "नमस्कार",
      mr: "नमस्कार",
    },
    evening: {
      en: "Good Evening",
      hi: "शुभ संध्या",
      mr: "शुभ संध्याकाळ",
    },
    night: {
      en: "Good Night",
      hi: "शुभ रात्रि",
      mr: "शुभ रात्री",
    },
  };
  
  // Time-based suggestions
  const suggestions: Record<string, Record<Language, string>> = {
    morning: {
      en: "A perfect time to check your fields and water your crops!",
      hi: "अपने खेतों की जाँच और फसलों को पानी देने का सही समय!",
      mr: "तुमच्या शेताची तपासणी आणि पिकांना पाणी देण्याची योग्य वेळ!",
    },
    afternoon: {
      en: "Check today's market prices and plan your next harvest.",
      hi: "आज के बाजार भाव देखें और अगली उपज की योजना बनाएं।",
      mr: "आजचे बाजारभाव तपासा आणि पुढील काढणीचे नियोजन करा.",
    },
    evening: {
      en: "Review your farm's daily progress and tomorrow's weather.",
      hi: "अपने खेत की दैनिक प्रगति और कल का मौसम देखें।",
      mr: "तुमच्या शेताची दैनिक प्रगती आणि उद्याचे हवामान पहा.",
    },
    night: {
      en: "Plan for tomorrow and check weather alerts.",
      hi: "कल की योजना बनाएं और मौसम चेतावनी देखें।",
      mr: "उद्याचे नियोजन करा आणि हवामान इशारे तपासा.",
    },
  };
  
  // Get icon based on time
  const TimeIcon = timeOfDay === "morning" ? Sunrise :
                   timeOfDay === "afternoon" ? Sun :
                   timeOfDay === "evening" ? Sunset : Moon;
  
  // Background gradients based on time
  const gradients: Record<string, string> = {
    morning: "from-amber-500/20 via-orange-400/10 to-yellow-300/5",
    afternoon: "from-blue-500/20 via-sky-400/10 to-cyan-300/5",
    evening: "from-purple-500/20 via-pink-400/10 to-orange-300/5",
    night: "from-indigo-600/20 via-purple-500/10 to-blue-400/5",
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden p-6 bg-gradient-to-r ${gradients[timeOfDay]}`}>
      {/* Decorative elements */}
      <div className="absolute top-2 right-4 opacity-20">
        <Sparkles className="h-16 w-16 text-primary animate-pulse" />
      </div>
      
      <div className="relative z-10 flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce-slow">
          <TimeIcon className="h-8 w-8 text-primary" />
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground font-medium">
            {greetings[timeOfDay][lang]}
          </p>
          <h2 className="text-2xl font-poppins font-bold text-foreground">
            {farmerName}! 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {suggestions[timeOfDay][lang]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeGreeting;
