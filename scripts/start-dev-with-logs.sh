#!/bin/bash
cd "$(dirname "$0")/.." # Navigate to project root

echo "🛑 Остановка существующих процессов..."
pkill -f "next dev" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

echo "🧹 Очистка кеша..."
rm -rf .next

echo "🔍 Проверка зависимостей..."
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules не найден. Устанавливаю зависимости..."
  npm install
fi

echo "🔍 Проверка .env.local..."
if [ ! -f ".env.local" ]; then
  echo "⚠️  .env.local не найден. Убедитесь, что DATABASE_URL настроен."
else
  echo "✅ .env.local существует"
fi

echo "🚀 Запуск dev-сервера..."
echo "📋 Логи будут выводиться ниже. Нажмите Ctrl+C для остановки."
echo ""

npm run dev 2>&1 | tee /tmp/nextjs-dev.log




