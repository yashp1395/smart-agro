import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Info } from "lucide-react";
import { marketPredictions, marketPriceTrend, mandiList, cropList } from "@/data/mockData";
import { Language } from "@/i18n/translations";

const MarketAdvisor: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Language;
  const [selectedCrop, setSelectedCrop] = useState("Soybean");
  const [selectedMandi, setSelectedMandi] = useState("Nagpur");

  const getName = (item: { name: string; nameHi: string; nameMr: string }) =>
    lang === "hi" ? item.nameHi : lang === "mr" ? item.nameMr : item.name;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-poppins font-bold">{t("market.title")}</h1>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-52">
          <label className="text-sm font-medium mb-1 block">{t("market.crop_select")}</label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              {cropList.map((c) => <SelectItem key={c.name} value={c.name}>{getName(c)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-52">
          <label className="text-sm font-medium mb-1 block">{t("market.mandi_select")}</label>
          <Select value={selectedMandi} onValueChange={setSelectedMandi}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              {mandiList.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Price Prediction Table */}
        <Card className="col-span-7 bg-card/95">
          <CardHeader>
            <CardTitle className="text-lg">{t("market.predicted_price")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("market.date")}</TableHead>
                  <TableHead>{t("market.predicted_price")}</TableHead>
                  <TableHead>{t("market.confidence")}</TableHead>
                  <TableHead>{t("market.recommendation")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketPredictions.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell className="font-inter">{row.date}</TableCell>
                    <TableCell className="font-inter font-bold">₹{row.price}</TableCell>
                    <TableCell className="font-inter">{row.confidence}%</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        row.recommendation === "hold" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      }`}>
                        {t(`market.${row.recommendation}`)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Why + Chart */}
        <div className="col-span-5 space-y-6">
          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-info" />
                {t("market.why_advice")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {lang === "hi"
                  ? "सोयाबीन की कीमतें अगले 10 दिनों में बढ़ने की उम्मीद है क्योंकि मांग बढ़ रही है और आपूर्ति सीमित है। 20 फरवरी के आसपास ₹5180/क्विंटल पर बेचना सबसे अच्छा समय हो सकता है।"
                  : lang === "mr"
                  ? "सोयाबीनच्या किमती पुढील 10 दिवसांत वाढण्याची शक्यता आहे कारण मागणी वाढत आहे आणि पुरवठा मर्यादित आहे. 20 फेब्रुवारीला ₹5180/क्विंटलला विकणे सर्वोत्तम असू शकते."
                  : "Soybean prices are expected to rise over the next 10 days due to increasing demand and limited supply. Selling around Feb 20 at ₹5180/quintal may be the best opportunity. After that, prices may stabilize or slightly decline."}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/95">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t("market.price_trend")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={marketPriceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Line type="monotone" dataKey="price" name={t("market.per_quintal")} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarketAdvisor;
