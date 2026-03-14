-- Migration: Add SEO and WebP fields to ScooterModel and Design
-- Adds seoTitle, seoDescription to ScooterModel
-- Adds textureWebp, bgWebp, filmType, seoTitle to Design

-- Step 1: Add SEO fields to ScooterModel
ALTER TABLE "ScooterModel" 
ADD COLUMN IF NOT EXISTS "seoTitle" TEXT,
ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;

-- Step 2: Add WebP and SEO fields to Design
ALTER TABLE "Design" 
ADD COLUMN IF NOT EXISTS "textureWebp" TEXT,  -- WebP текстура (512x512, <1MB)
ADD COLUMN IF NOT EXISTS "bgWebp" TEXT,        -- WebP фон (1920x1080, <1MB)
ADD COLUMN IF NOT EXISTS "filmType" TEXT,      -- Тип пленки для SEO
ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;      -- SEO заголовок дизайна

-- Step 3: Create indexes for SEO fields (optional, for search optimization)
CREATE INDEX IF NOT EXISTS "Design_filmType_idx" ON "Design"("filmType");
CREATE INDEX IF NOT EXISTS "Design_seoTitle_idx" ON "Design"("seoTitle");


