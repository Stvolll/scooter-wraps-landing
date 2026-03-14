#!/bin/bash

# Скрипт для создания репозитория на GitHub
# Использование: bash create_repo.sh

set -e

cd /Users/anatolii/scooter-wraps-landing

echo "🚀 Создание репозитория на GitHub"
echo ""

# Проверяем, установлен ли GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI не установлен"
    echo ""
    echo "Установите:"
    echo "  brew install gh"
    echo ""
    echo "Или создайте репозиторий вручную через веб-интерфейс:"
    echo "  https://github.com/new"
    echo ""
    exit 1
fi

# Проверяем авторизацию
if ! gh auth status &> /dev/null; then
    echo "❌ Не авторизован в GitHub"
    echo ""
    echo "Выполните авторизацию:"
    echo "  gh auth login"
    echo ""
    exit 1
fi

echo "✅ GitHub CLI установлен и авторизован"
echo ""

# Проверяем, существует ли уже репозиторий
if gh repo view Stvolll/scooter-wraps-landing &> /dev/null; then
    echo "⚠️  Репозиторий уже существует!"
    echo ""
    echo "Настраиваю remote и выполняю push..."
    git remote set-url origin https://github.com/Stvolll/scooter-wraps-landing.git
    git push -u origin main
    echo ""
    echo "✅ Готово!"
    exit 0
fi

# Создаем репозиторий
echo "📦 Создаю репозиторий Stvolll/scooter-wraps-landing..."
echo ""

# Создаем репозиторий (публичный)
if gh repo create Stvolll/scooter-wraps-landing --public --source=. --remote=origin --push; then
    echo ""
    echo "✅ Репозиторий создан и код отправлен!"
    echo ""
    echo "🔗 Репозиторий: https://github.com/Stvolll/scooter-wraps-landing"
    echo ""
    echo "📊 Vercel автоматически задеплоит изменения через 1-3 минуты"
    echo "   Проверьте: https://vercel.com/dashboard"
else
    echo ""
    echo "❌ Ошибка при создании репозитория"
    echo ""
    echo "Возможные причины:"
    echo "1. Репозиторий уже существует"
    echo "2. Нет прав на создание репозиториев"
    echo "3. Проблемы с авторизацией"
    echo ""
    echo "Попробуйте создать вручную:"
    echo "  https://github.com/new"
    exit 1
fi





