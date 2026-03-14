'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Breadcrumbs from '@/src/presentation/components/admin/Breadcrumbs'

export default function ModelDetailsPage() {
  const params = useParams()
  const modelId = (params?.id as string) ?? ''

  const [loading, setLoading] = useState(true)
  const [model, setModel] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/models/${modelId}`)
        
        if (!response.ok) {
          throw new Error(`Failed to load model: ${response.status}`)
        }
        
        const data = await response.json()
        setModel(data.model)
      } catch (err: any) {
        console.error('Error loading model:', err)
        setError(err.message || 'Failed to load model')
      } finally {
        setLoading(false)
      }
    }

    if (modelId) {
      loadModel()
    }
  }, [modelId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
          <p className="text-white/60">Загрузка модели...</p>
        </div>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-[#000000] p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Модель не найдена</h1>
          <p className="text-white/60 mb-4">{error || 'Не удалось загрузить модель.'}</p>
          <Link href="/admin/models" className="text-[#007AFF] hover:text-[#0051D5] inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Вернуться к списку моделей
          </Link>
        </div>
      </div>
    )
  }

  const designs = model.designs || []

  return (
    <div className="min-h-screen bg-[#000000] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pt-24 px-4 md:px-8 lg:px-16">
          <Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'Models', href: '/admin/models' }, { label: model.name || modelId }]} />
          <div className="mt-4">
          <Link
            href="/admin/models"
            className="text-[#007AFF] hover:text-[#0051D5] mb-6 inline-flex items-center gap-2 text-base font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Все модели
          </Link>
          
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
                {model.name}
              </h1>
              <p className="text-white/50 text-lg">ID: {model.id}</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/admin/models/${modelId}/edit`}>
                <button className="bg-[#007AFF] hover:bg-[#0051D5] active:scale-95 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all shadow-lg">
                  Редактировать модель
                </button>
              </Link>
              <Link href={`/admin/models/${modelId}/designs/create`}>
                <button className="bg-[#00FFA9] hover:bg-[#00D4FF] active:scale-95 text-[#000000] px-6 py-3.5 rounded-2xl font-semibold transition-all shadow-lg">
                  + Новый дизайн
                </button>
              </Link>
            </div>
          </div>
          </div>
        </div>

        {/* Model Info */}
        <div className="mb-8 px-4 md:px-8 lg:px-16">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Информация о модели</h2>
            <div className="grid md:grid-cols-2 gap-4 text-white/70">
              <div>
                <p className="text-white/50 text-sm mb-1">Название</p>
                <p className="text-white">{model.name}</p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Модель</p>
                <p className="text-white">{model.model || 'Не указано'}</p>
              </div>
              {model.panorama && (
                <div>
                  <p className="text-white/50 text-sm mb-1">Панорама</p>
                  <p className="text-white break-all">{model.panorama}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Designs List */}
        <div className="px-4 md:px-8 lg:px-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Дизайны ({designs.length})
            </h2>
          </div>

          {designs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-white/60 mb-4">У этой модели пока нет дизайнов</p>
              <Link href={`/admin/models/${modelId}/designs/create`}>
                <button className="bg-[#00FFA9] hover:bg-[#00D4FF] text-[#000000] px-6 py-3 rounded-xl font-semibold transition-colors">
                  Создать первый дизайн
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design: any) => (
                <Link
                  key={design.id}
                  href={`/admin/models/${modelId}/designs/${design.slug || design.id}`}
                  className="group"
                >
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="aspect-square rounded-xl overflow-hidden bg-neutral-800 mb-4">
                      {design.coverImage || design.thumbnail ? (
                        <img
                          src={design.coverImage || design.thumbnail}
                          alt={design.title || design.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {design.title || design.name || 'Без названия'}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <span>ID: {design.slug || design.id}</span>
                      {design.filmType && (
                        <span className="px-2 py-1 rounded bg-[#007AFF]/20 text-[#007AFF]">
                          {design.filmType}
                        </span>
                      )}
                    </div>
                    {design.status && (
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          design.status === 'FOR_SALE' ? 'bg-[#00FFA9]/20 text-[#00FFA9]' :
                          design.status === 'SOLD' ? 'bg-[#FF3B30]/20 text-[#FF3B30]' :
                          'bg-white/10 text-white/60'
                        }`}>
                          {design.status}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


