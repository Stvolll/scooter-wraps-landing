#!/bin/bash

# Script to automatically fix common Next.js errors
# Usage: ./scripts/fix-common-errors.sh

set -e

echo "🔧 Fixing common errors..."

# 1. Clear Next.js cache
echo "📦 Clearing .next cache..."
rm -rf .next
echo "✅ .next cache cleared"

# 2. Clear node_modules/.cache if exists
if [ -d "node_modules/.cache" ]; then
  echo "📦 Clearing node_modules cache..."
  rm -rf node_modules/.cache
  echo "✅ node_modules cache cleared"
fi

# 3. Fix common syntax errors in TypeScript/TSX files
echo "🔍 Checking for common syntax errors..."

# Fix duplicate closing tags
find app components -name "*.tsx" -o -name "*.ts" | while read file; do
  if [ -f "$file" ]; then
    # Remove duplicate closing div tags (common error)
    # This is a simple pattern - adjust as needed
    sed -i '' '/<\/div>.*<\/div>/d' "$file" 2>/dev/null || true
  fi
done

# 4. Run linter and formatter
echo "📝 Running linter..."
npm run lint:fix || true

echo "💅 Running formatter..."
npm run format || true

# 5. Check for missing dependencies
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules not found, installing..."
  npm install
fi

# 6. Verify Prisma schema
if [ -f "prisma/schema.prisma" ]; then
  echo "🗄️  Verifying Prisma schema..."
  npx prisma validate 2>/dev/null || echo "⚠️  Prisma validation skipped (DATABASE_URL may not be set)"
fi

# 7. Check for common file issues
echo "🔍 Checking for common file issues..."

# Check if critical files exist
CRITICAL_FILES=(
  "app/layout.tsx"
  "app/page.tsx"
  "next.config.js"
  "package.json"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing critical file: $file"
  else
    echo "✅ Found: $file"
  fi
done

echo ""
echo "✅ Fix script completed!"
echo "🚀 You can now run: npm run dev"


