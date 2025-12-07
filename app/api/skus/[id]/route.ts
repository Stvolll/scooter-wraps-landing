import { NextRequest, NextResponse } from 'next/server'
import { skuStore } from '@/lib/skuStore'
import { UpdateSKUDto } from '@/types/sku'

export const dynamic = 'force-dynamic'

// GET /api/skus/[id] - Get single SKU
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sku = skuStore.findById(params.id)
    
    if (!sku) {
      return NextResponse.json(
        { success: false, error: 'SKU not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: sku,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch SKU' },
      { status: 500 }
    )
  }
}

// PATCH /api/skus/[id] - Update SKU
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const data: UpdateSKUDto = {}
    if (body.code !== undefined) data.code = body.code
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.price !== undefined) data.price = Number(body.price)
    if (body.metadata !== undefined) data.metadata = body.metadata
    if (body.category_id !== undefined) data.category_id = body.category_id
    if (body.slug !== undefined) data.slug = body.slug
    if (body.status !== undefined) data.status = body.status
    
    const sku = skuStore.update(params.id, data)
    
    if (!sku) {
      return NextResponse.json(
        { success: false, error: 'SKU not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: sku,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update SKU' },
      { status: 400 }
    )
  }
}

// DELETE /api/skus/[id] - Delete SKU
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = skuStore.delete(params.id)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'SKU not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'SKU deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete SKU' },
      { status: 500 }
    )
  }
}


