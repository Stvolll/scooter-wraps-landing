import { scooters } from '@/config/scooters'
import DesignDetailClient from './DesignDetailClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface DesignPageProps {
  params: {
    model: string
    slug: string
  }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://txd.bike'

export async function generateMetadata({ params }: DesignPageProps): Promise<Metadata> {
  const { model, slug } = params

  if (!model || !slug) {
    return {
      title: 'Design Not Found',
    }
  }

  const scooter = (scooters as any)[model]
  const configDesign = scooter?.designs?.find((d: any) => d.id === slug)

  if (!configDesign || !scooter) {
    return {
      title: 'Design Not Found',
    }
  }

  const designName = configDesign.name || 'Custom Design'
  const scooterName = scooter.name || 'Scooter'
  const description =
    configDesign.description ||
    `Premium vinyl wrap design "${designName}" for ${scooterName}. Professional installation, 5-year warranty.`
  const imageUrl = configDesign.preview || configDesign.images?.[0] || '/images/designs/honda lead/honda-lead-0.jpg'
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`
  const pageUrl = `${siteUrl}/designs/${model}/${slug}`

  return {
    title: `${designName} - ${scooterName} | TXD`,
    description,
    keywords: [
      designName,
      scooterName,
      'vinyl wrap',
      'scooter wrap',
      'custom design',
      'premium vinyl',
      '3M vinyl',
      'scooter customization',
    ],
    openGraph: {
      title: `${designName} - ${scooterName} | TXD`,
      description,
      url: pageUrl,
      siteName: 'TXD',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: `${designName} for ${scooterName}`,
        },
      ],
      type: 'product',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${designName} - ${scooterName}`,
      description,
      images: [fullImageUrl],
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default function DesignPage({ params }: DesignPageProps) {
  const { model, slug } = params

  if (!model || !slug) {
    notFound()
  }

  // First, try to find design in config (for legacy designs)
  const scooter = (scooters as any)[model]
  const configDesign = scooter?.designs?.find((d: any) => d.id === slug)

  if (configDesign && scooter) {
    const designName = configDesign.name || 'Custom Design'
    const scooterName = scooter.name || 'Scooter'
    const description =
      configDesign.description ||
      `Premium vinyl wrap design "${designName}" for ${scooterName}. Professional installation, 5-year warranty.`
    const imageUrl = configDesign.preview || configDesign.images?.[0] || '/images/designs/honda lead/honda-lead-0.jpg'
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`
    const pageUrl = `${siteUrl}/designs/${model}/${slug}`

    // JSON-LD structured data for Product
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${designName} - ${scooterName}`,
      description,
      image: fullImageUrl,
      url: pageUrl,
      brand: {
        '@type': 'Brand',
        name: 'TXD',
      },
      category: 'Automotive Parts & Accessories',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'VND',
        price: configDesign.price
          ? configDesign.price.replace(/[^\d]/g, '')
          : undefined,
        availability: configDesign.status === 'FOR_SALE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'TXD',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '127',
      },
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
        <DesignDetailClient scooter={scooter} design={configDesign} modelId={model} designId={slug} />
      </>
    )
  }

  // If not found, show 404
  notFound()
}
