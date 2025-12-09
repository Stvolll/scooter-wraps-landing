import { Metadata } from 'next'
import { scooters } from '@/config/scooters'
import DesignDetailClient from './DesignDetailClient'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    model: string
    slug: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { model, slug } = params
  const scooter = (scooters as any)[model]
  const design = scooter?.designs?.find((d: any) => d.id === slug)

  if (!scooter || !design) {
    return {
      title: 'Design Not Found | TXD',
      description: 'The requested design could not be found.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://txd.bike'
  const title = `${design.name} for ${scooter.name} | TXD Premium Vinyl Wraps`
  const description =
    design.description ||
    `Premium vinyl wrap design "${design.name}" for ${scooter.name}. Professional installation included with 5-year warranty.`

  // Get image URL for OG image
  const ogImage =
    design.preview || design.images?.[0] || design.texture || '/images/studio-panorama.png'
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`

  const url = `${baseUrl}/designs/${model}/${slug}`

  return {
    title,
    description,
    keywords: [
      'vinyl wrap',
      'scooter wrap',
      design.name.toLowerCase(),
      scooter.name.toLowerCase(),
      'custom design',
      'premium vinyl',
      '3M vinyl',
      'scooter customization',
    ].join(', '),
    openGraph: {
      title,
      description,
      url,
      siteName: 'TXD Premium Vinyl Wraps',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${design.name} for ${scooter.name}`,
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

// Generate static params for all designs (optional, for static generation)
export async function generateStaticParams() {
  const params: Array<{ model: string; slug: string }> = []

  Object.entries(scooters).forEach(([modelId, scooter]: [string, any]) => {
    scooter.designs?.forEach((design: any) => {
      params.push({
        model: modelId,
        slug: design.id,
      })
    })
  })

  return params
}

export default function DesignDetailPage({ params }: PageProps) {
  const { model, slug } = params
  const scooter = (scooters as any)[model]
  const design = scooter?.designs?.find((d: any) => d.id === slug)

  if (!scooter || !design) {
    notFound()
  }

  return <DesignDetailClient scooter={scooter} design={design} modelId={model} designId={slug} />
}
