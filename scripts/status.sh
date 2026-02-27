#!/bin/bash
# Check status of all Smart Agro services

echo ""
echo "📊 Smart Agro Services Status"
echo "════════════════════════════════════════════════"

check_service() {
    local port=$1
    local name=$2
    local url=$3
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "✅ $name (port $port) - RUNNING"
    else
        echo -e "❌ $name (port $port) - NOT RUNNING"
    fi
}

check_service 5173 "Frontend            " "http://localhost:5173"
check_service 5000 "Crop Prediction API " "http://localhost:5000/api/health"
check_service 8000 "Disease Detection   " "http://localhost:8000/health"
check_service 8001 "Voice Bot Backend   " "http://localhost:8001/health"

echo "════════════════════════════════════════════════"
echo ""
