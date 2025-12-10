#!/bin/bash
cd /Users/anatolii/scooter-wraps-landing

echo "🚀 Деплой на Vercel"
echo ""

# Проверка Vercel CLI
if ! command -v vercel &> /dev/null && [ ! -f node_modules/.bin/vercel ]; then
    echo "Устанавливаю Vercel CLI локально..."
    npm install --save-dev vercel
fi

# Используем npx если vercel не в PATH
if command -v vercel &> /dev/null; then
    VERCEL_CMD="vercel"
else
    VERCEL_CMD="npx vercel"
fi

echo "Используется: $VERCEL_CMD"
echo ""

# Проверка логина
echo "Проверка авторизации..."
$VERCEL_CMD whoami 2>&1 | head -3

echo ""
echo "Для деплоя выполните:"
echo "  $VERCEL_CMD --prod"
echo ""
echo "Или откройте: https://vercel.com/new"
