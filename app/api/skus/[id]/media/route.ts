import { NextRequest, NextResponse } from 'next/server'
import { skuStore } from '@/lib/skuStore'
import { MediaFile } from '@/types/sku'

export const dynamic = 'force-dynamic'

// GET /api/skus/[id]/media - Get SKU media
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
      data: sku.media,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

// PATCH /api/skus/[id]/media - Update SKU media
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const mediaUpdate: Partial<{
      images: MediaFile[]
      videos: MediaFile[]
      description_file: MediaFile
      thumbnail: MediaFile
    }> = {}
    
    if (body.images !== undefined) mediaUpdate.images = body.images
    if (body.videos !== undefined) mediaUpdate.videos = body.videos
    if (body.description_file !== undefined) mediaUpdate.description_file = body.description_file
    if (body.thumbnail !== undefined) mediaUpdate.thumbnail = body.thumbnail
    
    const sku = skuStore.updateMedia(params.id, mediaUpdate)
    
    if (!sku) {
      return NextResponse.json(
        { success: false, error: 'SKU not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: sku.media,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update media' },
      { status: 400 }
    )
  }
}


