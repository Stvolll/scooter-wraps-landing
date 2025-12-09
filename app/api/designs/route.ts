import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Design {
  id: string
  modelId: string
  name: string
  nameVi: string
  image: string
  price: number
  isNew: boolean
  style: string
  styleVi: string
  description: string
  tags: string[]
}

// Mock database - in production, this would query a real database
const DESIGNS: Design[] = [
  {
    id: '1',
    modelId: 'honda-lead',
    name: 'Carbon Fiber Black',
    nameVi: 'Carbon Đen',
    image: '/designs/carbon-black.jpg',
    price: 500000,
    isNew: false,
    style: 'sport',
    styleVi: 'Thể thao',
    description: 'Thiết kế carbon fiber đen sang trọng',
    tags: ['carbon', 'black', 'sport'],
  },
  {
    id: '2',
    modelId: 'honda-lead',
    name: 'Racing Stripes Red',
    nameVi: 'Sọc Đua Đỏ',
    image: '/designs/racing-red.jpg',
    price: 600000,
    isNew: true,
    style: 'racing',
    styleVi: 'Đua xe',
    description: 'Thiết kế sọc đua đỏ năng động',
    tags: ['racing', 'red', 'stripes'],
  },
  {
    id: '3',
    modelId: 'honda-vision',
    name: 'Matte Blue',
    nameVi: 'Xanh Mờ',
    image: '/designs/matte-blue.jpg',
    price: 550000,
    isNew: false,
    style: 'elegant',
    styleVi: 'Thanh lịch',
    description: 'Màu xanh mờ thanh lịch',
    tags: ['matte', 'blue', 'elegant'],
  },
  {
    id: '4',
    modelId: 'yamaha-nvx',
    name: 'Camouflage Green',
    nameVi: 'Ngụy Trang Xanh',
    image: '/designs/camo-green.jpg',
    price: 650000,
    isNew: true,
    style: 'military',
    styleVi: 'Quân đội',
    description: 'Họa tiết ngụy trang quân đội',
    tags: ['camo', 'green', 'military'],
  },
  {
    id: '5',
    modelId: 'vinfast',
    name: 'Electric Blue',
    nameVi: 'Xanh Điện',
    image: '/designs/electric-blue.jpg',
    price: 700000,
    isNew: false,
    style: 'futuristic',
    styleVi: 'Tương lai',
    description: 'Màu xanh điện tương lai',
    tags: ['electric', 'blue', 'futuristic'],
  },
  {
    id: '6',
    modelId: 'vespa',
    name: 'Vintage Cream',
    nameVi: 'Kem Cổ Điển',
    image: '/designs/vintage-cream.jpg',
    price: 800000,
    isNew: false,
    style: 'vintage',
    styleVi: 'Cổ điển',
    description: 'Màu kem cổ điển sang trọng',
    tags: ['vintage', 'cream', 'classic'],
  },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const modelId = searchParams.get('model')
    const style = searchParams.get('style')
    const isNew = searchParams.get('new') === 'true'
    const search = searchParams.get('search')

    let filteredDesigns = [...DESIGNS]

    if (modelId && modelId !== 'all') {
      filteredDesigns = filteredDesigns.filter(d => d.modelId === modelId)
    }

    if (style && style !== 'all') {
      filteredDesigns = filteredDesigns.filter(d => d.style === style)
    }

    if (isNew) {
      filteredDesigns = filteredDesigns.filter(d => d.isNew)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredDesigns = filteredDesigns.filter(
        d =>
          d.name.toLowerCase().includes(searchLower) ||
          d.nameVi.toLowerCase().includes(searchLower) ||
          d.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredDesigns,
      count: filteredDesigns.length,
      filters: {
        modelId: modelId || 'all',
        style: style || 'all',
        isNew,
        search: search || '',
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch designs' }, { status: 500 })
  }
}
