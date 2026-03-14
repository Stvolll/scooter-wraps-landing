#!/bin/bash

# Скрипт для удаления репозиториев на GitHub
# Использование: bash delete_repos.sh

set -e

echo "🗑️  Удаление репозиториев на GitHub"
echo ""

# Проверяем, установлен ли GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI не установлен"
    echo ""
    echo "Установите: brew install gh"
    echo "Или удалите репозитории вручную через веб-интерфейс (см. DELETE_REPOS_INSTRUCTIONS.md)"
    exit 1
fi

# Проверяем авторизацию
if ! gh auth status &> /dev/null; then
    echo "❌ Не авторизован в GitHub"
    echo ""
    echo "Выполните авторизацию:"
    echo "  gh auth login"
    exit 1
fi

echo "✅ GitHub CLI установлен и авторизован"
echo ""

# Список репозиториев для удаления
repos=(
    "Stvolll/TXD"
    "Stvolll/lead"
    "Stvolll/scooter-3d-model"
)

# Удаляем каждый репозиторий
for repo in "${repos[@]}"; do
    echo "🔍 Проверяю репозиторий: $repo"
    
    if gh repo view "$repo" &> /dev/null; then
        echo "   ✅ Репозиторий существует"
        echo "   ⚠️  Удаляю..."
        
        if gh repo delete "$repo" --yes; then
            echo "   ✅ Репозиторий $repo удален"
        else
            echo "   ❌ Ошибка при удалении $repo"
        fi
    else
        echo "   ℹ️  Репозиторий $repo не найден или уже удален"
    fi
    echo ""
done

echo "✅ Готово! Проверка завершена."





