import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Landmark, IndianRupee, ShieldCheck, Wheat, CloudRain,
  FileText, ExternalLink, CheckCircle, AlertTriangle, ArrowRight,
  HandCoins, Tractor, Droplets, Sprout,
} from "lucide-react";
import { Language } from "@/i18n/translations";
import bgSchemes from "@/assets/bg-schemes.jpg";

const schemesData = {
  subsidies: [
    {
      id: 1,
      name: { en: "PM-KISAN Samman Nidhi", hi: "पीएम-किसान सम्मान निधि", mr: "पीएम-किसान सन्मान निधी" },
      desc: { en: "₹6,000/year direct income support to all land-holding farmer families in three equal installments.", hi: "सभी भूमिधारक किसान परिवारों को ₹6,000/वर्ष तीन समान किस्तों में सीधी आय सहायता।", mr: "सर्व भूधारक शेतकरी कुटुंबांना ₹6,000/वर्ष तीन समान हप्त्यांमध्ये थेट उत्पन्न सहाय्य." },
      amount: "₹6,000/yr",
      status: "active",
      icon: IndianRupee,
      category: "income",
    },
    {
      id: 2,
      name: { en: "Soil Health Card Scheme", hi: "मृदा स्वास्थ्य कार्ड योजना", mr: "मृदा आरोग्य कार्ड योजना" },
      desc: { en: "Free soil testing and nutrient-based recommendations for every farm. Get your soil health card every 2 years.", hi: "हर खेत के लिए मुफ्त मिट्टी परीक्षण और पोषक तत्व आधारित सिफारिशें। हर 2 साल में मृदा स्वास्थ्य कार्ड प्राप्त करें।", mr: "प्रत्येक शेतासाठी मोफत माती चाचणी आणि पोषक तत्त्वांवर आधारित शिफारसी. दर 2 वर्षांनी मृदा आरोग्य कार्ड मिळवा." },
      amount: "Free",
      status: "active",
      icon: Sprout,
      category: "input",
    },
    {
      id: 3,
      name: { en: "Pradhan Mantri Fasal Bima Yojana (PMFBY)", hi: "प्रधानमंत्री फसल बीमा योजना (PMFBY)", mr: "प्रधानमंत्री पीक विमा योजना (PMFBY)" },
      desc: { en: "Crop insurance at just 2% premium for Kharif and 1.5% for Rabi crops. Covers natural calamities, pests and diseases.", hi: "खरीफ के लिए सिर्फ 2% और रबी फसलों के लिए 1.5% प्रीमियम पर फसल बीमा। प्राकृतिक आपदाओं, कीटों और रोगों को कवर करता है।", mr: "खरीप पिकांसाठी फक्त 2% आणि रबी पिकांसाठी 1.5% प्रीमियमवर पीक विमा. नैसर्गिक आपत्ती, कीड आणि रोगांचे संरक्षण." },
      amount: "2% Premium",
      status: "active",
      icon: ShieldCheck,
      category: "insurance",
    },
    {
      id: 4,
      name: { en: "Kisan Credit Card (KCC)", hi: "किसान क्रेडिट कार्ड (KCC)", mr: "किसान क्रेडिट कार्ड (KCC)" },
      desc: { en: "Low-interest credit up to ₹3 lakh at 4% p.a. for crop production, post-harvest expenses, and farm maintenance.", hi: "फसल उत्पादन, कटाई के बाद के खर्चों और खेत रखरखाव के लिए 4% प्रति वर्ष पर ₹3 लाख तक कम ब्याज ऋण।", mr: "पीक उत्पादन, काढणीनंतरचे खर्च आणि शेत देखभालीसाठी 4% व्याजदरावर ₹3 लाखांपर्यंत कमी व्याज कर्ज." },
      amount: "Up to ₹3L",
      status: "active",
      icon: HandCoins,
      category: "credit",
    },
    {
      id: 5,
      name: { en: "Sub-Mission on Agricultural Mechanization (SMAM)", hi: "कृषि मशीनीकरण उप-मिशन (SMAM)", mr: "कृषी यांत्रिकीकरण उप-अभियान (SMAM)" },
      desc: { en: "40-50% subsidy on purchase of farm machinery including tractors, tillers, harvesters and irrigation equipment.", hi: "ट्रैक्टर, टिलर, हार्वेस्टर और सिंचाई उपकरण सहित कृषि मशीनरी की खरीद पर 40-50% सब्सिडी।", mr: "ट्रॅक्टर, टिलर, हार्वेस्टर आणि सिंचन उपकरणांसह शेती यंत्रसामग्री खरेदीवर 40-50% अनुदान." },
      amount: "40-50%",
      status: "active",
      icon: Tractor,
      category: "equipment",
    },
    {
      id: 6,
      name: { en: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)", hi: "प्रधानमंत्री कृषि सिंचाई योजना (PMKSY)", mr: "प्रधानमंत्री कृषी सिंचन योजना (PMKSY)" },
      desc: { en: "55-75% subsidy on micro-irrigation (drip and sprinkler systems). 'Per Drop More Crop' initiative.", hi: "सूक्ष्म सिंचाई (ड्रिप और स्प्रिंकलर सिस्टम) पर 55-75% सब्सिडी। 'प्रति बूंद अधिक फसल' पहल।", mr: "सूक्ष्म सिंचनावर (ड्रिप आणि स्प्रिंकलर) 55-75% अनुदान. 'प्रत्येक थेंबातून अधिक पीक' उपक्रम." },
      amount: "55-75%",
      status: "active",
      icon: Droplets,
      category: "irrigation",
    },
  ],
  nuksanBharpai: [
    {
      id: 101,
      name: { en: "Flood / Heavy Rain Compensation", hi: "बाढ़ / भारी बारिश मुआवजा", mr: "पूर / अतिवृष्टी भरपाई" },
      desc: { en: "Compensation for crop loss due to floods and excessive rainfall. Up to ₹13,500/hectare for food crops and ₹18,000/hectare for commercial crops.", hi: "बाढ़ और अत्यधिक वर्षा से फसल नुकसान के लिए मुआवजा। खाद्य फसलों के लिए ₹13,500/हेक्टेयर और वाणिज्यिक फसलों के लिए ₹18,000/हेक्टेयर तक।", mr: "पूर आणि अतिवृष्टीमुळे पीक नुकसानासाठी भरपाई. अन्नधान्य पिकांसाठी ₹13,500/हेक्टर आणि नगदी पिकांसाठी ₹18,000/हेक्टर." },
      amount: "₹13,500-18,000/ha",
      trigger: "flood",
    },
    {
      id: 102,
      name: { en: "Drought Compensation", hi: "सूखा मुआवजा", mr: "दुष्काळ भरपाई" },
      desc: { en: "Relief package for drought-declared districts. Includes input subsidy of ₹6,800/hectare for rainfed areas and ₹13,500/hectare for irrigated areas.", hi: "सूखा घोषित जिलों के लिए राहत पैकेज। वर्षा आधारित क्षेत्रों के लिए ₹6,800/हेक्टेयर और सिंचित क्षेत्रों के लिए ₹13,500/हेक्टेयर इनपुट सब्सिडी।", mr: "दुष्काळग्रस्त जिल्ह्यांसाठी मदत पॅकेज. कोरडवाहू क्षेत्रासाठी ₹6,800/हेक्टर आणि सिंचित क्षेत्रासाठी ₹13,500/हेक्टर." },
      amount: "₹6,800-13,500/ha",
      trigger: "drought",
    },
    {
      id: 103,
      name: { en: "Hailstorm / Unseasonal Rain Compensation", hi: "ओलावृष्टि / बेमौसम बारिश मुआवजा", mr: "गारपीट / अवकाळी पाऊस भरपाई" },
      desc: { en: "Immediate relief for crop damage due to hailstorm and unseasonal rainfall. ₹6,800/hectare for rainfed and ₹13,500/hectare for irrigated land.", hi: "ओलावृष्टि और बेमौसम वर्षा से फसल क्षति के लिए तत्काल राहत। वर्षा आधारित के लिए ₹6,800/हेक्टेयर और सिंचित भूमि के लिए ₹13,500/हेक्टेयर।", mr: "गारपीट आणि अवकाळी पावसामुळे पीक नुकसानीसाठी तात्काळ मदत. कोरडवाहूसाठी ₹6,800/हेक्टर आणि सिंचित जमिनीसाठी ₹13,500/हेक्टर." },
      amount: "₹6,800-13,500/ha",
      trigger: "hailstorm",
    },
    {
      id: 104,
      name: { en: "Pest / Disease Epidemic Compensation", hi: "कीट / रोग महामारी मुआवजा", mr: "कीड / रोग साथ भरपाई" },
      desc: { en: "Compensation when government declares pest/disease epidemic in a region. Covers cost of pesticides and crop loss partially.", hi: "जब सरकार किसी क्षेत्र में कीट/रोग महामारी घोषित करती है तो मुआवजा। कीटनाशकों की लागत और फसल हानि का आंशिक कवरेज।", mr: "सरकारने एखाद्या प्रदेशात कीड/रोग साथ जाहीर केल्यावर भरपाई. कीटकनाशकांचा खर्च आणि पीक नुकसानीचा आंशिक भरपाई." },
      amount: "Variable",
      trigger: "pest",
    },
  ],
};

