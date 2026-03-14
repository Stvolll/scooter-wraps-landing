#!/bin/bash
cd "$(dirname "$0")/.."

echo "🔍 Проверка зависимостей..."
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules не найден. Запустите: npm install"
  exit 1
fi

echo "🧹 Очистка порта 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

echo "🚀 Запуск dev-сервера..."
npm run dev




