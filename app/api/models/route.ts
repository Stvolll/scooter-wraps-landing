import { NextResponse } from 'next/server'
import { prisma, withTimeout } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/models
 * Returns list of all models with design counts
 * Format: [{id:1, name:"Honda Lead", designs_count:5, glbModelUrl:"..."}]
 */
export async function GET() {
  try {
    // Try to fetch from database
    let models: any[] = []
    
    try {
      const dbQuery = prisma.scooterModel.findMany({
        where: { active: true },
        select: {
          id: true,
          slug: true,
          name: true,
          model: true,
          glbModelUrl: true,
          glbModelCompressed: true,
          glbModelMobile: true,
          seoTitle: true,
          seoDescription: true,
          _count: {
            select: {
              designs: {
                where: { published: true },
              },
            },
          },
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      })
      
      models = await withTimeout(dbQuery, 3000, []) as any[]
    } catch (dbError: any) {
      console.warn('⚠️ Database query failed, using fallback:', dbError.message)
      models = []
    }

    // If no models from DB, use fallback
    if (!models || models.length === 0) {
      const { scooters } = await import('@/config/scooters')
      models = Object.values(scooters).map((scooter: any) => ({
        id: scooter.id,
        slug: scooter.id,
        name: scooter.name,
        model: scooter.model,
        glbModelUrl: scooter.glbModelUrl || null,
        glbModelCompressed: scooter.glbModelCompressed || null,
        glbModelMobile: scooter.glbModelMobile || null,
        seoTitle: scooter.name,
        seoDescription: null,
        _count: {
          designs: scooter.designs?.length || 0,
        },
      }))
    }

    // Transform to response format
    const data = models.map((model) => ({
      id: model.slug || model.id,
      name: model.name,
      model: model.model,
      glbModelUrl: model.glbModelUrl,
      glbModelCompressed: model.glbModelCompressed,
      glbModelMobile: model.glbModelMobile,
      seo_info: {
        title: model.seoTitle || model.name,
        description: model.seoDescription || null,
      },
      designs_count: model._count?.designs || 0,
    }))

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    })
  } catch (error: any) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch models', details: error.message },
      { status: 500 }
    )
  }
}
