/**
 * Quick check of migration status
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStatus() {
  try {
    console.log('🔍 Checking migration status...\n')

    // Check Material table exists and has data
    const materialCount = await prisma.material.count()
    console.log(`✅ Materials in database: ${materialCount}`)

    // Check designs with materials
    const designsWithMaterials = await prisma.design.findMany({
      include: {
        materials: {
          select: {
            format: true,
            url: true,
            metadata: true,
          },
        },
        _count: {
          select: { materials: true },
        },
      },
      take: 5,
    })

    console.log(`\n📊 Sample designs (first 5):`)
    designsWithMaterials.forEach((design) => {
      console.log(`\n  ${design.title} (${design.slug})`)
      console.log(`    Materials: ${design._count.materials}`)
      if (design.materials.length > 0) {
        design.materials.forEach((m) => {
          const role = m.metadata && typeof m.metadata === 'object' && 'role' in m.metadata
            ? ` [${m.metadata.role}]`
            : ''
          console.log(`      - ${m.format}${role}`)
        })
      }
    })

    // Summary by format
    const byFormat = await prisma.material.groupBy({
      by: ['format'],
      _count: true,
    })

    console.log(`\n📦 Summary by format:`)
    byFormat.forEach(({ format, _count }) => {
      console.log(`   ${format}: ${_count}`)
    })

    console.log('\n✅ Migration status check complete!')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.message?.includes('Material')) {
      console.log('\n💡 Tip: Make sure you ran the SQL migration first!')
    }
  } finally {
    await prisma.$disconnect()
  }
}

checkStatus()



