#!/bin/bash

# Автоматический скрипт для push в GitHub
# Использование: bash auto_push.sh

set -e

cd /Users/anatolii/scooter-wraps-landing

echo "🚀 Автоматический push в GitHub"
echo ""

# Проверяем, есть ли изменения для push
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Есть незакоммиченные изменения!"
    echo "Хотите закоммитить их? (y/n)"
    read -r answer
    if [ "$answer" = "y" ]; then
        git add .
        echo "Введите сообщение коммита:"
        read -r commit_message
        git commit -m "$commit_message"
    fi
fi

# Проверяем, есть ли что-то для push
if ! git rev-parse --verify origin/main > /dev/null 2>&1; then
    echo "⚠️  Remote branch origin/main не найден"
    echo "Создаю и отправляю..."
    git push -u origin main
    exit 0
fi

# Запрашиваем токен
echo "📝 Введите ваш GitHub Personal Access Token:"
echo "   (Токен можно создать здесь: https://github.com/settings/tokens)"
echo "   (Токен начинается с 'ghp_...')"
echo ""
read -rs token
echo ""

if [ -z "$token" ]; then
    echo "❌ Токен не введен. Выход."
    exit 1
fi

# Сохраняем токен в credential helper
echo "💾 Сохраняю токен в Git credential helper..."
git credential approve <<EOF
protocol=https
host=github.com
username=Stvolll
password=$token
EOF

echo "✅ Токен сохранен!"
echo ""

# Выполняем push
echo "🔄 Выполняю push..."
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
    echo "2. Токен неверный или не имеет прав 'repo'"
    echo "3. Репозиторий находится в организации (не у пользователя Stvolll)"
    echo ""
    echo "Проверьте:"
    echo "- Существует ли репозиторий: https://github.com/Stvolll/scooter-wraps-landing"
    echo "- Правильность токена и его права доступа"
    exit 1
fi





