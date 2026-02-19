import { useState, useEffect, useCallback } from "react";

// Open-Meteo API - Free, no API key required
const WEATHER_API_BASE = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API_BASE = "https://geocoding-api.open-meteo.com/v1/search";

// Default location: Nagpur, Maharashtra (center of India)
const DEFAULT_LOCATION = {
  latitude: 21.1458,
  longitude: 79.0882,
  name: "Nagpur",
  district: "Nagpur",
  state: "Maharashtra",
};

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    weatherDescription: string;
    feelsLike: number;
    precipitation: number;
    cloudCover: number;
    pressure: number;
    uvIndex: number;
    visibility: number;
    isDay: boolean;
  };
  daily: {
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
    weatherDescription: string;
    precipitationProbability: number;
    precipitationSum: number;
    sunrise: string;
    sunset: string;
    uvIndexMax: number;
    windSpeedMax: number;
  }[];
  location: {
    name: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  lastUpdated: Date;
}

interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  locationPermission: "granted" | "denied" | "prompt" | "unknown";
  refetch: () => void;
  setManualLocation: (lat: number, lon: number) => void;
}

// Weather code to description mapping (WMO codes)
const weatherCodeDescriptions: Record<number, { en: string; hi: string; mr: string; icon: string }> = {
  0: { en: "Clear sky", hi: "साफ आसमान", mr: "स्वच्छ आकाश", icon: "☀️" },
  1: { en: "Mainly clear", hi: "मुख्यतः साफ", mr: "मुख्यतः स्वच्छ", icon: "🌤️" },
  2: { en: "Partly cloudy", hi: "आंशिक बादल", mr: "अंशतः ढगाळ", icon: "⛅" },
  3: { en: "Overcast", hi: "बादल छाए", mr: "ढगाळ", icon: "☁️" },
  45: { en: "Fog", hi: "कोहरा", mr: "धुके", icon: "🌫️" },
  48: { en: "Depositing rime fog", hi: "जमा हुआ कोहरा", mr: "दव धुके", icon: "🌫️" },
  51: { en: "Light drizzle", hi: "हल्की बूंदाबांदी", mr: "हलकी रिमझिम", icon: "🌦️" },
  53: { en: "Moderate drizzle", hi: "मध्यम बूंदाबांदी", mr: "मध्यम रिमझिम", icon: "🌦️" },
  55: { en: "Dense drizzle", hi: "घनी बूंदाबांदी", mr: "दाट रिमझिम", icon: "🌧️" },
  56: { en: "Freezing drizzle", hi: "जमाने वाली बूंदाबांदी", mr: "गोठवणारी रिमझिम", icon: "🌧️" },
  57: { en: "Dense freezing drizzle", hi: "घनी जमाने वाली बूंदाबांदी", mr: "दाट गोठवणारी रिमझिम", icon: "🌧️" },
  61: { en: "Slight rain", hi: "हल्की बारिश", mr: "हलका पाऊस", icon: "🌧️" },
  63: { en: "Moderate rain", hi: "मध्यम बारिश", mr: "मध्यम पाऊस", icon: "🌧️" },
  65: { en: "Heavy rain", hi: "भारी बारिश", mr: "जोरदार पाऊस", icon: "🌧️" },
  66: { en: "Freezing rain", hi: "जमाने वाली बारिश", mr: "गोठवणारा पाऊस", icon: "🌧️" },
  67: { en: "Heavy freezing rain", hi: "भारी जमाने वाली बारिश", mr: "जोरदार गोठवणारा पाऊस", icon: "🌧️" },
  71: { en: "Slight snow", hi: "हल्की बर्फबारी", mr: "हलकी हिमवृष्टी", icon: "🌨️" },
  73: { en: "Moderate snow", hi: "मध्यम बर्फबारी", mr: "मध्यम हिमवृष्टी", icon: "🌨️" },
  75: { en: "Heavy snow", hi: "भारी बर्फबारी", mr: "जोरदार हिमवृष्टी", icon: "❄️" },
  77: { en: "Snow grains", hi: "बर्फ के कण", mr: "हिमकण", icon: "🌨️" },
  80: { en: "Slight rain showers", hi: "हल्की बौछार", mr: "हलक्या सरी", icon: "🌦️" },
  81: { en: "Moderate rain showers", hi: "मध्यम बौछार", mr: "मध्यम सरी", icon: "🌧️" },
  82: { en: "Violent rain showers", hi: "तेज बौछार", mr: "जोरदार सरी", icon: "⛈️" },
  85: { en: "Slight snow showers", hi: "हल्की हिमपात", mr: "हलकी हिमवृष्टी", icon: "🌨️" },
  86: { en: "Heavy snow showers", hi: "भारी हिमपात", mr: "जोरदार हिमवृष्टी", icon: "❄️" },
  95: { en: "Thunderstorm", hi: "गरज के साथ तूफान", mr: "वादळी वादळ", icon: "⛈️" },
  96: { en: "Thunderstorm with hail", hi: "ओलों के साथ तूफान", mr: "गारपिटीसह वादळ", icon: "⛈️" },
  99: { en: "Thunderstorm with heavy hail", hi: "भारी ओलों के साथ तूफान", mr: "जोरदार गारपिटीसह वादळ", icon: "⛈️" },
};

export function getWeatherDescription(code: number, lang: "en" | "hi" | "mr" = "en"): string {
  return weatherCodeDescriptions[code]?.[lang] || "Unknown";
}

