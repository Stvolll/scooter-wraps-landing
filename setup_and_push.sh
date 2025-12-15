#!/bin/bash

# Скрипт для настройки Git и выполнения push
# Использование: bash setup_and_push.sh

set -e

echo "🚀 Настройка Git и выполнение push"
echo ""

cd /Users/anatolii/scooter-wraps-landing

# Проверяем текущий remote
echo "📋 Текущий remote URL:"
git remote get-url origin
echo ""

# Вариант 1: Использовать токен через URL (временный)
echo "📝 Вариант 1: Push с токеном через URL"
echo ""
echo "Если у вас есть токен, выполните:"
echo "  git push https://YOUR_TOKEN@github.com/Stvolll/scooter-wraps-landing.git main"
echo ""
echo "Где YOUR_TOKEN - ваш Personal Access Token"
echo ""

# Вариант 2: Настроить credential helper
echo "📝 Вариант 2: Сохранить токен в credential helper"
echo ""
echo "Выполните команду (замените YOUR_TOKEN на ваш токен):"
echo "  git credential approve <<EOF"
echo "  protocol=https"
echo "  host=github.com"
echo "  username=Stvolll"
echo "  password=YOUR_TOKEN"
echo "  EOF"
echo ""
echo "Затем выполните:"
echo "  git push origin main"
echo ""

# Вариант 3: GitHub CLI
echo "📝 Вариант 3: Использовать GitHub CLI (если установлен)"
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI установлен!"
    echo ""
    echo "Выполните:"
    echo "  gh auth login"
    echo "  git push origin main"
else
    echo "❌ GitHub CLI не установлен"
    echo "Установите: brew install gh"
fi
echo ""

# Вариант 4: Проверить организацию
echo "📝 Вариант 4: Проверить, может репозиторий в организации"
echo ""
echo "Если репозиторий находится в организации (не у пользователя Stvolll),"
echo "нужно использовать URL организации:"
echo "  git remote set-url origin https://github.com/ORGANIZATION/scooter-wraps-landing.git"
echo ""

echo "---"
echo "❓ Какой вариант использовать?"
echo ""
echo "Рекомендую Вариант 2 - он сохранит токен и больше не будет запрашивать пароль."
echo ""