const GovSchemes: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Language;
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { key: "all", label: t("schemes.all") },
    { key: "income", label: t("schemes.income") },
    { key: "insurance", label: t("schemes.insurance") },
    { key: "credit", label: t("schemes.credit") },
    { key: "equipment", label: t("schemes.equipment") },
    { key: "irrigation", label: t("schemes.irrigation") },
    { key: "input", label: t("schemes.input") },
  ];

  const filteredSchemes = activeCategory === "all"
    ? schemesData.subsidies
    : schemesData.subsidies.filter((s) => s.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-40 group">
        <img src={bgSchemes} alt="Gov schemes" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/70 to-transparent" />
        <div className="relative z-10 flex items-center h-full px-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="h-6 w-6 text-accent" />
              <Badge className="bg-accent text-accent-foreground">{t("schemes.govt")}</Badge>
            </div>
            <h1 className="text-3xl font-poppins font-bold text-secondary-foreground">{t("schemes.title")}</h1>
            <p className="text-secondary-foreground/70 mt-1 text-sm max-w-lg">{t("schemes.subtitle")}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="subsidies" className="w-full">
        <TabsList className="bg-card/80 backdrop-blur-sm border border-border/50 p-1 h-auto">
          <TabsTrigger value="subsidies" className="text-sm py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <IndianRupee className="h-4 w-4 mr-1.5" />
            {t("schemes.subsidies")}
          </TabsTrigger>
          <TabsTrigger value="nuksan" className="text-sm py-2.5 px-5 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
            <AlertTriangle className="h-4 w-4 mr-1.5" />
            {t("schemes.nuksan")}
          </TabsTrigger>
          <TabsTrigger value="benefits" className="text-sm py-2.5 px-5 data-[state=active]:bg-success data-[state=active]:text-success-foreground">
            <CheckCircle className="h-4 w-4 mr-1.5" />
            {t("schemes.benefits")}
          </TabsTrigger>
        </TabsList>

        {/* Subsidies & Schemes */}
        <TabsContent value="subsidies" className="mt-5 space-y-4">
          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat.key}
                size="sm"
                variant={activeCategory === cat.key ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.key)}
                className="rounded-full text-xs"
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-4">
            {filteredSchemes.map((scheme) => (
              <Card key={scheme.id} className="col-span-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card/95 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <scheme.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="leading-tight">{scheme.name[lang]}</span>
                    </span>
                    <Badge className="bg-success/10 text-success border-success/20 shrink-0">{scheme.amount}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{scheme.desc[lang]}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-success" />
                      {t("schemes.active_status")}
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-primary text-xs group-hover:bg-primary/5">
                      {t("schemes.apply")} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Nuksan Bharpai */}
        <TabsContent value="nuksan" className="mt-5 space-y-4">
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-destructive">{t("schemes.nuksan_info_title")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("schemes.nuksan_info_desc")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-12 gap-4">
            {schemesData.nuksanBharpai.map((item) => (
              <Card key={item.id} className="col-span-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card/95 backdrop-blur-sm border-l-4 border-l-destructive">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                        <CloudRain className="h-5 w-5 text-destructive" />
                      </div>
                      <span className="leading-tight">{item.name[lang]}</span>
                    </span>
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 shrink-0">{item.amount}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.desc[lang]}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs capitalize">
                      <CloudRain className="h-3 w-3 mr-1" />
                      {item.trigger}
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-destructive text-xs">
                      {t("schemes.claim")} <FileText className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Benefits / How to Apply */}
        <TabsContent value="benefits" className="mt-5 space-y-4">
          <div className="grid grid-cols-12 gap-5">
            {/* How to apply steps */}
            <Card className="col-span-7 bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t("schemes.how_to_apply")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { step: 1, title: t("schemes.step1_title"), desc: t("schemes.step1_desc") },
                  { step: 2, title: t("schemes.step2_title"), desc: t("schemes.step2_desc") },
                  { step: 3, title: t("schemes.step3_title"), desc: t("schemes.step3_desc") },
                  { step: 4, title: t("schemes.step4_title"), desc: t("schemes.step4_desc") },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-4 p-3 rounded-xl bg-muted/30">
                    <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Key documents */}
            <Card className="col-span-5 bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-warning" />
                  {t("schemes.documents_needed")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  t("schemes.doc1"),
                  t("schemes.doc2"),
                  t("schemes.doc3"),
                  t("schemes.doc4"),
                  t("schemes.doc5"),
                  t("schemes.doc6"),
                ].map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    <span className="text-sm">{doc}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Helpline */}
            <Card className="col-span-12 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Landmark className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-base">{t("schemes.helpline_title")}</p>
                    <p className="text-sm text-muted-foreground">{t("schemes.helpline_desc")}</p>
                  </div>
                </div>
                <Button className="bg-primary text-primary-foreground">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("schemes.visit_portal")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GovSchemes;
