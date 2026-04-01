import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MaterialFormat } from '@/lib/materials/types'
import { findMaterialByFormat } from '@/lib/materials/registry'
import { getDesignById } from '@/lib/designsData'

/**
 * Определяет URL главной текстуры из разных возможных полей
 */
function getMainTextureUrl(design: any): string | null {
  // Приоритет: textureWebp > textureUrl > texture > image > textures?.body
  return (
    design.textureWebp ||
    design.textureUrl ||
    design.texture ||
    design.image ||
    design.texture_webp ||
    design.textures?.body ||
    design.textures?.main ||
    null
  )
}

/**
 * Определяет формат по URL
 */
function getImageFormat(url: string): 'jpg' | 'png' | 'webp' {
  const ext = url.split('.').pop()?.toLowerCase()
  
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'jpg'
    case 'png':
      return 'png'
    case 'webp':
      return 'webp'
    default:
      return 'jpg'
  }
}

/**
 * Получает конфигурацию фона (если есть)
 */
function getBackgroundConfig(design: any) {
  const bgUrl = design.bgWebp || design.bg_webp || design.background || design.panorama
  
  if (!bgUrl) {
    return null
  }

  const ext = bgUrl.split('.').pop()?.toLowerCase()
  
  if (ext === 'hdr' || ext === 'exr') {
    return {
      id: 'background',
      payload: {
        type: 'hdri',
        url: bgUrl,
        format: ext,
      },
    }
  } else {
    return {
      id: 'background',
      payload: {
        type: 'image',
        url: bgUrl,
        format: getImageFormat(bgUrl),
      },
    }
  }
}

/**
 * API endpoint для получения дизайна по ID
 * Формат ответа согласно MODEL_DESIGN_SYSTEM_AUTONOMOUS.md
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: designId } = await params
    console.log('🔍 [API] Fetching design:', designId)

    let design: any = null

    // Сначала пытаемся найти в базе данных (Prisma)
    if (prisma) {
      try {
        const dbDesign = await prisma.design.findFirst({
          where: {
            OR: [
              { id: designId },
              { slug: designId },
              { slug: { endsWith: `-${designId}` } },
            ],
          },
          include: {
            materials: {
              select: {
                id: true,
                format: true,
                url: true,
                metadata: true,
              },
            },
            scooterModel: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
        })

        if (dbDesign) {
          // Преобразуем из базы данных в нужный формат
          const textureMaterial = findMaterialByFormat(dbDesign.materials, MaterialFormat.TEXTURE)
          const panoramaMaterial = findMaterialByFormat(dbDesign.materials, MaterialFormat.PANORAMA)

          design = {
            id: dbDesign.id,
            modelId: dbDesign.scooterModel?.slug || dbDesign.scooterModelId,
            name: dbDesign.title,
            textureWebp: textureMaterial?.url || dbDesign.textureWebp,
            textureUrl: textureMaterial?.url || dbDesign.textureUrl,
            texture: textureMaterial?.url || dbDesign.textureUrl || dbDesign.textureWebp,
            bgWebp: panoramaMaterial?.url || dbDesign.bgWebp,
            panorama: panoramaMaterial?.url || dbDesign.panorama,
            background: panoramaMaterial?.url || dbDesign.panorama || dbDesign.bgWebp,
            previewImageUrl: dbDesign.coverImage || dbDesign.thumbnail || textureMaterial?.url,
            createdAt: dbDesign.createdAt,
            updatedAt: dbDesign.updatedAt,
          }
        }
      } catch (dbError) {
        console.warn('⚠️ [API] Database query failed, trying fallback:', dbError)
      }
    }

    // Если не нашли в БД, пробуем из designsData
    if (!design) {
      design = getDesignById(designId)
      
      if (design) {
        // Преобразуем из designsData в нужный формат
        design = {
          ...design,
          texture: design.image, // В designsData текстура хранится в поле image
          previewImageUrl: design.image,
        }
      }
    }

    if (!design) {
      console.error('❌ [API] Design not found:', designId)
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      )
    }

    const textureUrl = getMainTextureUrl(design)

    if (!textureUrl) {
      console.error('❌ [API] No texture URL found for design:', designId)
      return NextResponse.json(
        { error: 'Design has no texture' },
        { status: 400 }
      )
    }

    const response = {
      design: {
        id: design.id,
        modelId: design.modelId,
        name: design.name || design.title || 'Unnamed Design',
        
        mainTexture: {
          id: 'main-texture',
          payload: {
            url: textureUrl,
            width: 2048,
            height: 2048,
            format: getImageFormat(textureUrl),
          },
          type: 'texture',
        },

        supportMaterials: {
          photos: [],
          videos: [],
          sceneBackground: getBackgroundConfig(design),
        },

        version: {
          major: 1,
          minor: 0,
          patch: 0,
          status: 'published',
        },

        status: 'published',
        previewImageUrl: design.previewImageUrl || textureUrl,
        createdAt: design.createdAt ? new Date(design.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: design.updatedAt ? new Date(design.updatedAt).toISOString() : new Date().toISOString(),
      },
    }

    console.log('✅ [API] Design serialized:', response.design.name)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}




