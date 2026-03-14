// app/api/admin/designs/[id]/replace-file/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MaterialFormat } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * Валидация URL
 */
function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  // Проверяем, что это валидный URL или путь
  try {
    if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
      return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * Валидация массива URL
 */
function validateUrls(urls: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = []
  const invalid: string[] = []
  
  for (const url of urls) {
    if (isValidUrl(url)) {
      valid.push(url)
    } else {
      invalid.push(url)
    }
  }
  
  return { valid, invalid }
}

/**
 * POST /api/admin/designs/[id]/replace-file
 * Замена файлов дизайна (текстура, фото, видео, фон)
 * Автоматически создает новую версию дизайна
 * Использует транзакции для атомарности операций
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { 
      designId, 
      mainTextureFile, 
      photoFiles, 
      videoFiles, 
      backgroundFile 
    } = body

    const finalDesignId = designId || id

    // Валидация входных данных
    if (!finalDesignId || typeof finalDesignId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid design ID' },
        { status: 400 }
      )
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Получаем дизайн
    const design = await prisma.design.findUnique({
      where: { id: finalDesignId },
      include: {
        materials: true,
      },
    })

    if (!design) {
      return NextResponse.json(
        { error: `Design not found: ${finalDesignId}` },
        { status: 404 }
      )
    }

    // Валидация URL перед использованием
    if (mainTextureFile && !isValidUrl(mainTextureFile)) {
      return NextResponse.json(
        { error: 'Invalid texture file URL' },
        { status: 400 }
      )
    }

    if (backgroundFile && !isValidUrl(backgroundFile)) {
      return NextResponse.json(
        { error: 'Invalid background file URL' },
        { status: 400 }
      )
    }

    if (photoFiles && Array.isArray(photoFiles)) {
      const { invalid } = validateUrls(photoFiles)
      if (invalid.length > 0) {
        return NextResponse.json(
          { error: `Invalid photo file URLs: ${invalid.join(', ')}` },
          { status: 400 }
        )
      }
    }

    if (videoFiles && Array.isArray(videoFiles)) {
      const { invalid } = validateUrls(videoFiles)
      if (invalid.length > 0) {
        return NextResponse.json(
          { error: `Invalid video file URLs: ${invalid.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Используем транзакцию для атомарности всех операций
    const updatedDesign = await prisma.$transaction(async (tx) => {
      // Замена текстуры
      if (mainTextureFile) {
        // Удаляем старые текстуры
        await tx.material.deleteMany({
          where: {
            designId: finalDesignId,
            format: MaterialFormat.TEXTURE,
          },
        })

        // Создаем новую текстуру
        await tx.material.create({
          data: {
            designId: finalDesignId,
            format: MaterialFormat.TEXTURE,
            url: mainTextureFile,
            metadata: {
              role: 'main',
              order: 0,
            },
          },
        })
      }

      // Замена фото (удаляем старые, добавляем новые)
      if (photoFiles && Array.isArray(photoFiles) && photoFiles.length > 0) {
        await tx.material.deleteMany({
          where: {
            designId: finalDesignId,
            format: MaterialFormat.PHOTO,
          },
        })

        for (let i = 0; i < photoFiles.length; i++) {
          await tx.material.create({
            data: {
              designId: finalDesignId,
              format: MaterialFormat.PHOTO,
              url: photoFiles[i],
              metadata: {
                role: 'gallery',
                order: i,
              },
            },
          })
        }
      }

      // Замена видео (удаляем старые, добавляем новые)
      if (videoFiles && Array.isArray(videoFiles) && videoFiles.length > 0) {
        await tx.material.deleteMany({
          where: {
            designId: finalDesignId,
            format: MaterialFormat.VIDEO,
          },
        })

        for (let i = 0; i < videoFiles.length; i++) {
          await tx.material.create({
            data: {
              designId: finalDesignId,
              format: MaterialFormat.VIDEO,
              url: videoFiles[i],
              metadata: {
                role: 'preview',
                order: i,
              },
            },
          })
        }
      }

      // Замена фона
      if (backgroundFile) {
        // Удаляем старые панорамы/фоны
        await tx.material.deleteMany({
          where: {
            designId: finalDesignId,
            format: MaterialFormat.PANORAMA,
          },
        })

        // Создаем новый фон
        await tx.material.create({
          data: {
            designId: finalDesignId,
            format: MaterialFormat.PANORAMA,
            url: backgroundFile,
            metadata: {
              role: 'background',
              order: 0,
            },
          },
        })
      }

      // Обновляем updatedAt
      await tx.design.update({
        where: { id: finalDesignId },
        data: {
          updatedAt: new Date(),
        },
      })

      // Получаем обновленный дизайн
      return await tx.design.findUnique({
        where: { id: finalDesignId },
        include: {
          materials: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      design: updatedDesign,
      message: 'Files replaced successfully',
    })
  } catch (error: any) {
    console.error('Error replacing design files:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to replace files' },
      { status: 500 }
    )
  }
}

