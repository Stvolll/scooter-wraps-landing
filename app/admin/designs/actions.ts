// app/admin/designs/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { DesignStatus } from '@prisma/client'

export async function createDesign(data: {
  title: string
  slug: string
  scooterModel: string
  description?: string
  price?: number
  editionTotal?: number
  coverImage?: string
  galleryImages?: string[]
  glbModelUrl?: string
  textureUrl?: string
}) {
  const design = await prisma.design.create({
    data: {
      title: data.title,
      slug: data.slug,
      scooterModel: data.scooterModel,
      description: data.description || null,
      price: data.price || 0,
      editionTotal: data.editionTotal || 5,
      editionAvailable: data.editionTotal || 5,
      coverImage: data.coverImage || null,
      galleryImages: data.galleryImages || [],
      glbModelUrl: data.glbModelUrl || null,
      textureUrl: data.textureUrl || null,
      status: DesignStatus.CREATIVE,
      published: false,
    },
  })

  // Create initial status history entry
  await prisma.designStatusHistory.create({
    data: {
      designId: design.id,
      status: DesignStatus.CREATIVE,
      note: 'Design created',
    },
  })

  return design
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
