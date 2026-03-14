import { NextResponse } from 'next/server'
import { prisma, withTimeout } from '@/lib/prisma'
import { MaterialFormat } from '@prisma/client'
import {
  findMaterialByFormat,
  findMaterialByRole,
  findMaterialsByFormat,
  getMaterialDisplayUrl,
} from '@/lib/materials/registry'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Public API endpoint для фронтенда
export async function GET() {
  try {
    // Check if Prisma is available
    if (!prisma) {
      console.warn('Scooters API: Prisma not available')
      return NextResponse.json({ models: [] }, { status: 200 })
    }

    // Immediately return fallback if DB query fails or times out
    let models: any[] = []
    
    try {
      // Use timeout to prevent hanging
      const dbQuery = prisma.scooterModel.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        include: {
          designs: {
            where: { published: true }, // Only published designs
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              price: true,
              thumbnail: true,
              editionTotal: true,
              editionAvailable: true,
              // New Material model
              materials: {
                select: {
                  id: true,
                  format: true,
                  url: true,
                  metadata: true,
                },
                orderBy: {
                  createdAt: 'asc', // Order by creation time to preserve order
                },
              },
              // WebP and SEO fields
              textureWebp: true,
              bgWebp: true,
              filmType: true,
              seoTitle: true,
              // Legacy format fields (for backward compatibility)
              textureUrl: true,
              panorama: true,
              videoPreview: true,
              galleryImages: true,
              coverImage: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      })
      
      // Add timeout to prevent hanging - use withTimeout helper for better error handling
      models = await withTimeout(dbQuery, 2000, []) as any[] // Reduced to 2 seconds for faster fallback
    } catch (dbError: any) {
      console.warn('⚠️ Database query failed, using fallback:', dbError.message)
      models = []
    }
    
    // If timeout occurred, models will be empty array, fallback will be used

    // Если моделей нет, возвращаем пустой объект (fallback будет использован на клиенте)
    if (!models || models.length === 0) {
      console.warn('⚠️ No active models found in database, using fallback')
      const { scooters } = await import('@/config/scooters')
      return NextResponse.json({ scooters })
    }

    // Преобразуем в формат, совместимый с config/scooters.js
    const scootersObj = models.reduce((acc, model) => {
      acc[model.slug] = {
        id: model.slug,
        name: model.name,
        model: model.glbModelUrl || model.model, // Use glbModelUrl first, fallback to model
        panorama: model.panorama,
        glbModelUrl: model.glbModelUrl || model.model, // Primary: glbModelUrl, fallback: model
        glbModelCompressed: model.glbModelCompressed,
        glbModelMobile: model.glbModelMobile,
        designs: (model.designs || []).map((design: any) => {
          const materials = design.materials || []
          
          // Extract materials by format using registry (if materials exist)
          const textureMaterial = materials.length > 0 ? findMaterialByFormat(materials, MaterialFormat.TEXTURE) : null
          const panoramaMaterial = materials.length > 0 ? findMaterialByFormat(materials, MaterialFormat.PANORAMA) : null
          const videoMaterial = materials.length > 0 ? findMaterialByFormat(materials, MaterialFormat.VIDEO) : null
          const photoMaterials = materials.length > 0 ? findMaterialsByFormat(materials, MaterialFormat.PHOTO) : []
          const coverMaterial = materials.length > 0 ? findMaterialByRole(materials, 'cover') || photoMaterials[0] : null

          // Priority: WebP → Material → Legacy fields
          const textureUrl = design.textureWebp || 
            (textureMaterial ? (getMaterialDisplayUrl(textureMaterial) || undefined) : undefined) ||
            (design.textureUrl || undefined)
          const panorama = design.bgWebp ||
            (panoramaMaterial ? (getMaterialDisplayUrl(panoramaMaterial) || undefined) : undefined) ||
            (design.panorama || undefined)
          const video = videoMaterial ? (getMaterialDisplayUrl(videoMaterial) || undefined) : (design.videoPreview || undefined)
          const images = photoMaterials.length > 0 
            ? photoMaterials.map((m: any) => getMaterialDisplayUrl(m)).filter((url): url is string => url !== null)
            : (design.galleryImages || [])
          const preview = coverMaterial 
            ? (getMaterialDisplayUrl(coverMaterial) || undefined)
            : (design.coverImage || design.thumbnail || images[0] || undefined)

          // Build response with materials array and legacy format for backward compatibility
          return {
            id: design.slug.replace(`${model.slug}-`, ''), // Убираем префикс модели
            name: design.title,
            slug: design.slug,
            // Materials array (new format)
            materials: materials.map((m: any) => ({
              id: m.id,
              format: m.format,
              url: m.url,
              metadata: m.metadata || {},
            })),
            // WebP fields (optimized)
            texture_webp: design.textureWebp || undefined,
            bg_webp: design.bgWebp || undefined,
            // Design info for SEO
            design_info: {
              film_type: design.filmType || undefined,
              seo_title: design.seoTitle || design.title,
            },
            // Legacy format fields (for backward compatibility)
            texture: textureUrl,
            textureUrl: textureUrl,
            preview: preview,
            images: images,
            video: video,
            panorama: panorama,
            description: design.description,
            price: design.price > 0 ? `${design.price.toLocaleString('vi-VN')} VND` : undefined,
            editions: design.editionTotal,
            available: design.editionAvailable,
          }
        }),
      }
      return acc
    }, {} as Record<string, any>)

    // Если после преобразования объект пустой, используем fallback
    if (Object.keys(scootersObj).length === 0) {
      console.warn('⚠️ No valid models after transformation, using fallback')
      const { scooters } = await import('@/config/scooters')
      return NextResponse.json({ scooters })
    }

    return NextResponse.json({ scooters: scootersObj }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching scooters:', error)
    
    // Если БД не настроена, возвращаем данные из файла как fallback
    try {
      const { scooters } = await import('@/config/scooters')
      console.warn('⚠️ Using fallback data from config/scooters.js (DB not configured)')
      return NextResponse.json({ scooters }, { status: 200 })
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError)
      return NextResponse.json(
        { error: 'Failed to fetch scooters data', details: error.message },
        { status: 500 }
      )
    }
  }
}
