import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Sprout,
  Droplets,
  Bug,
  Scissors,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SeasonalTask {
  id: string;
  icon: React.ElementType;
  title: Record<Language, string>;
  description: Record<Language, string>;
  completed: boolean;
  urgent?: boolean;
}

const SeasonalHelper: React.FC = () => {
  const { language } = useLanguage();
  const lang = language as Language;
  
  // Get current month for seasonal context
  const month = new Date().getMonth(); // 0-11
  
  // Determine season based on Indian agricultural calendar
  const getSeason = () => {
    if (month >= 5 && month <= 9) return "kharif"; // June to October (Monsoon)
    if (month >= 10 || month <= 2) return "rabi"; // November to March (Winter)
    return "zaid"; // March to June (Summer)
  };
  
  const season = getSeason();
  
  const seasonNames: Record<string, Record<Language, string>> = {
    kharif: {
      en: "Kharif Season",
      hi: "खरीफ सीजन",
      mr: "खरीप हंगाम",
    },
    rabi: {
      en: "Rabi Season",
      hi: "रबी सीजन",
      mr: "रब्बी हंगाम",
    },
    zaid: {
      en: "Zaid/Summer Season",
      hi: "जायद/गर्मी सीजन",
      mr: "उन्हाळी हंगाम",
    },
  };
  
  const seasonColors: Record<string, string> = {
    kharif: "bg-green-600",
    rabi: "bg-amber-600",
    zaid: "bg-orange-500",
  };
  
  // Sample tasks based on season
  const tasks: Record<string, SeasonalTask[]> = {
    kharif: [
      {
        id: "k1",
        icon: Sprout,
        title: { en: "Prepare Seedbed", hi: "बीज बेड तैयार करें", mr: "बीजबेड तयार करा" },
        description: { en: "Prepare soil for rice/cotton sowing", hi: "धान/कपास बुवाई के लिए मिट्टी तैयार करें", mr: "धान/कापूस पेरणीसाठी माती तयार करा" },
        completed: true,
      },
      {
        id: "k2",
        icon: Droplets,
        title: { en: "Check Irrigation", hi: "सिंचाई जांचें", mr: "सिंचन तपासा" },
        description: { en: "Ensure proper drainage channels", hi: "उचित जल निकासी सुनिश्चित करें", mr: "योग्य निचऱ्याची खात्री करा" },
        completed: true,
      },
      {
        id: "k3",
        icon: Bug,
        title: { en: "Pest Monitoring", hi: "कीट निगरानी", mr: "कीड निरीक्षण" },
        description: { en: "Watch for monsoon pest attacks", hi: "मानसून कीट हमलों पर नजर रखें", mr: "पावसाळी कीड हल्ले पहा" },
        completed: false,
        urgent: true,
      },
      {
        id: "k4",
        icon: Package,
        title: { en: "Stock Fertilizers", hi: "उर्वरक स्टॉक करें", mr: "खते साठवा" },
        description: { en: "Buy fertilizers before prices rise", hi: "कीमतें बढ़ने से पहले उर्वरक खरीदें", mr: "किंमती वाढण्यापूर्वी खते घ्या" },
        completed: false,
      },
    ],
    rabi: [
      {
        id: "r1",
        icon: Sprout,
        title: { en: "Wheat Sowing", hi: "गेहूं बुवाई", mr: "गहू पेरणी" },
        description: { en: "Optimal time for wheat sowing", hi: "गेहूं बुवाई का सही समय", mr: "गहू पेरणीची योग्य वेळ" },
        completed: false,
        urgent: true,
      },
      {
        id: "r2",
        icon: Droplets,
        title: { en: "Plan Irrigation", hi: "सिंचाई योजना", mr: "सिंचन नियोजन" },
        description: { en: "Schedule winter irrigation", hi: "सर्दियों की सिंचाई की योजना", mr: "हिवाळी सिंचनाचे नियोजन" },
        completed: true,
      },
      {
        id: "r3",
        icon: Bug,
        title: { en: "Disease Prevention", hi: "रोग रोकथाम", mr: "रोग प्रतिबंध" },
        description: { en: "Apply preventive measures", hi: "निवारक उपाय करें", mr: "प्रतिबंधात्मक उपाय करा" },
        completed: false,
      },
      {
        id: "r4",
        icon: Scissors,
        title: { en: "Pruning", hi: "छंटाई", mr: "छाटणी" },
        description: { en: "Prune fruit trees", hi: "फलदार पेड़ों की छंटाई", mr: "फळझाडांची छाटणी" },
        completed: false,
      },
    ],
    zaid: [
      {
        id: "z1",
        icon: Sprout,
        title: { en: "Summer Vegetables", hi: "गर्मी की सब्जियां", mr: "उन्हाळी भाज्या" },
        description: { en: "Plant cucurbits and melons", hi: "कद्दूवर्गीय और खरबूजे लगाएं", mr: "काकडीवर्गीय आणि खरबूज लावा" },
        completed: false,
        urgent: true,
      },
      {
        id: "z2",
        icon: Droplets,
        title: { en: "Mulching", hi: "मल्चिंग", mr: "आच्छादन" },
        description: { en: "Apply mulch to retain moisture", hi: "नमी बनाए रखने के लिए मल्च करें", mr: "आर्द्रता टिकवण्यासाठी आच्छादन करा" },
        completed: true,
      },
      {
        id: "z3",
        icon: Bug,
        title: { en: "Heat Protection", hi: "गर्मी से सुरक्षा", mr: "उष्णतेपासून संरक्षण" },
        description: { en: "Install shade nets", hi: "शेड नेट लगाएं", mr: "शेड नेट लावा" },
        completed: false,
      },
      {
        id: "z4",
        icon: Package,
        title: { en: "Harvest Planning", hi: "कटाई योजना", mr: "काढणी नियोजन" },
        description: { en: "Plan rabi harvest and storage", hi: "रबी कटाई और भंडारण की योजना", mr: "रब्बी काढणी आणि साठवणुकीचे नियोजन" },
        completed: true,
      },
    ],
  };
  
  const currentTasks = tasks[season];
  const completedCount = currentTasks.filter((t) => t.completed).length;
  const progress = (completedCount / currentTasks.length) * 100;

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            {lang === "hi" ? "मौसमी कार्य" : lang === "mr" ? "हंगामी कामे" : "Seasonal Tasks"}
          </span>
          <Badge className={cn("text-white", seasonColors[season])}>
            {seasonNames[season][lang]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {lang === "hi" ? "प्रगति" : lang === "mr" ? "प्रगती" : "Progress"}
            </span>
            <span className="font-semibold text-primary">
              {completedCount}/{currentTasks.length}{" "}
              {lang === "hi" ? "पूर्ण" : lang === "mr" ? "पूर्ण" : "done"}
            </span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {currentTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                task.completed
                  ? "bg-success/5 border border-success/20"
                  : task.urgent
                  ? "bg-warning/5 border border-warning/30 animate-pulse-slow"
                  : "bg-muted/30 hover:bg-muted/50"
              )}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  task.completed
                    ? "bg-success/20 text-success"
                    : task.urgent
                    ? "bg-warning/20 text-warning"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <task.icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "font-medium text-sm truncate",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title[lang]}
                  </p>
                  {task.urgent && !task.completed && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      {lang === "hi" ? "जरूरी" : lang === "mr" ? "तातडीचे" : "Urgent"}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {task.description[lang]}
                </p>
              </div>
              
              <div className="shrink-0">
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SeasonalHelper;
