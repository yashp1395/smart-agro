#!/bin/bash
# Start Crop Prediction API (Flask)
# Port: 5000

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🌱 Starting Crop Prediction API on http://localhost:5000"

cd "$PROJECT_ROOT/crop-prediction-api"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "venv2" ]; then
    source venv2/bin/activate
fi

python app.py
