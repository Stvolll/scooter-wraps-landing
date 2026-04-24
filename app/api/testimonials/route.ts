import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MaterialFormat } from '@prisma/client'
import { findMaterialByRole, getMaterialDisplayUrl } from '@/lib/materials/registry'

/**
 * GET /api/testimonials
 * Returns testimonials from deals with feedback
 */
export async function GET() {
  try {
    // Check if Prisma is available
    if (!prisma) {
      console.warn('Testimonials API: Prisma not available')
      return NextResponse.json({ testimonials: [] }, { status: 200 })
    }

    // Get delivered deals with feedback and rating
    let deals: any[] = []
    try {
      deals = await prisma.deal.findMany({
      where: {
        status: 'delivered',
        feedback: {
          not: null,
        },
        rating: {
          not: null,
        },
      },
      include: {
        design: {
          select: {
            title: true,
            slug: true,
            scooterModel: {
              select: {
                slug: true,
                name: true,
              },
            },
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
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10, // Limit to 10 most recent
      })
    } catch (dbError: any) {
      console.warn('Testimonials API: Database query failed:', dbError.message)
      return NextResponse.json({ testimonials: [] }, { status: 200 })
    }

    // Transform deals into testimonials format using Materials
    const testimonials = deals.map((deal) => {
      try {
        // Get cover image from materials
        const coverMaterial = deal.design?.materials && Array.isArray(deal.design.materials)
          ? findMaterialByRole(deal.design.materials, 'cover')
          : null
        const imageUrl = coverMaterial ? getMaterialDisplayUrl(coverMaterial) : null

        return {
          id: deal.id,
          name: deal.buyerName || 'Anonymous',
          location: 'Vietnam', // Could be added to Deal model if needed
          rating: deal.rating || 5,
          text: deal.feedback || '',
          design: deal.design?.title || 'Unknown Design',
          model: deal.design?.scooterModel?.name || deal.design?.scooterModel?.slug || 'Unknown',
          image: imageUrl,
          verified: true,
          date: formatDate(deal.updatedAt || deal.createdAt),
          designSlug: deal.design?.slug || '',
          modelSlug: deal.design?.scooterModel?.slug || '',
        }
      } catch (dealError) {
        console.warn('Testimonials API: Error processing deal:', dealError)
        return null
      }
    }).filter(Boolean)

    return NextResponse.json({ testimonials }, { status: 200 })
  } catch (error: any) {
    console.error('Testimonials API error:', error)
    // Return empty array with 200 status to prevent frontend errors
    return NextResponse.json({ testimonials: [] }, { status: 200 })
  }
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

