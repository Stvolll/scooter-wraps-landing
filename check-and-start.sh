#!/bin/bash
cd "$(dirname "$0")"

echo "=== Проверка окружения ==="
echo "Node version: $(node --version 2>&1)"
echo "NPM version: $(npm --version 2>&1)"
echo ""

echo "=== Остановка старых процессов ==="
pkill -f "next dev" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

echo "=== Проверка файлов ==="
[ -f ".env.local" ] && echo "✅ .env.local существует" || echo "❌ .env.local отсутствует"
[ -d "node_modules" ] && echo "✅ node_modules существует" || echo "❌ node_modules отсутствует - запустите npm install"
[ -f "next.config.js" ] && echo "✅ next.config.js существует" || echo "❌ next.config.js отсутствует"
echo ""

echo "=== Очистка кеша ==="
rm -rf .next
echo "✅ Кеш очищен"
echo ""

echo "=== Запуск сервера ==="
echo "Сервер запускается... Логи будут выведены ниже:"
echo ""

npm run dev 2>&1




