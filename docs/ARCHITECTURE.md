# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           🌾 Smart Agro Platform                         │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Frontend (React + Vite)                         │
│                            Port: 5173                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Dashboard │ │ Predict  │ │ Disease  │ │  Voice   │ │  Market  │      │
│  │   Page   │ │   Page   │ │Detection │ │   Bot    │ │  Prices  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
         │               │               │               │
         ▼               ▼               ▼               ▼
    ┌─────────┐    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │ Weather │    │    Crop     │  │   Disease   │  │  Voice Bot  │
    │   API   │    │ Prediction  │  │  Detection  │  │   Backend   │
    │(OpenWea)│    │    API      │  │     API     │  │             │
    └─────────┘    │  Port:5000  │  │  Port:8000  │  │  Port:8001  │
                   └─────────────┘  └─────────────┘  └─────────────┘
                         │               │               │
                         ▼               ▼               ▼
                   ┌─────────┐    ┌─────────────┐  ┌─────────────┐
                   │scikit-  │    │   PyTorch   │  │Google Cloud │
                   │ learn   │    │  ResNet18   │  │ Speech/TTS/ │
                   │ Model   │    │   Model     │  │ Dialogflow  │
                   └─────────┘    └─────────────┘  └─────────────┘
```

## Data Flow

### 1. Crop Yield Prediction Flow
```
User Input (Soil params) → Frontend → Crop Prediction API → ML Model → Prediction Result
```

### 2. Disease Detection Flow
```
User Upload (Image) → Frontend → Disease Detection API → PyTorch Model → Disease + Treatment
```

### 3. Voice Assistant Flow
```
User Speech → Frontend → Voice Bot API → Google STT → Dialogflow CX → Google TTS → Audio Response
```

## Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Routing**: React Router
- **i18n**: react-i18next (EN, HI, MR)

### Crop Prediction API
- **Framework**: Flask
- **ML Library**: scikit-learn
- **Data Processing**: Pandas, NumPy
- **Database**: MongoDB (for historical data)

### Disease Detection API
- **Framework**: FastAPI
- **Deep Learning**: PyTorch
- **Model**: ResNet18 (fine-tuned on PlantVillage)
- **Image Processing**: Pillow, torchvision

### Voice Bot Backend
- **Framework**: FastAPI
- **Speech-to-Text**: Google Cloud Speech API
- **Text-to-Speech**: Google Cloud TTS (Neural voices)
- **NLU**: Dialogflow CX
- **WebSocket**: Real-time conversation

## ML Models

### Crop Yield Prediction Model
- **Algorithm**: Random Forest / Gradient Boosting
- **Input Features**: N, P, K, pH, rainfall, temperature, area, state, crop type
- **Output**: Production (tons), Yield (tons/hectare)
- **Training Data**: Historical crop data from Indian agriculture

### Disease Detection Model
- **Architecture**: ResNet18 (pretrained on ImageNet)
- **Classes**: 39 plant disease classes
- **Dataset**: PlantVillage Dataset
- **Accuracy**: ~95% on test set
- **Input**: 224x224 RGB image
- **Output**: Disease class + confidence score

## Supported Languages

| Language | Code | STT | TTS | UI |
|----------|------|-----|-----|-----|
| English | en | ✅ | ✅ | ✅ |
| Hindi | hi | ✅ | ✅ | ✅ |
| Marathi | mr | ✅ | ✅ | ✅ |

## Security Considerations

- CORS enabled for frontend origin
- API keys stored in environment variables
- Google Cloud credentials via service account
- No sensitive data logged

## Scalability

Current architecture supports:
- Horizontal scaling of backend APIs
- CDN for frontend assets
- Model caching for faster inference
- WebSocket for real-time features
