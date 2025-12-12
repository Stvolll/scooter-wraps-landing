#!/bin/bash

# Скрипт для проверки статуса деплоя на Vercel
# Использование: bash check_deployment.sh

set -e

cd /Users/anatolii/scooter-wraps-landing

echo "🔍 Проверка статуса деплоя"
echo ""

# Проверяем статус Git
echo "📊 Статус Git:"
git status --short || echo "Нет изменений"
echo ""

# Проверяем последние коммиты
echo "📝 Последние коммиты:"
git log --oneline -5
echo ""

# Проверяем remote
echo "🔗 Remote репозиторий:"
git remote -v
echo ""

# Проверяем, есть ли код в GitHub
echo "🌐 Проверка репозитория на GitHub:"
if git ls-remote --heads origin main &> /dev/null; then
    echo "✅ Репозиторий существует и доступен"
    echo ""
    echo "🔗 URL: https://github.com/Stvolll/scooter-wraps-landing"
else
    echo "⚠️  Репозиторий не найден или нет доступа"
    echo "   Выполните: git push -u origin main"
fi
echo ""

# Проверяем Vercel CLI
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI установлен"
    echo ""
    echo "📋 Последние деплои:"
    vercel ls 2>&1 | head -10 || echo "Не удалось получить список деплоев"
else
    echo "⚠️  Vercel CLI не установлен"
    echo ""
    echo "Проверьте статус деплоя вручную:"
    echo "  https://vercel.com/dashboard"
fi
echo ""

echo "---"
echo "🌐 Проверьте сайты:"
echo "  • txd.bike"
echo "  • decalwrap.co"
echo ""
echo "📊 Vercel Dashboard:"
echo "  https://vercel.com/dashboard"
echo ""

