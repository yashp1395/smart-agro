import { useState, useEffect, useCallback } from "react";

// Data.gov.in API configuration
const API_BASE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
const API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"; // Free public API key

export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

// Fallback mock data for when API is rate-limited or unavailable
const generateMockData = (district: string): MandiRecord[] => {
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  
  const commodities = [
    { name: "Soyabean", variety: "Yellow", min: 4200, max: 4800, modal: 4500 },
    { name: "Cotton", variety: "DCH-32", min: 6500, max: 7200, modal: 6850 },
    { name: "Wheat", variety: "Lokwan", min: 2200, max: 2500, modal: 2350 },
    { name: "Onion", variety: "Red", min: 800, max: 1500, modal: 1100 },
    { name: "Tomato", variety: "Local", min: 1500, max: 2500, modal: 2000 },
    { name: "Tur (Arhar)", variety: "Red", min: 7500, max: 8500, modal: 8000 },
    { name: "Gram", variety: "Desi", min: 5200, max: 5800, modal: 5500 },
    { name: "Maize", variety: "Yellow", min: 1800, max: 2200, modal: 2000 },
    { name: "Jowar", variety: "White", min: 2800, max: 3200, modal: 3000 },
    { name: "Groundnut", variety: "Bold", min: 5500, max: 6200, modal: 5850 },
  ];
  
  const markets = [`${district} APMC`, `${district} Market Yard`, `${district} Krishi Bazaar`];
  
  return commodities.map((c, i) => ({
    state: "Maharashtra",
    district: district,
    market: markets[i % markets.length],
    commodity: c.name,
    variety: c.variety,
    arrival_date: dateStr,
    min_price: (c.min + Math.floor(Math.random() * 200 - 100)).toString(),
    max_price: (c.max + Math.floor(Math.random() * 200 - 100)).toString(),
    modal_price: (c.modal + Math.floor(Math.random() * 150 - 75)).toString(),
  }));
};

interface MandiAPIResponse {
  index_name: string;
  title: string;
  desc: string;
  org_type: string;
  org: string[];
  sector: string[];
  source: string;
  catalog_uuid: string;
  visualizable: string;
  active: string;
  created: number;
  updated: number;
  created_date: string;
  updated_date: string;
  target_bucket: {
    index: string;
    type: string;
    field: string;
  };
  field: {
    id: string;
    name: string;
    type: string;
  }[];
  message: string;
  version: string;
  status: string;
  total: number;
  count: number;
  limit: string;
  offset: string;
  records: MandiRecord[];
  error?: string;
}

interface UseMandiPricesOptions {
  state?: string;
  district?: string;
  commodity?: string;
  limit?: number;
}

interface UseMandiPricesReturn {
  data: MandiRecord[];
  loading: boolean;
  error: string | null;
  total: number;
  refetch: () => void;
  districts: string[];
  commodities: string[];
  usingFallback: boolean;
}

// Maharashtra districts for filtering
export const maharashtraDistricts = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana",
  "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna",
  "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded", "Nandurbar", "Nashik",
  "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli",
  "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
];

// Common commodities
export const commonCommodities = [
  "Wheat", "Rice", "Soyabean", "Cotton", "Onion", "Tomato", "Potato", "Jowar",
  "Bajra", "Maize", "Gram", "Tur", "Urad", "Moong", "Groundnut", "Sugarcane",
  "Chilli", "Turmeric", "Ginger", "Garlic", "Banana", "Grapes", "Orange", "Pomegranate"
];

export function useMandiPrices(options: UseMandiPricesOptions = {}): UseMandiPricesReturn {
  const { state = "Maharashtra", district, commodity, limit = 100 } = options;
  
  const [data, setData] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [districts, setDistricts] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);

  const useFallbackData = useCallback((targetDistrict: string) => {
    const mockData = generateMockData(targetDistrict || "Nagpur");
    const filtered = commodity 
      ? mockData.filter(r => r.commodity.toLowerCase().includes(commodity.toLowerCase()))
      : mockData;
    
    setData(filtered);
    setTotal(filtered.length);
    setDistricts([targetDistrict || "Nagpur"]);
    setCommodities([...new Set(filtered.map(r => r.commodity))].sort());
    setUsingFallback(true);
  }, [commodity]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      // Build URL with filters
      const params = new URLSearchParams({
        "api-key": API_KEY,
        format: "json",
        limit: limit.toString(),
        "filters[state]": state,
      });

      if (district) {
        params.append("filters[district]", district);
      }

      if (commodity) {
        params.append("filters[commodity]", commodity);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.status === 429) {
        // Rate limited - use fallback data
        console.warn("API rate limited, using fallback data");
        useFallbackData(district || "Nagpur");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result: MandiAPIResponse = await response.json();

      if (result.error) {
        // API returned error (e.g., rate limit)
        console.warn("API error:", result.error);
        useFallbackData(district || "Nagpur");
        setLoading(false);
        return;
      }

      if (result.status === "ok" && result.records && result.records.length > 0) {
        setData(result.records);
        setTotal(result.total);

        // Extract unique districts and commodities from the data
        const uniqueDistricts = [...new Set(result.records.map((r) => r.district))].sort();
        const uniqueCommodities = [...new Set(result.records.map((r) => r.commodity))].sort();
        
        setDistricts(uniqueDistricts);
        setCommodities(uniqueCommodities);
      } else {
        // No data returned - use fallback
        useFallbackData(district || "Nagpur");
      }
    } catch (err) {
      console.warn("Mandi API fetch failed, using fallback:", err);
      useFallbackData(district || "Nagpur");
    } finally {
      setLoading(false);
    }
  }, [state, district, commodity, limit, useFallbackData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    total,
    refetch: fetchData,
    districts,
    commodities,
    usingFallback,
  };
}

// Helper function to format price
export function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return `₹${num.toLocaleString("en-IN")}`;
}

// Helper function to format date
export function formatMandiDate(dateStr: string): string {
  try {
    // Handle different date formats from the API
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try parsing DD/MM/YYYY format
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${day}/${month}/${year}`;
      }
      return dateStr;
    }
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
