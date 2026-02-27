import React, { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFarmLocation } from "@/contexts/FarmLocationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, Phone, Mail, MapPin, FileText, ShieldCheck, 
  Eye, EyeOff, RefreshCw, CheckCircle2, AlertCircle,
  Landmark, Home, Ruler, Calendar, CreditCard, Loader2,
  ExternalLink, Lock, Fingerprint
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FarmerProfile {
  // Personal Info
  name: string;
  fatherName: string;
  aadhaar: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  // Address
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
}

interface LandRecord {
  id: string;
  khasraNo: string;
  khataNo: string;
  area: string;
  areaUnit: string;
  ownership: string;
  landType: string;
  soilType: string;
  irrigationSource: string;
  cropSeason: string;
}

interface SyncedDocument {
  id: string;
  name: string;
  type: string;
  syncedAt: string;
  verified: boolean;
}

// Mask sensitive data with ****
const maskData = (value: string, showFirst: number = 0, showLast: number = 4): string => {
  if (!value) return "****";
  const len = value.length;
  if (len <= showFirst + showLast) return "****";
  const firstPart = value.substring(0, showFirst);
  const lastPart = value.substring(len - showLast);
  const masked = "*".repeat(Math.min(len - showFirst - showLast, 8));
  return `${firstPart}${masked}${lastPart}`;
};

