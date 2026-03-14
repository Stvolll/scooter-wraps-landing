import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const models = await prisma.scooterModel.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: {
        designs: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    // Преобразуем в формат, ожидаемый фронтендом (объект)
    const modelsObj = models.reduce((acc, model) => {
      acc[model.slug] = {
        id: model.slug,
        name: model.name,
        model: model.model,
        panorama: model.panorama,
        designs: model.designs,
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(modelsObj)
  } catch (error: any) {
    console.error('Error fetching models:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, id: slug, model, panorama } = await req.json()

    if (!name || !slug || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: name, id, model' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли модель с таким slug
    const existing = await prisma.scooterModel.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Model with ID "${slug}" already exists` },
        { status: 409 }
      )
    }

    const newModel = await prisma.scooterModel.create({
      data: {
        slug,
        name,
        model,
        panorama: panorama || null,
        active: true,
        order: 0,
      },
    })

    return NextResponse.json(
      {
        message: 'Model created successfully',
        model: {
          id: newModel.slug,
          name: newModel.name,
          model: newModel.model,
          panorama: newModel.panorama,
          designs: [],
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create model' },
      { status: 500 }
    )
  }
}
