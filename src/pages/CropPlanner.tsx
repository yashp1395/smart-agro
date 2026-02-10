import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, ArrowLeftRight, Check } from "lucide-react";
import { recommendedCrops, intercroppingPairs, fertilizerPlan } from "@/data/mockData";
import { Language } from "@/i18n/translations";
import { toast } from "@/hooks/use-toast";

const CropPlanner: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Language;

  const getName = (item: { name: string; nameHi: string; nameMr: string }) =>
    lang === "hi" ? item.nameHi : lang === "mr" ? item.nameMr : item.name;

  const getSeason = (item: { season: string; seasonHi: string; seasonMr: string }) =>
    lang === "hi" ? item.seasonHi : lang === "mr" ? item.seasonMr : item.season;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-poppins font-bold">{t("crop.title")}</h1>

      <Tabs defaultValue="recommended" className="space-y-4">
        <TabsList className="bg-muted/60 h-12 p-1">
          <TabsTrigger value="recommended" className="text-sm h-10 px-6">{t("crop.recommended")}</TabsTrigger>
          <TabsTrigger value="intercropping" className="text-sm h-10 px-6">{t("crop.intercropping")}</TabsTrigger>
          <TabsTrigger value="fertilizer" className="text-sm h-10 px-6">{t("crop.fertilizer")}</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended">
          <Card className="bg-card/95">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("crop.name")}</TableHead>
                    <TableHead>{t("crop.suitability")}</TableHead>
                    <TableHead>{t("crop.season")}</TableHead>
                    <TableHead>{t("crop.yield")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendedCrops.map((crop) => (
                    <TableRow key={crop.name} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <span className="text-xl mr-2">{crop.emoji}</span>
                        {getName(crop)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[150px]">
                          <Progress value={crop.suitability} className="h-2.5 flex-1" />
                          <span className="font-inter text-sm font-semibold w-10">{crop.suitability}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">{getSeason(crop)}</span>
                      </TableCell>
                      <TableCell className="font-inter text-sm">{crop.yield}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => toast({ title: `${getName(crop)} selected!` })} className="h-9 bg-primary hover:bg-primary/90">
                          <Check className="h-4 w-4 mr-1" />{t("crop.select")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intercropping">
          <div className="grid grid-cols-2 gap-6">
            {intercroppingPairs.map((pair, i) => (
              <Card key={i} className="bg-card/95 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center p-4 bg-primary/5 rounded-xl">
                      <p className="text-3xl mb-1">{pair.main.emoji}</p>
                      <p className="font-medium text-sm">{getName(pair.main)}</p>
                      <p className="text-xs text-muted-foreground">{t("crop.main")}</p>
                    </div>
                    <ArrowLeftRight className="h-6 w-6 text-primary" />
                    <div className="text-center p-4 bg-accent/10 rounded-xl">
                      <p className="text-3xl mb-1">{pair.companion.emoji}</p>
                      <p className="font-medium text-sm">{getName(pair.companion)}</p>
                      <p className="text-xs text-muted-foreground">{t("crop.companion")}</p>
                    </div>
                  </div>
                  <div className="bg-success/5 p-3 rounded-lg mb-4">
                    <p className="text-xs text-muted-foreground uppercase font-medium">{t("crop.benefit")}</p>
                    <p className="text-sm mt-1">{pair.benefit[lang]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-2">{t("crop.timeline")}</p>
                    <div className="flex gap-1">
                      {monthNames.map((m, idx) => (
                        <div key={m} className={`flex-1 h-6 rounded text-[10px] flex items-center justify-center font-medium ${
                          pair.months.includes(idx + 1) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {m.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fertilizer">
          <Card className="bg-card/95">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {fertilizerPlan.map((stage, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl border-l-4 border-primary">
                    <span className="text-3xl">{stage.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{stage.stage[lang]}</p>
                      <p className="text-sm text-muted-foreground">{stage.timing}</p>
                    </div>
                    <div className="text-center px-4">
                      <p className="font-inter font-bold text-primary">{stage.fertilizer}</p>
                      <p className="text-sm text-muted-foreground">{t("crop.fertilizer_type")}</p>
                    </div>
                    <div className="text-center px-4">
                      <p className="font-inter font-bold">{stage.dosage}</p>
                      <p className="text-sm text-muted-foreground">{t("crop.dosage")}</p>
                    </div>
                    {i < fertilizerPlan.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CropPlanner;
