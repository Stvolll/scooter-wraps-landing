-- Migration: Add feedback, rating, and updatedAt to Deal model
-- Run this migration when DATABASE_URL is configured

-- Add feedback column
ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "feedback" TEXT;

-- Add rating column (1-5)
ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "rating" INTEGER;

-- Add updatedAt column with default
ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create index on status for better query performance
CREATE INDEX IF NOT EXISTS "Deal_status_idx" ON "Deal"("status");

-- Update existing records to set updatedAt = createdAt
UPDATE "Deal" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;


