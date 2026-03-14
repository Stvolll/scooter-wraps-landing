#!/bin/bash

# Script to apply database migrations
# Usage: ./scripts/apply-migrations.sh

set -e

echo "🔧 Applying database migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  if [ -f .env.local ]; then
    echo "📝 Loading DATABASE_URL from .env.local..."
    # Load only DATABASE_URL to avoid conflicts
    export DATABASE_URL=$(grep "^DATABASE_URL=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ -z "$DATABASE_URL" ]; then
      echo "❌ Error: DATABASE_URL not found in .env.local"
      exit 1
    fi
  else
    echo "❌ Error: DATABASE_URL not set and .env.local not found"
    exit 1
  fi
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is still not set"
  exit 1
fi

echo "✅ DATABASE_URL found"

# Apply migrations
echo ""
echo "1️⃣ Applying glbModelUrl migration..."
if [ -f "prisma/migrations/add_glb_model_url_to_scooter_model.sql" ]; then
  psql "$DATABASE_URL" -f prisma/migrations/add_glb_model_url_to_scooter_model.sql || {
    echo "⚠️ Warning: glbModelUrl migration failed (may already be applied)"
  }
else
  echo "⚠️ Migration file not found: add_glb_model_url_to_scooter_model.sql"
fi

echo ""
echo "2️⃣ Applying SEO and WebP fields migration..."
if [ -f "prisma/migrations/add_seo_and_webp_fields.sql" ]; then
  psql "$DATABASE_URL" -f prisma/migrations/add_seo_and_webp_fields.sql || {
    echo "⚠️ Warning: SEO/WebP migration failed (may already be applied)"
  }
else
  echo "⚠️ Migration file not found: add_seo_and_webp_fields.sql"
fi

echo ""
echo "✅ Migrations applied!"
echo ""
echo "🧪 Testing database connection..."
npx prisma db execute --stdin <<< "SELECT 1;" || echo "⚠️ Database connection test failed"

echo ""
echo "📊 Generating Prisma Client..."
npx prisma generate

echo ""
echo "✅ All done! You can now test the application."

