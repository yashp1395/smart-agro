#!/bin/bash
# Start Voice Bot Backend (FastAPI)
# Port: 8001

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🎙️  Starting Voice Bot Backend on http://localhost:8001"

cd "$PROJECT_ROOT/smart-agro/voice-bot-backend"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
fi

uvicorn server:app --host 0.0.0.0 --port 8001 --reload
