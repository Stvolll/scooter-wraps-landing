import { NextRequest, NextResponse } from 'next/server'
import { categoryStore, initSampleData } from '@/lib/skuStore'
import { CreateCategoryDto } from '@/types/sku'

export const dynamic = 'force-dynamic'

// Initialize sample data on first API call
let initialized = false
if (!initialized) {
  initSampleData()
  initialized = true
}

// GET /api/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tree = searchParams.get('tree') === 'true'

    const categories = tree ? categoryStore.findTree() : categoryStore.findAll()

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    const data: CreateCategoryDto = {
      name: body.name,
      slug: body.slug,
      parent_id: body.parent_id || null,
    }

    const category = categoryStore.create(data)

    return NextResponse.json(
      {
        success: true,
        data: category,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create category' },
      { status: 400 }
    )
  }
}
