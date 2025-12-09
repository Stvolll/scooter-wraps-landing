// app/api/admin/designs/[id]/stages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DesignStatus } from '@prisma/client'
import { updateDesignStatus } from '@/app/admin/designs/actions'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json()
    const { status, note } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status enum
    if (!Object.values(DesignStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    await updateDesignStatus(id, status as DesignStatus, note)

    const updated = await prisma.design.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { at: 'desc' },
        },
      },
    })

    return NextResponse.json({ ok: true, design: updated })
  } catch (e: any) {
    console.error('Stage update error:', e)
    return NextResponse.json({ error: e.message || 'server error' }, { status: 500 })
  }
}
