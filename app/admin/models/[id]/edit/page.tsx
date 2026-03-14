'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'
import FileDisplay from '@/components/FileDisplay'
import Breadcrumbs from '@/src/presentation/components/admin/Breadcrumbs'

export default function EditModelPage() {
  const params = useParams()
  const router = useRouter()
  const modelId = (params?.id as string) ?? ''

  const [loading, setLoading] = useState(true)
  const [modelName, setModelName] = useState('')
  const [modelFile, setModelFile] = useState('')
  const [originalData, setOriginalData] = useState<any>(null)
  const [oldModelFile, setOldModelFile] = useState<string | null>(null)

  useEffect(() => {
    // Загружаем данные конкретной модели
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
          const currentModelFile = model.glbModelUrl || model.model
          setModelFile(currentModelFile)
          setOldModelFile(currentModelFile) // Сохраняем старый путь для удаления
          setOriginalData(model)
        } else {
          throw new Error('Model not found in response')
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading model:', error)
        alert(`Ошибка загрузки данных модели: ${error.message}`)
        setLoading(false)
      })
  }, [modelId])

  const handleSave = async () => {
    if (!modelName) {
      alert('Пожалуйста, укажите название модели')
      return
    }

    if (!modelFile) {
      alert('Пожалуйста, загрузите 3D-модель')
      return
    }

    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName,
          model: modelFile,
          glbModelUrl: modelFile,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Ошибка: ${data.error}`)
        return
      }

      alert('Модель успешно обновлена!')
      
      // Force reload main page data by triggering a cache clear
      // Open main page in new tab to trigger reload, or just navigate
      if (typeof window !== 'undefined') {
        // Clear any cached data
        window.dispatchEvent(new Event('storage'))
        // Notify main page to reload (if it's open)
        localStorage.setItem('admin-update', Date.now().toString())
      }
      
      router.push('/admin/models')
    } catch (error: any) {
      console.error('Error updating model:', error)
      alert(`Ошибка обновления: ${error.message}`)
    }
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
          <h1 className="text-4xl font-bold text-white mb-4">Модель не найдена</h1>
          <Link href="/admin/models" className="text-[#007AFF] hover:text-[#0051D5]">
            ← Вернуться к списку моделей
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 pt-24">
          <Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'Models', href: '/admin/models' }, { label: originalData.name, href: `/admin/models/${modelId}` }, { label: 'Edit' }]} />
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight mt-4">
            Редактирование модели
          </h1>
          <p className="text-white/50 text-lg">
            {originalData.name}
          </p>
        </div>
        <div className="mb-6">
          <Link href={`/admin/models/${modelId}`} className="text-[#007AFF] hover:text-[#0051D5] inline-flex items-center gap-2 text-base font-medium">
            ← К модели
          </Link>
        </div>

        {/* Форма */}
        <div className="bg-[#1C1C1E] rounded-3xl p-8 space-y-8 shadow-2xl">
          {/* 3D-модель */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-base font-semibold text-white">
                3D-модель (.glb) *
              </label>
              {modelFile ? (
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
              3D-модель скутера в формате GLB для интерактивного просмотра на сайте. Рекомендуемый размер: оптимизированная модель (20-30MB). Имя файла может быть любым.
            </p>
            {modelFile ? (
              <div className="space-y-3">
                <FileDisplay
                  url={modelFile}
                  label="3D-модель загружена"
                  fileType="model"
                  onReplace={() => setModelFile('')}
                  showInfo={true}
                />
                <FileUpload
                  label="Заменить модель"
                  accept=".glb,.gltf"
                  onUploadComplete={(url) => setModelFile(url)}
                  fileType="model"
                  folder="models"
                  endpoint="/api/admin/models/upload"
                  customFilename={`MODEL-${(modelName || modelId).replace(/[^a-zA-Z0-9]/g, '-')}.glb`}
                />
              </div>
            ) : (
              <FileUpload
                label="Загрузить 3D-модель (.glb)"
                accept=".glb,.gltf"
                onUploadComplete={(url) => setModelFile(url)}
                fileType="model"
                folder="models"
                endpoint="/api/admin/models/upload"
                customFilename={`MODEL-${(modelName || modelId).replace(/[^a-zA-Z0-9]/g, '-')}.glb`}
              />
            )}
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-4 justify-end pt-4 border-t border-white/10">
            <Link href="/admin/models">
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
    </div>
  )
}