const Profile: React.FC = () => {
  const { language, t } = useLanguage();
  const { location } = useFarmLocation();
  const [showSensitive, setShowSensitive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [digilockerConnected, setDigilockerConnected] = useState(false);

  // Mock farmer data - in real app, this comes from DigiLocker
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>({
    name: "Ravi Patil",
    fatherName: "Shankar Patil",
    aadhaar: "234567891234",
    phone: "9876543210",
    email: "ramesh.patil@gmail.com",
    dob: "15-08-1985",
    gender: "Male",
    village: location.village || "Shivajinagar",
    taluka: location.taluka || "Haveli",
    district: location.district,
    state: "Maharashtra",
    pincode: "411005"
  });

  const [landRecords, setLandRecords] = useState<LandRecord[]>([
    {
      id: "1",
      khasraNo: "123/4A",
      khataNo: "KH-2024-5678",
      area: "5.5",
      areaUnit: "Acres",
      ownership: "Self-Owned",
      landType: "Agricultural",
      soilType: "Black Cotton Soil",
      irrigationSource: "Well + Canal",
      cropSeason: "Kharif & Rabi"
    },
    {
      id: "2",
      khasraNo: "125/2B",
      khataNo: "KH-2024-5679",
      area: "2.0",
      areaUnit: "Acres",
      ownership: "Leased",
      landType: "Agricultural",
      soilType: "Red Soil",
      irrigationSource: "Borewell",
      cropSeason: "Rabi"
    }
  ]);

  const [syncedDocuments, setSyncedDocuments] = useState<SyncedDocument[]>([
    { id: "1", name: "Aadhaar Card", type: "Identity", syncedAt: "2026-02-15", verified: true },
    { id: "2", name: "7/12 Extract (Satbara)", type: "Land Record", syncedAt: "2026-02-15", verified: true },
    { id: "3", name: "Caste Certificate", type: "Certificate", syncedAt: "2026-02-15", verified: true },
  ]);

  useEffect(() => {
    // Check if DigiLocker was previously connected
    const connected = localStorage.getItem('digilocker_connected');
    const synced = localStorage.getItem('digilocker_last_synced');
    if (connected === 'true') {
      setDigilockerConnected(true);
      setLastSynced(synced);
    }
  }, []);

  const handleDigilockerSync = async () => {
    setIsSyncing(true);
    
    // Simulate DigiLocker OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setDigilockerConnected(true);
    const now = new Date().toISOString();
    setLastSynced(now);
    localStorage.setItem('digilocker_connected', 'true');
    localStorage.setItem('digilocker_last_synced', now);
    
    setIsSyncing(false);
    toast({
      title: language === "hi" ? "डिजिलॉकर से सिंक हो गया!" : 
             language === "mr" ? "डिजिलॉकरशी सिंक झाले!" : 
             "Synced with DigiLocker!",
      description: language === "hi" ? "आपके दस्तावेज़ अपडेट हो गए हैं" :
                   language === "mr" ? "तुमचे दस्तऐवज अपडेट झाले आहेत" :
                   "Your documents have been updated"
    });
  };

  const text = {
    en: {
      title: "Farmer Profile",
      subtitle: "Your personal and land information synced from DigiLocker",
      personalInfo: "Personal Information",
      landRecords: "Land Records",
      documents: "Synced Documents",
      digilocker: "DigiLocker Integration",
      syncNow: "Sync with DigiLocker",
      syncing: "Syncing...",
      lastSynced: "Last synced",
      connected: "Connected",
      notConnected: "Not Connected",
      showData: "Show Data",
      hideData: "Hide Data",
      verified: "Verified",
      name: "Full Name",
      fatherName: "Father's Name",
      aadhaar: "Aadhaar Number",
      phone: "Mobile Number",
      email: "Email Address",
      dob: "Date of Birth",
      gender: "Gender",
      address: "Address",
      village: "Village",
      taluka: "Taluka",
      district: "District",
      state: "State",
      pincode: "PIN Code",
      khasraNo: "Khasra/Survey No.",
      khataNo: "Khata/Record No.",
      area: "Land Area",
      ownership: "Ownership",
      landType: "Land Type",
      soilType: "Soil Type",
      irrigation: "Irrigation",
      cropSeason: "Crop Season",
      totalLand: "Total Land",
      acres: "Acres",
      privacyNote: "Your data is encrypted and stored securely. Click 'Show Data' to view full details.",
      digilockerNote: "Connect to DigiLocker to automatically sync your Aadhaar, land records (7/12), and other government documents."
    },
    hi: {
      title: "किसान प्रोफ़ाइल",
      subtitle: "डिजिलॉकर से सिंक की गई आपकी व्यक्तिगत और भूमि जानकारी",
      personalInfo: "व्यक्तिगत जानकारी",
      landRecords: "भूमि रिकॉर्ड",
      documents: "सिंक किए गए दस्तावेज़",
      digilocker: "डिजिलॉकर इंटीग्रेशन",
      syncNow: "डिजिलॉकर से सिंक करें",
      syncing: "सिंक हो रहा है...",
      lastSynced: "अंतिम सिंक",
      connected: "कनेक्टेड",
      notConnected: "कनेक्ट नहीं",
      showData: "डेटा दिखाएं",
      hideData: "डेटा छुपाएं",
      verified: "सत्यापित",
      name: "पूरा नाम",
      fatherName: "पिता का नाम",
      aadhaar: "आधार नंबर",
      phone: "मोबाइल नंबर",
      email: "ईमेल पता",
      dob: "जन्म तिथि",
      gender: "लिंग",
      address: "पता",
      village: "गाँव",
      taluka: "तालुका",
      district: "जिला",
      state: "राज्य",
      pincode: "पिन कोड",
      khasraNo: "खसरा/सर्वे नं.",
      khataNo: "खाता/रिकॉर्ड नं.",
      area: "भूमि क्षेत्र",
      ownership: "स्वामित्व",
      landType: "भूमि प्रकार",
      soilType: "मिट्टी का प्रकार",
      irrigation: "सिंचाई",
      cropSeason: "फसल मौसम",
      totalLand: "कुल भूमि",
      acres: "एकड़",
      privacyNote: "आपका डेटा एन्क्रिप्टेड और सुरक्षित रूप से संग्रहीत है। पूर्ण विवरण देखने के लिए 'डेटा दिखाएं' पर क्लिक करें।",
      digilockerNote: "अपना आधार, भूमि रिकॉर्ड (7/12), और अन्य सरकारी दस्तावेज़ स्वचालित रूप से सिंक करने के लिए डिजिलॉकर से कनेक्ट करें।"
    },
    mr: {
      title: "शेतकरी प्रोफाइल",
      subtitle: "डिजिलॉकरमधून सिंक केलेली तुमची वैयक्तिक आणि जमीन माहिती",
      personalInfo: "वैयक्तिक माहिती",
      landRecords: "जमीन रेकॉर्ड",
      documents: "सिंक केलेले दस्तऐवज",
      digilocker: "डिजिलॉकर इंटिग्रेशन",
      syncNow: "डिजिलॉकरशी सिंक करा",
      syncing: "सिंक होत आहे...",
      lastSynced: "शेवटचे सिंक",
      connected: "कनेक्ट",
      notConnected: "कनेक्ट नाही",
      showData: "डेटा दाखवा",
      hideData: "डेटा लपवा",
      verified: "सत्यापित",
      name: "पूर्ण नाव",
      fatherName: "वडिलांचे नाव",
      aadhaar: "आधार क्रमांक",
      phone: "मोबाइल क्रमांक",
      email: "ईमेल पत्ता",
      dob: "जन्म तारीख",
      gender: "लिंग",
      address: "पत्ता",
      village: "गाव",
      taluka: "तालुका",
      district: "जिल्हा",
      state: "राज्य",
      pincode: "पिन कोड",
      khasraNo: "खसरा/सर्वे क्र.",
      khataNo: "खाते/रेकॉर्ड क्र.",
      area: "जमीन क्षेत्र",
      ownership: "मालकी",
      landType: "जमीन प्रकार",
      soilType: "माती प्रकार",
      irrigation: "सिंचन",
      cropSeason: "पीक हंगाम",
      totalLand: "एकूण जमीन",
      acres: "एकर",
      privacyNote: "तुमचा डेटा एन्क्रिप्टेड आणि सुरक्षितपणे संग्रहित आहे. पूर्ण तपशील पाहण्यासाठी 'डेटा दाखवा' वर क्लिक करा.",
      digilockerNote: "तुमचे आधार, जमीन रेकॉर्ड (7/12), आणि इतर सरकारी दस्तऐवज स्वयंचलितपणे सिंक करण्यासाठी डिजिलॉकरशी कनेक्ट करा."
    }
  };

  const t_local = text[language as keyof typeof text] || text.en;

  const totalLandArea = landRecords.reduce((sum, record) => sum + parseFloat(record.area), 0);

  const InfoRow = ({ icon: Icon, label, value, sensitive = false }: { 
    icon: React.ElementType; 
    label: string; 
    value: string;
    sensitive?: boolean;
  }) => (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-green-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900 truncate">
          {sensitive && !showSensitive ? maskData(value) : value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-800">{t_local.title}</h1>
          <p className="text-gray-600 mt-1">{t_local.subtitle}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSensitive(!showSensitive)}
          className="w-fit"
        >
          {showSensitive ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              {t_local.hideData}
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              {t_local.showData}
            </>
          )}
        </Button>
      </div>

      {/* DigiLocker Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Fingerprint className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {t_local.digilocker}
                  {digilockerConnected ? (
                    <Badge className="bg-green-500 text-white border-0">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {t_local.connected}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {t_local.notConnected}
                    </Badge>
                  )}
                </h3>
                <p className="text-blue-100 text-sm mt-1">{t_local.digilockerNote}</p>
                {lastSynced && (
                  <p className="text-blue-200 text-xs mt-2">
                    {t_local.lastSynced}: {new Date(lastSynced).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <Button 
              onClick={handleDigilockerSync}
              disabled={isSyncing}
              className="bg-white text-blue-600 hover:bg-blue-50 shrink-0"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t_local.syncing}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t_local.syncNow}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">{t_local.privacyNote}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="bg-white shadow-lg border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              {t_local.personalInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <InfoRow icon={User} label={t_local.name} value={farmerProfile.name} />
            <InfoRow icon={User} label={t_local.fatherName} value={farmerProfile.fatherName} />
            <InfoRow icon={CreditCard} label={t_local.aadhaar} value={farmerProfile.aadhaar} sensitive />
            <InfoRow icon={Phone} label={t_local.phone} value={farmerProfile.phone} sensitive />
            <InfoRow icon={Mail} label={t_local.email} value={farmerProfile.email} sensitive />
            <InfoRow icon={Calendar} label={t_local.dob} value={farmerProfile.dob} />
            
            <Separator className="my-4" />
            
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t_local.address}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">{t_local.village}:</span>
                <span className="ml-2 font-medium">{farmerProfile.village}</span>
              </div>
              <div>
                <span className="text-gray-500">{t_local.taluka}:</span>
                <span className="ml-2 font-medium">{farmerProfile.taluka}</span>
              </div>
              <div>
                <span className="text-gray-500">{t_local.district}:</span>
                <span className="ml-2 font-medium">{farmerProfile.district}</span>
              </div>
              <div>
                <span className="text-gray-500">{t_local.state}:</span>
                <span className="ml-2 font-medium">{farmerProfile.state}</span>
              </div>
              <div>
                <span className="text-gray-500">{t_local.pincode}:</span>
                <span className="ml-2 font-medium">{showSensitive ? farmerProfile.pincode : maskData(farmerProfile.pincode, 0, 3)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Synced Documents */}
        <Card className="bg-white shadow-lg border-l-4 border-l-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              {t_local.documents}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {syncedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.verified && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        {t_local.verified}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-4" asChild>
              <a href="https://www.digilocker.gov.in/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {language === "hi" ? "डिजिलॉकर पर और दस्तावेज़ देखें" : 
                 language === "mr" ? "डिजिलॉकरवर अधिक दस्तऐवज पहा" :
                 "View More Documents on DigiLocker"}
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Land Records */}
      <Card className="bg-white shadow-lg border-t-4 border-t-amber-500">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-amber-600" />
              {t_local.landRecords}
            </span>
            <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-base px-3 py-1">
              {t_local.totalLand}: {totalLandArea.toFixed(1)} {t_local.acres}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4">
            {landRecords.map((record, index) => (
              <div key={record.id} className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Home className="h-5 w-5 text-amber-600" />
                    {language === "hi" ? `भूमि रिकॉर्ड ${index + 1}` :
                     language === "mr" ? `जमीन रेकॉर्ड ${index + 1}` :
                     `Land Record ${index + 1}`}
                  </h4>
                  <Badge variant={record.ownership === "Self-Owned" ? "default" : "secondary"}>
                    {record.ownership}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-gray-500 text-xs">{t_local.khasraNo}</p>
                    <p className="font-semibold text-gray-800 mt-1">
                      {showSensitive ? record.khasraNo : maskData(record.khasraNo, 0, 2)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-gray-500 text-xs">{t_local.khataNo}</p>
                    <p className="font-semibold text-gray-800 mt-1">
                      {showSensitive ? record.khataNo : maskData(record.khataNo, 3, 4)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-gray-500 text-xs">{t_local.area}</p>
                    <p className="font-semibold text-gray-800 mt-1 flex items-center gap-1">
                      <Ruler className="h-4 w-4 text-green-600" />
                      {record.area} {record.areaUnit}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-gray-500 text-xs">{t_local.landType}</p>
                    <p className="font-semibold text-gray-800 mt-1">{record.landType}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-gray-500 text-xs">{t_local.soilType}</p>
                    <p className="font-semibold text-gray-800 mt-1">{record.soilType}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-gray-500 text-xs">{t_local.irrigation}</p>
                    <p className="font-semibold text-gray-800 mt-1">{record.irrigationSource}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border col-span-2">
                    <p className="text-gray-500 text-xs">{t_local.cropSeason}</p>
                    <p className="font-semibold text-gray-800 mt-1">{record.cropSeason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
