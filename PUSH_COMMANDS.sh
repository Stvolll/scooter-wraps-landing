#!/bin/bash

# Скрипт для выполнения git push
# Запустите этот файл в терминале: bash PUSH_COMMANDS.sh

echo "🚀 Начинаем push в GitHub..."
echo ""

# Переходим в директорию проекта
cd /Users/anatolii/scooter-wraps-landing

# Проверяем статус
echo "📊 Текущий статус репозитория:"
git status

echo ""
echo "📝 Последние коммиты:"
git log --oneline -5

echo ""
echo "🔄 Выполняем push..."
git push origin main

echo ""
echo "✅ Готово! Если были ошибки аутентификации, следуйте инструкциям выше."





