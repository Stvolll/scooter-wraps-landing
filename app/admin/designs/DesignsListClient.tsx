'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '@/src/presentation/components/admin/Breadcrumbs'

type Design = {
  id: string
  title: string
  slug: string
  published: boolean
  coverImage?: string | null
  thumbnail?: string | null
  textureUrl?: string | null
  galleryImages?: string[]
  scooterModel?: { slug: string; name: string }
}

type ModelsMap = Record<string, { id: string; name: string; model?: string }>

export default function DesignsListClient() {
  const [designs, setDesigns] = useState<Design[]>([])
  const [models, setModels] = useState<ModelsMap>({})
  const [loading, setLoading] = useState(true)
  const [filterModel, setFilterModel] = useState<string>('all')
  const [actioning, setActioning] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/designs').then((r) => r.json()),
      fetch('/api/admin/models').then((r) => r.json()),
    ])
      .then(([designsRes, modelsRes]) => {
        if (designsRes.designs) setDesigns(designsRes.designs)
        if (modelsRes && typeof modelsRes === 'object') setModels(modelsRes)
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  const filteredDesigns =
    filterModel === 'all'
      ? designs
      : designs.filter((d) => d.scooterModel?.slug === filterModel)

  const modelList = Object.entries(models).map(([slug, m]) => ({
    slug,
    name: m.name,
  }))

  const handleDelete = async (design: Design) => {
    if (!confirm(`Удалить дизайн "${design.title}"?`)) return
    setActioning(design.id)
    try {
      const res = await fetch(`/api/admin/designs/${design.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDesigns((prev) => prev.filter((d) => d.id !== design.id))
      } else {
        const data = await res.json()
        alert(data.error || 'Ошибка удаления')
      }
    } catch (e: any) {
      alert(e.message || 'Ошибка удаления')
    } finally {
      setActioning(null)
    }
  }

  const handlePublish = async (design: Design, published: boolean) => {
    setActioning(design.id)
    try {
      const res = await fetch(`/api/admin/designs/${design.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      })
      if (res.ok) {
        setDesigns((prev) =>
          prev.map((d) => (d.id === design.id ? { ...d, published } : d))
        )
      } else {
        const data = await res.json()
        alert(data.error || 'Ошибка')
      }
    } catch (e: any) {
      alert(e.message || 'Ошибка')
    } finally {
      setActioning(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] p-8 flex items-center justify-center">
        <div className="text-white/60">Загрузка дизайнов...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pt-24 px-4 md:px-8 lg:px-16">
          <Breadcrumbs
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Designs' },
            ]}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Дизайны
              </h1>
              <p className="text-white/50 text-lg mt-1">
                {filteredDesigns.length} из {designs.length}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                className="px-4 py-2.5 rounded-2xl bg-[#2C2C2E] border border-white/10 text-white focus:ring-2 focus:ring-[#007AFF] focus:outline-none"
              >
                <option value="all">Все модели</option>
                {modelList.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.name}
                  </option>
                ))}
              </select>
              <Link
                href="/admin/designs/new"
                className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-6 py-3 rounded-2xl font-semibold transition-all"
              >
                + Создать дизайн
              </Link>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 lg:px-16">
          {filteredDesigns.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-white/60 mb-4">
                {designs.length === 0
                  ? 'Дизайнов пока нет'
                  : 'Нет дизайнов для выбранной модели'}
              </p>
              <Link
                href="/admin/designs/new"
                className="inline-block bg-[#007AFF] hover:bg-[#0051D5] text-white px-6 py-3 rounded-2xl font-semibold"
              >
                Создать дизайн
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDesigns.map((design) => (
                <div
                  key={design.id}
                  className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-all"
                >
                  <div className="aspect-[4/3] bg-neutral-800 relative">
                    <img
                      src={
                        design.thumbnail ||
                        design.coverImage ||
                        (design.galleryImages && design.galleryImages[0]) ||
                        '/images/placeholder-preview.jpg'
                      }
                      alt={design.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmMyYzJlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBwcmV2aWV3PC90ZXh0Pjwvc3ZnPg=='
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          design.published
                            ? 'bg-[#34C759]/20 text-[#34C759]'
                            : 'bg-white/20 text-white/80'
                        }`}
                      >
                        {design.published ? 'Опубликован' : 'Черновик'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {design.title}
                    </h3>
                    <p className="text-sm text-white/50 mb-3">
                      {design.scooterModel?.name || '—'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/designs/${design.id}`}
                        className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        Редактировать
                      </Link>
                      <button
                        type="button"
                        disabled={actioning === design.id}
                        onClick={() =>
                          handlePublish(design, !design.published)
                        }
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        {design.published ? 'Снять' : 'Опубликовать'}
                      </button>
                      <button
                        type="button"
                        disabled={actioning === design.id}
                        onClick={() => handleDelete(design)}
                        className="bg-[#FF3B30]/20 hover:bg-[#FF3B30]/30 text-[#FF3B30] px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
