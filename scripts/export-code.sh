#!/bin/bash
cd "$(dirname "$0")/.."

OUTPUT_FILE="./scooter-wraps-code-$(date +%Y%m%d-%H%M%S).tar.gz"

echo "📦 Создание архива кода..."
echo ""

# Создаем временную директорию для структурированного экспорта
TEMP_DIR=$(mktemp -d)
EXPORT_DIR="$TEMP_DIR/scooter-wraps-landing"

mkdir -p "$EXPORT_DIR"

# Копируем ключевые директории и файлы
echo "📁 Копирование файлов..."

# Директории
for dir in app components lib prisma config hooks contexts types locales public scripts; do
  if [ -d "$dir" ]; then
    echo "  ✓ $dir/"
    cp -r "$dir" "$EXPORT_DIR/" 2>/dev/null || true
  fi
done

# Конфигурационные файлы
for file in middleware.ts next.config.js package.json tsconfig.json tailwind.config.ts postcss.config.js vercel.json next-env.d.ts; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
    cp "$file" "$EXPORT_DIR/" 2>/dev/null || true
  fi
done

# Настройки
if [ -d ".vscode" ]; then
  echo "  ✓ .vscode/"
  cp -r ".vscode" "$EXPORT_DIR/" 2>/dev/null || true
fi

for file in pyrightconfig.json exclude.json .cursorignore .gitignore; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
    cp "$file" "$EXPORT_DIR/" 2>/dev/null || true
  fi
done

# Создаем архив
echo ""
echo "🗜️  Создание архива..."
cd "$TEMP_DIR"
tar -czf "$(pwd)/../scooter-wraps-code.tar.gz" scooter-wraps-landing/ 2>/dev/null
mv "$(pwd)/../scooter-wraps-code.tar.gz" "$(dirname "$0")/../"

# Очистка
rm -rf "$TEMP_DIR"

# Проверка результата
if [ -f "$(dirname "$0")/../scooter-wraps-code.tar.gz" ]; then
  SIZE=$(du -h "$(dirname "$0")/../scooter-wraps-code.tar.gz" | cut -f1)
  echo ""
  echo "✅ Архив создан успешно!"
  echo "📦 Файл: $(dirname "$0")/../scooter-wraps-code.tar.gz"
  echo "📊 Размер: $SIZE"
else
  echo ""
  echo "❌ Ошибка при создании архива"
  exit 1
fi




