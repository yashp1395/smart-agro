# 🌾 Smart Agro - Marathi Voice Bot Backend

A high-accuracy speech-to-speech conversational bot for Marathi (India) using Google Cloud APIs.

## 🏗️ Architecture

```
                    ┌─────────────────────────────────────────────────────┐
                    │                   User Interface                     │
                    │                  (React Frontend)                    │
                    └─────────────────────┬───────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FastAPI Server (server.py)                         │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────────────────┐ │
│  │  REST API    │   │  WebSocket API   │   │     Health Monitoring        │ │
│  │  /api/*      │   │  /ws/conversation│   │     /health                  │ │
│  └──────────────┘   └──────────────────┘   └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
          ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
          │  EARS           │   │  BRAIN          │   │  MOUTH          │
          │  Speech-to-Text │   │  Dialogflow CX  │   │  Text-to-Speech │
          │  (Chirp 2)      │   │  (Agent)        │   │  (Neural2)      │
          │  mr-IN          │   │  Multilingual   │   │  mr-IN-Neural2-A│
          └─────────────────┘   └─────────────────┘   └─────────────────┘
                    │                     │                     │
                    └─────────────────────┼─────────────────────┘
                                          ▼
                              ┌─────────────────────────┐
                              │    Google Cloud APIs    │
                              └─────────────────────────┘
```

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.10+
- Google Cloud account with billing enabled
- Service account with required permissions
- FFmpeg (for audio conversion)

### 2. Google Cloud Setup

#### Create a Google Cloud Project

```bash
# Install gcloud CLI if not installed
# Visit: https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create smart-agro-bot --name="Smart Agro Voice Bot"

# Set as active project
gcloud config set project smart-agro-bot

# Enable billing (required for APIs)
# Visit: https://console.cloud.google.com/billing
```

#### Enable Required APIs

```bash
# Enable Speech-to-Text API
gcloud services enable speech.googleapis.com

# Enable Text-to-Speech API
gcloud services enable texttospeech.googleapis.com

# Enable Dialogflow CX API
gcloud services enable dialogflow.googleapis.com
```

#### Create Service Account

```bash
# Create service account
gcloud iam service-accounts create smart-agro-bot \
    --display-name="Smart Agro Voice Bot"

# Grant required roles
gcloud projects add-iam-policy-binding smart-agro-bot \
    --member="serviceAccount:smart-agro-bot@smart-agro-bot.iam.gserviceaccount.com" \
    --role="roles/speech.client"

gcloud projects add-iam-policy-binding smart-agro-bot \
    --member="serviceAccount:smart-agro-bot@smart-agro-bot.iam.gserviceaccount.com" \
    --role="roles/texttospeech.client"

gcloud projects add-iam-policy-binding smart-agro-bot \
    --member="serviceAccount:smart-agro-bot@smart-agro-bot.iam.gserviceaccount.com" \
    --role="roles/dialogflow.client"

# Create and download key
gcloud iam service-accounts keys create ./service-account-key.json \
    --iam-account=smart-agro-bot@smart-agro-bot.iam.gserviceaccount.com
```

#### Create Dialogflow CX Agent

