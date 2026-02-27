export const weatherData = {
  temperature: 32,
  humidity: 68,
  wind: 12,
  rainChance: 35,
  condition: "Partly Cloudy",
};

export const soilData = {
  nitrogen: 42,
  phosphorus: 71,
  potassium: 55,
  ph: 6.2,
  moisture: 38,
  organic: 2.8,
};

export const cropRecommendation = {
  primary: { name: "Soybean", nameHi: "सोयाबीन", nameMr: "सोयाबीन", suitability: 92 },
  intercrop: { name: "Pigeon Pea", nameHi: "अरहर", nameMr: "तूर", suitability: 78 },
  reason: {
    en: "Soybean is ideal for your soil's current nitrogen levels and the upcoming Kharif season. Pigeon Pea adds nitrogen back to the soil.",
    hi: "सोयाबीन आपकी मिट्टी के नाइट्रोजन स्तर और आगामी खरीफ मौसम के लिए आदर्श है। अरहर मिट्टी में नाइट्रोजन वापस जोड़ता है।",
    mr: "सोयाबीन आपल्या मातीतील नायट्रोजन पातळी आणि येणाऱ्या खरीप हंगामासाठी आदर्श आहे. तूर मातीत नायट्रोजन परत जोडते.",
  },
};

export const marketPrices = [
  { crop: "Soybean", cropHi: "सोयाबीन", cropMr: "सोयाबीन", price: 4850, trend: "up" as const, change: "+120" },
  { crop: "Wheat", cropHi: "गेहूं", cropMr: "गहू", price: 2275, trend: "down" as const, change: "-45" },
  { crop: "Cotton", cropHi: "कपास", cropMr: "कापूस", price: 6420, trend: "up" as const, change: "+230" },
];

export const alerts = [
  { type: "warning" as const, message: { en: "Heavy rainfall expected in 3 days", hi: "3 दिनों में भारी बारिश की संभावना", mr: "3 दिवसांत जोरदार पावसाची शक्यता" } },
  { type: "danger" as const, message: { en: "Leaf blight risk is HIGH for Soybean", hi: "सोयाबीन में पत्ती झुलसा रोग का खतरा अधिक", mr: "सोयाबीनमध्ये पानावरील करपा रोगाचा धोका जास्त" } },
  { type: "info" as const, message: { en: "Market prices updated: Soybean ↑ ₹120/qtl", hi: "बाजार मूल्य अपडेट: सोयाबीन ↑ ₹120/क्विंटल", mr: "बाजार किंमत अपडेट: सोयाबीन ↑ ₹120/क्विंटल" } },
];

export const recommendedCrops = [
  { name: "Soybean", nameHi: "सोयाबीन", nameMr: "सोयाबीन", suitability: 92, season: "Kharif", seasonHi: "खरीफ", seasonMr: "खरीप", yield: "18-22 qtl/acre", emoji: "🫘" },
  { name: "Cotton", nameHi: "कपास", nameMr: "कापूस", suitability: 85, season: "Kharif", seasonHi: "खरीफ", seasonMr: "खरीप", yield: "8-12 qtl/acre", emoji: "🌿" },
  { name: "Wheat", nameHi: "गेहूं", nameMr: "गहू", suitability: 78, season: "Rabi", seasonHi: "रबी", seasonMr: "रब्बी", yield: "20-25 qtl/acre", emoji: "🌾" },
  { name: "Chickpea", nameHi: "चना", nameMr: "हरभरा", suitability: 74, season: "Rabi", seasonHi: "रबी", seasonMr: "रब्बी", yield: "10-14 qtl/acre", emoji: "🫛" },
  { name: "Pigeon Pea", nameHi: "अरहर", nameMr: "तूर", suitability: 70, season: "Kharif", seasonHi: "खरीफ", seasonMr: "खरीप", yield: "8-12 qtl/acre", emoji: "🌱" },
];

export const intercroppingPairs = [
  {
    main: { name: "Soybean", nameHi: "सोयाबीन", nameMr: "सोयाबीन", emoji: "🫘" },
    companion: { name: "Pigeon Pea", nameHi: "अरहर", nameMr: "तूर", emoji: "🌱" },
    benefit: { en: "Nitrogen fixation, pest reduction", hi: "नाइट्रोजन स्थिरीकरण, कीट कमी", mr: "नायट्रोजन स्थिरीकरण, कीड कमी" },
    months: [6, 7, 8, 9, 10, 11],
  },
  {
    main: { name: "Cotton", nameHi: "कपास", nameMr: "कापूस", emoji: "🌿" },
    companion: { name: "Black Gram", nameHi: "उड़द", nameMr: "उडीद", emoji: "🫘" },
    benefit: { en: "Soil fertility, weed control", hi: "मिट्टी उर्वरता, खरपतवार नियंत्रण", mr: "माती सुपीकता, तण नियंत्रण" },
    months: [6, 7, 8, 9, 10],
  },
];

