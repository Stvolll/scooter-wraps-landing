import { NextRequest, NextResponse } from 'next/server'
import { prisma, withTimeout } from '@/lib/prisma'
import { MaterialFormat } from '@prisma/client'
import {
  findMaterialByFormat,
  findMaterialByRole,
  findMaterialsByFormat,
  getMaterialDisplayUrl,
} from '@/lib/materials/registry'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/models/:id
 * Returns a single model with all its designs
 * Format: { model: {...}, designs: [{id:11, texture_webp:"...", bg_webp:"..."}] }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: modelId } = await params

    // Find model by slug or id
    const model = await withTimeout(
      prisma.scooterModel.findFirst({
        where: {
          OR: [
            { id: modelId },
            { slug: modelId },
          ],
        },
        include: {
          designs: {
            where: { published: true },
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              price: true,
              thumbnail: true,
              editionTotal: true,
              editionAvailable: true,
              // New WebP and SEO fields
              textureWebp: true,
              bgWebp: true,
              filmType: true,
              seoTitle: true,
              // Material model
              materials: {
                select: {
                  id: true,
                  format: true,
                  url: true,
                  metadata: true,
                },
              },
              // Legacy fields (for backward compatibility)
              textureUrl: true,
              panorama: true,
              videoPreview: true,
              galleryImages: true,
              coverImage: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      3000,
      null
    ) as any

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    // Transform designs with Material registry
    const designs = (model.designs || []).map((design: any) => {
      const materials = design.materials || []
      
      // Extract materials by format
      const textureMaterial = materials.length > 0 
        ? findMaterialByFormat(materials, MaterialFormat.TEXTURE) 
        : null
      const panoramaMaterial = materials.length > 0 
        ? findMaterialByFormat(materials, MaterialFormat.PANORAMA) 
        : null
      const photoMaterials = materials.length > 0 
        ? findMaterialsByFormat(materials, MaterialFormat.PHOTO) 
        : []
      const coverMaterial = materials.length > 0 
        ? findMaterialByRole(materials, 'cover') || photoMaterials[0] 
        : null

      // Prefer WebP fields, fallback to Material, then legacy
      const textureWebp = design.textureWebp || 
        (textureMaterial ? getMaterialDisplayUrl(textureMaterial) : null) ||
        design.textureUrl || null
      
      const bgWebp = design.bgWebp ||
        (panoramaMaterial ? getMaterialDisplayUrl(panoramaMaterial) : null) ||
        design.panorama || null

      const images = photoMaterials.length > 0
        ? photoMaterials.map((m: any) => getMaterialDisplayUrl(m)).filter(Boolean)
        : (design.galleryImages || [])

      const preview = coverMaterial
        ? getMaterialDisplayUrl(coverMaterial)
        : (design.coverImage || design.thumbnail || images[0] || null)

      return {
        id: design.slug.replace(`${model.slug}-`, ''),
        name: design.title,
        slug: design.slug,
        // WebP fields (optimized)
        texture_webp: textureWebp,
        bg_webp: bgWebp,
        // Design info for SEO
        design_info: {
          film_type: design.filmType || null,
          seo_title: design.seoTitle || design.title,
        },
        // Media
        media: images,
        preview: preview,
        // Other fields
        description: design.description,
        price: design.price > 0 ? `${design.price.toLocaleString('vi-VN')} VND` : undefined,
        editions: design.editionTotal,
        available: design.editionAvailable,
        // Materials array (new format)
        materials: materials.map((m: any) => ({
          id: m.id,
          format: m.format,
          url: m.url,
          metadata: m.metadata || {},
        })),
      }
    })

    // Return model with designs (glbModelUrl unified: DB glbModelUrl || model path)
    const glbModelUrl = model.glbModelUrl || model.model
    return NextResponse.json({
      model: {
        id: model.slug || model.id,
        name: model.name,
        model: model.model,
        glbModelUrl,
        glbUrl: glbModelUrl, // alias for backward compatibility with older client code
        glbModelCompressed: model.glbModelCompressed,
        glbModelMobile: model.glbModelMobile,
        seo_info: {
          title: model.seoTitle || model.name,
          description: model.seoDescription || null,
        },
      },
      designs,
    })
  } catch (error: any) {
    console.error('Error fetching model:', error)
    return NextResponse.json(
      { error: 'Failed to fetch model', details: error.message },
      { status: 500 }
    )
  }
}

