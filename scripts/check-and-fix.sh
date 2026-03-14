#!/bin/bash
cd "$(dirname "$0")/.."

echo "🔍 Проверка окружения..."

# 1. Проверка порта 3000
echo ""
echo "1️⃣ Проверка порта 3000..."
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "   ⚠️  Порт 3000 занят. Освобождаю..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null
  sleep 1
  echo "   ✅ Порт 3000 освобожден"
else
  echo "   ✅ Порт 3000 свободен"
fi

# 2. Проверка node_modules
echo ""
echo "2️⃣ Проверка зависимостей..."
if [ -d "node_modules" ]; then
  echo "   ✅ node_modules существует"
else
  echo "   ❌ node_modules не найден. Устанавливаю зависимости..."
  npm install
fi

# 3. Очистка кеша Next.js
echo ""
echo "3️⃣ Очистка кеша Next.js..."
if [ -d ".next" ]; then
  rm -rf .next
  echo "   ✅ Кеш .next удален"
else
  echo "   ℹ️  .next не существовал"
fi

# 4. Проверка .env.local
echo ""
echo "4️⃣ Проверка .env.local..."
if [ -f ".env.local" ]; then
  if grep -q "DATABASE_URL" .env.local; then
    echo "   ✅ .env.local существует и содержит DATABASE_URL"
  else
    echo "   ⚠️  .env.local существует, но DATABASE_URL не найден"
    echo "   💡 Добавьте DATABASE_URL в .env.local"
  fi
else
  echo "   ❌ .env.local не найден"
  echo "   💡 Создайте .env.local с DATABASE_URL"
fi

echo ""
echo "✅ Проверка завершена!"
echo ""
echo "🚀 Запуск сервера:"
echo "   npm run dev"




