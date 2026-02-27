import { useState, useCallback } from "react";

// Crop prediction API endpoint - Flask backend
const PREDICTION_API_URL = "http://localhost:5000/api/predict";

export interface CropPredictionInput {
  N: number;        // Nitrogen content
  P: number;        // Phosphorus content
  K: number;        // Potassium content
  pH: number;       // Soil pH level
  rainfall: number; // Expected rainfall in mm
  temperature: number; // Temperature in Celsius
  Area_in_hectares: number; // Farm area
  State_Name: string;
  Crop_Type: string;
  Crop: string;
}

export interface CropPredictionResult {
  success: boolean;
  production: number;      // Total production in tons
  yield_per_hectare: number;
  unit: string;
  area: number;
  crop: string;
  error?: string;
}

interface UseCropPredictionReturn {
  predict: (input: CropPredictionInput) => Promise<void>;
  result: CropPredictionResult | null;
  loading: boolean;
  error: string | null;
  clearResult: () => void;
}

// Available states for dropdown
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

// Crop types for dropdown
export const CROP_TYPES = [
  { value: "Kharif", label: { en: "Kharif (Monsoon)", hi: "खरीफ (मानसून)", mr: "खरीप (पावसाळा)" } },
  { value: "Rabi", label: { en: "Rabi (Winter)", hi: "रबी (शीतकालीन)", mr: "रब्बी (हिवाळा)" } },
  { value: "Zaid", label: { en: "Zaid (Summer)", hi: "जायद (ग्रीष्मकालीन)", mr: "झैद (उन्हाळा)" } },
  { value: "Whole Year", label: { en: "Whole Year", hi: "पूरे साल", mr: "संपूर्ण वर्ष" } }
];

// Common crops for dropdown
export const CROPS = [
  // Kharif crops
  { value: "Rice", label: { en: "Rice", hi: "चावल", mr: "तांदूळ" }, type: "Kharif" },
  { value: "Maize", label: { en: "Maize/Corn", hi: "मक्का", mr: "मका" }, type: "Kharif" },
  { value: "Soyabean", label: { en: "Soybean", hi: "सोयाबीन", mr: "सोयाबीन" }, type: "Kharif" },
  { value: "Cotton(lint)", label: { en: "Cotton", hi: "कपास", mr: "कापूस" }, type: "Kharif" },
  { value: "Groundnut", label: { en: "Groundnut", hi: "मूंगफली", mr: "भुईमूग" }, type: "Kharif" },
  { value: "Arhar/Tur", label: { en: "Pigeon Pea", hi: "अरहर/तूर", mr: "तूर" }, type: "Kharif" },
  { value: "Urad", label: { en: "Black Gram", hi: "उड़द", mr: "उडीद" }, type: "Kharif" },
  { value: "Moong(Green Gram)", label: { en: "Green Gram", hi: "मूंग", mr: "मूग" }, type: "Kharif" },
  { value: "Sugarcane", label: { en: "Sugarcane", hi: "गन्ना", mr: "ऊस" }, type: "Kharif" },
  // Rabi crops
  { value: "Wheat", label: { en: "Wheat", hi: "गेहूं", mr: "गहू" }, type: "Rabi" },
  { value: "Gram", label: { en: "Chickpea/Gram", hi: "चना", mr: "हरभरा" }, type: "Rabi" },
  { value: "Masoor", label: { en: "Lentil", hi: "मसूर", mr: "मसूर" }, type: "Rabi" },
  { value: "Rapeseed &Mustard", label: { en: "Mustard", hi: "सरसों", mr: "मोहरी" }, type: "Rabi" },
  { value: "Sunflower", label: { en: "Sunflower", hi: "सूरजमुखी", mr: "सूर्यफूल" }, type: "Rabi" },
  { value: "Barley", label: { en: "Barley", hi: "जौ", mr: "जव" }, type: "Rabi" },
  // Vegetables & Others
  { value: "Potato", label: { en: "Potato", hi: "आलू", mr: "बटाटा" }, type: "Rabi" },
  { value: "Onion", label: { en: "Onion", hi: "प्याज", mr: "कांदा" }, type: "Whole Year" },
  { value: "Tomato", label: { en: "Tomato", hi: "टमाटर", mr: "टोमॅटो" }, type: "Whole Year" }
];

export const useCropPrediction = (): UseCropPredictionReturn => {
  const [result, setResult] = useState<CropPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (input: CropPredictionInput) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(PREDICTION_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Prediction failed");
      }

      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to connect to prediction service";
      setError(errorMessage);
      setResult({
        success: false,
        production: 0,
        yield_per_hectare: 0,
        unit: "tons",
        area: input.Area_in_hectares,
        crop: input.Crop,
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    predict,
    result,
    loading,
    error,
    clearResult,
  };
};

export default useCropPrediction;
