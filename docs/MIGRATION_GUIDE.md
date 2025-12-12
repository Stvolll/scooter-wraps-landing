# Migration Guide: Add Feedback to Deal Model

## Overview

This migration adds feedback and rating capabilities to the Deal model, enabling customer testimonials functionality.

## Changes

1. **New Fields in Deal Model:**
   - `feedback` (String?) - Customer feedback/review text
   - `rating` (Int?) - Rating from 1 to 5
   - `updatedAt` (DateTime) - Timestamp for last update

2. **New Index:**
   - Index on `status` field for better query performance

## Migration Steps

### Option 1: Using Prisma Migrate (Recommended)

```bash
# Make sure DATABASE_URL is set in .env.local
npx prisma migrate dev --name add-feedback-to-deal

# Generate Prisma Client
npx prisma generate
```

### Option 2: Manual SQL Migration

If you prefer to run SQL directly:

```bash
# Connect to your PostgreSQL database and run:
psql $DATABASE_URL -f prisma/migrations/add_feedback_to_deal.sql
```

Or use the SQL file content:

```sql
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
```

## Verification

After migration, verify the changes:

```bash
# Check Prisma schema
npx prisma format

# Verify database structure
npx prisma db pull

# Test the API
curl http://localhost:3000/api/testimonials
```

## Rollback (if needed)

If you need to rollback:

```sql
ALTER TABLE "Deal" DROP COLUMN IF EXISTS "feedback";
ALTER TABLE "Deal" DROP COLUMN IF EXISTS "rating";
ALTER TABLE "Deal" DROP COLUMN IF EXISTS "updatedAt";
DROP INDEX IF EXISTS "Deal_status_idx";
```

## Notes

- Existing deals will have `updatedAt` set to `createdAt`
- `feedback` and `rating` are optional fields (nullable)
- The API endpoint `/api/testimonials` will only return deals with both feedback and rating
- Rating should be between 1 and 5 (enforced in application logic)



