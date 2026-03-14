/**
 * Verification script to check Material migration
 * 
 * Run with: npx tsx scripts/verify-materials.ts
 */

import { PrismaClient, MaterialFormat } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyMaterials() {
  console.log('🔍 Verifying Material migration...\n')

  try {
    // 1. Check total materials
    const totalMaterials = await prisma.material.count()
    console.log(`📊 Total materials: ${totalMaterials}`)

    // 2. Check materials by format
    const byFormat = await prisma.material.groupBy({
      by: ['format'],
      _count: true,
    })
    console.log('\n📦 Materials by format:')
    byFormat.forEach(({ format, _count }) => {
      console.log(`   ${format}: ${_count}`)
    })

    // 3. Check designs with materials
    const designsWithMaterials = await prisma.design.findMany({
      where: {
        materials: {
          some: {},
        },
      },
      include: {
        materials: true,
        _count: {
          select: { materials: true },
        },
      },
      take: 5,
    })

    console.log(`\n🎨 Sample designs with materials (showing first 5):`)
    designsWithMaterials.forEach((design) => {
      console.log(`\n   Design: ${design.title} (${design.slug})`)
      console.log(`   Materials: ${design._count.materials}`)
      design.materials.forEach((material) => {
        const role = material.metadata && typeof material.metadata === 'object' && 'role' in material.metadata
          ? ` (${material.metadata.role})`
          : ''
        console.log(`     - ${material.format}${role}: ${material.url.substring(0, 60)}...`)
      })
    })

    // 4. Check for designs without materials (might need migration)
    const designsWithoutMaterials = await prisma.design.count({
      where: {
        materials: {
          none: {},
        },
      },
    })
    console.log(`\n⚠️  Designs without materials: ${designsWithoutMaterials}`)

    // 5. Verify material handlers can process all formats
    console.log('\n✅ Material format verification:')
    const formats = Object.values(MaterialFormat)
    for (const format of formats) {
      const count = await prisma.material.count({
        where: { format },
      })
      console.log(`   ${format}: ${count > 0 ? '✅' : '⚠️'} (${count} materials)`)
    }

    console.log('\n✅ Verification complete!')

  } catch (error: any) {
    console.error('❌ Verification failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

verifyMaterials()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