1. Go to [Dialogflow CX Console](https://dialogflow.cloud.google.com/cx)
2. Click "Create Agent"
3. Settings:
   - **Display name:** Smart Agro Bot
   - **Location:** global (or your preferred region)
   - **Default language:** Marathi (mr)
   - **Time zone:** Asia/Kolkata
4. Add intents for agricultural queries:
   - Weather queries
   - Crop recommendations
   - Market prices
   - Disease detection help
   - Water management
5. Note the **Agent ID** from the URL (e.g., `abc123-def456-...`)

### 3. Local Setup

```bash
# Navigate to voice bot directory
cd smart-agro/voice-bot-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install system dependencies (Ubuntu/Debian)
sudo apt-get install portaudio19-dev python3-pyaudio ffmpeg

# On macOS
brew install portaudio ffmpeg

# Copy and configure environment
cp .env.example .env

# Edit .env with your values
nano .env
```

### 4. Configure Environment

Edit `.env` file:

```env
GOOGLE_CLOUD_PROJECT=smart-agro-bot
DIALOGFLOW_LOCATION=global
DIALOGFLOW_AGENT_ID=your-agent-id-here
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
PORT=8001
```

### 5. Run the Bot

#### Option A: Standalone CLI Bot (with microphone)

```bash
# Activate virtual environment
source venv/bin/activate

# Run interactive bot
python main.py

# Choose option:
# 1 - Full bot with Dialogflow CX
# 2 - Simple keyword-based bot (no Dialogflow needed)
# 3 - Test Text-to-Speech only
# 4 - Test Speech-to-Text only
# 5 - List available voices
```

#### Option B: FastAPI Server (for web integration)

```bash
# Start API server
python server.py

# Or with uvicorn directly
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Server will be available at `http://localhost:8001`

## 📡 API Endpoints

### REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Check service health |
| `/api/speech-to-text` | POST | Convert audio file to text |
| `/api/speech-to-text/base64` | POST | Convert base64 audio to text |
| `/api/text-to-speech` | POST | Convert text to audio (base64) |
| `/api/text-to-speech/stream` | POST | Convert text to audio (stream) |
| `/api/dialogflow` | POST | Get Dialogflow CX response |
| `/api/process` | POST | Full speech-to-speech pipeline |
| `/api/voices/{lang}` | GET | List available TTS voices |

### WebSocket API

```
ws://localhost:8001/ws/conversation/{session_id}
```

**Send:**
```json
{
  "type": "audio",
  "data": "<base64_encoded_audio>",
  "language": "mr-IN"
}
```

**Receive:**
```json
{
  "type": "response",
  "user_text": "हवामान कसे आहे?",
  "bot_response": "आज हवामान चांगले आहे.",
  "audio": "<base64_encoded_mp3>"
}
```

## 🎤 Supported Voices

### Marathi (mr-IN)
- `mr-IN-Neural2-A` - Female (default)
- `mr-IN-Neural2-B` - Male
- `mr-IN-Wavenet-A` - Female
- `mr-IN-Wavenet-B` - Male

### Hindi (hi-IN) - Fallback
- `hi-IN-Neural2-A` - Female
- `hi-IN-Neural2-B` - Male
- `hi-IN-Neural2-C` - Male
- `hi-IN-Neural2-D` - Female

## 🔧 Troubleshooting

### Common Issues

1. **"Could not access microphone"**
   - Check microphone permissions
   - Install portaudio: `sudo apt-get install portaudio19-dev`

2. **"API rate limit exceeded"**
   - Check your Google Cloud quotas
   - Implement request throttling

3. **"Dialogflow agent not found"**
   - Verify PROJECT_ID, LOCATION, and AGENT_ID in .env
   - Check service account permissions

4. **"No speech detected"**
   - Ensure audio is in correct format (LINEAR16, 16kHz)
   - Check microphone input levels

### Logs Location

```bash
# View real-time logs
tail -f logs/voice_bot.log
```

## 📁 Project Structure

```
voice-bot-backend/
├── main.py              # Standalone CLI voice bot
├── server.py            # FastAPI server for web integration
├── requirements.txt     # Python dependencies
├── .env.example         # Environment template
├── .env                 # Your configuration (gitignored)
├── service-account-key.json  # Google Cloud credentials (gitignored)
└── README.md            # This file
```

## 🔐 Security Notes

- **NEVER** commit `service-account-key.json` to git
- **NEVER** commit `.env` with actual credentials
- Use environment variables in production
- Restrict CORS origins in production
- Implement rate limiting for public APIs

## 📞 Frontend Integration

See the VoiceBot component in the React frontend:
`smart-agro/src/components/VoiceBot.tsx`

The frontend connects to this backend via:
- REST API for one-shot processing
- WebSocket for real-time conversation

## 📄 License

Smart Agro Project - Agricultural AI Assistant
