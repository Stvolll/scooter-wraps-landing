import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createDesign } from '@/app/admin/designs/actions'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const modelId = searchParams.get('modelId')

    const where = modelId ? { scooterModelId: modelId } : {}

    const designs = await prisma.design.findMany({
      where,
      include: {
        scooterModel: {
          select: {
            slug: true,
            name: true,
          },
        },
        materials: {
          select: {
            id: true,
            format: true,
            url: true,
            metadata: true,
          },
        },
        textures: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ designs })
  } catch (error: any) {
    console.error('Error fetching designs:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const {
      title,
      slug,
      scooterModel, // slug модели
      scooterModelId, // ID модели (альтернатива)
      description,
      price,
      coverImage,
      galleryImages,
      videoPreview,
      textureUrl,
      textures,
      editionTotal,
      editionAvailable,
      panorama,
    } = data

    if (!title || !slug || (!scooterModelId && !scooterModel)) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, and either scooterModelId or scooterModel' },
        { status: 400 }
      )
    }

    // Если передан slug модели, находим её ID
    let modelId = scooterModelId
    if (!modelId && scooterModel) {
      const model = await prisma.scooterModel.findUnique({
        where: { slug: scooterModel },
        select: { id: true },
      })
      if (!model) {
        return NextResponse.json(
          { error: `Scooter model with slug "${scooterModel}" not found` },
          { status: 404 }
        )
      }
      modelId = model.id
    }

    // Проверяем, существует ли дизайн с таким slug
    const existing = await prisma.design.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Design with slug "${slug}" already exists` },
        { status: 409 }
      )
    }

    // Получаем slug модели для createDesign action
    const model = await prisma.scooterModel.findUnique({
      where: { id: modelId },
      select: { slug: true },
    })

    if (!model) {
      return NextResponse.json(
        { error: `Scooter model with id "${modelId}" not found` },
        { status: 404 }
      )
    }

    // Используем обновленный createDesign action, который создает Materials
    const design = await createDesign({
      title,
      slug,
      scooterModel: model.slug,
      description: description || undefined,
      price: price || undefined,
      editionTotal: editionTotal || undefined,
      panorama: panorama || undefined,
      textureUrl: textureUrl || undefined,
      galleryImages: galleryImages || undefined,
      videoPreview: videoPreview || undefined,
    })

    return NextResponse.json(
      {
        message: 'Design created successfully',
        design,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating design:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create design' },
      { status: 500 }
    )
  }
}

