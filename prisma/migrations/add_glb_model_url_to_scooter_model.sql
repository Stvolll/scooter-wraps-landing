-- Migration: Add glbModelUrl, glbModelCompressed, glbModelMobile to ScooterModel
-- Phase 2: Move these fields from Design to ScooterModel

-- Step 1: Add new columns to ScooterModel
ALTER TABLE "ScooterModel" 
ADD COLUMN IF NOT EXISTS "glbModelUrl" TEXT,
ADD COLUMN IF NOT EXISTS "glbModelCompressed" TEXT,
ADD COLUMN IF NOT EXISTS "glbModelMobile" TEXT;

-- Step 2: Migrate data from Design to ScooterModel (if needed)
-- This will copy glbModelUrl from the first design of each model to the model itself
-- You may need to adjust this logic based on your data structure
UPDATE "ScooterModel" sm
SET 
  "glbModelUrl" = (
    SELECT d."glbModelUrl" 
    FROM "Design" d 
    WHERE d."scooterModelId" = sm.id 
    AND d."glbModelUrl" IS NOT NULL 
    LIMIT 1
  ),
  "glbModelCompressed" = (
    SELECT d."glbModelCompressed" 
    FROM "Design" d 
    WHERE d."scooterModelId" = sm.id 
    AND d."glbModelCompressed" IS NOT NULL 
    LIMIT 1
  ),
  "glbModelMobile" = (
    SELECT d."glbModelMobile" 
    FROM "Design" d 
    WHERE d."scooterModelId" = sm.id 
    AND d."glbModelMobile" IS NOT NULL 
    LIMIT 1
  )
WHERE EXISTS (
  SELECT 1 FROM "Design" d WHERE d."scooterModelId" = sm.id
);

-- Step 3: Remove columns from Design (optional - can be done later if you want to keep backward compatibility)
-- ALTER TABLE "Design" 
-- DROP COLUMN IF EXISTS "glbModelUrl",
-- DROP COLUMN IF EXISTS "glbModelCompressed",
-- DROP COLUMN IF EXISTS "glbModelMobile";


