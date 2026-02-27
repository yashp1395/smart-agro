# 📋 API Reference

## Service URLs

| Service | Base URL | Health Check |
|---------|----------|--------------|
| Crop Prediction | http://localhost:5000 | `/api/health` |
| Disease Detection | http://localhost:8000 | `/health` |
| Voice Bot | http://localhost:8001 | `/health` |

---

## Crop Prediction API (Port 5000)

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "crop-prediction-api"
}
```

### Predict Crop Yield
```http
POST /api/predict
Content-Type: application/json
```

**Request Body:**
```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "pH": 6.5,
  "rainfall": 202.9,
  "temperature": 20.87,
  "Area_in_hectares": 5.0,
  "State_Name": "Maharashtra",
  "Crop_Type": "Kharif",
  "Crop": "Rice"
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "production": 125.5,
    "yield": 25.1
  }
}
```

---

## Disease Detection API (Port 8000)

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "classes_count": 39
}
```

### Get Available Classes
```http
GET /classes
```

**Response:**
```json
{
  "classes": [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    ...
  ],
  "count": 39
}
```

### Predict Disease
```http
POST /predict
Content-Type: multipart/form-data
```

**Request:**
- `file` (file): Image file (JPG, PNG)
- `language` (optional): Language code (en, hi, mr)

**Response:**
```json
{
  "success": true,
  "prediction": {
    "disease": "Tomato___Late_blight",
    "confidence": 0.95,
    "name": {
      "en": "Late Blight",
      "hi": "पछेती झुलसा",
      "mr": "उशिरा येणारा करपा"
    },
    "risk": "high",
    "treatment": [...]
  }
}
```

---

## Voice Bot API (Port 8001)

### Health Check
```http
GET /health
```

### Speech to Text
```http
POST /api/speech-to-text
Content-Type: multipart/form-data
```

**Request:**
- `file` (file): Audio file (WAV, MP3)

**Response:**
```json
{
  "transcript": "माझ्या शेतात टोमॅटोवर रोग आहे",
  "confidence": 0.92,
  "language": "mr-IN"
}
```

### Text to Speech
```http
POST /api/text-to-speech
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "तुमच्या टोमॅटोवर उशिरा येणारा करपा रोग आहे",
  "language_code": "mr-IN"
}
```

**Response:**
Audio file stream (WAV)

### Dialogflow Query
```http
POST /api/dialogflow
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "माझ्या शेतात टोमॅटोवर रोग आहे",
  "session_id": "user-123",
  "language_code": "mr-IN"
}
```

### Full Pipeline (Speech to Speech)
```http
POST /api/process
Content-Type: application/json
```

**Request Body:**
```json
{
  "audio_base64": "<base64_encoded_audio>",
  "session_id": "user-123",
  "language_code": "mr-IN"
}
```

### WebSocket Real-time Conversation
```websocket
WS /ws/conversation/{session_id}
```

Send audio chunks, receive text and audio responses in real-time.

---

## Error Responses

All APIs return errors in this format:
```json
{
  "success": false,
  "error": "Error message",
  "detail": "Detailed error description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid input)
- `422` - Validation error
- `500` - Server error
