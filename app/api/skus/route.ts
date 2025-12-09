import { NextRequest, NextResponse } from 'next/server'
import { skuStore, initSampleData } from '@/lib/skuStore'
import { CreateSKUDto, SKUFilterParams } from '@/types/sku'

export const dynamic = 'force-dynamic'

// Initialize sample data on first API call
let initialized = false
if (!initialized) {
  initSampleData()
  initialized = true
}

// GET /api/skus - List all SKUs with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const filters: SKUFilterParams = {
      category_id: searchParams.get('category_id') || undefined,
      status: (searchParams.get('status') as any) || undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      search: searchParams.get('search') || undefined,
    }

    const skus = skuStore.findAll(filters)

    return NextResponse.json({
      success: true,
      data: skus,
      count: skus.length,
      filters,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch SKUs' },
      { status: 500 }
    )
  }
}

// POST /api/skus - Create new SKU
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.code || !body.title || !body.description || body.price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: code, title, description, price' },
        { status: 400 }
      )
    }

    const data: CreateSKUDto = {
      code: body.code,
      title: body.title,
      description: body.description,
      price: Number(body.price),
      metadata: body.metadata || {},
      category_id: body.category_id || null,
      slug: body.slug,
      status: body.status || 'draft',
    }

    const sku = skuStore.create(data)

    return NextResponse.json(
      {
        success: true,
        data: sku,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create SKU' },
      { status: 400 }
    )
  }
}
