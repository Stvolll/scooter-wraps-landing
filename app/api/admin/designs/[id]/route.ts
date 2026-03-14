import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// Новая архитектура
import { ApplicationContext } from '@/src/application/ApplicationContext'
import { PrismaToDomainAdapter } from '@/src/application/adapters/PrismaToDomainAdapter'
import { MaterialFormat } from '@/src/shared-core/types/MaterialFormat'
import { DesignId } from '@/src/shared-core/types/ValueObjects'

export const dynamic = 'force-dynamic'

// PUT: Update a design
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Build update data object using Prisma's type-safe approach
    // Use 'as any' to bypass TypeScript type checking for fields that Prisma Client might not recognize
    const updateData: any = {}
    
    if (body.title !== undefined && body.title !== null) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.price !== undefined && body.price !== null) updateData.price = Number(body.price)
    
    // Handle galleryImages - try direct assignment first, fallback to set if needed
    if (Array.isArray(body.galleryImages)) {
      // Try direct assignment (works in most Prisma versions)
      try {
        updateData.galleryImages = body.galleryImages
      } catch (e) {
        // Fallback to set syntax if direct assignment fails
        updateData.galleryImages = { set: body.galleryImages }
      }
    }
    
    if (body.videoPreview !== undefined) updateData.videoPreview = body.videoPreview || null
    if (body.textureUrl !== undefined) updateData.textureUrl = body.textureUrl || null
    if (body.panorama !== undefined) updateData.panorama = body.panorama || null
    if (body.editionTotal !== undefined && body.editionTotal !== null) updateData.editionTotal = Number(body.editionTotal)
    if (body.editionAvailable !== undefined && body.editionAvailable !== null) updateData.editionAvailable = Number(body.editionAvailable)
    if (body.status !== undefined && body.status !== null) updateData.status = body.status
    // Автоматическая установка published: true, если не указано явно
    if (body.published !== undefined && body.published !== null) {
      updateData.published = Boolean(body.published)
    } else {
      // Если published не указан, автоматически устанавливаем true
      updateData.published = true
    }
    
    // New WebP and SEO fields
    if (body.textureWebp !== undefined) updateData.textureWebp = body.textureWebp || null
    if (body.bgWebp !== undefined) updateData.bgWebp = body.bgWebp || null
    if (body.filmType !== undefined) updateData.filmType = body.filmType || null
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle || null
    
    // Handle coverImage - save to thumbnail
    if (body.coverImage !== undefined && body.coverImage !== null) {
      updateData.thumbnail = body.coverImage
    }

    // Update the design
    // Use type assertion to bypass Prisma Client type checking issues with galleryImages
    const updatedDesign = await (prisma.design.update as any)({
      where: { id },
      data: updateData,
    })

    // Handle materials update - используем новую архитектуру с fallback
    if (Array.isArray(body.materials)) {
      try {
        // Пробуем использовать MaterialService из новой архитектуры
        const context = ApplicationContext.getInstance()
        
        // Удаляем старые материалы
        await prisma.material.deleteMany({
          where: { designId: id },
        })
        
        // Создаем новые материалы
        if (body.materials.length > 0) {
          // Если есть файлы для загрузки, используем MaterialService
          // Иначе создаем напрямую через Prisma
          for (const materialData of body.materials) {
            if (materialData.file) {
              // Загрузка через MaterialService (если файл предоставлен)
              try {
                await context.materialService.uploadMaterial(
                  DesignId(id),
                  materialData.format as MaterialFormat,
                  materialData.file
                )
                console.log('✅ Material uploaded using new architecture')
              } catch (error) {
                console.warn('⚠️ MaterialService upload failed, using direct Prisma:', error)
                // Fallback на прямое создание через Prisma
                await prisma.material.create({
                  data: {
                    designId: id,
                    format: materialData.format,
                    url: materialData.url,
                    metadata: materialData.metadata || {},
                  },
                })
              }
            } else {
              // Создаем напрямую через Prisma (если URL уже есть)
              await prisma.material.create({
                data: {
                  designId: id,
                  format: materialData.format,
                  url: materialData.url,
                  metadata: materialData.metadata || {},
                },
              })
            }
          }
        }
        
        console.log('✅ Materials saved using new architecture')
      } catch (error) {
        console.warn('⚠️ New architecture materials save failed, using legacy:', error)
        // Fallback на старую логику
        await prisma.material.deleteMany({
          where: { designId: id },
        })

        if (body.materials.length > 0) {
          const materialsToCreate = body.materials.map((material: any, index: number) => ({
            designId: id,
            format: material.format,
            url: material.url,
            metadata: {
              ...(material.metadata || {}),
              order: material.metadata?.order ?? index,
            },
          }))
          
          await prisma.material.createMany({
            data: materialsToCreate,
          })
        }
      }
    }

    // Fetch updated design with materials to return complete data
    const designWithMaterials = await prisma.design.findUnique({
      where: { id },
      include: {
        materials: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    return NextResponse.json({ success: true, design: designWithMaterials })
  } catch (error: any) {
    console.error('Error updating design:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update design' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a design
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Delete the design
    await prisma.design.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting design:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete design' },
      { status: 500 }
    )
  }
}

// GET: Get a single design
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const design = await prisma.design.findUnique({
      where: { id },
      include: {
        scooterModel: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    })

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ design })
  } catch (error: any) {
    console.error('Error fetching design:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch design' },
      { status: 500 }
    )
  }
}
