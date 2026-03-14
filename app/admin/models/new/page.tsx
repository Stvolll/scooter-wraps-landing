'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'
import Breadcrumbs from '@/src/presentation/components/admin/Breadcrumbs'

export default function NewModelPage() {
  const router = useRouter()
  
  const [modelName, setModelName] = useState('')
  const [modelId, setModelId] = useState('')
  const [modelFile, setModelFile] = useState('')
  const [panoramaFile, setPanoramaFile] = useState('')
  const [autoGenerateId, setAutoGenerateId] = useState(true)

  // Auto-generate ID from name
  const handleNameChange = (name: string) => {
    setModelName(name)
    if (autoGenerateId) {
      const generatedId = name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      setModelId(generatedId)
    }
  }

  const handleCreate = async () => {
    if (!modelName || !modelId) {
      alert('Пожалуйста, заполните название и ID модели')
      return
    }

    if (!modelFile) {
      alert('Пожалуйста, загрузите 3D-модель')
      return
    }

    try {
      const response = await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName,
          id: modelId,
          model: modelFile,
          panorama: panoramaFile,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Ошибка: ${data.error}`)
        return
      }

      alert(`Модель "${modelName}" успешно создана!`)
      router.push('/admin/models')
    } catch (error: any) {
      console.error('Error creating model:', error)
      alert(`Ошибка создания модели: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 pt-24">
          <Breadcrumbs items={[{ label: 'Admin', href: '/admin' }, { label: 'Models', href: '/admin/models' }, { label: 'New model' }]} />
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight mt-4">
            Новая модель скутера
          </h1>
          <p className="text-white/50 text-lg">
            Добавление базовой 3D-модели в систему
          </p>
        </div>
        <div className="mb-6">
          <Link href="/admin/models" className="text-[#007AFF] hover:text-[#0051D5] inline-flex items-center gap-2 text-base font-medium">
            ← Модели скутеров
          </Link>
        </div>

        {/* Инструкция */}
        <div className="bg-[#1C1C1E] rounded-3xl p-8 mb-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">💡</span>
            <h2 className="text-xl font-bold text-white">Как это работает</h2>
          </div>
          <div className="bg-[#2C2C2E] rounded-2xl p-5 space-y-3 text-white/70 text-sm">
            <div>1️⃣ <strong className="text-white">Создайте модель</strong> - укажите название и загрузите базовый .glb файл</div>
            <div>2️⃣ <strong className="text-white">Добавьте дизайны</strong> - после создания модели вы сможете добавлять к ней различные дизайны</div>
            <div>3️⃣ <strong className="text-white">Управляйте материалами</strong> - для каждого дизайна загружайте текстуры, панорамы, видео</div>
          </div>
        </div>

        {/* Форма */}
        <div className="bg-[#1C1C1E] rounded-3xl p-8 space-y-8 shadow-2xl">
          {/* Название модели */}
          <div>
            <label className="block text-base font-semibold text-white mb-3">
              Название модели *
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-[#2C2C2E] border-0 text-white text-base placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
              placeholder="Например: Honda SH160i"
            />
            <p className="text-white/40 text-sm mt-2">
              Полное название модели, которое будет отображаться на сайте
            </p>
          </div>

          {/* ID модели */}
          <div>
            <label className="block text-base font-semibold text-white mb-3">
              ID модели (slug) *
            </label>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="text"
                value={modelId}
                onChange={(e) => {
                  setModelId(e.target.value)
                  setAutoGenerateId(false)
                }}
                className="flex-1 px-5 py-4 rounded-2xl bg-[#2C2C2E] border-0 text-white text-base placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all font-mono"
                placeholder="например: honda-sh160i"
              />
              <button
                onClick={() => setAutoGenerateId(!autoGenerateId)}
                className={`px-4 py-4 rounded-2xl font-medium transition-all ${
                  autoGenerateId 
                    ? 'bg-[#007AFF] text-white' 
                    : 'bg-[#2C2C2E] text-white/50'
                }`}
              >
                Авто
              </button>
            </div>
            <p className="text-white/40 text-sm">
              Уникальный идентификатор для URL (только латиница, цифры и дефис)
            </p>
          </div>

          {/* 3D-модель */}
          <div>
            <label className="block text-base font-semibold text-white mb-3">
              Базовая 3D-модель (.glb) *
            </label>
            <div className="bg-[#2C2C2E] rounded-2xl p-5 mb-3">
              <div className="space-y-2 text-sm text-white/50">
                <div>✓ Формат: GLB (glTF 2.0 Binary)</div>
                <div>✓ Содержит: Геометрия 3D-модели</div>
                <div>✓ Без ограничений по размеру</div>
                <div>✓ Имя файла может быть любым</div>
              </div>
            </div>
            {modelFile ? (
              <div className="bg-[#2C2C2E] rounded-2xl p-5">
                <p className="text-[#34C759] text-base font-medium mb-3">✓ Модель загружена</p>
                <code className="text-xs text-white/50 break-all block mb-3">{modelFile}</code>
                <button
                  onClick={() => setModelFile('')}
                  className="text-[#FF3B30] hover:text-[#FF453A] text-sm font-medium"
                >
                  Заменить модель
                </button>
              </div>
            ) : (
              <FileUpload
                label="Загрузить .glb модель"
                accept=".glb,.gltf"
                fileType="model"
                folder="models"
                endpoint="/api/admin/models/upload"
                onUploadComplete={(url) => setModelFile(url)}
              />
            )}
          </div>

          {/* Панорама по умолчанию */}
          <div>
            <label className="block text-base font-semibold text-white mb-3">
              Панорама по умолчанию (.webp)
            </label>
            <p className="text-white/40 text-sm mb-3">
              Фон, который будет использоваться для всех дизайнов этой модели по умолчанию
            </p>
            {panoramaFile ? (
              <div className="bg-[#2C2C2E] rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <img 
                    src={panoramaFile} 
                    alt="Panorama" 
                    className="w-48 h-32 object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-[#34C759] text-base font-medium mb-2">✓ Загружена</p>
                    <code className="text-xs text-white/50 break-all block mb-3">{panoramaFile}</code>
                    <button
                      onClick={() => setPanoramaFile('')}
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
                accept="image/webp,image/jpeg,image/png"
                fileType="image"
                onUploadComplete={(url) => setPanoramaFile(url)}
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
              onClick={handleCreate}
              className="bg-[#007AFF] hover:bg-[#0051D5] active:scale-95 text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg"
            >
              Создать модель
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

