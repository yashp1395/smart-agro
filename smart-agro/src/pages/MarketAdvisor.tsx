import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFarmLocation } from "@/contexts/FarmLocationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Info, RefreshCw, Store, MapPin, Search, ExternalLink, Loader2, AlertCircle, IndianRupee } from "lucide-react";
import { marketPredictions, marketPriceTrend, cropList } from "@/data/mockData";
import { Language } from "@/i18n/translations";
import { useMandiPrices, formatPrice, formatMandiDate, maharashtraDistricts, DataSource } from "@/hooks/useMandiPrices";

const MarketAdvisor: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Language;
  const { location } = useFarmLocation();
  
  // State for prediction section
  const [selectedCrop, setSelectedCrop] = useState("Soybean");
  
  // State for real-time mandi prices - initialized from user's location
  const [selectedDistrict, setSelectedDistrict] = useState<string>(location.district || "all");
  const [selectedCommodity, setSelectedCommodity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Update district when location changes
  useEffect(() => {
    if (location.district && maharashtraDistricts.includes(location.district)) {
      setSelectedDistrict(location.district);
    }
  }, [location.district]);

  // Fetch mandi data from Agmarknet
  const { data: mandiData, loading, error, total, refetch, commodities, usingFallback, dataSource } = useMandiPrices({
    state: "Maharashtra",
    district: selectedDistrict !== "all" ? selectedDistrict : undefined,
    commodity: selectedCommodity !== "all" ? selectedCommodity : undefined,
    limit: 200,
    dataSource: "agmarknet",
  });

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return mandiData;
    const query = searchQuery.toLowerCase();
    return mandiData.filter(
      (item) =>
        item.market.toLowerCase().includes(query) ||
        item.commodity.toLowerCase().includes(query) ||
        item.district.toLowerCase().includes(query) ||
        item.variety.toLowerCase().includes(query)
    );
  }, [mandiData, searchQuery]);

  // Group data by district for summary
  const districtSummary = useMemo(() => {
    const summary: Record<string, { count: number; commodities: Set<string> }> = {};
    mandiData.forEach((item) => {
      if (!summary[item.district]) {
        summary[item.district] = { count: 0, commodities: new Set() };
      }
      summary[item.district].count++;
      summary[item.district].commodities.add(item.commodity);
    });
    return Object.entries(summary)
      .map(([district, data]) => ({
        district,
        count: data.count,
        commodityCount: data.commodities.size,
      }))
      .sort((a, b) => b.count - a.count);
  }, [mandiData]);

  const getName = (item: { name: string; nameHi: string; nameMr: string }) =>
    lang === "hi" ? item.nameHi : lang === "mr" ? item.nameMr : item.name;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-poppins font-bold">{t("market.title")}</h1>
        <div className="flex items-center gap-3">
          {usingFallback && (
            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
              <AlertCircle className="h-3 w-3 mr-1" />
              Offline Data
            </Badge>
          )}
          <span className="text-xs text-muted-foreground hidden sm:block">
            {dataSource}
          </span>
          <a
            href="https://agmarknet.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
          >
            Agmarknet <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="bg-card/80 backdrop-blur-sm border border-border/50 p-1 h-auto">
          <TabsTrigger value="realtime" className="text-sm py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Store className="h-4 w-4 mr-1.5" />
            {t("market.realtime_prices")}
          </TabsTrigger>
          <TabsTrigger value="predictions" className="text-sm py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="h-4 w-4 mr-1.5" />
            {t("market.price_predictions")}
          </TabsTrigger>
        </TabsList>

        {/* Real-time Mandi Prices Tab */}
        <TabsContent value="realtime" className="mt-5 space-y-4">
          {/* Filters */}
          <Card className="bg-card/95">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-1.5 block">{t("market.district")}</label>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={t("market.all_districts")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("market.all_districts")}</SelectItem>
                      {maharashtraDistricts.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-1.5 block">{t("market.commodity")}</label>
                  <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={t("market.all_commodities")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("market.all_commodities")}</SelectItem>
                      {commodities.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[250px]">
                  <label className="text-sm font-medium mb-1.5 block">{t("market.search")}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("market.search_placeholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                  disabled={loading}
                  className="h-10 px-4"
                >
                  <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                  {t("market.refresh")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-12 gap-4">
            {/* District Summary Sidebar */}
            <Card className="col-span-3 bg-card/95 max-h-[600px] overflow-hidden flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {t("market.district_summary")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {districtSummary.map(({ district, count, commodityCount }) => (
                      <button
                        key={district}
                        onClick={() => setSelectedDistrict(district)}
                        className={`w-full text-left p-2.5 rounded-lg transition-colors text-sm ${
                          selectedDistrict === district
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="font-medium">{district}</div>
                        <div className={`text-xs ${selectedDistrict === district ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {count} {t("market.records")} • {commodityCount} {t("market.items")}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Table */}
            <Card className="col-span-9 bg-card/95">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-success" />
                    {t("market.mandi_prices")}
                    {selectedDistrict !== "all" && (
                      <Badge variant="secondary" className="ml-2">{selectedDistrict}</Badge>
                    )}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {t("market.showing")} {filteredData.length} {t("market.of")} {total} {t("market.records")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">{t("market.loading")}</span>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-16 text-destructive">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p className="text-sm">{error}</p>
                    <Button variant="outline" size="sm" onClick={refetch} className="mt-4">
                      {t("market.try_again")}
                    </Button>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Store className="h-8 w-8 mb-2" />
                    <p className="text-sm">{t("market.no_data")}</p>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow>
                          <TableHead className="w-[120px]">{t("market.date")}</TableHead>
                          <TableHead>{t("market.market_name")}</TableHead>
                          <TableHead>{t("market.commodity")}</TableHead>
                          <TableHead>{t("market.variety")}</TableHead>
                          <TableHead className="text-right">{t("market.min_price")}</TableHead>
                          <TableHead className="text-right">{t("market.max_price")}</TableHead>
                          <TableHead className="text-right">{t("market.modal_price")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((item, idx) => (
                          <TableRow key={`${item.market}-${item.commodity}-${item.arrival_date}-${idx}`}>
                            <TableCell className="font-inter text-xs">{formatMandiDate(item.arrival_date)}</TableCell>
                            <TableCell>
                              <div className="font-medium text-sm">{item.market}</div>
                              <div className="text-xs text-muted-foreground">{item.district}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{item.commodity}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">{item.variety || "-"}</TableCell>
                            <TableCell className="text-right font-inter text-sm">{formatPrice(item.min_price)}</TableCell>
                            <TableCell className="text-right font-inter text-sm">{formatPrice(item.max_price)}</TableCell>
                            <TableCell className="text-right font-inter font-bold text-sm text-primary">
                              {formatPrice(item.modal_price)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Price Predictions Tab */}
        <TabsContent value="predictions" className="mt-5 space-y-4">
          {/* Crop Filter */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketAdvisor;
