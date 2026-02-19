import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFarmLocation } from "@/contexts/FarmLocationContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, MicOff, MessageCircle, X, Send, Volume2, VolumeX, 
  Bot, User, Loader2, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getGeminiResponse } from "@/hooks/useGemini";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ConversationMessage {
  role: "user" | "model";
  text: string;
}

const VoiceBot: React.FC = () => {
  const { language } = useLanguage();
  const { location } = useFarmLocation();
  const lang = language as "en" | "hi" | "mr";
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleUserMessageRef = useRef<(text: string) => void>(() => {});

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI() as SpeechRecognition;
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        // Set language based on app language
        const langMap: Record<string, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };
        recognitionRef.current.lang = langMap[lang] || "en-IN";

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          // Use ref to always get latest handler
          handleUserMessageRef.current(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (e) => {
          console.log("Speech recognition error:", e);
          setIsListening(false);
        };
      }
      
      synthRef.current = window.speechSynthesis;
      
      // Load voices (they may be loaded async)
      const loadVoices = () => {
        synthRef.current?.getVoices();
      };
      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
  }, []); // Only initialize once

  // Update recognition language when app language changes
  useEffect(() => {
    if (recognitionRef.current) {
      const langMap: Record<string, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };
      recognitionRef.current.lang = langMap[lang] || "en-IN";
    }
  }, [lang]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: {
          en: `Hello! 👋 I'm your AI-powered SmartAgro assistant (Gemini). Ask me anything about:\n• Weather and farming tips\n• Crop recommendations\n• Market prices (mandi bhav)\n• Government schemes\n\nSpeak or type in English, Hindi, or Marathi!`,
          hi: `नमस्ते! 👋 मैं आपका AI-संचालित स्मार्ट एग्रो सहायक (Gemini) हूं। मुझसे कुछ भी पूछें:\n• मौसम और खेती की सलाह\n• फसल सिफारिशें\n• बाजार भाव (मंडी भाव)\n• सरकारी योजनाएं\n\nहिंदी, मराठी या अंग्रेजी में बोलें या टाइप करें!`,
          mr: `नमस्कार! 👋 मी तुमचा AI-संचालित स्मार्ट एग्रो सहाय्यक (Gemini) आहे. मला काहीही विचारा:\n• हवामान आणि शेती टिप्स\n• पीक शिफारसी\n• बाजारभाव (मंडी भाव)\n• सरकारी योजना\n\nमराठी, हिंदी किंवा इंग्रजीत बोला किंवा टाइप करा!`,
        }[lang],
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setConversationHistory([]);
    }
  }, [isOpen, lang, messages.length]);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };
    const targetLang = langMap[lang] || "en-IN";
    utterance.lang = targetLang;
    
    // Try to find a voice that matches the language
    const voices = synthRef.current.getVoices();
    const matchingVoice = voices.find(v => 
      v.lang === targetLang || 
      v.lang.startsWith(lang) ||
      (lang === "hi" && v.lang.includes("hi")) ||
      (lang === "mr" && v.lang.includes("mr"))
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  }, [lang, voiceEnabled]);

  const handleUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);

    // Update conversation history
    const newHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: "user" as const, text: text.trim() }
    ];

    try {
      // Get response from Gemini AI
      const response = await getGeminiResponse(text, lang, location.district, newHistory);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Update conversation history with bot response
      setConversationHistory([
        ...newHistory,
        { role: "model" as const, text: response }
      ]);
      
      // Speak the response
      speak(response);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = {
        en: "Sorry, I'm having trouble right now. Please try again.",
        hi: "क्षमा करें, मुझे अभी समस्या हो रही है। कृपया फिर से प्रयास करें।",
        mr: "माफ करा, मला आत्ता अडचण येत आहे. कृपया पुन्हा प्रयत्न करा."
      }[lang];
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [lang, location.district, speak, conversationHistory]);

  // Keep ref updated with latest handler for speech recognition callback
  useEffect(() => {
    handleUserMessageRef.current = handleUserMessage;
  }, [handleUserMessage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Speech recognition not supported
      const errorMsg = {
        en: "Voice recognition is not supported in your browser. Please type your question.",
        hi: "आपके ब्राउज़र में वॉइस रिकग्निशन समर्थित नहीं है। कृपया अपना प्रश्न टाइप करें।",
        mr: "तुमच्या ब्राउझरमध्ये व्हॉइस रेकग्निशन समर्थित नाही. कृपया तुमचा प्रश्न टाइप करा.",
      }[lang];
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: errorMsg,
        sender: "bot",
        timestamp: new Date(),
      }]);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        // Ensure language is set before starting
        const langMap: Record<string, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };
        recognitionRef.current.lang = langMap[lang] || "en-IN";
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.log("Speech recognition start error:", e);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUserMessage(inputText);
  };

  const toggleVoice = () => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
          "transition-all duration-300 hover:scale-110",
          isOpen && "rotate-0"
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[380px] h-[500px] shadow-2xl z-50 flex flex-col overflow-hidden border-primary/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-1.5">
                    SmartAgro AI
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-normal">Gemini</span>
                  </h3>
                  <p className="text-xs text-primary-foreground/70">
                    {isListening ? (
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 bg-red-400 rounded-full animate-pulse" />
                        {lang === "hi" ? "सुन रहा हूं..." : lang === "mr" ? "ऐकत आहे..." : "Listening..."}
                      </span>
                    ) : isSpeaking ? (
                      <span className="flex items-center gap-1">
                        <Volume2 className="h-3 w-3 animate-pulse" />
                        {lang === "hi" ? "बोल रहा हूं..." : lang === "mr" ? "बोलत आहे..." : "Speaking..."}
                      </span>
                    ) : isProcessing ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {lang === "hi" ? "सोच रहा हूं..." : lang === "mr" ? "विचार करत आहे..." : "Thinking..."}
                      </span>
                    ) : (
                      lang === "hi" ? "AI द्वारा संचालित" : lang === "mr" ? "AI द्वारे संचालित" : "Powered by AI"
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                onClick={toggleVoice}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2",
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.sender === "bot" && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === "user" && (
                    <div className="h-8 w-8 rounded-full bg-primary/80 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isProcessing && (
                <div className="flex gap-2 justify-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-card">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                className={cn(
                  "shrink-0 transition-all",
                  isListening && "animate-pulse"
                )}
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  lang === "hi" ? "अपना प्रश्न टाइप करें..." :
                  lang === "mr" ? "तुमचा प्रश्न टाइप करा..." :
                  "Type your question..."
                }
                className="flex-1"
                disabled={isListening}
              />
              <Button type="submit" size="icon" disabled={!inputText.trim() || isProcessing}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              {lang === "hi" ? "🎤 हिंदी में बोलें या टाइप करें" :
               lang === "mr" ? "🎤 मराठीत बोला किंवा टाइप करा" :
               "🎤 Speak in English or type your question"}
            </p>
          </div>
        </Card>
      )}
    </>
  );
};

export default VoiceBot;
