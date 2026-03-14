#!/bin/bash
cd "$(dirname "$0")/.."

echo "🛑 Остановка всех процессов Next.js..."
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "node.*dev" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

echo "🧹 Очистка кеша..."
rm -rf .next node_modules/.cache

echo "✅ Готово к запуску"
echo ""
echo "📝 Запустите сервер вручную командой:"
echo "   npm run dev"
echo ""
echo "Или запустите в фоне:"
echo "   npm run dev > /tmp/nextjs.log 2>&1 &"
echo "   tail -f /tmp/nextjs.log"