export function getWeatherIcon(code: number): string {
  return weatherCodeDescriptions[code]?.icon || "🌡️";
}

// Reverse geocoding to get location name
async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; district: string; state: string }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      {
        headers: {
          "User-Agent": "SmartAgro/1.0",
        },
      }
    );
    
    if (!response.ok) throw new Error("Geocoding failed");
    
    const data = await response.json();
    const address = data.address || {};
    
    return {
      name: address.village || address.town || address.city || address.county || "Unknown",
      district: address.county || address.state_district || address.city || "Unknown",
      state: address.state || "Maharashtra",
    };
  } catch {
    return {
      name: "Your Location",
      district: "Unknown",
      state: "Maharashtra",
    };
  }
}

interface UseWeatherOptions {
  latitude?: number;
  longitude?: number;
  skipGeolocation?: boolean;
}

export function useWeather(options?: UseWeatherOptions): UseWeatherReturn {
  const { latitude, longitude, skipGeolocation = false } = options || {};
  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    latitude !== undefined && longitude !== undefined 
      ? { lat: latitude, lon: longitude } 
      : null
  );

  const fetchWeather = useCallback(async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch weather data from Open-Meteo
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "precipitation",
          "weather_code",
          "cloud_cover",
          "pressure_msl",
          "wind_speed_10m",
          "wind_direction_10m",
          "uv_index",
          "is_day",
        ].join(","),
        daily: [
          "weather_code",
          "temperature_2m_max",
          "temperature_2m_min",
          "precipitation_sum",
          "precipitation_probability_max",
          "sunrise",
          "sunset",
          "uv_index_max",
          "wind_speed_10m_max",
        ].join(","),
        timezone: "Asia/Kolkata",
        forecast_days: "7",
      });

      const response = await fetch(`${WEATHER_API_BASE}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      // Get location name
      const locationInfo = await reverseGeocode(latitude, longitude);

      // Parse current weather
      const current = {
        temperature: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        windDirection: data.current.wind_direction_10m,
        weatherCode: data.current.weather_code,
        weatherDescription: getWeatherDescription(data.current.weather_code),
        feelsLike: Math.round(data.current.apparent_temperature),
        precipitation: data.current.precipitation,
        cloudCover: data.current.cloud_cover,
        pressure: Math.round(data.current.pressure_msl),
        uvIndex: data.current.uv_index,
        visibility: 10, // Open-Meteo doesn't provide visibility in free tier
        isDay: data.current.is_day === 1,
      };

      // Parse daily forecast
      const daily = data.daily.time.map((date: string, i: number) => ({
        date,
        maxTemp: Math.round(data.daily.temperature_2m_max[i]),
        minTemp: Math.round(data.daily.temperature_2m_min[i]),
        weatherCode: data.daily.weather_code[i],
        weatherDescription: getWeatherDescription(data.daily.weather_code[i]),
        precipitationProbability: data.daily.precipitation_probability_max[i] || 0,
        precipitationSum: data.daily.precipitation_sum[i] || 0,
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
        uvIndexMax: data.daily.uv_index_max[i],
        windSpeedMax: Math.round(data.daily.wind_speed_10m_max[i]),
      }));

      setWeather({
        current,
        daily,
        location: {
          ...locationInfo,
          latitude,
          longitude,
        },
        lastUpdated: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  }, []);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLocationPermission("denied");
      // Use default location
      setCoords({ lat: DEFAULT_LOCATION.latitude, lon: DEFAULT_LOCATION.longitude });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermission("granted");
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setLocationPermission(err.code === 1 ? "denied" : "unknown");
        // Use default location on error
        setCoords({ lat: DEFAULT_LOCATION.latitude, lon: DEFAULT_LOCATION.longitude });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, []);

  const setManualLocation = useCallback((lat: number, lon: number) => {
    setCoords({ lat, lon });
  }, []);

  // Update coords when latitude/longitude props change
  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      setCoords({ lat: latitude, lon: longitude });
    }
  }, [latitude, longitude]);

  // Check permission status on mount and get location if not skipping geolocation
  useEffect(() => {
    // Skip geolocation if coordinates are provided or skipGeolocation is true
    const shouldSkipGeolocation = skipGeolocation || (latitude !== undefined && longitude !== undefined);
    
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationPermission(result.state as "granted" | "denied" | "prompt");
        result.onchange = () => {
          setLocationPermission(result.state as "granted" | "denied" | "prompt");
        };
      }).catch(() => {
        // Permissions API not fully supported
        if (!shouldSkipGeolocation) {
          getLocation();
        }
      });
    }
    
    if (!shouldSkipGeolocation) {
      getLocation();
    }
  }, [getLocation, skipGeolocation, latitude, longitude]);

  // Fetch weather when coordinates change
  useEffect(() => {
    if (coords) {
      fetchWeather(coords.lat, coords.lon);
    }
  }, [coords, fetchWeather]);

  const refetch = useCallback(() => {
    if (coords) {
      fetchWeather(coords.lat, coords.lon);
    } else {
      getLocation();
    }
  }, [coords, fetchWeather, getLocation]);

  return {
    weather,
    loading,
    error,
    locationPermission,
    refetch,
    setManualLocation,
  };
}

// Helper to format time from ISO string
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper to format date
export function formatWeatherDate(dateString: string, lang: "en" | "hi" | "mr" = "en"): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" };
  
  const locale = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN";
  return date.toLocaleDateString(locale, options);
}

// Get wind direction label
export function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
