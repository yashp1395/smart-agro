# Crop Disease Detection Using Deep Learning

This project uses Convolutional Neural Network (ResNet18) to identify different types of diseases in plants using images of their leaves. It integrates with the Smart-Agro frontend application.

## Features

- **39 Disease Classes**: Detects diseases across Apple, Tomato, Potato, Corn, Grape, and other crops
- **REST API**: FastAPI backend for easy integration
- **Multilingual Support**: Returns results in English, Hindi, and Marathi
- **Treatment Recommendations**: Provides actionable treatment steps for each disease

## Quick Start

### 1. Install Dependencies

```bash
cd crop-disease-detection-master
pip install -r requirements.txt
```

### 2. Run the API Server

```bash
python app.py
```

Or with uvicorn directly:


```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 3. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Detailed health status |
| `/classes` | GET | List all detectable diseases |
| `/predict` | POST | Upload image for disease detection |

### 4. Example Usage

```bash
# Check API health
curl http://localhost:8000/health

# Predict disease from image
curl -X POST "http://localhost:8000/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/leaf_image.jpg"
```

## Training the Model

To train the model with your own data:

```bash
python train.py
```

The model will be saved in `lightning_logs/` directory.

## Integration with Smart-Agro

The Smart-Agro frontend automatically connects to this API. Make sure:

1. The API is running on `http://localhost:8000`
2. Or set `VITE_DISEASE_API_URL` in Smart-Agro's `.env` file

## Dataset

Uses the Plant Village Dataset with 39 classes of plant diseases:
- Apple (4 classes)
- Blueberry (1 class)
- Cherry (2 classes)
- Corn/Maize (4 classes)
- Grape (4 classes)
- Orange (1 class)
- Peach (2 classes)
- Pepper (2 classes)
- Potato (3 classes)
- Raspberry (1 class)
- Soybean (1 class)
- Squash (1 class)
- Strawberry (2 classes)
- Tomato (10 classes)

## Model Architecture

- **Base Model**: ResNet18
- **Input Size**: 150x150 RGB images
- **Optimizer**: SGD with OneCycleLR scheduler
- **Framework**: PyTorch Lightning
