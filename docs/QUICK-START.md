# 🚀 Quick Start Guide

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ or Bun installed
- Python 3.10+ installed
- Google Cloud account (for voice features)

## Step 1: Initial Setup (One-time)

### 1.1 Frontend Setup
```bash
cd smart-agro
npm install
cp .env.example .env
# Edit .env and add your API keys
```

### 1.2 Crop Prediction API Setup
```bash
cd Crop_prediction_ml_pipeline-main
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 1.3 Disease Detection API Setup
```bash
cd crop-disease-detection-master
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 1.4 Voice Bot Backend Setup
```bash
cd smart-agro/voice-bot-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add Google Cloud credentials
```

## Step 2: Start All Services

### Option A: Single Command (Recommended)
```bash
./scripts/start-all.sh
```

### Option B: Start Individually (4 Terminals)
```bash
# Terminal 1
./scripts/start-frontend.sh

# Terminal 2
./scripts/start-crop-prediction.sh

# Terminal 3
./scripts/start-disease-detection.sh

# Terminal 4
./scripts/start-voice-bot.sh
```

## Step 3: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173

## Step 4: Stop Services

```bash
./scripts/stop-all.sh
```

## Checking Service Status

```bash
./scripts/status.sh
```

## Troubleshooting

### "Port already in use" error
```bash
./scripts/stop-all.sh  # Kill existing services
```

### Module not found errors
```bash
cd <service-folder>
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend won't connect to backend
Check that all backend services are running:
```bash
./scripts/status.sh
```
