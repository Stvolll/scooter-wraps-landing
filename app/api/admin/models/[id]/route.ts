import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: slug } = await params

    const model = await prisma.scooterModel.findUnique({
      where: { slug },
      include: {
        designs: {
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

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    // Transform designs to include only needed fields
    const designs = model.designs.map((design: any) => ({
      id: design.id,
      title: design.title, // Main title field
      name: design.title, // Alias for backward compatibility
      slug: design.slug,
      thumbnail: design.thumbnail,
      coverImage: design.coverImage,
      price: design.price,
      textureUrl: design.textureUrl,
      panorama: design.panorama,
      videoPreview: design.videoPreview,
      galleryImages: design.galleryImages,
      description: design.description,
      status: design.status,
      published: design.published,
      // New WebP and SEO fields
      textureWebp: design.textureWebp,
      bgWebp: design.bgWebp,
      filmType: design.filmType,
      seoTitle: design.seoTitle,
      // Legacy fields for compatibility
      texture: design.textureUrl || design.textureWebp,
      images: design.galleryImages,
      video: design.videoPreview,
      // Design info object for compatibility
      design_info: {
        film_type: design.filmType,
        seo_title: design.seoTitle || design.title,
      },
      // Materials array
      materials: design.materials ? design.materials.map((m: any) => ({
        id: m.id,
        format: m.format,
        url: m.url,
        metadata: m.metadata || {},
      })) : [],
    }))

    return NextResponse.json({
      model: {
        id: model.slug,
        name: model.name,
        model: model.model,
        panorama: model.panorama,
        designs,
      },
    })
  } catch (error: any) {
    console.error('Error fetching model:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: slug } = await params
    const { name, model: modelPath, panorama, glbModelUrl } = await req.json()

    const model = await prisma.scooterModel.findUnique({
      where: { slug },
    })

    if (!model) {
      return NextResponse.json(
        { error: `Model with ID "${slug}" not found` },
        { status: 404 }
      )
    }

    // Удаляем старый GLB файл, если загружается новый
    const newModelPath = modelPath || glbModelUrl
    const oldModelPath = model.glbModelUrl || model.model
    
    if (newModelPath && oldModelPath && newModelPath !== oldModelPath) {
      try {
        // Проверяем, что это локальный файл (начинается с /uploads)
        if (oldModelPath.startsWith('/uploads/models/')) {
          const oldFilePath = join(process.cwd(), 'public', oldModelPath)
          if (existsSync(oldFilePath)) {
            await unlink(oldFilePath)
            console.log(`✅ Старый файл модели удален: ${oldModelPath}`)
          } else {
            console.warn(`⚠️ Старый файл не найден: ${oldFilePath}`)
          }
        }
      } catch (deleteError: any) {
        // Не критично, если не удалось удалить старый файл
        console.warn(`⚠️ Не удалось удалить старый файл модели: ${deleteError.message}`)
      }
    }

    // Обновляем модель
    const updateData: any = {
      name: name || model.name,
      panorama: panorama !== undefined ? panorama : model.panorama,
    }

    // Используем glbModelUrl если доступен, иначе model (legacy)
    if (glbModelUrl) {
      updateData.glbModelUrl = glbModelUrl
    } else if (modelPath) {
      updateData.glbModelUrl = modelPath
      // Также обновляем legacy поле для совместимости
      updateData.model = modelPath
    }

    const updatedModel = await prisma.scooterModel.update({
      where: { slug },
      data: updateData,
    })

    return NextResponse.json({
      message: 'Model updated successfully',
      model: {
        id: updatedModel.slug,
        name: updatedModel.name,
        model: updatedModel.glbModelUrl || updatedModel.model,
        glbModelUrl: updatedModel.glbModelUrl,
        panorama: updatedModel.panorama,
      },
    })
  } catch (error: any) {
    console.error('Error updating model:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update model' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: slug } = await params

    const model = await prisma.scooterModel.findUnique({
      where: { slug },
    })

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    // Удаляем модель (связанные дизайны удалятся каскадом)
    await prisma.scooterModel.delete({
      where: { slug },
    })

    return NextResponse.json({ message: 'Model deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting model:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete model' },
      { status: 500 }
    )
  }
}
