import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_DISEASE_API_URL || 'http://localhost:8000';

export interface DiseaseTranslation {
  en: string;
  hi: string;
  mr: string;
}

export interface DiseaseResult {
  success: boolean;
  prediction: {
    class: string;
    confidence: number;
    name: DiseaseTranslation;
    risk: 'low' | 'medium' | 'high';
    weatherInfluence: DiseaseTranslation;
    treatment: DiseaseTranslation[];
  };
  top_predictions: Array<{
    class: string;
    confidence: number;
  }>;
  safety: DiseaseTranslation;
}

export interface UseDiseaseDetectionReturn {
  detectDisease: (file: File) => Promise<DiseaseResult | null>;
  isLoading: boolean;
  error: string | null;
  result: DiseaseResult | null;
  clearResult: () => void;
}

export const useDiseaseDetection = (): UseDiseaseDetectionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseResult | null>(null);

  const detectDisease = async (file: File): Promise<DiseaseResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: DiseaseResult = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to detect disease';
      setError(errorMessage);
      console.error('Disease detection error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return {
    detectDisease,
    isLoading,
    error,
    result,
    clearResult,
  };
};

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'healthy' && data.model_loaded;
  } catch {
    return false;
  }
};
