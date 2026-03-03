#!/bin/bash
#===============================================================================
# Smart Agro - Start All Services
#===============================================================================
# This script starts all backend services and the frontend for demo purposes.
# Each service runs in a separate background process.
#
# Usage: ./scripts/start-all.sh
#        ./scripts/start-all.sh --kill   # Kill all services
#===============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Log directory
LOG_DIR="$PROJECT_ROOT/logs"
mkdir -p "$LOG_DIR"

# PID file to track running services
PID_FILE="$PROJECT_ROOT/.services.pid"

#-------------------------------------------------------------------------------
# Print banner
#-------------------------------------------------------------------------------
print_banner() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║           🌾 Smart Agro - Service Manager                        ║"
    echo "║                                                                  ║"
    echo "║   Frontend:              http://localhost:5173                   ║"
    echo "║   Crop Prediction API:   http://localhost:5000                   ║"
    echo "║   Disease Detection API: http://localhost:8000                   ║"
    echo "║   Voice Bot Backend:     http://localhost:8001                   ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

#-------------------------------------------------------------------------------
# Kill all services
#-------------------------------------------------------------------------------
kill_services() {
    echo -e "${YELLOW}🛑 Stopping all Smart Agro services...${NC}"
    
    # Kill by PID file if exists
    if [ -f "$PID_FILE" ]; then
        while read -r pid; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
                echo -e "   Killed process $pid"
            fi
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi
    
    # Kill by port as backup
    for port in 5000 5173 8000 8001; do
        pid=$(lsof -ti:$port 2>/dev/null || true)
        if [ -n "$pid" ]; then
            kill $pid 2>/dev/null || true
            echo -e "   Killed process on port $port"
        fi
    done
    
    echo -e "${GREEN}✓ All services stopped${NC}"
}

#-------------------------------------------------------------------------------
# Wait for service to be ready
#-------------------------------------------------------------------------------
wait_for_service() {
    local port=$1
    local name=$2
    local max_attempts=30
    local attempt=0
    
    echo -ne "   Waiting for $name (port $port)"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "http://localhost:$port" > /dev/null 2>&1 || \
           curl -s "http://localhost:$port/health" > /dev/null 2>&1 || \
           curl -s "http://localhost:$port/api/health" > /dev/null 2>&1; then
            echo -e " ${GREEN}✓${NC}"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
        echo -ne "."
    done
    
    echo -e " ${RED}✗ (timeout)${NC}"
    return 1
}

#-------------------------------------------------------------------------------
# Start Crop Prediction API (Flask - Port 5000)
#-------------------------------------------------------------------------------
start_crop_prediction() {
    echo -e "${BLUE}🌱 Starting Crop Prediction API...${NC}"
    
    cd "$PROJECT_ROOT/crop-prediction-api"
    
    # Activate venv and start
    if [ -d "venv" ]; then
        source venv/bin/activate
    elif [ -d "venv2" ]; then
        source venv2/bin/activate
    fi
    
    python3 app.py > "$LOG_DIR/crop-prediction.log" 2>&1 &
    echo $! >> "$PID_FILE"
    
    cd "$PROJECT_ROOT"
}

#-------------------------------------------------------------------------------
# Start Disease Detection API (FastAPI - Port 8000)
#-------------------------------------------------------------------------------
start_disease_detection() {
    echo -e "${BLUE}🔬 Starting Disease Detection API...${NC}"
    
    cd "$PROJECT_ROOT/disease-detection-api"
    
    # Activate venv and start
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    uvicorn app:app --host 0.0.0.0 --port 8000 > "$LOG_DIR/disease-detection.log" 2>&1 &
    echo $! >> "$PID_FILE"
    
    cd "$PROJECT_ROOT"
}

#-------------------------------------------------------------------------------
# Start Voice Bot Backend (FastAPI - Port 8001)
#-------------------------------------------------------------------------------
start_voice_bot() {
    echo -e "${BLUE}🎙️  Starting Voice Bot Backend...${NC}"
    
    cd "$PROJECT_ROOT/smart-agro/voice-bot-backend"
    
    # Activate venv and start
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    uvicorn server:app --host 0.0.0.0 --port 8001 > "$LOG_DIR/voice-bot.log" 2>&1 &
    echo $! >> "$PID_FILE"
    
    cd "$PROJECT_ROOT"
}

#-------------------------------------------------------------------------------
# Start Frontend (Vite - Port 5173)
#-------------------------------------------------------------------------------
start_frontend() {
    echo -e "${BLUE}🖥️  Starting Frontend...${NC}"
    
    cd "$PROJECT_ROOT/smart-agro"
    
    npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
    echo $! >> "$PID_FILE"
    
    cd "$PROJECT_ROOT"
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------
main() {
    # Handle --kill flag
    if [ "$1" == "--kill" ] || [ "$1" == "-k" ] || [ "$1" == "stop" ]; then
        kill_services
        exit 0
    fi
    
    print_banner
    
    # Clean up any existing services
    echo -e "${YELLOW}🧹 Cleaning up existing services...${NC}"
    kill_services 2>/dev/null || true
    echo ""
    
    # Clear PID file
    > "$PID_FILE"
    
    # Start all services
    echo -e "${CYAN}🚀 Starting all services...${NC}"
    echo ""
    
    start_crop_prediction
    start_disease_detection
    start_voice_bot
    start_frontend
    
    # Wait for services
    echo ""
    echo -e "${CYAN}⏳ Waiting for services to be ready...${NC}"
    
    wait_for_service 5000 "Crop Prediction API"
    wait_for_service 8000 "Disease Detection API"
    wait_for_service 8001 "Voice Bot Backend"
    wait_for_service 5173 "Frontend"
    
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ All services are running!${NC}"
    echo ""
    echo -e "   ${CYAN}Frontend:${NC}              http://localhost:5173"
    echo -e "   ${CYAN}Crop Prediction API:${NC}   http://localhost:5000"
    echo -e "   ${CYAN}Disease Detection API:${NC} http://localhost:8000"
    echo -e "   ${CYAN}Voice Bot Backend:${NC}     http://localhost:8001"
    echo ""
    echo -e "   ${YELLOW}Logs:${NC}                  $LOG_DIR/"
    echo -e "   ${YELLOW}Stop services:${NC}         ./scripts/start-all.sh --kill"
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Open browser
    if command -v xdg-open &> /dev/null; then
        echo -e "${BLUE}🌐 Opening browser...${NC}"
        sleep 2
        xdg-open "http://localhost:5173" 2>/dev/null || true
    fi
}

main "$@"
