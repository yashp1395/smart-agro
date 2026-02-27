"""
FastAPI Server for Marathi Voice Bot
=====================================

REST API and WebSocket endpoints for integrating the voice bot with web frontend.

Endpoints:
- POST /api/speech-to-text      - Convert audio to text
- POST /api/text-to-speech      - Convert text to audio
- POST /api/dialogflow          - Get Dialogflow CX response
- POST /api/process             - Full speech-to-speech pipeline
- WS   /ws/conversation         - Real-time conversation WebSocket

Author: Smart Agro Team
"""

import os
import io
import json
import base64
import asyncio
from typing import Optional, List
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx

# Load environment
load_dotenv()

# Google Cloud imports
from google.cloud import speech_v1p1beta1 as speech
from google.cloud import texttospeech_v1 as texttospeech
from google.cloud import dialogflowcx_v3 as dialogflow
from google.api_core import exceptions as google_exceptions

# ============================================================================
# CONFIGURATION
# ============================================================================

class Settings:
    """Application settings from environment variables."""
    PROJECT_ID: str = os.getenv("GOOGLE_CLOUD_PROJECT", "your-project-id")
    LOCATION: str = os.getenv("DIALOGFLOW_LOCATION", "global")
    AGENT_ID: str = os.getenv("DIALOGFLOW_AGENT_ID", "your-agent-id")
    LANGUAGE_CODE: str = "mr-IN"
    TTS_VOICE: str = "mr-IN-Neural2-A"
    STT_MODEL: str = "chirp_2"

settings = Settings()

# ============================================================================
# API MODELS
# ============================================================================

class TextToSpeechRequest(BaseModel):
    """Request model for TTS endpoint."""
    text: str
    language_code: str = "mr-IN"
    voice_name: str = "mr-IN-Neural2-A"
    speaking_rate: float = 1.0
    pitch: float = 0.0

class DialogflowRequest(BaseModel):
    """Request model for Dialogflow endpoint."""
    text: str
    session_id: str
    language_code: str = "mr-IN"

class ProcessRequest(BaseModel):
    """Request model for full pipeline processing."""
    audio_base64: str
    session_id: str
    language_code: str = "mr-IN"

class SpeechToTextResponse(BaseModel):
    """Response model for STT endpoint."""
    transcript: str
    confidence: float
    language: str

class DialogflowResponse(BaseModel):
    """Response model for Dialogflow endpoint."""
    response_text: str
    intent: Optional[str] = None
    confidence: Optional[float] = None

class ProcessResponse(BaseModel):
    """Response model for full pipeline."""
    user_text: str
    bot_response: str
    audio_base64: str

# ============================================================================
# GOOGLE CLOUD CLIENTS
# ============================================================================

# Initialize clients (singleton pattern)
speech_client = None
tts_client = None
dialogflow_client = None

def get_speech_client():
    global speech_client
    if speech_client is None:
        speech_client = speech.SpeechClient()
    return speech_client

def get_tts_client():
    global tts_client
    if tts_client is None:
        tts_client = texttospeech.TextToSpeechClient()
    return tts_client

def get_dialogflow_client():
    global dialogflow_client
    if dialogflow_client is None:
        dialogflow_client = dialogflow.SessionsClient()
    return dialogflow_client

# ============================================================================
# FASTAPI APPLICATION
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    # Startup
    print("🚀 Starting Marathi Voice Bot API Server...")
    print(f"   Project: {settings.PROJECT_ID}")
    print(f"   Location: {settings.LOCATION}")
    print(f"   Language: {settings.LANGUAGE_CODE}")
    
    # Pre-initialize clients
    try:
        get_speech_client()
        print("   ✓ Speech-to-Text client ready")
    except Exception as e:
        print(f"   ⚠️ Speech-to-Text client failed: {e}")
    
    try:
        get_tts_client()
        print("   ✓ Text-to-Speech client ready")
    except Exception as e:
        print(f"   ⚠️ Text-to-Speech client failed: {e}")
    
    try:
        get_dialogflow_client()
        print("   ✓ Dialogflow CX client ready")
    except Exception as e:
        print(f"   ⚠️ Dialogflow CX client failed: {e}")
    
    print("\n✓ API Server is ready!\n")
    
    yield
    
    # Shutdown
    print("\n⏹️ Shutting down API Server...")

