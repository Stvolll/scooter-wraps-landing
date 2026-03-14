'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'

export default function NewDesignForModelPage() {
  const params = useParams()
  const router = useRouter()
  const modelId = (params?.id as string) ?? ''
  
  const [designName, setDesignName] = useState('')
  const [uvTexture, setUvTexture] = useState('')
  const [panorama, setPanorama] = useState('')
  const [video, setVideo] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])

  const handleCreate = async () => {
    if (!designName || !uvTexture) {
      alert('Пожалуйста, заполните название и загрузите UV-текстуру')
      return
    }

    try {
      const response = await fetch('/api/admin/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: designName,
          slug: designName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          scooterModel: modelId,
          textureUrl: uvTexture,
          panorama: panorama,
          videoPreview: video,
          galleryImages: galleryImages,
          coverImage: galleryImages[0] || null,
          price: 0,
          editionTotal: 5,
          editionAvailable: 5,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create design')
      }

      const { design } = await response.json()
      alert(`Дизайн "${designName}" успешно создан!`)
      router.push(`/admin/models/${modelId}`)
    } catch (error: any) {
      console.error('Error creating design:', error)
      alert(`Ошибка создания дизайна: ${error.message}`)
    }
  }

  const handleAddGalleryImage = (url: string) => {
    setGalleryImages((prev) => [...prev, url])
  }

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-[#000000] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 pt-32">
          <Link
            href={`/admin/models/${modelId}`}
            className="text-[#007AFF] hover:text-[#0051D5] mb-6 inline-flex items-center gap-2 text-base font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Модели
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Новый дизайн
          </h1>
          <p className="text-white/50 text-lg">
            Создание дизайна для {modelId}
          </p>
        </div>

        <div className="bg-[#1C1C1E] rounded-3xl p-8 space-y-8 shadow-2xl">
          {/* Информационный блок */}
          <div className="bg-[#2C2C2E]/50 rounded-2xl p-5 border border-[#007AFF]/20">
            <h3 className="text-lg font-semibold text-white mb-3">📋 Структура загрузки</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p>• <strong className="text-white">UV-текстура</strong> — WebP для 3D-модели</p>
              <p>• <strong className="text-white">Панорама</strong> — WebP для фона 3D-сцены</p>
              <p>• <strong className="text-white">Фотографии</strong> — PNG/WebP для карточки товара</p>
              <p>• <strong className="text-white">Видео</strong> — MP4 для карточки товара (после фото)</p>
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold text-white mb-3">
              Название дизайна
            </label>
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-[#2C2C2E] border-0 text-white text-base placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
              placeholder="Например: Neon Blade"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-white mb-3">
              UV-текстура дизайна (.jpg)
            </label>
            <p className="text-white/40 text-sm mb-3">
              Текстура дизайна для 3D-модели. Рекомендуемый размер: 512x512px, формат JPG, размер файла &lt;1MB.
            </p>
            {uvTexture ? (
              <div className="bg-[#2C2C2E] rounded-2xl p-5">
                <p className="text-[#34C759] text-base font-medium mb-3">✓ UV-текстура загружена</p>
                <code className="text-xs text-white/50 break-all block mb-3">{uvTexture}</code>
                <button
                  onClick={() => setUvTexture('')}
                  className="text-[#FF3B30] hover:text-[#FF453A] text-sm font-medium"
                >
                  Удалить
                </button>
              </div>
            ) : (
              <FileUpload
                label="Загрузить UV-текстуру (.jpg)"
                accept="image/jpeg,image/jpg"
                onUploadComplete={(url) => setUvTexture(url)}
                fileType="image"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Панорама (фон) (.webp)
            </label>
            <p className="text-white/40 text-xs mb-3">
              Фон для 3D-сцены с моделью скутера
            </p>
            {panorama ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <p className="text-green-400 text-sm">✓ Загружена</p>
                <button
                  onClick={() => setPanorama('')}
                  className="text-red-400 hover:text-red-300 text-xs mt-2"
                >
                  Удалить
                </button>
              </div>
            ) : (
              <FileUpload
                label="Загрузить панораму"
                accept="image/webp,image/jpeg,image/png"
                onUploadComplete={(url) => setPanorama(url)}
                fileType="image"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Видео (опционально)
            </label>
            <p className="text-white/40 text-xs mb-3">
              Видео отображается в карточке товара после фотографий
            </p>
            {video ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <p className="text-green-400 text-sm">✓ Загружено</p>
                <button
                  onClick={() => setVideo('')}
                  className="text-red-400 hover:text-red-300 text-xs mt-2"
                >
                  Удалить
                </button>
              </div>
            ) : (
              <FileUpload
                label="Загрузить видео"
                accept="video/mp4"
                onUploadComplete={(url) => setVideo(url)}
                fileType="video"
              />
            )}
          </div>

          {/* Галерея фотографий */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Фотографии для карточки товара
            </label>
            <p className="text-white/40 text-xs mb-3">
              Изображения галереи для карточки товара. Первое фото будет обложкой. Форматы: PNG, WebP
            </p>
            
            <div className="space-y-3">
              {/* Список загруженных фото */}
              {galleryImages.length > 0 && (
                <div className="space-y-2">
                  {galleryImages.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-[#2C2C2E] p-3 rounded-xl"
                    >
                      <div className="flex-shrink-0 w-16 h-16 bg-[#1C1C1E] rounded-lg overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={`Фото ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-xs font-mono truncate">
                          {imgUrl.split('/').pop()}
                        </p>
                        {index === 0 && (
                          <span className="inline-block mt-1 text-[#007AFF] text-xs font-medium">
                            📌 Обложка
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="flex-shrink-0 text-[#FF3B30] hover:text-[#CC2A24] text-sm font-medium transition-colors active:scale-95"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Кнопка добавления нового фото */}
              <FileUpload
                onUploadComplete={handleAddGalleryImage}
                accept="image/png,image/webp,image/jpeg"
                label={galleryImages.length === 0 ? "Загрузить первое фото (обложка)" : "Добавить ещё фото"}
                fileType="image"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link href={`/admin/models/${modelId}`}>
              <button className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold">
                Отмена
              </button>
            </Link>
            <button
              onClick={handleCreate}
              disabled={!designName || !uvTexture}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Создать дизайн
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

