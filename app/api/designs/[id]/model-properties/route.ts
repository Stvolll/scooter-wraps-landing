/**
 * Model Properties API
 * Сохранение свойств 3D модели (камера, освещение, материалы)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/designs/[id]/model-properties
 * Сохранить свойства модели
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const designId = params.id
    const body = await request.json()

    // Проверка существования дизайна
    const design = await prisma.design.findUnique({
      where: { id: designId },
    })

    if (!design) {
      return NextResponse.json({ success: false, error: 'Design not found' }, { status: 404 })
    }

    // Сохранение или обновление свойств
    const modelProperties = await prisma.designModelProperties.upsert({
      where: { designId },
      update: {
        cameraPosition: body.cameraPosition || null,
        cameraTarget: body.cameraTarget || null,
        lighting: body.lighting || null,
        materials: body.materials || null,
        environmentMap: body.environmentMap || null,
      },
      create: {
        designId,
        cameraPosition: body.cameraPosition || null,
        cameraTarget: body.cameraTarget || null,
        lighting: body.lighting || null,
        materials: body.materials || null,
        environmentMap: body.environmentMap || null,
      },
    })

    return NextResponse.json({
      success: true,
      properties: modelProperties,
    })
  } catch (error: any) {
    console.error('Model properties save error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save model properties' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/designs/[id]/model-properties
 * Получить свойства модели
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const designId = params.id

    const modelProperties = await prisma.designModelProperties.findUnique({
      where: { designId },
    })

    return NextResponse.json({
      success: true,
      properties: modelProperties || null,
    })
  } catch (error: any) {
    console.error('Model properties get error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get model properties' },
      { status: 500 }
    )
  }
}


