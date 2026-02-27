# 🌾 Smart Agro - Intelligent Farming Platform

A comprehensive AI-powered agricultural platform that helps farmers with crop prediction, disease detection, and voice-based assistance in multiple languages (English, Hindi, Marathi).

---

## 📁 Project Structure

```
Cybage-Hack/
├── smart-agro/                    # 🖥️ Frontend (React + TypeScript)
│   ├── src/                       # Frontend source code
│   ├── voice-bot-backend/         # 🎙️ Voice Bot API (FastAPI)
│   └── package.json               # Frontend dependencies
│
├── crop-prediction-api/           # 🌱 Crop Yield Prediction API (Flask)
│   ├── app.py                     # Main Flask application
│   ├── src/                       # ML pipeline source code
│   └── templates/                 # HTML templates
│
├── disease-detection-api/         # 🔬 Disease Detection API (FastAPI)
│   ├── app.py                     # Main FastAPI application
│   ├── best_model.pth             # Trained PyTorch model
│   └── Plant_leave_diseases_dataset/  # Training dataset
│
├── scripts/                       # 🚀 Startup & utility scripts
├── docs/                          # 📚 Documentation
└── logs/                          # 📝 Application logs
```

---

## 🚀 Services Overview

| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| **Frontend** | React + Vite + TypeScript | `5173` | Main web application UI |
| **Crop Prediction API** | Flask + scikit-learn | `5000` | ML-based crop yield prediction |
| **Disease Detection API** | FastAPI + PyTorch | `8000` | Image-based plant disease detection |
| **Voice Bot Backend** | FastAPI + Google Cloud | `8001` | Marathi voice assistant |

---

## ⚡ Quick Start

### Option 1: Start All Services (Recommended for Demo)

```bash
# Make the script executable (first time only)
chmod +x scripts/start-all.sh

# Start all services
./scripts/start-all.sh
```

### Option 2: Start Services Individually

```bash
# Terminal 1 - Frontend
cd smart-agro && npm run dev

# Terminal 2 - Crop Prediction API
cd crop-prediction-api
source venv/bin/activate
python app.py

# Terminal 3 - Disease Detection API
cd disease-detection-api
source venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000

# Terminal 4 - Voice Bot Backend
cd smart-agro/voice-bot-backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

---

## 🔧 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ / Bun
- Google Cloud credentials (for voice bot)

### 1. Clone and Setup

```bash
cd /home/sameer/Desktop/Cybage-Hack
```

### 2. Setup Each Service

#### Frontend (smart-agro)
```bash
cd smart-agro
npm install
cp .env.example .env
# Edit .env with your API keys
```

#### Crop Prediction API
```bash
cd crop-prediction-api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Disease Detection API
```bash
cd disease-detection-api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Voice Bot Backend
```bash
cd smart-agro/voice-bot-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add Google Cloud credentials
```

---

## 🔑 Environment Variables

### Frontend (.env)
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_WEATHER_API_KEY=your_openweather_api_key
VITE_CROP_PREDICTION_API=http://localhost:5000
VITE_DISEASE_DETECTION_API=http://localhost:8000
VITE_VOICE_BOT_API=http://localhost:8001
```

### Voice Bot Backend (.env)
```env
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GOOGLE_CLOUD_PROJECT=your-project-id
DIALOGFLOW_AGENT_ID=your-agent-id
DIALOGFLOW_LOCATION=global
PORT=8001
```

---

## 🌐 API Endpoints

### Crop Prediction API (Port 5000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Web interface |
| POST | `/predict` | Form-based prediction |
| POST | `/api/predict` | JSON API for frontend |
| GET | `/api/health` | Health check |

### Disease Detection API (Port 8000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| POST | `/predict` | Upload image for detection |
| GET | `/health` | Health check |
| GET | `/classes` | List disease classes |

### Voice Bot API (Port 8001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/speech-to-text` | Audio to text |
| POST | `/api/text-to-speech` | Text to audio |
| POST | `/api/dialogflow` | Dialogflow response |
| POST | `/api/process` | Full pipeline |
| WS | `/ws/conversation/{id}` | Real-time chat |

---

## 🎥 Demo Recording Checklist

1. **Start Services** - Run `./scripts/start-all.sh`
2. **Open Browser** - Navigate to `http://localhost:5173`
3. **Features to Demo**:
   - [ ] Dashboard overview
   - [ ] Crop yield prediction with soil parameters
   - [ ] Disease detection (upload plant image)
   - [ ] Voice assistant in Marathi
   - [ ] Market price information
   - [ ] Weather integration
   - [ ] Multi-language support (EN/HI/MR)

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
lsof -ti:8000 | xargs kill -9
lsof -ti:8001 | xargs kill -9
```

### Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Google Cloud Authentication
```bash
# Set credentials
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"

# Verify authentication
gcloud auth application-default print-access-token
```

---

## 📊 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend APIs**: Flask, FastAPI, Uvicorn
- **ML/AI**: scikit-learn, PyTorch, ResNet18
- **Voice**: Google Cloud Speech-to-Text, Text-to-Speech, Dialogflow CX
- **Database**: MongoDB (crop data)

---

## 👥 Team

Smart Agro Team - Cybage Hackathon 2026

---

## 📄 License

This project is developed for the Cybage Hackathon 2026.
