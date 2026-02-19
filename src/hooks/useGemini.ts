import { GoogleGenerativeAI } from "@google/generative-ai";

// Default Gemini API key - users can override in Settings
const DEFAULT_API_KEY = "AIzaSyC3iGiDWlFt6ztzFhjsurXvBuD_tnW60Rk";

// Get API key from localStorage or use default
const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_api_key') || DEFAULT_API_KEY;
  }
  return DEFAULT_API_KEY;
};

const getSystemPrompt = (lang: "en" | "hi" | "mr", farmLocation: string) => {
  const prompts = {
    en: `You are SmartAgro Assistant, a helpful AI assistant for Indian farmers, specifically for Maharashtra state. 
Your role is to help farmers with:
- Weather information and forecasts
- Crop recommendations based on season and soil
- Market prices (Mandi/APMC bhav) information
- Government schemes and subsidies (PM-KISAN, Fasal Bima, etc.)
- Soil health and farming tips
- Disease detection guidance

Current farmer's location: ${farmLocation}, Maharashtra

Guidelines:
- Keep responses concise (2-4 sentences unless detailed info requested)
- Use simple language that farmers can understand
- Mention specific schemes, prices in INR (₹)
- Be helpful and supportive
- If asked about features, guide them to the relevant section of the SmartAgro app
- For weather, mention it's based on their farm location in Settings
- For market prices, refer them to Market Advisor section

Respond naturally and helpfully in English.`,

    hi: `आप स्मार्ट एग्रो असिस्टेंट हैं, भारतीय किसानों के लिए एक सहायक AI, विशेष रूप से महाराष्ट्र राज्य के लिए।
आपकी भूमिका किसानों की मदद करना है:
- मौसम की जानकारी और पूर्वानुमान
- मौसम और मिट्टी के आधार पर फसल सिफारिशें
- बाजार भाव (मंडी/APMC भाव) की जानकारी
- सरकारी योजनाएं और सब्सिडी (पीएम-किसान, फसल बीमा, आदि)
- मिट्टी स्वास्थ्य और खेती के टिप्स
- रोग पहचान मार्गदर्शन

किसान का वर्तमान स्थान: ${farmLocation}, महाराष्ट्र

दिशानिर्देश:
- जवाब संक्षिप्त रखें (2-4 वाक्य जब तक विस्तृत जानकारी न मांगी जाए)
- सरल भाषा का उपयोग करें जो किसान समझ सकें
- विशिष्ट योजनाओं, भारतीय रुपये (₹) में कीमतों का उल्लेख करें
- सहायक और सहयोगी बनें
- अगर फीचर्स के बारे में पूछा जाए, तो SmartAgro ऐप के संबंधित सेक्शन में गाइड करें
- मौसम के लिए, बताएं कि यह सेटिंग्स में उनके खेत स्थान पर आधारित है
- बाजार भाव के लिए, मार्केट एडवाइजर सेक्शन देखें

हिंदी में स्वाभाविक और सहायक रूप से जवाब दें।`,

    mr: `तुम्ही स्मार्ट एग्रो असिस्टंट आहात, भारतीय शेतकऱ्यांसाठी एक सहाय्यक AI, विशेषतः महाराष्ट्र राज्यासाठी.
तुमची भूमिका शेतकऱ्यांना मदत करणे आहे:
- हवामान माहिती आणि अंदाज
- हंगाम आणि मातीवर आधारित पीक शिफारसी
- बाजारभाव (मंडी/APMC भाव) माहिती
- सरकारी योजना आणि अनुदान (पीएम-किसान, फसल विमा, इ.)
- माती आरोग्य आणि शेती टिप्स
- रोग ओळख मार्गदर्शन

शेतकऱ्याचे सध्याचे स्थान: ${farmLocation}, महाराष्ट्र

मार्गदर्शक तत्त्वे:
- उत्तरे संक्षिप्त ठेवा (2-4 वाक्ये जोपर्यंत तपशीलवार माहिती मागितली जात नाही)
- साधी भाषा वापरा जी शेतकरी समजू शकतील
- विशिष्ट योजना, भारतीय रुपयांमध्ये (₹) किंमती नमूद करा
- सहाय्यक आणि सहकार्य करणारे व्हा
- वैशिष्ट्यांबद्दल विचारल्यास, SmartAgro अॅपच्या संबंधित विभागाकडे मार्गदर्शन करा
- हवामानासाठी, सेटिंग्जमधील त्यांच्या शेत स्थानावर आधारित असल्याचे सांगा
- बाजारभावासाठी, मार्केट अॅडव्हायझर विभाग पहा

मराठीत नैसर्गिक आणि उपयुक्त प्रतिसाद द्या.`
  };
  
  return prompts[lang];
};

