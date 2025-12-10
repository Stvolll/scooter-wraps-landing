import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/testimonials
 * Returns testimonials from deals with feedback
 */
export async function GET() {
  try {
    // Get delivered deals with feedback and rating
    // Now using Prisma's where clause after migration
    const deals = await prisma.deal.findMany({
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
            scooterModel: true,
            coverImage: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10, // Limit to 10 most recent
    })

    // Transform deals into testimonials format
    const testimonials = deals.map((deal) => ({
      id: deal.id,
      name: deal.buyerName || 'Anonymous',
      location: 'Vietnam', // Could be added to Deal model if needed
      rating: deal.rating || 5,
      text: deal.feedback || '',
      design: deal.design.title,
      model: deal.design.scooterModel,
      image: deal.design.coverImage || null,
      verified: true,
      date: formatDate(deal.updatedAt || deal.createdAt),
      designSlug: deal.design.slug,
    }))

    return NextResponse.json({ testimonials })
  } catch (error: any) {
    console.error('Testimonials API error:', error)
    // Return empty array if database is not configured
    return NextResponse.json({ testimonials: [] })
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

