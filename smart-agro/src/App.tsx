import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { FarmLocationProvider } from "@/contexts/FarmLocationContext";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import SoilAnalysis from "./pages/SoilAnalysis";
import CropPlanner from "./pages/CropPlanner";
import DiseaseDetection from "./pages/DiseaseDetection";
import YieldForecast from "./pages/YieldForecast";
import MarketAdvisor from "./pages/MarketAdvisor";
import GovSchemes from "./pages/GovSchemes";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Weather from "./pages/Weather";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <FarmLocationProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/soil" element={<SoilAnalysis />} />
              <Route path="/crop" element={<CropPlanner />} />
              <Route path="/disease" element={<DiseaseDetection />} />
              <Route path="/yield" element={<YieldForecast />} />
              <Route path="/market" element={<MarketAdvisor />} />
              <Route path="/schemes" element={<GovSchemes />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
        </TooltipProvider>
      </FarmLocationProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
