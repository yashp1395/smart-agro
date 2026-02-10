import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import farmBg from "@/assets/farm-bg.jpg";
import bgSoil from "@/assets/bg-soil.jpg";
import bgCrop from "@/assets/bg-crop.jpg";
import bgDisease from "@/assets/bg-disease.jpg";
import bgYield from "@/assets/bg-yield.jpg";
import bgMarket from "@/assets/bg-market.jpg";
import bgSchemes from "@/assets/bg-schemes.jpg";

const routeBackgrounds: Record<string, string> = {
  "/": farmBg,
  "/soil": bgSoil,
  "/crop": bgCrop,
  "/disease": bgDisease,
  "/yield": bgYield,
  "/market": bgMarket,
  "/schemes": bgSchemes,
  "/reports": farmBg,
  "/settings": farmBg,
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const bg = routeBackgrounds[location.pathname] || farmBg;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-background relative">
          <div
            className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
              opacity: 0.06,
              filter: "blur(3px)",
            }}
          />
          <div
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              background: "linear-gradient(135deg, hsl(120 20% 97% / 0.7), hsl(120 15% 95% / 0.5))",
            }}
          />
          <div className="relative z-10 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
