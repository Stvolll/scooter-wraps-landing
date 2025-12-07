import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MODELS = [
  {
    id: 'honda-lead',
    name: 'Honda Lead',
    nameVi: 'Honda Lead',
    glbPath: '/models/honda-lead.glb',
    thumbnail: '/models/honda-lead-thumb.jpg',
    description: 'Phù hợp với Honda Lead các đời',
    availableDesigns: 15,
  },
  {
    id: 'honda-vision',
    name: 'Honda Vision',
    nameVi: 'Honda Vision',
    glbPath: '/models/honda-vision.glb',
    thumbnail: '/models/honda-vision-thumb.jpg',
    description: 'Phù hợp với Honda Vision các đời',
    availableDesigns: 18,
  },
  {
    id: 'honda-airblade',
    name: 'Honda Air Blade',
    nameVi: 'Honda Air Blade',
    glbPath: '/models/honda-airblade.glb',
    thumbnail: '/models/honda-airblade-thumb.jpg',
    description: 'Phù hợp với Honda Air Blade các đời',
    availableDesigns: 20,
  },
  {
    id: 'yamaha-nvx',
    name: 'Yamaha NVX',
    nameVi: 'Yamaha NVX',
    glbPath: '/models/yamaha-nvx.glb',
    thumbnail: '/models/yamaha-nvx-thumb.jpg',
    description: 'Phù hợp với Yamaha NVX các đời',
    availableDesigns: 12,
  },
  {
    id: 'vinfast',
    name: 'VinFast',
    nameVi: 'VinFast',
    glbPath: '/models/vinfast.glb',
    thumbnail: '/models/vinfast-thumb.jpg',
    description: 'Phù hợp với các mẫu xe điện VinFast',
    availableDesigns: 10,
  },
  {
    id: 'vespa',
    name: 'Vespa',
    nameVi: 'Vespa',
    glbPath: '/models/vespa.glb',
    thumbnail: '/models/vespa-thumb.jpg',
    description: 'Phù hợp với Vespa các đời',
    availableDesigns: 8,
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: MODELS,
      count: MODELS.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}

