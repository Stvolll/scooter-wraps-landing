import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MaterialFormat } from '@prisma/client'
import { findMaterialsByFormat, findMaterialByRole, getMaterialDisplayUrl } from '@/lib/materials/registry'

/**
 * GET /api/gallery
 * Returns published designs with gallery images for the gallery section
 */
export async function GET() {
  try {
    // Check if Prisma is available
    if (!prisma) {
      console.warn('Gallery API: Prisma not available')
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    let designs: any[] = []
    try {
      designs = await prisma.design.findMany({
      where: {
        published: true,
        materials: {
          some: {
            format: MaterialFormat.PHOTO,
          },
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        scooterModel: {
          select: {
            slug: true,
            name: true,
          },
        },
        price: true,
        materials: {
          where: {
            format: MaterialFormat.PHOTO,
          },
          select: {
            id: true,
            format: true,
            url: true,
            metadata: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to prevent large responses
      })
    } catch (dbError: any) {
      console.warn('Gallery API: Database query failed:', dbError.message)
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    // Transform designs into gallery items using Materials
    const galleryItems = designs.flatMap(design => {
      try {
        // Get photo materials
        const photoMaterials = design.materials && Array.isArray(design.materials) 
          ? findMaterialsByFormat(design.materials, MaterialFormat.PHOTO)
          : []
        
        if (photoMaterials.length === 0) {
          return []
        }

        return photoMaterials.map((material, index) => {
          try {
            const imageUrl = getMaterialDisplayUrl(material)
            if (!imageUrl) return null

            return {
              id: `${design.id}-${index}`,
              designId: design.id,
              designSlug: design.slug,
              title: design.title,
              model: design.scooterModel?.name || design.scooterModel?.slug || 'Unknown',
              image: imageUrl,
              // Normalize category from scooterModel
              category: (design.scooterModel?.slug || 'unknown').toLowerCase().replace(/\s+/g, '-'),
              price: design.price,
              isPrimary: material.metadata && typeof material.metadata === 'object' && material.metadata.role === 'cover',
            }
          } catch (materialError) {
            console.warn('Gallery API: Error processing material:', materialError)
            return null
          }
        }).filter(Boolean)
      } catch (designError) {
        console.warn('Gallery API: Error processing design:', designError)
        return []
      }
    })

    return NextResponse.json({ items: galleryItems }, { status: 200 })
  } catch (error: any) {
    console.error('Gallery API error:', error)
    // Return empty array with 200 status to prevent frontend errors
    return NextResponse.json({ items: [] }, { status: 200 })
  }
}







