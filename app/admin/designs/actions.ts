// app/admin/designs/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { DesignStatus, MaterialFormat } from '@prisma/client'

export async function createDesign(data: {
  title: string
  slug: string
  scooterModel: string
  description?: string
  price?: number
  editionTotal?: number
  panorama?: string
  textureUrl?: string
  galleryImages?: string[]
  videoPreview?: string
  glbModelUrl?: string
  glbModelCompressed?: string
  glbModelMobile?: string
}) {
  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'Клиент Prisma не инициализирован. Пожалуйста, укажите параметр DATABASE_URL в файле .env.local'
    )
  }

  try {
    // Phase 2: Update ScooterModel with glbModelUrl if provided
    if (data.glbModelUrl || data.glbModelCompressed || data.glbModelMobile) {
      await prisma.scooterModel.update({
        where: { slug: data.scooterModel },
        data: {
          ...(data.glbModelUrl && { glbModelUrl: data.glbModelUrl }),
          ...(data.glbModelCompressed && { glbModelCompressed: data.glbModelCompressed }),
          ...(data.glbModelMobile && { glbModelMobile: data.glbModelMobile }),
        },
      })
    }

    // Create design first
    const design = await prisma.design.create({
      data: {
        title: data.title,
        slug: data.slug,
        scooterModel: {
          connect: { slug: data.scooterModel }
        },
        description: data.description || null,
        price: data.price || 0,
        editionTotal: data.editionTotal || 5,
        editionAvailable: data.editionTotal || 5,
        status: DesignStatus.CREATIVE,
        published: true, // Автоматически публикуем дизайн при создании
      },
    })

    // Create Material records for format-specific data
    const materialsToCreate = []

    // Texture material
    if (data.textureUrl) {
      materialsToCreate.push({
        designId: design.id,
        format: MaterialFormat.TEXTURE,
        url: data.textureUrl,
        metadata: {},
      })
    }

    // Panorama material
    if (data.panorama) {
      materialsToCreate.push({
        designId: design.id,
        format: MaterialFormat.PANORAMA,
        url: data.panorama,
        metadata: {},
      })
    }

    // Video preview material
    if (data.videoPreview) {
      materialsToCreate.push({
        designId: design.id,
        format: MaterialFormat.VIDEO,
        url: data.videoPreview,
        metadata: { type: 'preview' },
      })
    }

    // Gallery images as PHOTO materials
    if (data.galleryImages && data.galleryImages.length > 0) {
      data.galleryImages.forEach((url, index) => {
        materialsToCreate.push({
          designId: design.id,
          format: MaterialFormat.PHOTO,
          url,
          metadata: {
            role: index === 0 ? 'cover' : 'gallery',
            order: index,
          },
        })
      })
    }

    // Create all materials in a transaction
    if (materialsToCreate.length > 0) {
      await prisma.material.createMany({
        data: materialsToCreate,
      })
    }

    // Create initial status history entry
    await prisma.designStatusHistory.create({
      data: {
        designId: design.id,
        status: DesignStatus.CREATIVE,
        note: 'Design created',
      },
    })

    // Return design with materials
    return await prisma.design.findUnique({
      where: { id: design.id },
      include: { materials: true },
    })
  } catch (error: any) {
    console.error('Error creating design:', error)
    
    // Provide user-friendly error message
    if (error.message?.includes('not initialized') || error.message?.includes('DATABASE_URL')) {
      throw new Error(
        'Клиент Prisma не инициализирован. Пожалуйста, укажите параметр DATABASE_URL в файле .env.local'
      )
    }
    
    throw new Error(
      error.message ||
        'Не удалось создать дизайн. Проверьте подключение к базе данных и убедитесь, что DATABASE_URL установлен в .env.local'
    )
  }
}

export async function updateDesignStatus(designId: string, status: DesignStatus, note?: string) {
  // Get current design to check status progression
  const design = await prisma.design.findUnique({ where: { id: designId } })
  if (!design) throw new Error('Design not found')

  // Validate status progression (can only move forward)
  const statusOrder = [
    DesignStatus.CREATIVE,
    DesignStatus.MODELING_3D,
    DesignStatus.UV_TEMPLATE,
    DesignStatus.PRINTING,
    DesignStatus.FOR_SALE,
    DesignStatus.SOLD,
    DesignStatus.DELIVERY,
    DesignStatus.FEEDBACK,
  ]

  const currentIndex = statusOrder.indexOf(design.status)
  const newIndex = statusOrder.indexOf(status)

  if (newIndex < currentIndex) {
    throw new Error('Cannot move status backwards')
  }

  // Update design status and create history entry
  return await prisma.$transaction([
    prisma.design.update({
      where: { id: designId },
      data: { status },
    }),
    prisma.designStatusHistory.create({
      data: {
        designId,
        status,
        note: note || null,
      },
    }),
  ])
}

export async function togglePublish(designId: string, publish: boolean) {
  return prisma.design.update({
    where: { id: designId },
    data: { published: publish },
  })
}

export async function createDeal(designId: string, buyerName?: string, buyerEmail?: string) {
  return prisma.deal.create({
    data: {
      designId,
      buyerName: buyerName || null,
      buyerEmail: buyerEmail || null,
      status: 'open',
    },
  })
}

export async function markDealPaid(dealId: string) {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } })
  if (!deal) throw new Error('Deal not found')

  // Atomic transaction: update deal status and decrement available editions
  return await prisma.$transaction([
    prisma.deal.update({
      where: { id: dealId },
      data: { status: 'paid' },
    }),
    prisma.design.update({
      where: { id: deal.designId },
      data: {
        editionAvailable: { decrement: 1 },
        // Auto-update status to SOLD if all editions are sold
      },
    }),
  ])
}
