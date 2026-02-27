import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Search, AlertTriangle, Shield, Thermometer, Loader2, Camera, X, Wifi, WifiOff, Video, VideoOff } from "lucide-react";
import { Language } from "@/i18n/translations";
import { useDiseaseDetection, checkApiHealth, DiseaseResult } from "@/hooks/useDiseaseDetection";

const DiseaseDetection: React.FC = () => {
  const { language, t } = useLanguage();
  const lang = language as Language;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { detectDisease, isLoading, error, result, clearResult } = useDiseaseDetection();

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
        };
      }
      setIsCameraMode(true);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError(
        lang === "hi" ? "कैमरा एक्सेस नहीं मिल सका" : 
        lang === "mr" ? "कॅमेरा प्रवेश मिळाला नाही" : 
        "Could not access camera. Please check permissions."
      );
    }
  }, [lang]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraMode(false);
    setIsCameraReady(false);
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setSelectedFile(file);
          setPreviewUrl(canvas.toDataURL('image/jpeg'));
          stopCamera();
          clearResult();
        }
      }, 'image/jpeg', 0.9);
    }
  }, [stopCamera, clearResult]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await checkApiHealth();
      setApiConnected(healthy);
    };
    checkHealth();
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      clearResult();
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      clearResult();
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    clearResult();
    stopCamera();
    setCameraError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (selectedFile) {
      await detectDisease(selectedFile);
    }
  };

  const riskColors = { low: "text-success bg-success/10", medium: "text-warning bg-warning/10", high: "text-destructive bg-destructive/10" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-poppins font-bold">{t("disease.title")}</h1>
        <div className="flex items-center gap-2 text-sm">
          {apiConnected === null ? (
            <span className="text-muted-foreground">Checking API...</span>
          ) : apiConnected ? (
            <>
              <Wifi className="h-4 w-4 text-success" />
              <span className="text-success">AI Model Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-destructive" />
              <span className="text-destructive">API Offline - Start backend server</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Upload */}
        <Card className="col-span-5 bg-card/95">
          <CardHeader>
            <CardTitle className="text-lg">{t("disease.upload")}</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Camera Mode */}
            {isCameraMode ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-xl bg-black"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={capturePhoto}
                    disabled={!isCameraReady}
                    className="flex-1 h-12 bg-primary hover:bg-primary/90"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    {lang === "hi" ? "फोटो लें" : lang === "mr" ? "फोटो घ्या" : "Capture Photo"}
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="h-12"
                  >
                    <VideoOff className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Upload/Capture Selection */
              <div
                onClick={handleUploadClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all relative"
              >
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Selected crop" 
                      className="max-h-48 mx-auto rounded-lg object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <p className="mt-3 text-sm text-success font-medium">
                      {lang === "hi" ? "छवि चयनित!" : lang === "mr" ? "प्रतिमा निवडली!" : "Image selected!"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedFile?.name}</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-center gap-4 mb-4">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{t("disease.drag")}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {lang === "hi" ? "JPG, PNG, WEBP समर्थित" : lang === "mr" ? "JPG, PNG, WEBP समर्थित" : "Supports JPG, PNG, WEBP"}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Camera Button - Only show when no image selected and not in camera mode */}
            {!isCameraMode && !previewUrl && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  startCamera();
                }}
                variant="outline"
                className="w-full mt-4 h-12"
              >
                <Video className="h-5 w-5 mr-2" />
                {lang === "hi" ? "कैमरा से फोटो लें" : lang === "mr" ? "कॅमेरा मधून फोटो घ्या" : "Capture from Camera"}
              </Button>
            )}
            
            {cameraError && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                <p className="text-sm text-destructive">{cameraError}</p>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            {selectedFile && !result && (
              <Button 
                onClick={handleAnalyze} 
                disabled={isLoading || !apiConnected} 
                className="w-full mt-4 h-12 bg-primary hover:bg-primary/90 text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    {t("disease.analyze")}
                  </>
                )}
              </Button>
            )}
            
            {result && (
              <Button 
                onClick={handleClear} 
                variant="outline"
                className="w-full mt-4 h-12 text-base"
              >
                {lang === "hi" ? "नया विश्लेषण" : lang === "mr" ? "नवीन विश्लेषण" : "New Analysis"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        <div className="col-span-7 space-y-6">
          {result ? (
            <>
              <Card className="bg-card/95">
                <CardHeader>
                  <CardTitle className="text-lg">{t("disease.result")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <p className="text-xs text-muted-foreground uppercase">{t("disease.name")}</p>
                      <p className="font-poppins font-bold text-base mt-1">{result.prediction.name[lang]}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <p className="text-xs text-muted-foreground uppercase">{t("disease.confidence")}</p>
                      <p className="font-inter font-bold text-2xl text-primary mt-1">{result.prediction.confidence}%</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <p className="text-xs text-muted-foreground uppercase">{t("disease.risk")}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1 ${riskColors[result.prediction.risk]}`}>
                        {t(`common.${result.prediction.risk}`).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-info/5 rounded-lg border-l-4 border-info">
                    <Thermometer className="h-5 w-5 text-info shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-info uppercase">{t("disease.weather_influence")}</p>
                      <p className="text-sm mt-1">{result.prediction.weatherInfluence[lang]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/95">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {t("disease.treatment")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.prediction.treatment.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                      <p className="text-sm">{step[lang]}</p>
                    </div>
                  ))}
                  <div className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg border-l-4 border-warning mt-4">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-warning uppercase">{t("disease.safety")}</p>
                      <p className="text-sm mt-1">{result.safety[lang]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-card/95 h-full flex items-center justify-center">
              <CardContent className="text-center py-16">
                <span className="text-6xl">🔬</span>
                <p className="mt-4 text-muted-foreground">
                  {selectedFile 
                    ? (lang === "hi" ? "विश्लेषण शुरू करने के लिए बटन दबाएं" : lang === "mr" ? "विश्लेषण सुरू करण्यासाठी बटण दाबा" : "Click Analyze to detect diseases") 
                    : (lang === "hi" ? "पहले फोटो अपलोड करें" : lang === "mr" ? "प्रथम फोटो अपलोड करा" : "Upload a crop image to start")
                  }
                </p>
                {!apiConnected && (
                  <p className="mt-2 text-sm text-destructive">
                    {lang === "hi" ? "कृपया बैकएंड सर्वर शुरू करें" : lang === "mr" ? "कृपया बॅकएंड सर्व्हर सुरू करा" : "Please start the backend server"}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
