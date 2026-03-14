#!/bin/bash

# Скрипт для экспорта всего кода проекта в один текстовый файл

OUTPUT_FILE="PROJECT_CODE.txt"
EXCLUDE_PATTERNS="node_modules|\.next|\.git|dist|build|coverage|\.turbo|\.cache"

echo "📦 Начинаю экспорт кода проекта..."
echo ""

# Очищаем предыдущий файл
> "$OUTPUT_FILE"

# Заголовок
{
    echo "========================================"
    echo "КОД ПРОЕКТА: SCOOTER WRAPS LANDING"
    echo "Дата экспорта: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "========================================"
    echo ""
} >> "$OUTPUT_FILE"

# Функция для добавления файла
add_file() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "Добавляю: $file"
        {
            echo ""
            echo "========================================"
            echo "ФАЙЛ: $file"
            echo "========================================"
            echo ""
            cat "$file"
            echo ""
        } >> "$OUTPUT_FILE"
    fi
}

# Основные конфигурационные файлы
echo "📄 Конфигурационные файлы..."
add_file "package.json"
add_file "next.config.js"
add_file "tsconfig.json"
add_file "tailwind.config.ts"
add_file "postcss.config.js"
add_file "middleware.ts"

# Prisma
echo "📄 Prisma схема..."
add_file "prisma/schema.prisma"
[ -f "prisma/seed.ts" ] && add_file "prisma/seed.ts"

# Lib файлы
echo "📄 Библиотеки и утилиты..."
find lib -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | sort | while read f; do
    add_file "$f"
done

# Компоненты
echo "📄 Компоненты..."
find components -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) 2>/dev/null | sort | while read f; do
    add_file "$f"
done

# API Routes
echo "📄 API Routes..."
find app/api -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | sort | while read f; do
    add_file "$f"
done

# Pages (app directory)
echo "📄 Страницы (app)..."
find app -type f \( -name "page.tsx" -o -name "layout.tsx" -o -name "*.tsx" -o -name "error.tsx" -o -name "not-found.tsx" \) ! -path "*/api/*" 2>/dev/null | sort | while read f; do
    add_file "$f"
done

# Config
echo "📄 Конфигурация..."
[ -f "config/scooters.js" ] && add_file "config/scooters.js"

# Locales
echo "📄 Локализация..."
find locales -type f -name "*.json" 2>/dev/null | sort | while read f; do
    add_file "$f"
done

# Hooks
echo "📄 Hooks..."
find hooks -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | sort | while read f; do
    add_file "$f"
done

# Contexts
echo "📄 Contexts..."
find contexts -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | sort | while read f; do
    add_file "$f"
done

# Types
echo "📄 Types..."
find types -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | sort | while read f; do
    add_file "$f"
done

# Scripts
echo "📄 Scripts..."
find scripts -type f \( -name "*.ts" -o -name "*.js" \) 2>/dev/null | sort | while read f; do
    add_file "$f"
done

echo ""
echo "✅ Экспорт завершен!"
echo "📊 Файл: $OUTPUT_FILE"
echo "📊 Размер: $(du -h "$OUTPUT_FILE" | cut -f1)"
echo ""
echo "💡 Файл содержит весь код проекта (исключая node_modules, .next, .git)"


