import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// Maharashtra districts with their approximate coordinates
export const maharashtraLocations = [
  { district: "Ahmednagar", lat: 19.0948, lon: 74.7480, talukas: ["Ahmednagar", "Shrirampur", "Rahuri", "Sangamner", "Kopargaon", "Shevgaon", "Pathardi", "Jamkhed", "Karjat", "Parner", "Nagar", "Akole", "Nevasa", "Shrigonda"] },
  { district: "Akola", lat: 20.7059, lon: 77.0058, talukas: ["Akola", "Balapur", "Patur", "Murtijapur", "Barshitakli", "Akot", "Telhara"] },
  { district: "Amravati", lat: 20.9374, lon: 77.7796, talukas: ["Amravati", "Achalpur", "Chandur Bazar", "Morshi", "Warud", "Daryapur", "Anjangaon Surji", "Chandur Railway", "Dhamangaon Railway", "Nandgaon Khandeshwar", "Dharni", "Chikhaldara", "Bhatkuli", "Teosa"] },
  { district: "Aurangabad", lat: 19.8762, lon: 75.3433, talukas: ["Aurangabad", "Khuldabad", "Soygaon", "Sillod", "Kannad", "Phulambri", "Vaijapur", "Gangapur", "Paithan"] },
  { district: "Beed", lat: 18.9891, lon: 75.7601, talukas: ["Beed", "Ashti", "Patoda", "Shirur Kasar", "Georai", "Majalgaon", "Wadwani", "Kaij", "Dharur", "Parli", "Ambejogai"] },
  { district: "Bhandara", lat: 21.1669, lon: 79.6500, talukas: ["Bhandara", "Tumsar", "Pauni", "Mohadi", "Sakoli", "Lakhani", "Lakhandur"] },
  { district: "Buldhana", lat: 20.5293, lon: 76.1842, talukas: ["Buldhana", "Chikhli", "Deulgaon Raja", "Jalgaon Jamod", "Sangrampur", "Malkapur", "Motala", "Nandura", "Khamgaon", "Shegaon", "Mehkar", "Lonar", "Sindkhed Raja"] },
  { district: "Chandrapur", lat: 19.9615, lon: 79.2961, talukas: ["Chandrapur", "Bhadravati", "Warora", "Chimur", "Nagbhid", "Bramhapuri", "Sindewahi", "Mul", "Saoli", "Gondpimpri", "Pombhurna", "Rajura", "Korpana", "Jivati", "Ballarpur"] },
  { district: "Dhule", lat: 20.9042, lon: 74.7749, talukas: ["Dhule", "Sakri", "Sindkheda", "Shirpur"] },
  { district: "Gadchiroli", lat: 20.1052, lon: 80.0029, talukas: ["Gadchiroli", "Dhanora", "Chamorshi", "Mulchera", "Desaiganj", "Armori", "Kurkheda", "Korchi", "Aheri", "Etapalli", "Bhamragad", "Sironcha"] },
  { district: "Gondia", lat: 21.4624, lon: 80.1920, talukas: ["Gondia", "Goregaon", "Tirora", "Amgaon", "Arjuni Morgaon", "Deori", "Salekasa", "Sadak Arjuni"] },
  { district: "Hingoli", lat: 19.7173, lon: 77.1502, talukas: ["Hingoli", "Sengaon", "Kalamnuri", "Basmath", "Aundha Nagnath"] },
  { district: "Jalgaon", lat: 21.0077, lon: 75.5626, talukas: ["Jalgaon", "Jamner", "Erandol", "Dharangaon", "Bhusawal", "Raver", "Muktainagar", "Bodwad", "Yawal", "Amalner", "Parola", "Chopda", "Pachora", "Bhadgaon", "Chalisgaon"] },
  { district: "Jalna", lat: 19.8347, lon: 75.8816, talukas: ["Jalna", "Bhokardan", "Jafrabad", "Badnapur", "Ambad", "Ghansawangi", "Partur", "Mantha"] },
  { district: "Kolhapur", lat: 16.7050, lon: 74.2433, talukas: ["Kolhapur", "Karvir", "Panhala", "Shahuwadi", "Kagal", "Hatkanangle", "Shirol", "Ichalkaranji", "Radhanagari", "Gaganbawda", "Bhudargad", "Ajra", "Gadhinglaj", "Chandgad"] },
  { district: "Latur", lat: 18.4088, lon: 76.5604, talukas: ["Latur", "Renapur", "Ahmadpur", "Jalkot", "Chakur", "Shirur Anantpal", "Ausa", "Nilanga", "Deoni", "Udgir"] },
  { district: "Mumbai City", lat: 18.9750, lon: 72.8258, talukas: ["Mumbai City"] },
  { district: "Mumbai Suburban", lat: 19.0760, lon: 72.8777, talukas: ["Andheri", "Borivali", "Kurla"] },
  { district: "Nagpur", lat: 21.1458, lon: 79.0882, talukas: ["Nagpur Urban", "Nagpur Rural", "Kamptee", "Hingna", "Katol", "Narkhed", "Savner", "Kalmeshwar", "Ramtek", "Parseoni", "Mouda", "Umred", "Kuhi", "Bhiwapur"] },
  { district: "Nanded", lat: 19.1383, lon: 77.3210, talukas: ["Nanded", "Ardhapur", "Mudkhed", "Bhokar", "Umri", "Loha", "Kandhar", "Kinwat", "Himayatnagar", "Hadgaon", "Mahur", "Deglur", "Mukhed", "Dharmabad", "Biloli", "Naigaon"] },
  { district: "Nandurbar", lat: 21.3700, lon: 74.2394, talukas: ["Nandurbar", "Navapur", "Shahade", "Talode", "Akkalkuwa", "Akrani"] },
  { district: "Nashik", lat: 20.0000, lon: 73.7800, talukas: ["Nashik", "Igatpuri", "Dindori", "Peth", "Trimbakeshwar", "Kalwan", "Deola", "Surgana", "Baglan", "Malegaon", "Nandgaon", "Chandwad", "Niphad", "Sinnar", "Yeola"] },
  { district: "Osmanabad", lat: 18.1860, lon: 76.0400, talukas: ["Osmanabad", "Tuljapur", "Umarga", "Lohara", "Kallam", "Bhum", "Paranda", "Washi"] },
  { district: "Palghar", lat: 19.6967, lon: 72.7699, talukas: ["Palghar", "Vasai", "Dahanu", "Talasari", "Jawhar", "Mokhada", "Vikramgad", "Wada"] },
  { district: "Parbhani", lat: 19.2607, lon: 76.7748, talukas: ["Parbhani", "Sonpeth", "Gangakhed", "Palam", "Purna", "Sailu", "Jintur", "Manwath", "Pathri"] },
  { district: "Pune", lat: 18.5204, lon: 73.8567, talukas: ["Pune City", "Haveli", "Mulshi", "Maval", "Bhor", "Velhe", "Purandar", "Baramati", "Indapur", "Daund", "Shirur", "Khed", "Junnar", "Ambegaon"] },
  { district: "Raigad", lat: 18.5158, lon: 73.1822, talukas: ["Alibag", "Pen", "Panvel", "Uran", "Karjat", "Khalapur", "Mangaon", "Tala", "Roha", "Sudhagad", "Mahad", "Poladpur", "Shrivardhan", "Mhasla", "Murud"] },
  { district: "Ratnagiri", lat: 16.9944, lon: 73.3000, talukas: ["Ratnagiri", "Sangameshwar", "Lanja", "Rajapur", "Chiplun", "Guhagar", "Dapoli", "Mandangad", "Khed"] },
  { district: "Sangli", lat: 16.8524, lon: 74.5815, talukas: ["Sangli", "Miraj", "Tasgaon", "Khanapur", "Atpadi", "Jat", "Walwa", "Shirala", "Kadegaon", "Palus"] },
  { district: "Satara", lat: 17.6805, lon: 74.0183, talukas: ["Satara", "Karad", "Koregaon", "Wai", "Mahabaleshwar", "Phaltan", "Khandala", "Man", "Khatav", "Patan", "Jaoli"] },
  { district: "Sindhudurg", lat: 16.3489, lon: 73.7553, talukas: ["Sawantwadi", "Kudal", "Vengurla", "Malvan", "Devgad", "Kankavli", "Vaibhavwadi", "Dodamarg"] },
  { district: "Solapur", lat: 17.6599, lon: 75.9064, talukas: ["Solapur North", "Solapur South", "Akkalkot", "Barshi", "Karmala", "Madha", "Malshiras", "Mangalvedhe", "Mohol", "Pandharpur", "Sangola"] },
  { district: "Thane", lat: 19.2183, lon: 72.9781, talukas: ["Thane", "Kalyan", "Bhiwandi", "Shahapur", "Murbad", "Ambarnath", "Ulhasnagar"] },
  { district: "Wardha", lat: 20.7453, lon: 78.6022, talukas: ["Wardha", "Deoli", "Seloo", "Arvi", "Ashti", "Karanja", "Hinganghat", "Samudrapur"] },
  { district: "Washim", lat: 20.1120, lon: 77.1303, talukas: ["Washim", "Malegaon", "Risod", "Mangrulpir", "Karanja", "Manora"] },
  { district: "Yavatmal", lat: 20.3888, lon: 78.1204, talukas: ["Yavatmal", "Arni", "Babhulgaon", "Kalamb", "Darwha", "Digras", "Pusad", "Umarkhed", "Mahagaon", "Kelapur", "Ralegaon", "Ghatanji", "Wani", "Maregaon", "Zari Jamni", "Ner"] },
];

