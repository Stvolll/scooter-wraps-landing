'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import FileUpload from '@/components/FileUpload'

export default function DesignViewPage() {
  const params = useParams()
  const router = useRouter()
  const modelId = (params?.id as string) ?? ''
  const designId = (params?.designId as string) ?? ''

  const [loading, setLoading] = useState(true)
  const [model, setModel] = useState<any>(null)
  const [design, setDesign] = useState<any>(null)
  const [uvTexture, setUvTexture] = useState('')
  const [panorama, setPanorama] = useState('')
  const [video, setVideo] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    // Загружаем данные модели и дизайна
    fetch(`/api/admin/models/${modelId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        const loadedModel = data.model
        if (loadedModel) {
          setModel(loadedModel)
          const loadedDesign = loadedModel.designs.find(
            (d: any) => d.id === designId || d.slug === designId
          )
          if (loadedDesign) {
            setDesign(loadedDesign)
            setUvTexture(loadedDesign.textures?.body || loadedDesign.texture || '')
            setPanorama(loadedDesign.panorama || '')
            setVideo(loadedDesign.video || '')
            setGalleryImages(loadedDesign.images || [])
          }
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading design:', error)
        setLoading(false)
      })
  }, [modelId, designId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] p-8 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!model || !design) {
    return (
      <div className="min-h-screen bg-[#000000] p-8 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Дизайн не найден</h1>
          <Link href="/admin/models" className="text-[#007AFF]">
            ← Назад к моделям
          </Link>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    // TODO: Сохранение в config/scooters.js или базу данных
    console.log('Сохранение материалов дизайна:', {
      modelId,
      designId,
      uvTexture,
      panorama,
      video,
      galleryImages,
    })
    alert('Материалы сохранены! (TODO: реальное сохранение)')
  }

  const handleAddGalleryImage = (url: string) => {
    setGalleryImages([...galleryImages, url])
  }

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index))
  }

  const handleDelete = async () => {
    if (!confirm(`Вы уверены, что хотите удалить дизайн "${design.name}"?\n\nЭто действие нельзя отменить.`)) {
      return
    }

    try {
      setDeleting(true)
      
      // Fetch design from DB to get its ID
      const designResponse = await fetch(`/api/admin/designs/by-model?model=${modelId}`)
      if (!designResponse.ok) {
        throw new Error('Failed to fetch designs')
      }
      
      const designs = await designResponse.json()
      const dbDesign = designs.find((d: any) => 
        d.id === designId || d.slug === designId || d.slug.includes(designId)
      )
      
      if (!dbDesign) {
        alert('❌ Дизайн не найден в базе данных')
        return
      }

      // Delete the design
      const deleteResponse = await fetch(`/api/admin/designs/${dbDesign.id}`, {
        method: 'DELETE',
      })

      if (!deleteResponse.ok) {
        const error = await deleteResponse.json()
        throw new Error(error.error || 'Failed to delete design')
      }

      alert('✅ Дизайн успешно удалён!')
      router.push(`/admin/models/${modelId}`)
    } catch (error: any) {
      console.error('Error deleting design:', error)
      alert(`❌ Ошибка при удалении: ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8 pt-32">
          <Link
            href={`/admin/models/${modelId}`}
            className="text-[#007AFF] hover:text-[#0051D5] mb-6 inline-flex items-center gap-2 text-base font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {model.name}
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                {design.name}
              </h1>
              <p className="text-white/50 text-lg">
                Управление материалами дизайна
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-3">
              <Link
                href={`/admin/models/${modelId}/designs/${designId}/edit`}
                className="px-6 py-3 bg-[#007AFF] hover:bg-[#0051D5] text-white rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Редактировать
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {deleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>

        {/* Иерархия */}
        <div className="bg-[#1C1C1E] rounded-3xl p-8 mb-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📦</span>
            <h2 className="text-2xl font-bold text-white">Структура материалов</h2>
          </div>
          <div className="bg-[#2C2C2E] rounded-2xl p-5 space-y-2 text-white/70">
            <div>🏍️ <strong className="text-white">3D-модель:</strong> {model.name}</div>
            <div className="ml-6">🎨 <strong className="text-white">Дизайн:</strong> {design.name}</div>
            <div className="ml-12">📁 <strong className="text-white">Материалы:</strong> UV-текстуры, Панорама, Видео, Галерея</div>
          </div>
        </div>

        {/* UV-текстура */}
        <div className="bg-[#1C1C1E] rounded-3xl p-8 mb-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🎨</span>
            <h2 className="text-2xl font-bold text-white">UV-текстура дизайна</h2>
          </div>
          <p className="text-white/50 mb-4">
            Текстура дизайна для 3D-модели. Один файл WebP на дизайн.
          </p>
          <div>
            {uvTexture ? (
              <div className="bg-[#2C2C2E] rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <img 
                    src={uvTexture} 
                    alt="UV Texture" 
                    className="w-48 h-48 object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-[#34C759] text-base font-medium mb-2">✓ UV-текстура загружена</p>
                    <code className="text-xs text-white/50 break-all block mb-3">{uvTexture}</code>
                    <button
                      onClick={() => setUvTexture('')}
                      className="text-[#FF3B30] hover:text-[#FF453A] text-sm font-medium"
                    >
                      Заменить текстуру
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <FileUpload
                label="Загрузить UV-текстуру (.webp)"
                accept="image/webp,image/png,image/jpeg"
                onUploadComplete={(url) => setUvTexture(url)}
              />
            )}
          </div>
        </div>

        {/* Панорама */}
        <div className="bg-[#1C1C1E] rounded-3xl p-8 mb-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🌅</span>
            <h2 className="text-2xl font-bold text-white">Панорама (фон)</h2>
          </div>
          {panorama ? (
            <div className="bg-[#2C2C2E] rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <img 
                  src={panorama} 
                  alt="Panorama" 
                  className="w-48 h-32 object-cover rounded-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="flex-1">
                  <p className="text-[#34C759] text-base font-medium mb-2">✓ Загружена</p>
                  <code className="text-xs text-white/50 break-all block mb-3">{panorama}</code>
                  <button
                    onClick={() => setPanorama('')}
                    className="text-[#FF3B30] hover:text-[#FF453A] text-sm font-medium"
                  >
                    Заменить
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <FileUpload
              label="Загрузить панораму"
              accept="image/webp,image/png,image/jpeg"
              onUploadComplete={(url) => setPanorama(url)}
            />
          )}
        </div>

        {/* Видео */}
        <div className="bg-[#1C1C1E] rounded-3xl p-8 mb-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🎥</span>
            <h2 className="text-2xl font-bold text-white">Видео</h2>
          </div>
          {video ? (
            <div className="bg-[#2C2C2E] rounded-2xl p-5">
              <p className="text-[#34C759] text-base font-medium mb-3">✓ Загружено</p>
              <video 
                src={video} 
                controls 
                className="w-full max-w-2xl rounded-xl mb-3"
              />
              <code className="text-xs text-white/50 break-all block mb-3">{video}</code>
              <button
                onClick={() => setVideo('')}
                className="text-[#FF3B30] hover:text-[#FF453A] text-sm font-medium"
              >
                Заменить
              </button>
            </div>
          ) : (
            <FileUpload
              label="Загрузить видео"
              accept="video/mp4,video/webm"
              onUploadComplete={(url) => setVideo(url)}
            />
          )}
        </div>

        {/* Галерея фотографий */}
        <div className="bg-[#1C1C1E] rounded-3xl p-8 mb-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📸</span>
            <h2 className="text-2xl font-bold text-white">Галерея фотографий</h2>
          </div>
          
          {/* Существующие изображения */}
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {galleryImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={img} 
                    alt={`Gallery ${index + 1}`} 
                    className="w-full h-32 object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <button
                    onClick={() => handleRemoveGalleryImage(index)}
                    className="absolute top-2 right-2 bg-[#FF3B30] text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Добавить новое изображение */}
          <FileUpload
            label="Добавить фото в галерею"
            accept="image/png,image/jpeg,image/webp"
            onUploadComplete={handleAddGalleryImage}
          />
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-4 justify-end">
          <Link href={`/admin/models/${modelId}`}>
            <button className="bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white px-8 py-4 rounded-2xl font-semibold transition-all">
              Отмена
            </button>
          </Link>
          <button
            onClick={handleSave}
            className="bg-[#007AFF] hover:bg-[#0051D5] active:scale-95 text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg"
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  )
}

