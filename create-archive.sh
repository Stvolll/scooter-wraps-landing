#!/bin/bash
cd /Users/anatolii/scooter-wraps-landing

echo "Создание архива кода..."

tar -czf scooter-wraps-code.tar.gz \
  app/ \
  components/ \
  lib/ \
  prisma/ \
  config/ \
  hooks/ \
  contexts/ \
  types/ \
  locales/ \
  scripts/ \
  middleware.ts \
  next.config.js \
  package.json \
  tsconfig.json \
  tailwind.config.ts \
  .vscode/ \
  pyrightconfig.json \
  exclude.json \
  CODE_EXPORT_PATHS.txt \
  EXPORT_INFO.md \
  2>&1 | grep -v "Removing leading" || true

if [ -f "scooter-wraps-code.tar.gz" ]; then
  SIZE=$(du -h scooter-wraps-code.tar.gz | cut -f1)
  echo "✅ Архив создан: scooter-wraps-code.tar.gz"
  echo "📊 Размер: $SIZE"
  echo "📍 Полный путь: $(pwd)/scooter-wraps-code.tar.gz"
else
  echo "❌ Ошибка при создании архива"
fi




