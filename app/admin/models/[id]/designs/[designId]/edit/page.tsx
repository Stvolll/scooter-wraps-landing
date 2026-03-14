'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'
import FileDisplay from '@/components/FileDisplay'

export default function EditDesignPage() {
  const params = useParams()
  const router = useRouter()
  const modelId = (params?.id as string) ?? ''
  const designId = (params?.designId as string) ?? ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [designName, setDesignName] = useState('')
  const [textureJpg, setTextureJpg] = useState('') // UV-текстура в формате JPG
  const [bgWebp, setBgWebp] = useState('') // Фон для 3D-сцены в формате WebP
  const [galleryImages, setGalleryImages] = useState<string[]>([]) // Фотографии для карточки товара
  const [video, setVideo] = useState('') // Видео для карточки товара (опционально)
  const [originalData, setOriginalData] = useState<any>(null)
  const [modelName, setModelName] = useState('')

  useEffect(() => {
    // Загружаем данные конкретной модели и дизайна
    fetch(`/api/admin/models/${modelId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        const model = data.model
        if (model) {
          setModelName(model.name)
          // Try to find design by id, slug, or slug with model prefix
          const design = model.designs.find((d: any) => 
            d.id === designId || 
            d.slug === designId || 
            d.slug === `${model.slug}-${designId}` ||
            d.slug.endsWith(`-${designId}`)
          )
          if (design) {
            setDesignName(design.title || design.name || '')
            
            // Загружаем данные из материалов или legacy полей
            const materials = design.materials || []
            
            // Текстура: ищем TEXTURE материал или используем textureWebp/textureUrl
            const textureMaterial = materials.find((m: any) => m.format === 'TEXTURE')
            setTextureJpg(textureMaterial?.url || design.textureWebp || design.textureUrl || '')
            
            // Фон: ищем PANORAMA материал или используем bgWebp/panorama
            const panoramaMaterial = materials.find((m: any) => m.format === 'PANORAMA')
            setBgWebp(panoramaMaterial?.url || design.bgWebp || design.panorama || '')
            
            // Видео: ищем VIDEO материал или используем videoPreview
            const videoMaterial = materials.find((m: any) => m.format === 'VIDEO')
            setVideo(videoMaterial?.url || design.videoPreview || '')
            
            // Фотографии: ищем PHOTO материалы или используем galleryImages
            const photoMaterials = materials.filter((m: any) => m.format === 'PHOTO')
            setGalleryImages(photoMaterials.length > 0 
              ? photoMaterials.map((m: any) => m.url)
              : (design.galleryImages || design.images || [])
            )
            
            setOriginalData(design)
          } else {
            throw new Error('Design not found')
          }
        } else {
          throw new Error('Model not found in response')
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading design:', error)
        alert(`Ошибка загрузки данных дизайна: ${error.message}`)
        setLoading(false)
      })
  }, [modelId, designId])

  const handleSave = async () => {
    if (!designName) {
      alert('Пожалуйста, укажите название дизайна')
      return
    }

    try {
      setSaving(true)
      
      // Use originalData if available (from initial load), otherwise fetch
      let dbDesign = originalData
      
      if (!dbDesign || !dbDesign.id) {
        // Fallback: Fetch design from DB to get its database ID
        const designResponse = await fetch(`/api/admin/designs/by-model?model=${modelId}`)
        if (!designResponse.ok) {
          const errorData = await designResponse.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to fetch designs: ${designResponse.status}`)
        }
        
        const designsData = await designResponse.json()
        
        // Handle error response
        if (designsData.error) {
          throw new Error(designsData.error)
        }
        
        // Handle both array and object responses
        const designs = Array.isArray(designsData) ? designsData : (designsData.designs || designsData.data || [])
        
        if (!Array.isArray(designs) || designs.length === 0) {
          throw new Error('No designs found for this model')
        }
        
        // Find design by id, slug, or slug pattern
        dbDesign = designs.find((d: any) => {
          if (!d) return false
          const dSlug = d.slug || ''
          const dId = d.id || ''
          
          // Try exact matches first
          if (dId === designId || dSlug === designId) {
            return true
          }
          
          // Try pattern matches
          if (dSlug && typeof dSlug === 'string') {
            // Check if slug ends with designId (e.g., "sh160-01" ends with "01")
            if (dSlug.endsWith(`-${designId}`) || dSlug.includes(`-${designId}-`)) {
              return true
            }
            // Check if slug includes designId
            if (dSlug.includes(designId)) {
              return true
            }
          }
          
          return false
        })
      }
      
      if (!dbDesign || !dbDesign.id) {
        alert(`❌ Дизайн "${designId}" не найден в базе данных. Невозможно сохранить изменения.`)
        console.error('Original data:', originalData)
        setSaving(false)
        return
      }

      // Автоматически создаем материалы из загруженных файлов
      const materialsToSave: Array<{
        format: 'TEXTURE' | 'PANORAMA' | 'VIDEO' | 'PHOTO'
        url: string
        metadata?: any
      }> = []
      
      // Текстура (TEXTURE)
      if (textureJpg) {
        materialsToSave.push({
          format: 'TEXTURE',
          url: textureJpg,
          metadata: {},
        })
      }
      
      // Фон (PANORAMA)
      if (bgWebp) {
        materialsToSave.push({
          format: 'PANORAMA',
          url: bgWebp,
          metadata: {},
        })
      }
      
      // Видео (VIDEO) - опционально
      if (video) {
        materialsToSave.push({
          format: 'VIDEO',
          url: video,
          metadata: {},
        })
      }
      
      // Фотографии (PHOTO) - первая с ролью cover
      galleryImages.forEach((url, index) => {
        materialsToSave.push({
          format: 'PHOTO',
          url: url,
          metadata: index === 0 ? { role: 'cover' } : {},
        })
      })
      
      // Update the design via API
      const updateResponse = await fetch(`/api/admin/designs/${dbDesign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: designName,
          // Legacy fields для обратной совместимости
          textureUrl: textureJpg || null,
          textureWebp: textureJpg || null,
          panorama: bgWebp || null,
          bgWebp: bgWebp || null,
          videoPreview: video || null,
          galleryImages: galleryImages,
          coverImage: galleryImages[0] || null,
          // Материалы (автоматически создаются из загруженных файлов)
          materials: materialsToSave,
        }),
      })

      if (!updateResponse.ok) {
        const error = await updateResponse.json()
        throw new Error(error.error || 'Failed to update design')
      }

      alert('✅ Дизайн успешно обновлён!')
      
      // Force reload main page data by triggering a cache clear
      if (typeof window !== 'undefined') {
        // Clear any cached data
        window.dispatchEvent(new Event('storage'))
        // Notify main page to reload (if it's open)
        localStorage.setItem('admin-update', Date.now().toString())
      }
      
      router.push(`/admin/models/${modelId}`)
    } catch (error: any) {
      console.error('Error updating design:', error)
      alert(`Ошибка обновления: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleAddGalleryImage = (url: string) => {
    setGalleryImages((prev) => [...prev, url])
  }

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF]"></div>
      </div>
    )
  }

  if (!originalData) {
    return (
      <div className="min-h-screen bg-[#000000] p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Дизайн не найден</h1>
          <Link href={`/admin/models/${modelId}`} className="text-[#007AFF] hover:text-[#0051D5]">
            ← Вернуться к модели {modelName}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8 pt-32">
          <Link
            href={`/admin/models/${modelId}`}
            className="text-[#007AFF] hover:text-[#0051D5] mb-6 inline-flex items-center gap-2 text-base font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {modelName}
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Редактирование дизайна
          </h1>
          <p className="text-white/50 text-lg">
            {originalData.name}
          </p>
        </div>

        {/* Форма */}
        <div className="bg-[#1C1C1E] rounded-3xl p-8 space-y-8 shadow-2xl">
          {/* Название дизайна */}
          <div>
            <label className="block text-base font-semibold text-white mb-3">
              Название дизайна *
            </label>
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-[#2C2C2E] border-0 text-white text-base placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
              placeholder="Например: Neon Blade"
            />
          </div>

          {/* 1. UV-текстура (JPG) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-base font-semibold text-white">
                1. Текстура для байка (UV-текстура, JPG) *
              </label>
              {textureJpg ? (
                <span className="flex items-center gap-2 text-[#34C759] text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Загружена
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-400 text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Не загружена
                </span>
              )}
            </div>
            <p className="text-white/50 text-sm mb-4">
              UV-текстура дизайна в формате JPG для наложения на 3D-модель. Рекомендуемый размер: 512x512px, размер файла &lt;1MB.
            </p>
            {textureJpg ? (
              <div className="space-y-3">
                <FileDisplay
                  url={textureJpg}
                  label="UV-текстура загружена"
                  fileType="image"
                  onReplace={() => setTextureJpg('')}
                  showInfo={true}
                />
                <FileUpload
                  label="Заменить текстуру"
                  accept="image/jpeg,image/jpg"
                  onUploadComplete={(url) => setTextureJpg(url)}
                  fileType="image"
                />
              </div>
            ) : (
              <FileUpload
                label="Загрузить UV-текстуру (JPG)"
                accept="image/jpeg,image/jpg"
                onUploadComplete={(url) => setTextureJpg(url)}
                fileType="image"
              />
            )}
          </div>

          {/* 2. Фон для 3D-сцены (WebP) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-base font-semibold text-white">
                2. Фон для 3D-сцены (WebP) *
              </label>
              {bgWebp ? (
                <span className="flex items-center gap-2 text-[#34C759] text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Загружен
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-400 text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Не загружен
                </span>
              )}
            </div>
            <p className="text-white/50 text-sm mb-4">
              Фоновое изображение для 3D-сцены в формате WebP. Рекомендуемый размер: 1920x1080px, размер файла &lt;1MB.
            </p>
            {bgWebp ? (
              <div className="space-y-3">
                <FileDisplay
                  url={bgWebp}
                  label="Фон загружен"
                  fileType="panorama"
                  onReplace={() => setBgWebp('')}
                  showInfo={true}
                />
                <FileUpload
                  label="Заменить фон"
                  accept="image/webp"
                  onUploadComplete={(url) => setBgWebp(url)}
                  fileType="panorama"
                  folder="images"
                />
              </div>
            ) : (
              <FileUpload
                label="Загрузить фон (WebP)"
                accept="image/webp"
                onUploadComplete={(url) => setBgWebp(url)}
                fileType="panorama"
                folder="images"
              />
            )}
          </div>

          {/* 3. Фотографии для карточки товара */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-base font-semibold text-white">
                3. Фотографии для карточки товара *
              </label>
              {galleryImages.length > 0 ? (
                <span className="flex items-center gap-2 text-[#34C759] text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Загружено: {galleryImages.length}
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-400 text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Не загружены
                </span>
              )}
            </div>
            <p className="text-white/50 text-sm mb-4">
              Серия фотографий для карточки товара. Первое фото будет использовано как обложка. Форматы: PNG, WebP, JPEG.
            </p>
            <div className="space-y-3 mb-4">
              {galleryImages.length === 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-400 text-xs flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Фотографии не загружены
                  </p>
                </div>
              ) : (
                galleryImages.map((imgUrl, index) => (
                  <div key={index} className="space-y-2">
                    <FileDisplay
                      url={imgUrl}
                      label={index === 0 ? `Фото ${index + 1} (Обложка)` : `Фото ${index + 1}`}
                      fileType="image"
                      onRemove={() => handleRemoveGalleryImage(index)}
                      showInfo={true}
                    />
                    {index === 0 && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-2">
                        <p className="text-blue-400 text-xs flex items-center gap-2">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Это фото будет использовано как обложка карточки товара
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <FileUpload
              onUploadComplete={handleAddGalleryImage}
              accept="image/png,image/webp,image/jpeg"
              label={galleryImages.length === 0 ? "Загрузить первое фото (обложка)" : "Добавить ещё фото"}
              fileType="image"
            />
          </div>

          {/* 4. Видео для карточки товара (опционально) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-base font-semibold text-white">
                4. Видео для карточки товара
              </label>
              {video ? (
                <span className="flex items-center gap-2 text-[#34C759] text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Загружено
                </span>
              ) : (
                <span className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Не загружено (опционально)
                </span>
              )}
            </div>
            <p className="text-white/50 text-sm mb-4">
              Видео для карточки товара (опционально). Формат: MP4 (H.264). Рекомендуемое разрешение: до 1920x1080px.
            </p>
            {video ? (
              <div className="space-y-3">
                <FileDisplay
                  url={video}
                  label="Видео загружено"
                  fileType="video"
                  onReplace={() => setVideo('')}
                  onRemove={() => setVideo('')}
                  showInfo={true}
                />
                <FileUpload
                  label="Заменить видео"
                  accept="video/mp4"
                  onUploadComplete={(url) => setVideo(url)}
                  fileType="video"
                />
              </div>
            ) : (
              <FileUpload
                label="Загрузить видео (MP4)"
                accept="video/mp4"
                onUploadComplete={(url) => setVideo(url)}
                fileType="video"
              />
            )}
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-4 justify-end pt-4 border-t border-white/10">
            <Link href={`/admin/models/${modelId}`}>
              <button className="bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white px-8 py-4 rounded-2xl font-semibold transition-all">
                Отмена
              </button>
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#007AFF] hover:bg-[#0051D5] active:scale-95 disabled:bg-[#007AFF]/50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg"
            >
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

