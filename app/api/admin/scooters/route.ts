import { NextResponse } from 'next/server'
import { scooters as scootersConfig } from '@/config/scooters'

// Временное решение: читаем из конфига
// TODO: В будущем переместить в базу данных
export async function GET() {
  try {
    const scooters = Object.values(scootersConfig).map((scooter: any) => ({
      id: scooter.id,
      name: scooter.name,
      model: scooter.model,
      panorama: scooter.panorama,
      designCount: scooter.designs?.length || 0,
    }))

    return NextResponse.json({ scooters })
  } catch (error) {
    console.error('Error loading scooters:', error)
    return NextResponse.json(
      { error: 'Failed to load scooters' },
      { status: 500 }
    )
  }
}

// POST: Создание новой модели
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // TODO: Сохранить в базу данных
    // Пока возвращаем успех
    return NextResponse.json({ 
      success: true,
      message: 'Модель будет добавлена после настройки базы данных',
      data 
    })
  } catch (error) {
    console.error('Error creating scooter:', error)
    return NextResponse.json(
      { error: 'Failed to create scooter' },
      { status: 500 }
    )
  }
}