app = FastAPI(
    title="Smart Agro - Marathi Voice Bot API",
    description="Speech-to-Speech API for Marathi agricultural assistance",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Smart Agro Marathi Voice Bot",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check with component status."""
    status = {
        "speech_to_text": False,
        "text_to_speech": False,
        "dialogflow": False
    }
    
    try:
        get_speech_client()
        status["speech_to_text"] = True
    except:
        pass
    
    try:
        get_tts_client()
        status["text_to_speech"] = True
    except:
        pass
    
    try:
        get_dialogflow_client()
        status["dialogflow"] = True
    except:
        pass
    
    return status


# ============================================================================
# SPEECH-TO-TEXT ENDPOINT
# ============================================================================

@app.post("/api/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(
    audio: UploadFile = File(...),
    language_code: str = Form("mr-IN"),
    model: str = Form("chirp_2")
):
    """
    Convert speech audio to text.
    
    Accepts audio file in WAV, MP3, or OGG format.
    Returns transcribed Marathi text.
    """
    try:
        # Read audio file
        audio_content = await audio.read()
        
        # Determine encoding based on content type
        content_type = audio.content_type or "audio/wav"
        
        if "wav" in content_type or "wave" in content_type:
            encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16
        elif "mp3" in content_type or "mpeg" in content_type:
            encoding = speech.RecognitionConfig.AudioEncoding.MP3
        elif "ogg" in content_type:
            encoding = speech.RecognitionConfig.AudioEncoding.OGG_OPUS
        elif "webm" in content_type:
            encoding = speech.RecognitionConfig.AudioEncoding.WEBM_OPUS
        else:
            encoding = speech.RecognitionConfig.AudioEncoding.ENCODING_UNSPECIFIED
        
        # Configure recognition
        config = speech.RecognitionConfig(
            encoding=encoding,
            sample_rate_hertz=16000,
            language_code=language_code,
            model=model,
            enable_automatic_punctuation=True,
            alternative_language_codes=["hi-IN", "en-IN"],
        )
        
        audio_obj = speech.RecognitionAudio(content=audio_content)
        
        # Perform recognition
        client = get_speech_client()
        response = client.recognize(config=config, audio=audio_obj)
        
        if not response.results:
            raise HTTPException(status_code=400, detail="No speech detected in audio")
        
        result = response.results[0]
        transcript = result.alternatives[0].transcript
        confidence = result.alternatives[0].confidence
        
        return SpeechToTextResponse(
            transcript=transcript,
            confidence=confidence,
            language=language_code
        )
        
    except google_exceptions.InvalidArgument as e:
        raise HTTPException(status_code=400, detail=f"Invalid audio format: {str(e)}")
    except google_exceptions.ResourceExhausted:
        raise HTTPException(status_code=429, detail="API rate limit exceeded. Please try again later.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech recognition error: {str(e)}")


@app.post("/api/speech-to-text/base64")
async def speech_to_text_base64(
    audio_base64: str = Form(...),
    language_code: str = Form("mr-IN"),
    sample_rate: int = Form(16000)
):
    """
    Convert base64-encoded audio to text.
    
    For browser-recorded audio (WebM/Opus format).
    """
    try:
        # Decode base64 audio
        audio_content = base64.b64decode(audio_base64)
        
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=sample_rate,
            language_code=language_code,
            model="chirp_2",
            enable_automatic_punctuation=True,
        )
        
        audio_obj = speech.RecognitionAudio(content=audio_content)
        
        client = get_speech_client()
        response = client.recognize(config=config, audio=audio_obj)
        
        if not response.results:
            return {"transcript": "", "confidence": 0, "language": language_code}
        
        result = response.results[0]
        return {
            "transcript": result.alternatives[0].transcript,
            "confidence": result.alternatives[0].confidence,
            "language": language_code
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# TEXT-TO-SPEECH ENDPOINT
# ============================================================================

@app.post("/api/text-to-speech")
async def text_to_speech(request: TextToSpeechRequest):
    """
    Convert text to speech audio.
    
    Returns MP3 audio as base64 string.
    """
    try:
        client = get_tts_client()
        
        # Configure synthesis
        synthesis_input = texttospeech.SynthesisInput(text=request.text)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code=request.language_code,
            name=request.voice_name
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=request.speaking_rate,
            pitch=request.pitch
        )
        
        # Synthesize
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        # Return as base64
        audio_base64 = base64.b64encode(response.audio_content).decode('utf-8')
        
        return {
            "audio_base64": audio_base64,
            "format": "mp3",
            "text": request.text
        }
        
    except google_exceptions.InvalidArgument as e:
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text-to-speech error: {str(e)}")


