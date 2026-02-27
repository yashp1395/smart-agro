#!/bin/bash
# Start Frontend (React + Vite)
# Port: 5173

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🖥️  Starting Frontend on http://localhost:5173"

cd "$PROJECT_ROOT/smart-agro"
npm run dev
