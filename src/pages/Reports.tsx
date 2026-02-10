import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText, FlaskConical, Wheat, TrendingUp, Store } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const reportItems = [
  { titleKey: "reports.soil", icon: FlaskConical, color: "text-warning", date: "2026-02-08", pages: 4 },
  { titleKey: "reports.crop", icon: Wheat, color: "text-primary", date: "2026-02-07", pages: 6 },
  { titleKey: "reports.yield", icon: TrendingUp, color: "text-info", date: "2026-02-05", pages: 3 },
  { titleKey: "reports.market", icon: Store, color: "text-success", date: "2026-02-04", pages: 5 },
];

const Reports: React.FC = () => {
  const { t } = useLanguage();

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
                <Button variant="outline" className="flex-1 h-11" onClick={() => toast({ title: `${t(report.titleKey)} preview opened` })}>
                  <Eye className="h-4 w-4 mr-2" />{t("reports.preview")}
                </Button>
                <Button className="flex-1 h-11 bg-primary hover:bg-primary/90" onClick={() => toast({ title: `${t(report.titleKey)} downloaded!` })}>
                  <Download className="h-4 w-4 mr-2" />{t("reports.download")}
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
