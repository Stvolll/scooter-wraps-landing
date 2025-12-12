#!/bin/bash

# Финальный скрипт для push в созданный репозиторий
# Использование: bash final_push.sh

set -e

cd /Users/anatolii/scooter-wraps-landing

echo "🚀 Настройка и push в GitHub"
echo ""

# Настраиваем remote
echo "📋 Настраиваю remote..."
git remote set-url origin https://github.com/Stvolll/scooter-wraps-landing.git

echo "✅ Remote настроен:"
git remote -v
echo ""

# Проверяем статус
echo "📊 Текущий статус:"
git status
echo ""

# Пытаемся использовать GitHub CLI для аутентификации
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    echo "✅ GitHub CLI авторизован"
    echo "🔧 Настраиваю Git для использования GitHub CLI..."
    git config --global credential.https://github.com.helper "!gh auth git-credential"
    echo ""
fi

# Выполняем push
echo "🔄 Выполняю push в GitHub..."
if git push -u origin main; then
    echo ""
    echo "✅ Успешно! Код отправлен в GitHub!"
    echo ""
    echo "🔗 Репозиторий: https://github.com/Stvolll/scooter-wraps-landing"
    echo ""
    echo "📊 Vercel автоматически задеплоит изменения через 1-3 минуты"
    echo "   Проверьте: https://vercel.com/dashboard"
    echo ""
    echo "✅ Сайты обновятся:"
    echo "   • txd.bike"
    echo "   • decalwrap.co"
else
    echo ""
    echo "❌ Ошибка при push"
    echo ""
    echo "Возможные решения:"
    echo "1. Авторизуйтесь в GitHub CLI: gh auth login"
    echo "2. Или используйте Personal Access Token (см. HOW_TO_GET_GITHUB_TOKEN.md)"
    echo ""
    exit 1
fi

