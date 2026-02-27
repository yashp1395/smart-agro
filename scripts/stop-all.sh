#!/bin/bash
# Stop all Smart Agro services

echo "🛑 Stopping all Smart Agro services..."

# Kill by port
for port in 5000 5173 8000 8001; do
    pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
        kill $pid 2>/dev/null || true
        echo "   ✓ Stopped service on port $port (PID: $pid)"
    else
        echo "   - No service running on port $port"
    fi
done

# Remove PID file if exists
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
rm -f "$PROJECT_ROOT/.services.pid"

echo ""
echo "✅ All services stopped"
