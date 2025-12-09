import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://txd.bike'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/admin`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Add design pages from database
  try {
    const designs = await prisma.design.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    })

    const designRoutes = designs.map(design => ({
      url: `${BASE_URL}/designs/${design.slug}`,
      lastModified: design.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...routes, ...designRoutes]
  } catch (error) {
    // If database is not configured, return static routes only
    console.error('Sitemap generation error:', error)
    return routes
  }
}
