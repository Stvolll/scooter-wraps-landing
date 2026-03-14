'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Breadcrumbs from '@/src/presentation/components/admin/Breadcrumbs'
import DesignFileNamingHint from '@/components/admin/DesignFileNamingHint'
import FileUpload from '@/components/FileUpload'
import FileDisplay from '@/components/FileDisplay'

const AdminDesignPreview3D = dynamic(
  () => import('@/components/admin/AdminDesignPreview3D'),
  { ssr: false, loading: () => <div className="h-[400px] flex items-center justify-center bg-[#1a1a1a] rounded-xl text-white/60">Загрузка 3D...</div> }
)

type Design = {
  id: string
  title: string
  slug: string
  published: boolean
  textureUrl?: string | null
  panorama?: string | null
  galleryImages?: string[]
  videoPreview?: string | null
  thumbnail?: string | null
  scooterModel?: { slug: string; name: string }
}

export default function EditDesignPage() {
  const params = useParams()
  const router = useRouter()
  const designId = (params?.id as string) ?? ''

  const [design, setDesign] = useState<Design | null>(null)
  const [modelUrl, setModelUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [textureUrl, setTextureUrl] = useState('')
  const [panorama, setPanorama] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [video, setVideo] = useState('')

  useEffect(() => {
    if (!designId) return
    fetch(`/api/admin/designs/${designId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Design not found')
        return r.json()
      })
      .then((data) => {
        const d = data.design
        setDesign(d)
        setTitle(d.title || '')
        setTextureUrl(d.textureUrl || d.textureWebp || '')
        setPanorama(d.panorama || d.bgWebp || '')
        setGalleryImages(Array.isArray(d.galleryImages) ? d.galleryImages : [])
        setVideo(d.videoPreview || '')
        const modelSlug = d.scooterModel?.slug
        if (modelSlug) {
          return fetch('/api/admin/models')
            .then((r2) => r2.json())
            .then((models: Record<string, { model?: string }>) => {
              setModelUrl(models[modelSlug]?.model || '')
            })
        }
      })
      .catch((e) => {
        setError(e.message || 'Ошибка загрузки')
      })
      .finally(() => setLoading(false))
  }, [designId])

  const handleSave = async () => {
    if (!design) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/designs/${design.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          textureUrl: textureUrl || null,
          panorama: panorama || null,
          galleryImages,
          videoPreview: video || null,
          coverImage: galleryImages[0] || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Ошибка сохранения')
      }
      setDesign((prev) => prev ? { ...prev, title, textureUrl, panorama, galleryImages, videoPreview: video } : null)
    } catch (e: any) {
      setError(e.message || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] p-8 flex items-center justify-center">
        <div className="text-white/60">Загрузка...</div>
      </div>
    )
  }

  if (error || !design) {
    return (
      <div className="min-h-screen bg-[#000000] p-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/80 mb-4">{error || 'Дизайн не найден'}</p>
          <Link href="/admin/designs" className="text-[#007AFF] hover:underline">
            ← К списку дизайнов
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 pt-24">
          <Breadcrumbs
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Designs', href: '/admin/designs' },
              { label: design.title },
            ]}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Редактирование: {design.title}
            </h1>
            <div className="flex gap-3">
              <Link
                href="/admin/designs"
                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-2xl font-medium"
              >
                ← К списку
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-5 py-2.5 rounded-2xl font-semibold disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
          <p className="text-white/50 mt-1">
            Модель: {design.scooterModel?.name || '—'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FF3B30]/20 border border-[#FF3B30]/30 text-[#FF3B30]">
            {error}
          </div>
        )}

        {/* 3D Preview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">3D предпросмотр</h2>
          <AdminDesignPreview3D
            modelUrl={modelUrl}
            designId={design.id}
            className="h-[400px] w-full"
          />
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Соглашение имён файлов</h2>
          <DesignFileNamingHint />
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-[#1C1C1E] border border-white/10 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#2C2C2E] border border-white/10 text-white focus:ring-2 focus:ring-[#007AFF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              UV-текстура (UV-*.jpg / UV-*.png)
            </label>
            {textureUrl ? (
              <div className="space-y-2">
                <FileDisplay
                  url={textureUrl}
                  label="Текстура"
                  fileType="image"
                  onReplace={() => setTextureUrl('')}
                />
                <FileUpload
                  label="Заменить"
                  accept="image/jpeg,image/jpg,image/png"
                  fileType="image"
                  onUploadComplete={(url) => setTextureUrl(url)}
                />
              </div>
            ) : (
              <FileUpload
                label="Загрузить UV-текстуру"
                accept="image/jpeg,image/jpg,image/png"
                fileType="image"
                onUploadComplete={(url) => setTextureUrl(url)}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Фон сцены (panoram-*.webp)
            </label>
            {panorama ? (
              <div className="space-y-2">
                <FileDisplay
                  url={panorama}
                  label="Фон"
                  fileType="image"
                  onReplace={() => setPanorama('')}
                />
                <FileUpload
                  label="Заменить"
                  accept="image/webp"
                  fileType="panorama"
                  onUploadComplete={(url) => setPanorama(url)}
                />
              </div>
            ) : (
              <FileUpload
                label="Загрузить фон"
                accept="image/webp"
                fileType="panorama"
                onUploadComplete={(url) => setPanorama(url)}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Фото карточки (photo-*.png)
            </label>
            <FileUpload
              label="Добавить фото"
              accept="image/webp,image/png,image/jpeg"
              fileType="image"
              onUploadComplete={(url) => setGalleryImages((prev) => [...prev, url])}
            />
            {galleryImages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {galleryImages.map((url, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/20">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-0 left-0 bg-[#34C759] text-black text-[10px] px-1">
                        Обложка
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Видео карточки (video-*.mp4)
            </label>
            {video ? (
              <div className="space-y-2">
                <p className="text-white/60 text-sm">Загружено</p>
                <button
                  type="button"
                  onClick={() => setVideo('')}
                  className="text-[#FF3B30] text-sm hover:underline"
                >
                  Удалить видео
                </button>
              </div>
            ) : (
              <FileUpload
                label="Загрузить видео"
                accept="video/mp4"
                fileType="video"
                onUploadComplete={(url) => setVideo(url)}
              />
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-6 py-3 rounded-2xl font-semibold disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <Link
              href="/admin/designs"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-medium"
            >
              Отмена
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