export const fertilizerPlan = [
  { stage: { en: "Sowing", hi: "बुवाई", mr: "पेरणी" }, fertilizer: "DAP", dosage: "50 kg/acre", timing: "At sowing", icon: "🌱" },
  { stage: { en: "Vegetative", hi: "वानस्पतिक", mr: "वनस्पती वाढ" }, fertilizer: "Urea", dosage: "25 kg/acre", timing: "30 days", icon: "🌿" },
  { stage: { en: "Flowering", hi: "फूल आना", mr: "फुलोरा" }, fertilizer: "MOP", dosage: "20 kg/acre", timing: "45 days", icon: "🌸" },
  { stage: { en: "Pod Formation", hi: "फली बनना", mr: "शेंग तयार होणे" }, fertilizer: "Micronutrients", dosage: "Spray", timing: "60 days", icon: "🫛" },
];

export const diseaseResult = {
  name: { en: "Leaf Blight (Cercospora)", hi: "पत्ती झुलसा (सर्कोस्पोरा)", mr: "पानावरील करपा (सर्कोस्पोरा)" },
  confidence: 87,
  risk: "high" as const,
  weatherInfluence: { en: "High humidity (>80%) and warm temperatures favor this disease", hi: "उच्च आर्द्रता (>80%) और गर्म तापमान इस रोग को बढ़ावा देते हैं", mr: "जास्त आर्द्रता (>80%) आणि उबदार तापमान या रोगाला अनुकूल" },
  treatment: [
    { en: "Apply Mancozeb 75% WP @ 2.5g/L water", hi: "मैन्कोज़ेब 75% WP @ 2.5g/L पानी में छिड़कें", mr: "मॅन्कोझेब 75% WP @ 2.5g/L पाण्यात फवारणी करा" },
    { en: "Spray Carbendazim 50% WP @ 1g/L as follow-up", hi: "कार्बेन्डाज़िम 50% WP @ 1g/L दूसरी छिड़काव", mr: "कार्बेन्डाझिम 50% WP @ 1g/L दुसरी फवारणी" },
    { en: "Remove and destroy infected leaves", hi: "संक्रमित पत्तियों को हटाकर नष्ट करें", mr: "संक्रमित पाने काढून नष्ट करा" },
  ],
  safety: { en: "Wear mask and gloves during spraying. Do not spray during windy conditions. Wait 7 days before harvest.", hi: "छिड़काव के दौरान मास्क और दस्ताने पहनें। हवा में छिड़काव न करें। कटाई से 7 दिन पहले रुकें।", mr: "फवारणीच्या वेळी मास्क व हातमोजे वापरा. वाऱ्यात फवारणी करू नका. काढणीच्या 7 दिवस आधी थांबा." },
};

export const yieldForecastData = {
  good: [
    { month: "Jun", yield: 0 }, { month: "Jul", yield: 2 }, { month: "Aug", yield: 8 },
    { month: "Sep", yield: 14 }, { month: "Oct", yield: 20 }, { month: "Nov", yield: 24 },
  ],
  average: [
    { month: "Jun", yield: 0 }, { month: "Jul", yield: 1.5 }, { month: "Aug", yield: 6 },
    { month: "Sep", yield: 11 }, { month: "Oct", yield: 16 }, { month: "Nov", yield: 19 },
  ],
  poor: [
    { month: "Jun", yield: 0 }, { month: "Jul", yield: 1 }, { month: "Aug", yield: 4 },
    { month: "Sep", yield: 7 }, { month: "Oct", yield: 11 }, { month: "Nov", yield: 13 },
  ],
  districtAvg: [
    { month: "Jun", yield: 0 }, { month: "Jul", yield: 1.2 }, { month: "Aug", yield: 5 },
    { month: "Sep", yield: 10 }, { month: "Oct", yield: 15 }, { month: "Nov", yield: 18 },
  ],
};

export const marketPredictions = [
  { date: "2026-02-10", price: 4920, confidence: 82, recommendation: "hold" as const },
  { date: "2026-02-15", price: 5050, confidence: 75, recommendation: "hold" as const },
  { date: "2026-02-20", price: 5180, confidence: 68, recommendation: "sell" as const },
  { date: "2026-02-25", price: 5100, confidence: 61, recommendation: "hold" as const },
  { date: "2026-03-01", price: 4980, confidence: 55, recommendation: "sell" as const },
  { date: "2026-03-05", price: 4850, confidence: 50, recommendation: "hold" as const },
];

export const marketPriceTrend = [
  { date: "Jan W1", price: 4500 }, { date: "Jan W2", price: 4580 }, { date: "Jan W3", price: 4620 },
  { date: "Jan W4", price: 4700 }, { date: "Feb W1", price: 4850 }, { date: "Feb W2", price: 4920 },
];

export const mandiList = [
  "Nagpur", "Pune", "Latur", "Indore", "Bhopal", "Akola", "Amravati",
];

export const cropList = [
  { name: "Soybean", nameHi: "सोयाबीन", nameMr: "सोयाबीन" },
  { name: "Wheat", nameHi: "गेहूं", nameMr: "गहू" },
  { name: "Cotton", nameHi: "कपास", nameMr: "कापूस" },
  { name: "Chickpea", nameHi: "चना", nameMr: "हरभरा" },
];
