#!/bin/bash

# Скрипт для авторизации в GitHub через GitHub CLI
# Использование: bash github_auth.sh

set -e

echo "🔐 Авторизация в GitHub"
echo ""

# Проверяем, установлен ли GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "📦 Устанавливаю GitHub CLI..."
    if command -v brew &> /dev/null; then
        brew install gh
    else
        echo "❌ Homebrew не установлен. Установите GitHub CLI вручную:"
        echo "   https://cli.github.com/"
        exit 1
    fi
fi

echo "✅ GitHub CLI установлен"
echo ""

# Проверяем, авторизован ли уже
if gh auth status &> /dev/null; then
    echo "✅ Уже авторизован в GitHub!"
    echo ""
    gh auth status
    echo ""
    echo "Продолжаем с push..."
else
    echo "🔑 Начинаю авторизацию..."
    echo ""
    echo "📝 Следуйте инструкциям:"
    echo "   1. Выберите: GitHub.com"
    echo "   2. Выберите: HTTPS"
    echo "   3. Выберите: Login with a web browser"
    echo "   4. Нажмите Enter для открытия браузера"
    echo "   5. Авторизуйтесь в браузере"
    echo ""
    
    # Запускаем авторизацию
    gh auth login
fi

echo ""
echo "🚀 Выполняю push..."
cd /Users/anatolii/scooter-wraps-landing

# Настраиваем Git для использования GitHub CLI как credential helper
git config --global credential.helper ""
git config --global credential.https://github.com.helper "!gh auth git-credential"

# Выполняем push
if git push origin main; then
    echo ""
    echo "✅ Успешно! Push выполнен!"
    echo ""
    echo "📊 Vercel автоматически задеплоит изменения через 1-3 минуты"
    echo "   Проверьте: https://vercel.com/dashboard"
else
    echo ""
    echo "❌ Ошибка при push"
    echo ""
    echo "Возможные причины:"
    echo "1. Репозиторий не существует или нет доступа"
    echo "2. Репозиторий находится в организации"
    echo ""
    echo "Проверьте:"
    echo "- Существует ли репозиторий: https://github.com/Stvolll/scooter-wraps-landing"
    exit 1
fi



