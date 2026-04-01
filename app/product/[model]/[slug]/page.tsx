import { scooters } from '@/config/scooters'
import ProductCardClient from './ProductCardClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma, withTimeout } from '@/lib/prisma'
import { MaterialFormat } from '@/lib/materials/types'
import {
  findMaterialByFormat,
  findMaterialsByFormat,
  findMaterialByRole,
  getMaterialDisplayUrl,
} from '@/lib/materials/registry'
import { getPublicSiteUrl } from '@/lib/site-url'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ProductPageProps {
  params: Promise<{ model: string; slug: string }>
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://txd.bike'

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { model, slug } = await params
  if (!model || !slug) return { title: 'Product Not Found' }

  let designName = 'Product'
  let scooterName = 'Scooter'
  let imageUrl = '/images/studio-panorama.png'

  if (process.env.DATABASE_URL) {
    try {
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
            include: { materials: { orderBy: { createdAt: 'asc' } } },
          },
        },
      })
      const safetyTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 300))
      const dbScooter = await Promise.race([
        withTimeout(queryPromise, 200, null),
        safetyTimeout,
      ]) as any
      if (dbScooter?.designs?.length > 0) {
        const d = dbScooter.designs[0]
        designName = d.title || 'Product'
        scooterName = dbScooter.name || 'Scooter'
        imageUrl = d.coverImage || d.galleryImages?.[0] || imageUrl
      }
    } catch {
      // use fallback
    }
  }

  if (designName === 'Product') {
    const scooter = (scooters as any)[model]
    const configDesign = scooter?.designs?.find((d: any) => d.id === slug || d.slug === slug)
    if (configDesign && scooter) {
      designName = configDesign.name || 'Product'
      scooterName = scooter.name || 'Scooter'
      imageUrl = configDesign.preview || configDesign.images?.[0] || imageUrl
    } else {
      return { title: 'Product Not Found' }
    }
  }

  const description = `Premium vinyl wrap "${designName}" for ${scooterName}. Professional installation, 5-year warranty.`
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`
  const pageUrl = `${siteUrl}/product/${model}/${slug}`

  return {
    title: `${designName} - ${scooterName} | TXD`,
    description,
    openGraph: {
      title: `${designName} - ${scooterName} | TXD`,
      description,
      url: pageUrl,
      siteName: 'TXD',
      images: [{ url: fullImageUrl, width: 1200, height: 630, alt: `${designName} for ${scooterName}` }],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: `${designName} - ${scooterName}`, description },
    alternates: { canonical: pageUrl },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { model, slug } = await params
  if (!model || !slug) notFound()

  const slugStripped = slug.startsWith(`${model}-`) ? slug.slice(model.length + 1) : slug

  let dbDesign = null
  let dbScooter = null

  if (process.env.DATABASE_URL) {
    try {
      const queryPromise = prisma.scooterModel.findUnique({
        where: { slug: model },
        include: {
          designs: {
            where: {
              OR: [
                { slug: `${model}-${slug}` },
                { slug: slug },
                { id: slug },
                { slug: slugStripped },
                { id: slugStripped },
              ],
            },
            include: { materials: { orderBy: { createdAt: 'asc' } } },
          },
        },
      })
      const safetyTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 500))
      dbScooter = await Promise.race([
        withTimeout(queryPromise, 300, null),
        safetyTimeout,
      ]) as any
      if (dbScooter?.designs?.length > 0) dbDesign = dbScooter.designs[0]
    } catch {
      console.warn('Product page: DB query failed, using config fallback')
    }
  }

  if (dbDesign && dbScooter) {
    const materials = dbDesign.materials || []
    const textureMaterial = materials.length ? findMaterialByFormat(materials, MaterialFormat.TEXTURE) : null
    const panoramaMaterial = materials.length ? findMaterialByFormat(materials, MaterialFormat.PANORAMA) : null
    const videoMaterial = materials.length ? findMaterialByFormat(materials, MaterialFormat.VIDEO) : null
    const photoMaterials = materials.length ? findMaterialsByFormat(materials, MaterialFormat.PHOTO) : []
    const coverMaterial = materials.length ? findMaterialByRole(materials, 'cover') || photoMaterials[0] : null

    const textureUrl =
      dbDesign.textureWebp ||
      (textureMaterial ? getMaterialDisplayUrl(textureMaterial) : null) ||
      dbDesign.textureUrl ||
      null
    const images =
      photoMaterials.length > 0
        ? photoMaterials.map((m: any) => getMaterialDisplayUrl(m)).filter((u): u is string => u != null)
        : (dbDesign.galleryImages || [])
    const preview = coverMaterial
      ? getMaterialDisplayUrl(coverMaterial)
      : (dbDesign.coverImage || dbDesign.thumbnail || images[0] || null)
    const video = videoMaterial ? getMaterialDisplayUrl(videoMaterial) : (dbDesign.videoPreview || null)
    const panorama =
      dbDesign.bgWebp ||
      (panoramaMaterial ? getMaterialDisplayUrl(panoramaMaterial) : null) ||
      dbDesign.panorama ||
      null

    const designData = {
      id: dbDesign.slug.replace(`${model}-`, ''),
      name: dbDesign.title,
      slug: dbDesign.slug,
      texture: textureUrl,
      textureUrl: textureUrl,
      preview,
      images,
      video,
      panorama,
      description: dbDesign.description,
      price: dbDesign.price > 0 ? `${dbDesign.price.toLocaleString('vi-VN')} VND` : undefined,
    }
    const scooterData = {
      id: dbScooter.slug,
      name: dbScooter.name,
      model: dbScooter.model,
      panorama: dbScooter.panorama,
    }
    return (
      <ProductCardClient
        scooter={scooterData}
        design={designData}
        modelId={model}
        designId={slug}
      />
    )
  }

  let scooter = (scooters as any)[model]
  let configDesign = scooter?.designs?.find(
    (d: any) =>
      d.id === slug || d.slug === slug || d.id === slugStripped || d.slug === slugStripped
  )

  if (!configDesign && model) {
    try {
      const baseUrl = getPublicSiteUrl()
      if (baseUrl) {
        const res = await fetch(`${baseUrl}/api/scooters`, { cache: 'no-store', next: { revalidate: 0 } })
        if (res.ok) {
          const data = await res.json()
          const apiScooters = data.scooters || data
          scooter = apiScooters[model]
          configDesign = scooter?.designs?.find(
            (d: any) =>
              d.id === slug || d.slug === slug || d.id === slugStripped || d.slug === slugStripped
          )
        }
      }
    } catch {
      // ignore
    }
  }

  if (configDesign && scooter) {
    return (
      <ProductCardClient
        scooter={scooter}
        design={configDesign}
        modelId={model}
        designId={slug}
      />
    )
  }

  notFound()
}
