#!/bin/bash
# Start Disease Detection API (FastAPI)
# Port: 8000

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔬 Starting Disease Detection API on http://localhost:8000"

cd "$PROJECT_ROOT/disease-detection-api"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
fi

uvicorn app:app --host 0.0.0.0 --port 8000 --reload
