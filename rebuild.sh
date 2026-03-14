#!/bin/bash
cd "$(dirname "$0")"

echo "🛑 Остановка процессов..."
pkill -f "next dev" 2>/dev/null
pkill -f "node.*dev" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

echo "🧹 Очистка кеша..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Кеш очищен"

echo "🔨 Запуск сборки..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Сборка успешна!"
  echo "🚀 Запуск dev-сервера..."
  npm run dev
else
  echo "❌ Ошибка сборки. Проверьте вывод выше."
  exit 1
fi




