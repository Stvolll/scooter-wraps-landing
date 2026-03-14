
// app/api/admin/designs/by-model/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('admin_auth')?.value
    if (!authCookie || authCookie !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const model = searchParams.get('model')

    if (!model) {
      return NextResponse.json({ error: 'Model parameter is required' }, { status: 400 })
    }

    // Find designs for this model
    const designs = await prisma.design.findMany({
      where: {
        scooterModel: {
          slug: model,
        },
      },
      select: {
        id: true,
        slug: true, // Add slug for design lookup
        title: true, // Add title for reference
        scooterModel: {
          select: {
            slug: true,
            glbModelUrl: true, // Phase 2: From ScooterModel
            glbModelCompressed: true,
            glbModelMobile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(designs)
  } catch (error: any) {
    console.error('Error fetching designs by model:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch designs' }, { status: 500 })
  }
}




