import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFarmLocation } from "@/contexts/FarmLocationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText, FlaskConical, Wheat, TrendingUp, Store, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

const reportItems = [
  { titleKey: "reports.soil", icon: FlaskConical, color: "text-warning", date: "2026-02-08", pages: 4, type: "soil" },
  { titleKey: "reports.crop", icon: Wheat, color: "text-primary", date: "2026-02-07", pages: 6, type: "crop" },
  { titleKey: "reports.yield", icon: TrendingUp, color: "text-info", date: "2026-02-05", pages: 3, type: "yield" },
  { titleKey: "reports.market", icon: Store, color: "text-success", date: "2026-02-04", pages: 5, type: "market" },
];

const Reports: React.FC = () => {
  const { language, t } = useLanguage();
  const { location } = useFarmLocation();
  const [generating, setGenerating] = useState<string | null>(null);

  const generatePDF = async (reportType: string, reportTitle: string) => {
    setGenerating(reportType);
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Header
    doc.setFillColor(34, 139, 34); // Green
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Smart Agro AI", margin, 18);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Intelligent Agriculture Platform", margin, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, 28);

    yPos = 55;

    // Report Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(reportTitle, margin, yPos);
    yPos += 15;

    // Farmer Info
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Farmer: Ravi Patil`, margin, yPos);
    doc.text(`Location: ${location.district}, Maharashtra`, margin + 80, yPos);
    yPos += 20;

    // Horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // Report Content based on type
    doc.setTextColor(0, 0, 0);
    
    if (reportType === "soil") {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Soil Health Analysis Report", margin, yPos);
      yPos += 15;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      const soilData = [
        ["Parameter", "Value", "Optimal Range", "Status"],
        ["Nitrogen (N)", "42 kg/ha", "40-60 kg/ha", "Good"],
        ["Phosphorus (P)", "18 kg/ha", "20-30 kg/ha", "Low"],
        ["Potassium (K)", "156 kg/ha", "150-200 kg/ha", "Good"],
        ["pH Level", "6.8", "6.0-7.5", "Optimal"],
        ["Organic Carbon", "0.58%", "0.5-0.75%", "Good"],
        ["Electrical Conductivity", "0.32 dS/m", "<1.0 dS/m", "Normal"],
      ];

      soilData.forEach((row, index) => {
        if (index === 0) {
          doc.setFont("helvetica", "bold");
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
        } else {
          doc.setFont("helvetica", "normal");
        }
        doc.text(row[0], margin + 2, yPos);
        doc.text(row[1], margin + 50, yPos);
        doc.text(row[2], margin + 90, yPos);
        doc.text(row[3], margin + 140, yPos);
        yPos += 12;
      });

      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Recommendations:", margin, yPos);
      yPos += 10;
      doc.setFont("helvetica", "normal");
      doc.text("1. Apply DAP fertilizer to improve Phosphorus levels", margin + 5, yPos);
      yPos += 8;
      doc.text("2. Continue current organic matter application practices", margin + 5, yPos);
      yPos += 8;
      doc.text("3. Soil is suitable for Wheat, Soybean, and Cotton crops", margin + 5, yPos);

    } else if (reportType === "crop") {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Crop Planning Report - Rabi Season 2026", margin, yPos);
      yPos += 15;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      const cropData = [
        ["Crop", "Area (Acres)", "Expected Yield", "Market Price", "Est. Revenue"],
        ["Wheat", "3.0", "18 q/acre", "Rs 2,275/q", "Rs 1,22,850"],
        ["Gram (Chana)", "1.5", "12 q/acre", "Rs 5,500/q", "Rs 99,000"],
        ["Onion", "1.0", "150 q/acre", "Rs 1,800/q", "Rs 2,70,000"],
      ];

      cropData.forEach((row, index) => {
        if (index === 0) {
          doc.setFont("helvetica", "bold");
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
        } else {
          doc.setFont("helvetica", "normal");
        }
        doc.text(row[0], margin + 2, yPos);
        doc.text(row[1], margin + 35, yPos);
        doc.text(row[2], margin + 70, yPos);
        doc.text(row[3], margin + 105, yPos);
        doc.text(row[4], margin + 140, yPos);
        yPos += 12;
      });

      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Total Estimated Revenue: Rs 4,91,850", margin, yPos);

    } else if (reportType === "yield") {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Yield Forecast Report", margin, yPos);
      yPos += 15;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Based on current weather patterns and soil conditions:", margin, yPos);
      yPos += 15;

      const yieldData = [
        ["Month", "Expected Yield (q/acre)", "Weather Risk", "Confidence"],
        ["February", "14.2", "Low", "85%"],
        ["March", "16.5", "Medium", "78%"],
        ["April", "18.0", "Medium", "72%"],
        ["May (Harvest)", "19.2", "Low", "80%"],
      ];

      yieldData.forEach((row, index) => {
        if (index === 0) {
          doc.setFont("helvetica", "bold");
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
        } else {
          doc.setFont("helvetica", "normal");
        }
        doc.text(row[0], margin + 2, yPos);
        doc.text(row[1], margin + 45, yPos);
        doc.text(row[2], margin + 100, yPos);
        doc.text(row[3], margin + 140, yPos);
        yPos += 12;
      });

      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Final Yield Prediction: 19.2 quintal/acre (Good Weather Scenario)", margin, yPos);

    } else if (reportType === "market") {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Market Price Analysis Report", margin, yPos);
      yPos += 15;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Nearest APMC: ${location.district} Mandi`, margin, yPos);
      yPos += 15;

      const marketData = [
        ["Commodity", "Min Price", "Max Price", "Modal Price", "Trend"],
        ["Wheat", "Rs 2,150", "Rs 2,400", "Rs 2,275", "Stable"],
        ["Soybean", "Rs 4,800", "Rs 5,200", "Rs 5,000", "Up 3%"],
        ["Cotton", "Rs 6,500", "Rs 7,200", "Rs 6,850", "Down 2%"],
        ["Onion", "Rs 1,500", "Rs 2,100", "Rs 1,800", "Up 8%"],
        ["Gram", "Rs 5,200", "Rs 5,800", "Rs 5,500", "Stable"],
      ];

      marketData.forEach((row, index) => {
        if (index === 0) {
          doc.setFont("helvetica", "bold");
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
        } else {
          doc.setFont("helvetica", "normal");
        }
        doc.text(row[0], margin + 2, yPos);
        doc.text(row[1], margin + 35, yPos);
        doc.text(row[2], margin + 65, yPos);
        doc.text(row[3], margin + 95, yPos);
        doc.text(row[4], margin + 135, yPos);
        yPos += 12;
      });

      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Best Selling Time: Onion prices expected to peak in March", margin, yPos);
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text("Generated by Smart Agro AI - Intelligent Agriculture Platform", margin, pageHeight - 15);
    doc.text("For support: smartagro@example.com", pageWidth - margin - 60, pageHeight - 15);

    // Save the PDF
    const fileName = `SmartAgro_${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    setGenerating(null);
    toast({ 
      title: language === "hi" ? "रिपोर्ट डाउनलोड हो गई!" : 
             language === "mr" ? "अहवाल डाउनलोड झाला!" : 
             "Report Downloaded!",
      description: fileName
    });
  };

  const previewPDF = (reportType: string, reportTitle: string) => {
    toast({ 
      title: language === "hi" ? "पूर्वावलोकन" : language === "mr" ? "पूर्वावलोकन" : "Preview",
      description: language === "hi" ? "डाउनलोड बटन पर क्लिक करके PDF प्राप्त करें" :
                   language === "mr" ? "डाउनलोड बटणावर क्लिक करून PDF मिळवा" :
                   "Click Download to get the PDF file"
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-poppins font-bold">{t("reports.title")}</h1>

      <div className="grid grid-cols-2 gap-6">
        {reportItems.map((report) => (
          <Card key={report.titleKey} className="bg-card/95 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <report.icon className={`h-5 w-5 ${report.color}`} />
                {t(report.titleKey)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {report.pages} pages</span>
                  <span>{t("reports.generated")} {report.date}</span>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-6 mb-4 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">PDF {t("reports.preview")}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-11" onClick={() => previewPDF(report.type, t(report.titleKey))}>
                  <Eye className="h-4 w-4 mr-2" />{t("reports.preview")}
                </Button>
                <Button 
                  className="flex-1 h-11 bg-primary hover:bg-primary/90" 
                  onClick={() => generatePDF(report.type, t(report.titleKey))}
                  disabled={generating === report.type}
                >
                  {generating === report.type ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {generating === report.type ? 
                    (language === "hi" ? "बना रहा है..." : language === "mr" ? "तयार होत आहे..." : "Generating...") : 
                    t("reports.download")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
