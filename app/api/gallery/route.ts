import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/gallery
 * Returns published designs with gallery images for the gallery section
 */
export async function GET() {
  try {
    const designs = await prisma.design.findMany({
      where: {
        published: true,
        // Only include designs with gallery images
        galleryImages: {
          isEmpty: false,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        scooterModel: true,
        coverImage: true,
        galleryImages: true,
        price: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform designs into gallery items
    // Each design can have multiple gallery images, so we create one item per image
    const galleryItems = designs.flatMap(design => {
      // Use galleryImages if available, otherwise use coverImage as fallback
      const images = design.galleryImages.length > 0 
        ? design.galleryImages 
        : design.coverImage 
          ? [design.coverImage] 
          : []

      return images.map((image, index) => ({
        id: `${design.id}-${index}`,
        designId: design.id,
        designSlug: design.slug,
        title: design.title,
        model: design.scooterModel,
        image: image,
        // Normalize category from scooterModel
        category: design.scooterModel.toLowerCase().replace(/\s+/g, '-'),
        price: design.price,
        isPrimary: index === 0, // First image is primary
      }))
    })

    return NextResponse.json({ items: galleryItems })
  } catch (error: any) {
    console.error('Gallery API error:', error)
    // Return empty array if database is not configured
    return NextResponse.json({ items: [] })
  }
}

