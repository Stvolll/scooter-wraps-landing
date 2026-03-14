// app/admin/designs/new/page.tsx
'use client'

import { createDesign } from '../actions'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload'
import UploadGuide from '@/components/UploadGuide'
import DesignFileNamingHint from '@/components/admin/DesignFileNamingHint'
import Breadcrumbs from '@/src/presentation/components/admin/Breadcrumbs'

type ModelOption = { id: string; name: string }

export default function NewDesignPage() {
  const router = useRouter()
  const [panorama, setPanorama] = useState<string>('')
  const [textureUrl, setTextureUrl] = useState<string>('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [video, setVideo] = useState<string>('')
  const [selectedScooterModel, setSelectedScooterModel] = useState<string>('')
  const [models, setModels] = useState<ModelOption[]>([])

  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [dbConfigured, setDbConfigured] = useState<boolean | null>(null)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check authentication
  useEffect(() => {
    if (!mounted) return

    let cancelled = false

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/verify', {
          credentials: 'include',
          cache: 'no-store',
        })
        
        if (cancelled) return
        
        if (!response.ok) {
          console.log('Auth verification failed: response not ok')
          router.replace('/admin/login')
          return
        }
        
        const data = await response.json()
        
        if (cancelled) return
        
        if (!data.authenticated) {
          console.log('Auth verification failed: not authenticated')
          router.replace('/admin/login')
          return
        }
        
        setAuthChecked(true)
      } catch (err) {
        console.error('Auth check error:', err)
        if (!cancelled) {
          router.replace('/admin/login')
        }
      }
    }
    
    checkAuth()
    
    return () => {
      cancelled = true
    }
  }, [router, mounted])

  // Check database configuration
  useEffect(() => {
    if (!mounted || !authChecked) return

    const checkDbConfig = async () => {
      try {
        const response = await fetch('/api/admin/health/db', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setDbConfigured(data.configured || false)
        } else {
          setDbConfigured(false)
        }
      } catch (err) {
        console.error('Error checking DB config:', err)
        setDbConfigured(false)
      }
    }
    checkDbConfig()
  }, [mounted, authChecked])

  // Load models from API for dropdown
  useEffect(() => {
    if (!mounted || !authChecked) return
    fetch('/api/admin/models')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          const list = Object.entries(data).map(([slug, m]: [string, any]) => ({
            id: slug,
            name: m.name || slug,
          }))
          setModels(list)
          if (list.length > 0 && !selectedScooterModel) {
            setSelectedScooterModel(list[0].id)
          }
        }
      })
      .catch(console.error)
  }, [mounted, authChecked])

  // Show loading state until auth is checked
  if (!mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{
          background:
            'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(15, 15, 15, 1) 5%, rgba(15, 15, 15, 1) 100%)',
        }}
      >
        <div className="w-full max-w-md p-8 rounded-3xl">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-4"></div>
            <div className="h-4 bg-white/10 rounded mb-8"></div>
          </div>
        </div>
      </div>
    )
  }
  
  // If auth check is not complete yet, show loading
  if (!authChecked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{
          background:
            'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(15, 15, 15, 1) 5%, rgba(15, 15, 15, 1) 100%)',
        }}
      >
        <div className="w-full max-w-md p-8 rounded-3xl">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-4"></div>
            <div className="h-4 bg-white/10 rounded mb-8"></div>
            <p className="text-white/60 text-sm text-center">Проверка авторизации...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (formData: FormData) => {
    setError('')
    setLoading(true)

    try {
      const title = formData.get('title') as string
      const slug = formData.get('slug') as string
      const scooterModel = formData.get('scooterModel') as string
      const price = Number(formData.get('price') || 0)
      const editionTotal = Number(formData.get('editionTotal') || 5)
      const description = formData.get('description') as string

      await createDesign({
        title,
        slug,
        scooterModel,
        price,
        editionTotal,
        description,
        panorama: panorama || undefined,
        textureUrl: textureUrl || undefined,
        galleryImages,
        videoPreview: video || undefined,
      })

      router.push('/admin/designs')
    } catch (err: any) {
      console.error('Error creating design:', err)
      setError(err.message || 'Failed to create design. Please check your database connection.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(15, 15, 15, 1) 5%, rgba(15, 15, 15, 1) 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 pt-24 px-4 md:px-8 lg:px-16">
          <Breadcrumbs
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Designs', href: '/admin/designs' },
              { label: 'New design' },
            ]}
          />
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2 mt-4">Новый дизайн</h1>
          <p className="text-white/60">Создание дизайна: модель, текстура UV, фото, видео, фон</p>
        </div>

        <div
          className="p-6 mx-4 md:mx-8 lg:mx-16"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRadius: '28px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow:
              '0 8px 32px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
          }}
        >
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Title (Название) *
              </label>
              <input
                name="title"
                required
                placeholder="Например: Neon Blade"
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                }}
              />
              <p className="text-xs text-white/50 mt-1">
                Название дизайна, которое будет отображаться на сайте
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Slug (URL-адрес) *
              </label>
              <input
                name="slug"
                required
                placeholder="Например: neon-blade"
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                }}
              />
              <p className="text-xs text-white/50 mt-1">
                Уникальный идентификатор для URL (только латиница, дефисы, без пробелов)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Модель скутера *
              </label>
              <select
                name="scooterModel"
                required
                value={selectedScooterModel}
                onChange={(e) => setSelectedScooterModel(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                }}
              >
                <option value="" className="bg-black text-white">Выберите модель</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id} className="bg-black text-white">
                    {m.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-white/50 mt-1">
                Модель скутера, для которой создаётся дизайн.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Price (Цена в VND)
              </label>
              <input
                name="price"
                type="number"
                defaultValue={0}
                placeholder="0"
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                }}
              />
              <p className="text-xs text-white/50 mt-1">
                Цена в вьетнамских донгах (0 = бесплатно)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Edition Total (Всего экземпляров)
              </label>
              <input
                name="editionTotal"
                type="number"
                defaultValue={5}
                placeholder="5"
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                }}
              />
              <p className="text-xs text-white/50 mt-1">
                Общее количество экземпляров этого дизайна (лимитированная серия)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Description (Описание)
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Опишите дизайн, его особенности, материалы..."
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                }}
              />
              <p className="text-xs text-white/50 mt-1">
                Подробное описание дизайна для отображения на сайте
              </p>
            </div>

            {/* File Uploads Section */}
            <div className="pt-6 border-t border-white/10">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">📁 Файлы дизайна</h3>
                <p className="text-sm text-white/60 mb-4">
                  Загрузите текстуру, фон, фото и видео. Имена файлов должны соответствовать соглашению ниже.
                </p>
                <div className="mb-4">
                  <DesignFileNamingHint />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <FileUpload
                    label="UV-текстура (UV-*.jpg / UV-*.png) *"
                    accept="image/jpeg,image/jpg,image/png"
                    onUploadComplete={url => setTextureUrl(url)}
                    fileType="image"
                  />
                  <p className="text-xs text-white/50 mt-1 ml-4">
                    Текстура дизайна, накладывается на меш. Рекомендуется: 512×512px, JPG/PNG
                  </p>
                </div>

                <div>
                  <FileUpload
                    label="Фон сцены (panoram-*.webp)"
                    accept="image/webp"
                    onUploadComplete={url => setPanorama(url)}
                    fileType="panorama"
                  />
                  <p className="text-xs text-white/50 mt-1 ml-4">
                    Фон 3D-сцены. Рекомендуется: 4096×2048px, WebP
                  </p>
                </div>

                <div>
                  <FileUpload
                    label="Фото карточки (photo-*.png)"
                    accept="image/webp,image/png,image/jpeg"
                    onUploadComplete={url => setGalleryImages([...galleryImages, url])}
                    fileType="image"
                  />
                  <p className="text-xs text-white/50 mt-1 ml-4">
                    Фотографии для карточки товара. Первое — обложка.
                  </p>
                  {galleryImages.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {galleryImages.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/20">
                          <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <div className="absolute top-0 left-0 bg-[#00FFA9] text-black text-[10px] px-1">
                              Обложка
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <FileUpload
                    label="Видео карточки (video-*.mp4)"
                    accept="video/mp4"
                    onUploadComplete={url => setVideo(url)}
                    fileType="video"
                  />
                  <p className="text-xs text-white/50 mt-1 ml-4">
                    Видео для карточки. MP4, до 30 сек, 1920×1080
                  </p>
                  {video && (
                    <div className="mt-2 p-2 rounded-lg bg-[#00FFA9]/10 border border-[#00FFA9]/20 flex items-center justify-between">
                      <span className="text-xs text-[#00FFA9]">✓ Видео загружено</span>
                      <button
                        type="button"
                        onClick={() => setVideo('')}
                        className="text-red-400 text-xs hover:text-red-300"
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Guide - Collapsible */}
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-medium text-[#00FFA9] hover:text-[#00D4FF] transition-colors">
                  📋 Подробное руководство по загрузке файлов
                </summary>
                <div className="mt-4">
                  <UploadGuide />
                </div>
              </details>
            </div>

            {dbConfigured === false && (
              <div className="p-4 rounded-xl bg-yellow-500/20 border border-yellow-500/30 mb-4">
                <div className="text-yellow-400 text-sm">
                  <strong>⚠️ База данных не настроена</strong>
                  <p className="mt-2 text-yellow-300/80">
                    Для создания дизайнов необходимо настроить базу данных. Добавьте в файл <code className="bg-black/30 px-1 rounded">.env.local</code>:
                  </p>
                  <pre className="mt-2 p-2 bg-black/30 rounded text-xs overflow-x-auto">
                    DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
                  </pre>
                  <p className="mt-2 text-yellow-300/80 text-xs">
                    После настройки перезапустите dev сервер и выполните миграции: <code className="bg-black/30 px-1 rounded">npx prisma migrate dev</code>
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || dbConfigured === false}
              className="px-6 py-3 rounded-2xl font-semibold text-black transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
              }}
            >
              {loading ? 'Creating...' : dbConfigured === false ? 'Database Not Configured' : 'Create Design'}
            </button>
          </form>
        </div>

        {/* Process Flow Diagram */}
        <div
          className="p-6 mx-4 md:mx-8 lg:mx-16 mt-6 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">🆕 Create New Design Process</h2>
          <div className="mb-4">
            <p className="text-white/70 mb-4">
              Процесс создания нового дизайна включает заполнение базовой информации и загрузку файлов. 
              После создания дизайна вы сможете управлять его стадиями и загружать дополнительные файлы через страницу редактирования.
            </p>
          </div>
          
          {/* Process Flow */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00FFA9]/20 flex items-center justify-center text-[#00FFA9] font-bold text-sm">1</div>
                  <h3 className="text-white font-semibold text-sm">Basic Info</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Заполнение базовой информации: название, slug, модель скутера, цена, описание
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] font-bold text-sm">2</div>
                  <h3 className="text-white font-semibold text-sm">File Upload</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Загрузка файлов: обложка, 3D модель (GLB), текстуры (опционально на этом этапе)
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00FFA9]/20 flex items-center justify-center text-[#00FFA9] font-bold text-sm">3</div>
                  <h3 className="text-white font-semibold text-sm">Create</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Сохранение дизайна в базу данных со статусом CREATIVE (начальная стадия)
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] font-bold text-sm">4</div>
                  <h3 className="text-white font-semibold text-sm">Edit & Manage</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Переход к странице редактирования для управления стадиями и пакетной загрузки файлов
                </p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Важные моменты:</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Slug:</strong> Должен быть уникальным и содержать только латиницу, дефисы, без пробелов. Используется в URL дизайна</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Initial Status:</strong> Новый дизайн создается со статусом CREATIVE - начальная стадия жизненного цикла</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Текстуры дизайна:</strong> Уникальны для каждого дизайна. Накладываются на модель. Загружаются в AWS S3</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Edition Total:</strong> Устанавливает лимит экземпляров для лимитированной серии (по умолчанию 5)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