export async function getGeminiResponse(
  userMessage: string,
  lang: "en" | "hi" | "mr",
  farmLocation: string,
  conversationHistory: { role: "user" | "model"; text: string }[] = []
): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    const noKeyMessages = {
      en: "Please configure your Gemini API key in Settings to use the AI assistant. Get a free key from Google AI Studio (aistudio.google.com).",
      hi: "AI असिस्टेंट उपयोग करने के लिए कृपया सेटिंग्स में अपनी Gemini API key कॉन्फ़िगर करें। Google AI Studio (aistudio.google.com) से मुफ्त key प्राप्त करें।",
      mr: "AI असिस्टंट वापरण्यासाठी कृपया सेटिंग्जमध्ये तुमची Gemini API key कॉन्फिगर करा. Google AI Studio (aistudio.google.com) वरून मोफत key मिळवा."
    };
    return noKeyMessages[lang];
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const systemPrompt = getSystemPrompt(lang, farmLocation);
    
    // Build context from history
    const historyContext = conversationHistory.slice(-4).map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
    ).join('\n');
    
    const fullPrompt = `${systemPrompt}\n\n${historyContext ? `Previous conversation:\n${historyContext}\n\n` : ''}User: ${userMessage}`;
    
    console.log("Calling Gemini API...");
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    console.log("Gemini response received:", text.substring(0, 100));
    return text;
  } catch (error: any) {
    console.error("Gemini API error:", error);
    console.error("Error message:", error?.message);
    console.error("Error status:", error?.status);
    
    // More specific error messages
    if (error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('invalid')) {
      const invalidKeyMessages = {
        en: "The API key is invalid. Please check your Gemini API key in Settings.",
        hi: "API key अमान्य है। कृपया सेटिंग्स में अपनी Gemini API key जाँचें।",
        mr: "API key अवैध आहे. कृपया सेटिंग्जमध्ये तुमची Gemini API key तपासा."
      };
      return invalidKeyMessages[lang];
    }
    
    if (error?.message?.includes('quota') || error?.message?.includes('rate')) {
      const quotaMessages = {
        en: "API quota exceeded. Please wait a moment and try again.",
        hi: "API कोटा समाप्त हो गया। कृपया कुछ देर प्रतीक्षा करें और पुनः प्रयास करें।",
        mr: "API कोटा संपला. कृपया थोडा वेळ थांबा आणि पुन्हा प्रयत्न करा."
      };
      return quotaMessages[lang];
    }
    
    // Return fallback message based on language
    const fallbackMessages = {
      en: `Connection error: ${error?.message || 'Unknown error'}. Please try again.`,
      hi: `कनेक्शन त्रुटि: ${error?.message || 'अज्ञात त्रुटि'}। कृपया पुनः प्रयास करें।`,
      mr: `कनेक्शन त्रुटी: ${error?.message || 'अज्ञात त्रुटी'}. कृपया पुन्हा प्रयत्न करा.`
    };
    
    return fallbackMessages[lang];
  }
}

// Check if API key is configured
export function isGeminiConfigured(): boolean {
  return getApiKey().length > 0;
}

// Save API key to localStorage
export function setGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gemini_api_key', key.trim());
  }
}

// Get current API key (masked for display)
export function getGeminiApiKeyMasked(): string {
  const key = getApiKey();
  if (!key) return '';
  return key.slice(0, 8) + '...' + key.slice(-4);
}
