#!/bin/bash
# Auto-watch and fix script
# Monitors for errors and automatically fixes common issues

echo "🔍 Starting auto-watch mode..."
echo "Press Ctrl+C to stop"
echo ""

while true; do
  # Check for common errors in console
  if pgrep -f "next dev" > /dev/null; then
    echo "✅ Server is running"
  else
    echo "⚠️  Server not running, starting..."
    cd "$(dirname "$0")/.." && npm run dev > /dev/null 2>&1 &
  fi
  
  # Run auto-fix check
  node scripts/auto-fix.js
  
  sleep 10
done