export interface FarmLocation {
  district: string;
  taluka?: string;
  village?: string;
  latitude: number;
  longitude: number;
  isAutoDetected: boolean;
}

interface FarmLocationContextType {
  location: FarmLocation;
  setLocation: (location: FarmLocation) => void;
  setDistrict: (district: string) => void;
  detectLocation: () => Promise<void>;
  isDetecting: boolean;
  error: string | null;
}

const defaultLocation: FarmLocation = {
  district: "Nagpur",
  latitude: 21.1458,
  longitude: 79.0882,
  isAutoDetected: false,
};

const FarmLocationContext = createContext<FarmLocationContextType | null>(null);

const STORAGE_KEY = "smartagro_farm_location";

export function FarmLocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<FarmLocation>(() => {
    // Load from localStorage on init
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultLocation;
        }
      }
    }
    return defaultLocation;
  });
  
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save to localStorage whenever location changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  }, [location]);

  const setLocation = useCallback((newLocation: FarmLocation) => {
    setLocationState(newLocation);
    setError(null);
  }, []);

  const setDistrict = useCallback((district: string) => {
    const districtData = maharashtraLocations.find((d) => d.district === district);
    if (districtData) {
      setLocationState({
        district: districtData.district,
        latitude: districtData.lat,
        longitude: districtData.lon,
        isAutoDetected: false,
      });
      setError(null);
    }
  }, []);

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Find nearest district based on coordinates
      let nearestDistrict = maharashtraLocations[0];
      let minDistance = Infinity;

      maharashtraLocations.forEach((loc) => {
        const distance = Math.sqrt(
          Math.pow(loc.lat - latitude, 2) + Math.pow(loc.lon - longitude, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestDistrict = loc;
        }
      });

      // Try to get village/taluka name via reverse geocoding
      let village = "";
      let taluka = "";
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
          { headers: { "User-Agent": "SmartAgro/1.0" } }
        );
        const data = await response.json();
        village = data.address?.village || data.address?.town || data.address?.city || "";
        taluka = data.address?.county || data.address?.state_district || "";
      } catch {
        // Ignore geocoding errors
      }

      setLocationState({
        district: nearestDistrict.district,
        taluka,
        village,
        latitude,
        longitude,
        isAutoDetected: true,
      });
    } catch (err) {
      const geoError = err as GeolocationPositionError;
      if (geoError.code === 1) {
        setError("Location permission denied. Please select your district manually.");
      } else if (geoError.code === 2) {
        setError("Unable to detect location. Please select your district manually.");
      } else {
        setError("Location detection timed out. Please select your district manually.");
      }
    } finally {
      setIsDetecting(false);
    }
  }, []);

  return (
    <FarmLocationContext.Provider
      value={{
        location,
        setLocation,
        setDistrict,
        detectLocation,
        isDetecting,
        error,
      }}
    >
      {children}
    </FarmLocationContext.Provider>
  );
}

export function useFarmLocation() {
  const context = useContext(FarmLocationContext);
  if (!context) {
    throw new Error("useFarmLocation must be used within a FarmLocationProvider");
  }
  return context;
}

// Helper to get district data
export function getDistrictData(district: string) {
  return maharashtraLocations.find((d) => d.district === district);
}
