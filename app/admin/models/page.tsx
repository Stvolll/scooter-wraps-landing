// app/admin/models/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Breadcrumbs from '@/src/presentation/components/admin/Breadcrumbs'
import ModelsListClient from './ModelsListClient'

export default async function ModelsPage() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')?.value

  if (!authCookie || authCookie !== 'authenticated') {
    redirect('/admin/login')
  }

  // Получаем модели из БД
  let models = {}
  let dbError = null
  
  try {
    const modelsData = await prisma.scooterModel.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: {
        designs: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    // Преобразуем в формат, ожидаемый фронтендом
    models = modelsData.reduce((acc, model) => {
      acc[model.slug] = {
        id: model.slug,
        name: model.name,
        model: model.model,
        panorama: model.panorama,
        designs: model.designs,
      }
      return acc
    }, {} as Record<string, any>)
  } catch (error: any) {
    console.error('❌ Database error:', error.message)
    dbError = error.message
    // Fallback на config/scooters.js если БД не настроена
    try {
      const { scooters } = await import('@/config/scooters')
      models = scooters
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError)
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pt-24 px-4 md:px-8 lg:px-16">
          <Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'Models' }]} />
          <div className="mt-4">
          <Link
            href="/admin"
            className="text-[#007AFF] hover:text-[#0051D5] mb-6 inline-flex items-center gap-2 text-base font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Админ-панель
          </Link>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Модели скутеров</h1>
            <Link href="/admin/models/new">
              <button className="bg-[#007AFF] hover:bg-[#0051D5] active:scale-95 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all shadow-lg">
                + Добавить модель
              </button>
            </Link>
          </div>
          <p className="text-white/50 text-lg">Управление 3D-моделями и дизайнами</p>
          
          {dbError && (
            <div className="mt-4 p-4 rounded-2xl bg-[#FF3B30]/20 border border-[#FF3B30]/30">
              <p className="text-[#FF3B30] text-sm">
                ⚠️ База данных не настроена. Используются данные из файла. 
                <Link href="/docs/DATABASE_SETUP.md" className="underline ml-2">
                  Инструкция по настройке
                </Link>
              </p>
            </div>
          )}
          
          <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-3">📦 Иерархия системы</h2>
            <p className="text-white/70 mb-4">
              Структура построена от базовой 3D-модели к дизайнам. Каждая модель скутера имеет свои ветки с карточками дизайнов.
            </p>
            <div className="space-y-2 text-white/60 text-sm">
              <p><strong>1. Модель скутера:</strong> Базовая 3D-модель, загружается один раз</p>
              <p><strong>2. Дизайны:</strong> Используют одну базовую модель, но имеют уникальные UV-текстуры</p>
              <p><strong>3. Медиа-файлы:</strong> Для каждого дизайна: текстуры, панорама (фон), видео, галерея</p>
            </div>
          </div>
          </div>
        </div>

        <ModelsListClient initialScooters={models} usesDatabase={!dbError} />
      </div>
    </div>
  )
}

