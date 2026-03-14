import { scooters } from '@/config/scooters'
import DesignDetailClient from './DesignDetailClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma, withTimeout } from '@/lib/prisma'
import { MaterialFormat } from '@prisma/client'
import {
  findMaterialByFormat,
  findMaterialsByFormat,
  findMaterialByRole,
  getMaterialDisplayUrl,
} from '@/lib/materials/registry'

// Force dynamic rendering to prevent RSC payload fetch failures
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface DesignPageProps {
  params: Promise<{
    model: string
    slug: string
  }>
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://txd.bike'

export async function generateMetadata({ params }: DesignPageProps): Promise<Metadata> {
  const { model, slug } = await params

  if (!model || !slug) {
    return {
      title: 'Design Not Found',
    }
  }

  // Try to load from database first
  let designName = 'Custom Design'
  let scooterName = 'Scooter'
  let imageUrl = '/images/studio-panorama.png'
  
  if (process.env.DATABASE_URL) {
    try {
      // Use helper function with timeout for metadata (very fast timeout to prevent hanging)
      const queryPromise = prisma.scooterModel.findUnique({
        where: { slug: model },
        include: {
          designs: {
            where: {
              OR: [
                { slug: `${model}-${slug}` },
                { slug: slug },
                { id: slug },
              ],
            },
            include: {
              materials: {
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
          },
        },
      })
      
      // Double timeout protection for metadata
      const safetyTimeout = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 300) // Absolute max 300ms for metadata
      })
      
      const dbScooter = await Promise.race([
        withTimeout(queryPromise, 200, null),
        safetyTimeout
      ]) as any
      
      if (dbScooter && dbScooter.designs && dbScooter.designs.length > 0) {
        const dbDesign = dbScooter.designs[0]
        designName = dbDesign.title || 'Custom Design'
        scooterName = dbScooter.name || 'Scooter'
        imageUrl = dbDesign.coverImage || dbDesign.galleryImages?.[0] || '/images/studio-panorama.png'
      }
    } catch (error) {
      // Silently fail and use config fallback
    }
  }

  // Fallback to config
  if (designName === 'Custom Design') {
    const scooter = (scooters as any)[model]
    const configDesign = scooter?.designs?.find((d: any) => d.id === slug)

    if (configDesign && scooter) {
      designName = configDesign.name || 'Custom Design'
      scooterName = scooter.name || 'Scooter'
      imageUrl = configDesign.preview || configDesign.images?.[0] || '/images/designs/yamaha-nvx/yamaha-nvx-0.jpg'
    } else {
      return {
        title: 'Design Not Found',
      }
    }
  }
  const description = `Premium vinyl wrap design "${designName}" for ${scooterName}. Professional installation, 5-year warranty.`
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
      type: 'website',
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

export default async function DesignPage({ params }: DesignPageProps) {
  const { model, slug } = await params

  if (!model || !slug) {
    notFound()
  }

  // Try to load from database first (with fast timeout and error handling)
  let dbDesign = null
  let dbScooter = null
  
  // Try to load from database (with quick fallback to config)
  // Use very aggressive timeout to prevent RSC payload fetch failures
  if (process.env.DATABASE_URL) {
    try {
      // Use helper function with timeout - very short timeout to prevent hanging
      // Wrap in Promise.race with additional safety timeout
      const queryPromise = prisma.scooterModel.findUnique({
        where: { slug: model },
        include: {
          designs: {
            where: {
              OR: [
                { slug: `${model}-${slug}` },
                { slug: slug },
                { id: slug },
              ],
            },
            include: {
              materials: {
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
          },
        },
      })
      
      // Double timeout protection: withTimeout + additional race
      const safetyTimeout = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 500) // Absolute max 500ms
      })
      
      dbScooter = await Promise.race([
        withTimeout(queryPromise, 300, null),
        safetyTimeout
      ]) as any
      
      if (dbScooter && dbScooter.designs && dbScooter.designs.length > 0) {
        dbDesign = dbScooter.designs[0]
      }
    } catch (error) {
      // Silently fail and use config fallback
      console.warn('Database query failed, using config fallback:', error)
    }
  }

  // If found in DB, use it
  if (dbDesign && dbScooter) {
    // Process materials through Material registry
    const materials = dbDesign.materials || []
    const textureMaterial = materials.length > 0 ? findMaterialByFormat(materials, MaterialFormat.TEXTURE) : null
    const panoramaMaterial = materials.length > 0 ? findMaterialByFormat(materials, MaterialFormat.PANORAMA) : null
    const videoMaterial = materials.length > 0 ? findMaterialByFormat(materials, MaterialFormat.VIDEO) : null
    const photoMaterials = materials.length > 0 ? findMaterialsByFormat(materials, MaterialFormat.PHOTO) : []
    const coverMaterial = materials.length > 0 ? findMaterialByRole(materials, 'cover') || photoMaterials[0] : null
    
    // Priority: WebP → Material → Legacy fields
    const textureUrl = dbDesign.textureWebp || 
      (textureMaterial ? getMaterialDisplayUrl(textureMaterial) : null) ||
      dbDesign.textureUrl || null
    const panorama = dbDesign.bgWebp ||
      (panoramaMaterial ? getMaterialDisplayUrl(panoramaMaterial) : null) ||
      dbDesign.panorama || null
    const video = videoMaterial ? getMaterialDisplayUrl(videoMaterial) : (dbDesign.videoPreview || null)
    const images = photoMaterials.length > 0 
      ? photoMaterials.map((m: any) => getMaterialDisplayUrl(m)).filter((url): url is string => url !== null)
      : (dbDesign.galleryImages || [])
    const preview = coverMaterial 
      ? getMaterialDisplayUrl(coverMaterial)
      : (dbDesign.coverImage || dbDesign.thumbnail || images[0] || null)
    
    const designData = {
      id: dbDesign.slug.replace(`${model}-`, ''),
      name: dbDesign.title,
      slug: dbDesign.slug,
      texture: textureUrl,
      textureUrl: textureUrl,
      textureWebp: dbDesign.textureWebp,
      bgWebp: dbDesign.bgWebp,
      preview: preview,
      images: images,
      video: video,
      panorama: panorama,
      description: dbDesign.description,
      price: dbDesign.price > 0 ? `${dbDesign.price.toLocaleString('vi-VN')} VND` : undefined,
      materials: materials.map((m: any) => ({
        id: m.id,
        format: m.format,
        url: m.url,
        metadata: m.metadata || {},
      })),
    }
    
    const scooterData = {
      id: dbScooter.slug,
      name: dbScooter.name,
      model: dbScooter.model,
      panorama: dbScooter.panorama,
    }

    return (
      <DesignDetailClient 
        scooter={scooterData} 
        design={designData} 
        modelId={model} 
        designId={slug} 
      />
    )
  }

  // Fallback to config (for legacy designs)
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