@app.post("/api/text-to-speech/stream")
async def text_to_speech_stream(request: TextToSpeechRequest):
    """
    Convert text to speech and stream the audio.
    
    Returns audio file as streaming response.
    """
    try:
        client = get_tts_client()
        
        synthesis_input = texttospeech.SynthesisInput(text=request.text)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code=request.language_code,
            name=request.voice_name
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=request.speaking_rate,
            pitch=request.pitch
        )
        
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        return StreamingResponse(
            io.BytesIO(response.audio_content),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=speech.mp3"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# DIALOGFLOW CX ENDPOINT
# ============================================================================

@app.post("/api/dialogflow", response_model=DialogflowResponse)
async def dialogflow_detect_intent(request: DialogflowRequest):
    """
    Send text to Dialogflow CX and get bot response.
    
    Uses Dialogflow CX (not legacy ES) as required.
    """
    try:
        client = get_dialogflow_client()
        
        # Build session path
        session_path = (
            f"projects/{settings.PROJECT_ID}/locations/{settings.LOCATION}/"
            f"agents/{settings.AGENT_ID}/sessions/{request.session_id}"
        )
        
        # Create query input
        text_input = dialogflow.TextInput(text=request.text)
        query_input = dialogflow.QueryInput(
            text=text_input,
            language_code=request.language_code
        )
        
        # Detect intent
        detect_request = dialogflow.DetectIntentRequest(
            session=session_path,
            query_input=query_input
        )
        
        response = client.detect_intent(request=detect_request)
        
        # Extract response
        response_messages = response.query_result.response_messages
        response_texts = []
        
        for message in response_messages:
            if message.text:
                response_texts.extend(message.text.text)
        
        bot_response = " ".join(response_texts) if response_texts else ""
        
        return DialogflowResponse(
            response_text=bot_response,
            intent=response.query_result.intent.display_name if response.query_result.intent else None,
            confidence=response.query_result.intent_detection_confidence
        )
        
    except google_exceptions.NotFound:
        raise HTTPException(
            status_code=404, 
            detail="Dialogflow agent not found. Check PROJECT_ID, LOCATION, and AGENT_ID."
        )
    except google_exceptions.PermissionDenied:
        raise HTTPException(
            status_code=403,
            detail="Permission denied. Check service account permissions."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dialogflow error: {str(e)}")


# ============================================================================
# FULL PIPELINE ENDPOINT
# ============================================================================

@app.post("/api/process", response_model=ProcessResponse)
async def process_speech_to_speech(request: ProcessRequest):
    """
    Full speech-to-speech pipeline:
    1. Convert audio to text (STT)
    2. Get response from Dialogflow CX
    3. Convert response to speech (TTS)
    
    Returns user's text, bot's response, and audio.
    """
    try:
        # Step 1: Speech-to-Text
        audio_content = base64.b64decode(request.audio_base64)
        
        stt_config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=16000,
            language_code=request.language_code,
            model="chirp_2",
            enable_automatic_punctuation=True,
        )
        
        stt_audio = speech.RecognitionAudio(content=audio_content)
        stt_response = get_speech_client().recognize(config=stt_config, audio=stt_audio)
        
        if not stt_response.results:
            raise HTTPException(status_code=400, detail="No speech detected")
        
        user_text = stt_response.results[0].alternatives[0].transcript
        
        # Step 2: Dialogflow CX
        session_path = (
            f"projects/{settings.PROJECT_ID}/locations/{settings.LOCATION}/"
            f"agents/{settings.AGENT_ID}/sessions/{request.session_id}"
        )
        
        text_input = dialogflow.TextInput(text=user_text)
        query_input = dialogflow.QueryInput(
            text=text_input,
            language_code=request.language_code
        )
        
        df_request = dialogflow.DetectIntentRequest(
            session=session_path,
            query_input=query_input
        )
        
        df_response = get_dialogflow_client().detect_intent(request=df_request)
        
        response_texts = []
        for message in df_response.query_result.response_messages:
            if message.text:
                response_texts.extend(message.text.text)
        
        bot_response = " ".join(response_texts) if response_texts else "माफ करा, मला समजले नाही."
        
        # Step 3: Text-to-Speech
        tts_input = texttospeech.SynthesisInput(text=bot_response)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code=request.language_code,
            name=settings.TTS_VOICE
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )
        
        tts_response = get_tts_client().synthesize_speech(
            input=tts_input,
            voice=voice,
            audio_config=audio_config
        )
        
        audio_base64 = base64.b64encode(tts_response.audio_content).decode('utf-8')
        
        return ProcessResponse(
            user_text=user_text,
            bot_response=bot_response,
            audio_base64=audio_base64
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# WEBSOCKET FOR REAL-TIME CONVERSATION
# ============================================================================

class ConnectionManager:
    """Manages WebSocket connections."""
    
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
    
    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
    
    async def send_json(self, session_id: str, data: dict):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(data)

manager = ConnectionManager()


@app.websocket("/ws/conversation/{session_id}")
async def websocket_conversation(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time conversation.
    
    Receives: {"type": "audio", "data": "<base64_audio>", "language": "mr-IN"}
    Sends: {"type": "response", "user_text": "...", "bot_response": "...", "audio": "<base64>"}
    """
    await manager.connect(websocket, session_id)
    
    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to Marathi Voice Bot",
            "session_id": session_id
        })
        
        while True:
            # Receive message
            data = await websocket.receive_json()
            
            if data.get("type") == "audio":
                try:
                    # Process audio
                    audio_base64 = data.get("data")
                    language = data.get("language", "mr-IN")
                    
                    # Send processing status
                    await websocket.send_json({
                        "type": "status",
                        "message": "Processing speech..."
                    })
                    
                    # STT
                    audio_content = base64.b64decode(audio_base64)
                    
                    stt_config = speech.RecognitionConfig(
                        encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
                        sample_rate_hertz=16000,
                        language_code=language,
                        model="chirp_2",
                    )
                    
                    stt_audio = speech.RecognitionAudio(content=audio_content)
                    stt_response = get_speech_client().recognize(config=stt_config, audio=stt_audio)
                    
                    if not stt_response.results:
                        await websocket.send_json({
                            "type": "error",
                            "message": "No speech detected"
                        })
                        continue
                    
                    user_text = stt_response.results[0].alternatives[0].transcript
                    
                    # Send transcription
                    await websocket.send_json({
                        "type": "transcription",
                        "text": user_text
                    })
                    
                    # Dialogflow
                    session_path = (
                        f"projects/{settings.PROJECT_ID}/locations/{settings.LOCATION}/"
                        f"agents/{settings.AGENT_ID}/sessions/{session_id}"
                    )
                    
                    text_input = dialogflow.TextInput(text=user_text)
                    query_input = dialogflow.QueryInput(
                        text=text_input,
                        language_code=language
                    )
                    
                    df_request = dialogflow.DetectIntentRequest(
                        session=session_path,
                        query_input=query_input
                    )
                    
                    df_response = get_dialogflow_client().detect_intent(request=df_request)
                    
                    response_texts = []
                    for message in df_response.query_result.response_messages:
                        if message.text:
                            response_texts.extend(message.text.text)
                    
                    bot_response = " ".join(response_texts) if response_texts else "माफ करा, मला समजले नाही."
                    
                    # TTS
                    tts_input = texttospeech.SynthesisInput(text=bot_response)
                    
                    voice = texttospeech.VoiceSelectionParams(
                        language_code=language,
                        name=settings.TTS_VOICE if language == "mr-IN" else f"{language}-Neural2-A"
                    )
                    
                    audio_config = texttospeech.AudioConfig(
                        audio_encoding=texttospeech.AudioEncoding.MP3
                    )
                    
                    tts_response = get_tts_client().synthesize_speech(
                        input=tts_input,
                        voice=voice,
                        audio_config=audio_config
                    )
                    
                    response_audio = base64.b64encode(tts_response.audio_content).decode('utf-8')
                    
                    # Send complete response
                    await websocket.send_json({
                        "type": "response",
                        "user_text": user_text,
                        "bot_response": bot_response,
                        "audio": response_audio
                    })
                    
                except Exception as e:
                    await websocket.send_json({
                        "type": "error",
                        "message": str(e)
                    })
            
            elif data.get("type") == "text":
                # Direct text input (skip STT)
                user_text = data.get("text", "")
                language = data.get("language", "mr-IN")
                
                # Process with Dialogflow and TTS
                # ... (similar to audio processing)
                
    except WebSocketDisconnect:
        manager.disconnect(session_id)


# ============================================================================
# AGMARKNET / MANDI PRICES API (via data.gov.in)
# ============================================================================

# Data.gov.in API Configuration (sources Agmarknet data)
MANDI_API_BASE = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
MANDI_API_KEY = os.getenv("DATA_GOV_IN_API_KEY", "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b")

class MandiPriceRecord(BaseModel):
    """Single mandi price record."""
    state: str
    district: str
    market: str
    commodity: str
    variety: str
    arrival_date: str
    min_price: str
    max_price: str
    modal_price: str

class MandiPricesResponse(BaseModel):
    """Response model for mandi prices."""
    success: bool
    total: int
    count: int
    records: List[MandiPriceRecord]
    source: str
    updated: str
    using_fallback: bool = False

# Fallback data generator
def generate_fallback_mandi_data(state: str = "Maharashtra", district: str = None) -> List[dict]:
    """Generate fallback mock data when API is unavailable."""
    today = datetime.now()
    date_str = today.strftime("%d/%m/%Y")
    
    commodities = [
        {"name": "Soyabean", "variety": "Yellow", "min": 4200, "max": 4800, "modal": 4500},
        {"name": "Cotton", "variety": "DCH-32", "min": 6500, "max": 7200, "modal": 6850},
        {"name": "Wheat", "variety": "Lokwan", "min": 2200, "max": 2500, "modal": 2350},
        {"name": "Onion", "variety": "Red", "min": 800, "max": 1500, "modal": 1100},
        {"name": "Tomato", "variety": "Local", "min": 1500, "max": 2500, "modal": 2000},
        {"name": "Tur (Arhar)", "variety": "Red", "min": 7500, "max": 8500, "modal": 8000},
        {"name": "Gram", "variety": "Desi", "min": 5200, "max": 5800, "modal": 5500},
        {"name": "Maize", "variety": "Yellow", "min": 1800, "max": 2200, "modal": 2000},
        {"name": "Jowar", "variety": "White", "min": 2800, "max": 3200, "modal": 3000},
        {"name": "Groundnut", "variety": "Bold", "min": 5500, "max": 6200, "modal": 5850},
        {"name": "Rice", "variety": "Common", "min": 2100, "max": 2400, "modal": 2250},
        {"name": "Potato", "variety": "Jyoti", "min": 1200, "max": 1800, "modal": 1500},
    ]
    
    districts = ["Nagpur", "Pune", "Nashik", "Aurangabad", "Kolhapur", "Solapur", "Ahmednagar", "Jalgaon"]
    target_districts = [district] if district else districts[:4]
    
    records = []
    import random
    
    for dist in target_districts:
        markets = [f"{dist} APMC", f"{dist} Market Yard", f"{dist} Krishi Bazaar"]
        for i, c in enumerate(commodities):
            variation = random.randint(-150, 150)
            records.append({
                "state": state,
                "district": dist,
                "market": markets[i % len(markets)],
                "commodity": c["name"],
                "variety": c["variety"],
                "arrival_date": date_str,
                "min_price": str(c["min"] + variation),
                "max_price": str(c["max"] + variation),
                "modal_price": str(c["modal"] + variation),
            })
    
    return records

@app.get("/api/mandi-prices", response_model=MandiPricesResponse)
async def get_mandi_prices(
    state: str = Query("Maharashtra", description="State name"),
    district: Optional[str] = Query(None, description="District name"),
    commodity: Optional[str] = Query(None, description="Commodity name"),
    limit: int = Query(100, ge=1, le=500, description="Maximum records to return"),
):
    """
    Fetch mandi (market) prices from Agmarknet via data.gov.in API.
    
    This endpoint proxies requests to the official Government of India data.gov.in API
    which sources data from Agmarknet (Agricultural Marketing Information Network).
    
    Data Source: https://agmarknet.gov.in
    API Provider: https://data.gov.in
    """
    try:
        # Build query parameters
        params = {
            "api-key": MANDI_API_KEY,
            "format": "json",
            "limit": str(limit),
            "filters[state]": state,
        }
        
        if district:
            params["filters[district]"] = district
        
        if commodity:
            params["filters[commodity]"] = commodity
        
        # Make async request to data.gov.in
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(MANDI_API_BASE, params=params)
            
            if response.status_code == 429:
                # Rate limited - return fallback data
                print("⚠️ Mandi API rate limited, using fallback data")
                fallback_records = generate_fallback_mandi_data(state, district)
                return MandiPricesResponse(
                    success=True,
                    total=len(fallback_records),
                    count=len(fallback_records),
                    records=[MandiPriceRecord(**r) for r in fallback_records],
                    source="Agmarknet (Fallback Data)",
                    updated=datetime.now().isoformat(),
                    using_fallback=True
                )
            
            response.raise_for_status()
            data = response.json()
        
        # Check for API errors
        if data.get("error"):
            print(f"⚠️ Mandi API error: {data.get('error')}")
            fallback_records = generate_fallback_mandi_data(state, district)
            return MandiPricesResponse(
                success=True,
                total=len(fallback_records),
                count=len(fallback_records),
                records=[MandiPriceRecord(**r) for r in fallback_records],
                source="Agmarknet (Fallback Data)",
                updated=datetime.now().isoformat(),
                using_fallback=True
            )
        
        # Parse successful response
        records = data.get("records", [])
        
        if not records:
            # No data returned - use fallback
            fallback_records = generate_fallback_mandi_data(state, district)
            return MandiPricesResponse(
                success=True,
                total=len(fallback_records),
                count=len(fallback_records),
                records=[MandiPriceRecord(**r) for r in fallback_records],
                source="Agmarknet (Fallback Data)",
                updated=datetime.now().isoformat(),
                using_fallback=True
            )
        
        return MandiPricesResponse(
            success=True,
            total=data.get("total", len(records)),
            count=len(records),
            records=[MandiPriceRecord(**r) for r in records],
            source="Agmarknet via data.gov.in",
            updated=datetime.now().isoformat(),
            using_fallback=False
        )
        
    except httpx.TimeoutException:
        print("⚠️ Mandi API timeout, using fallback data")
        fallback_records = generate_fallback_mandi_data(state, district)
        return MandiPricesResponse(
            success=True,
            total=len(fallback_records),
            count=len(fallback_records),
            records=[MandiPriceRecord(**r) for r in fallback_records],
            source="Agmarknet (Fallback Data)",
            updated=datetime.now().isoformat(),
            using_fallback=True
        )
        
    except httpx.HTTPStatusError as e:
        print(f"⚠️ Mandi API HTTP error: {e}")
        fallback_records = generate_fallback_mandi_data(state, district)
        return MandiPricesResponse(
            success=True,
            total=len(fallback_records),
            count=len(fallback_records),
            records=[MandiPriceRecord(**r) for r in fallback_records],
            source="Agmarknet (Fallback Data)",
            updated=datetime.now().isoformat(),
            using_fallback=True
        )
        
    except Exception as e:
        print(f"⚠️ Mandi API unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch mandi prices: {str(e)}")


@app.get("/api/mandi-prices/states")
async def get_available_states():
    """Get list of available states for mandi price data."""
    states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
        "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ]
    return {"states": states}


@app.get("/api/mandi-prices/districts/{state}")
async def get_districts_by_state(state: str):
    """Get list of districts for a given state."""
    # Maharashtra districts (expanded list)
    maharashtra_districts = [
        "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana",
        "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna",
        "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded", "Nandurbar", "Nashik",
        "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli",
        "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
    ]
    
    # For demo, return Maharashtra districts for any state
    # In production, this should query the data.gov.in API or use a complete state->districts mapping
    if state.lower() == "maharashtra":
        return {"state": state, "districts": maharashtra_districts}
    
    return {"state": state, "districts": maharashtra_districts[:10]}  # Placeholder


# ============================================================================
# INDIAN WEATHER API (via weather.indianapi.in)
# ============================================================================

INDIAN_WEATHER_API_BASE = "https://weather.indianapi.in"
INDIAN_WEATHER_API_KEY = os.getenv("INDIAN_WEATHER_API_KEY", "")

class WeatherCurrent(BaseModel):
    """Current weather data."""
    temperature: float
    humidity: float
    wind_speed: float
    wind_direction: Optional[str] = None
    description: str
    feels_like: Optional[float] = None
    pressure: Optional[float] = None
    visibility: Optional[float] = None
    uv_index: Optional[float] = None

class WeatherForecastDay(BaseModel):
    """Daily forecast data."""
    date: str
    max_temp: float
    min_temp: float
    description: str
    precipitation_probability: Optional[float] = None

class WeatherResponse(BaseModel):
    """Weather API response."""
    success: bool
    city: str
    state: Optional[str] = None
    current: Optional[WeatherCurrent] = None
    forecast: Optional[List[WeatherForecastDay]] = None
    source: str
    using_fallback: bool = False
    error: Optional[str] = None

@app.get("/api/weather/current", response_model=WeatherResponse)
async def get_current_weather(
    city: str = Query(..., description="City name"),
    state: Optional[str] = Query("Maharashtra", description="State name")
):
    """Get current weather for a city using Indian Weather API."""
    
    if not INDIAN_WEATHER_API_KEY:
        # Return mock data if no API key configured
        return WeatherResponse(
            success=True,
            city=city,
            state=state,
            current=WeatherCurrent(
                temperature=32.0,
                humidity=65.0,
                wind_speed=12.0,
                wind_direction="NW",
                description="Partly Cloudy",
                feels_like=35.0,
                pressure=1012.0,
                visibility=10.0,
                uv_index=7.0
            ),
            source="mock",
            using_fallback=True
        )
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{INDIAN_WEATHER_API_BASE}/india/weather",
                params={"city": city},
                headers={"X-Api-Key": INDIAN_WEATHER_API_KEY}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Parse the response (adapt based on actual API response format)
                current_data = data.get("current", data)
                
                return WeatherResponse(
                    success=True,
                    city=city,
                    state=state,
                    current=WeatherCurrent(
                        temperature=float(current_data.get("temperature", current_data.get("temp", 0))),
                        humidity=float(current_data.get("humidity", 0)),
                        wind_speed=float(current_data.get("wind_speed", current_data.get("wind", {}).get("speed", 0))),
                        wind_direction=current_data.get("wind_direction", current_data.get("wind", {}).get("direction")),
                        description=current_data.get("description", current_data.get("weather", {}).get("description", "Unknown")),
                        feels_like=current_data.get("feels_like"),
                        pressure=current_data.get("pressure"),
                        visibility=current_data.get("visibility"),
                        uv_index=current_data.get("uv_index")
                    ),
                    source="indianapi",
                    using_fallback=False
                )
            else:
                # API error - return fallback
                return WeatherResponse(
                    success=True,
                    city=city,
                    state=state,
                    current=WeatherCurrent(
                        temperature=32.0,
                        humidity=65.0,
                        wind_speed=12.0,
                        wind_direction="NW",
                        description="Partly Cloudy",
                        feels_like=35.0,
                        pressure=1012.0,
                        visibility=10.0,
                        uv_index=7.0
                    ),
                    source="mock",
                    using_fallback=True,
                    error=f"API returned status {response.status_code}"
                )
    except Exception as e:
        # Network error - return fallback
        return WeatherResponse(
            success=True,
            city=city,
            state=state,
            current=WeatherCurrent(
                temperature=32.0,
                humidity=65.0,
                wind_speed=12.0,
                wind_direction="NW",
                description="Partly Cloudy",
                feels_like=35.0,
                pressure=1012.0,
                visibility=10.0,
                uv_index=7.0
            ),
            source="mock",
            using_fallback=True,
            error=str(e)
        )


@app.get("/api/weather/forecast", response_model=WeatherResponse)
async def get_weather_forecast(
    city: str = Query(..., description="City name"),
    days: int = Query(7, description="Number of forecast days", ge=1, le=14)
):
    """Get weather forecast for a city."""
    
    if not INDIAN_WEATHER_API_KEY:
        # Return mock forecast data
        from datetime import timedelta
        today = datetime.now()
        forecasts = []
        
        for i in range(days):
            date = today + timedelta(days=i)
            forecasts.append(WeatherForecastDay(
                date=date.strftime("%Y-%m-%d"),
                max_temp=35.0 - (i * 0.5),
                min_temp=24.0 + (i * 0.3),
                description="Partly Cloudy" if i % 2 == 0 else "Clear Sky",
                precipitation_probability=10.0 + (i * 5)
            ))
        
        return WeatherResponse(
            success=True,
            city=city,
            forecast=forecasts,
            source="mock",
            using_fallback=True
        )
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{INDIAN_WEATHER_API_BASE}/india/forecast",
                params={"city": city, "days": days},
                headers={"X-Api-Key": INDIAN_WEATHER_API_KEY}
            )
            
            if response.status_code == 200:
                data = response.json()
                forecast_data = data.get("forecast", [])
                
                forecasts = []
                for day in forecast_data:
                    forecasts.append(WeatherForecastDay(
                        date=day.get("date", ""),
                        max_temp=float(day.get("max_temp", day.get("temperature_max", 0))),
                        min_temp=float(day.get("min_temp", day.get("temperature_min", 0))),
                        description=day.get("description", day.get("weather", {}).get("description", "Unknown")),
                        precipitation_probability=day.get("precipitation_probability")
                    ))
                
                return WeatherResponse(
                    success=True,
                    city=city,
                    forecast=forecasts,
                    source="indianapi",
                    using_fallback=False
                )
            else:
                # Fallback on error
                from datetime import timedelta
                today = datetime.now()
                forecasts = []
                
                for i in range(days):
                    date = today + timedelta(days=i)
                    forecasts.append(WeatherForecastDay(
                        date=date.strftime("%Y-%m-%d"),
                        max_temp=35.0 - (i * 0.5),
                        min_temp=24.0 + (i * 0.3),
                        description="Partly Cloudy",
                        precipitation_probability=10.0 + (i * 5)
                    ))
                
                return WeatherResponse(
                    success=True,
                    city=city,
                    forecast=forecasts,
                    source="mock",
                    using_fallback=True,
                    error=f"API returned status {response.status_code}"
                )
    except Exception as e:
        # Fallback on exception
        from datetime import timedelta
        today = datetime.now()
        forecasts = []
        
        for i in range(days):
            date = today + timedelta(days=i)
            forecasts.append(WeatherForecastDay(
                date=date.strftime("%Y-%m-%d"),
                max_temp=35.0 - (i * 0.5),
                min_temp=24.0 + (i * 0.3),
                description="Partly Cloudy",
                precipitation_probability=10.0 + (i * 5)
            ))
        
        return WeatherResponse(
            success=True,
            city=city,
            forecast=forecasts,
            source="mock",
            using_fallback=True,
            error=str(e)
        )


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@app.get("/api/voices/{language_code}")
async def list_voices(language_code: str = "mr-IN"):
    """List available TTS voices for a language."""
    try:
        client = get_tts_client()
        response = client.list_voices(language_code=language_code)
        
        voices = []
        for voice in response.voices:
            voices.append({
                "name": voice.name,
                "gender": texttospeech.SsmlVoiceGender(voice.ssml_gender).name,
                "sample_rate": voice.natural_sample_rate_hertz
            })
        
        return {"language": language_code, "voices": voices}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8001))
    
    print(f"""
    ╔══════════════════════════════════════════════════════════╗
    ║     🌾 Smart Agro - Marathi Voice Bot API Server        ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Starting server on http://localhost:{port}               ║
    ║                                                          ║
    ║  Endpoints:                                              ║
    ║    POST /api/speech-to-text   - Audio to text            ║
    ║    POST /api/text-to-speech   - Text to audio            ║
    ║    POST /api/dialogflow       - Dialogflow CX response   ║
    ║    POST /api/process          - Full pipeline            ║
    ║    WS   /ws/conversation/{{id}} - Real-time chat          ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
