import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import DesignDetailClient from './DesignDetailClient'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    slug: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params

  let design = null
  try {
    design = await prisma.design.findUnique({
      where: { slug },
      select: {
        title: true,
        description: true,
        coverImage: true,
        scooterModel: true,
        published: true,
      },
    })
  } catch (error) {
    // Database not configured
  }

  if (!design || !design.published) {
    return {
      title: 'Design Not Found | TXD',
      description: 'The requested design could not be found.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://txd.bike'
  const title = `${design.title} for ${design.scooterModel} | TXD Premium Vinyl Wraps`
  const description =
    design.description ||
    `Premium vinyl wrap design "${design.title}" for ${design.scooterModel}. Professional installation included with 5-year warranty.`

  // Get image URL for OG image
  const ogImage = design.coverImage || '/images/studio-panorama.png'
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`

  const url = `${baseUrl}/designs/${slug}`

  return {
    title,
    description,
    keywords: [
      'vinyl wrap',
      'scooter wrap',
      design.title.toLowerCase(),
      design.scooterModel.toLowerCase(),
      'custom design',
      'premium vinyl',
      '3M vinyl',
      'scooter customization',
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: 'TXD',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${design.title} on ${design.scooterModel}`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function DesignPage({ params }: PageProps) {
  const { slug } = params

  let design = null
  try {
    design = await prisma.design.findUnique({
      where: { slug },
      include: {
        statusHistory: {
          orderBy: { at: 'desc' },
        },
      },
    })
  } catch (error) {
    // Database not configured
  }

  if (!design || !design.published) {
    notFound()
  }

  return <DesignDetailClient design={design} />
}

