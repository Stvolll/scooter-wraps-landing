/**
 * Migration script to move format-specific fields from Design to Material model
 * 
 * This script:
 * 1. Reads existing Design records with format fields
 * 2. Creates Material records for each format field
 * 3. Does NOT delete old fields (for safety - manual cleanup required)
 * 
 * Run with: npx tsx prisma/migrate-to-materials.ts
 */

import { PrismaClient, MaterialFormat } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateToMaterials() {
  console.log('🔄 Starting migration to Material model...')

  try {
    // Get all designs that might have format fields
    // Note: These fields may not exist in schema anymore, so we use raw query
    const designs = await prisma.$queryRaw<Array<{
      id: string
      textureUrl?: string | null
      panorama?: string | null
      videoPreview?: string | null
      galleryImages?: string[] | null
      coverImage?: string | null
    }>>`
      SELECT 
        id,
        "textureUrl",
        "panorama",
        "videoPreview",
        "galleryImages",
        "coverImage"
      FROM "Design"
      WHERE 
        "textureUrl" IS NOT NULL OR
        "panorama" IS NOT NULL OR
        "videoPreview" IS NOT NULL OR
        "galleryImages" IS NOT NULL OR
        "coverImage" IS NOT NULL
    ` as any

    console.log(`📊 Found ${designs.length} designs with format fields`)

    let migratedCount = 0
    let materialCount = 0

    for (const design of designs) {
      const materialsToCreate = []

      // Texture material
      if (design.textureUrl) {
        materialsToCreate.push({
          designId: design.id,
          format: MaterialFormat.TEXTURE,
          url: design.textureUrl,
          metadata: {},
        })
      }

      // Panorama material
      if (design.panorama) {
        materialsToCreate.push({
          designId: design.id,
          format: MaterialFormat.PANORAMA,
          url: design.panorama,
          metadata: {},
        })
      }

      // Video preview material
      if (design.videoPreview) {
        materialsToCreate.push({
          designId: design.id,
          format: MaterialFormat.VIDEO,
          url: design.videoPreview,
          metadata: { type: 'preview' },
        })
      }

      // Gallery images as PHOTO materials
      if (design.galleryImages && Array.isArray(design.galleryImages) && design.galleryImages.length > 0) {
        design.galleryImages.forEach((url: string, index: number) => {
          if (url) {
            materialsToCreate.push({
              designId: design.id,
              format: MaterialFormat.PHOTO,
              url,
              metadata: {
                role: index === 0 ? 'cover' : 'gallery',
                order: index,
              },
            })
          }
        })
      }

      // Cover image as PHOTO material (if not already in galleryImages)
      if (design.coverImage && (!design.galleryImages || !design.galleryImages.includes(design.coverImage))) {
        materialsToCreate.push({
          designId: design.id,
          format: MaterialFormat.PHOTO,
          url: design.coverImage,
          metadata: {
            role: 'cover',
            order: 0,
          },
        })
      }

      // Create materials if any
      if (materialsToCreate.length > 0) {
        // Check if materials already exist for this design
        const existingMaterials = await prisma.material.findMany({
          where: { designId: design.id },
        })

        if (existingMaterials.length === 0) {
          await prisma.material.createMany({
            data: materialsToCreate,
          })
          migratedCount++
          materialCount += materialsToCreate.length
          console.log(`✅ Migrated ${materialsToCreate.length} materials for design ${design.id}`)
        } else {
          console.log(`⏭️  Design ${design.id} already has materials, skipping`)
        }
      }
    }

    console.log(`\n✅ Migration complete!`)
    console.log(`   - Migrated ${migratedCount} designs`)
    console.log(`   - Created ${materialCount} material records`)
    console.log(`\n⚠️  Note: Old format fields are NOT deleted automatically.`)
    console.log(`   You can manually remove them from the schema after verifying the migration.`)

  } catch (error: any) {
    console.error('❌ Migration failed:', error)
    
    // If error is about missing columns, that's expected if fields were already removed
    if (error.message?.includes('column') || error.message?.includes('does not exist')) {
      console.log('\n💡 Note: Format fields may have already been removed from schema.')
      console.log('   This is normal if you already updated the schema.')
      console.log('   The migration will work once you add the Material model and run migrations.')
    }
    
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateToMaterials()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })



