'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FileWithMetadata {
  file: File
  type: string
  metadata?: {
    textureType?: string
    layer?: number
    format?: string
    resolution?: string
  }
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  url?: string
  error?: string
}

interface BatchUploadProps {
  designId: string
  onUploadComplete?: (results: Array<{ type: string; url: string }>) => void
}

const FILE_TYPE_CONFIG: Record<string, {
  label: string
  accept: string
  maxSize: number
  hint: string
  multiple?: boolean
}> = {
  cover: {
    label: 'Обложка (Cover Image)',
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024, // 5MB
    hint: 'Главное изображение для карточек. Формат: JPG, PNG, WebP. Разрешение: 1200x800px. Размер: до 500KB.',
  },
  gallery: {
    label: 'Галерея (Gallery Images)',
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024,
    hint: 'Дополнительные фото дизайна. Формат: JPG, PNG, WebP. Разрешение: 1920x1080px. Рекомендуется 3-5 изображений.',
    multiple: true,
  },
  glb: {
    label: '3D Модель (GLB)',
    accept: '.glb,model/gltf-binary',
    maxSize: 50 * 1024 * 1024, // 50MB
    hint: 'Основная 3D модель скутера. Формат: GLB (binary GLTF). Размер: до 50MB. Рекомендуется использовать Draco-сжатие.',
  },
  'glb-compressed': {
    label: '3D Модель (GLB, сжатая)',
    accept: '.glb,model/gltf-binary',
    maxSize: 20 * 1024 * 1024,
    hint: 'Сжатая версия модели с Draco. Формат: GLB. Размер: до 20MB. Используется для быстрой загрузки.',
  },
  'glb-mobile': {
    label: '3D Модель (GLB, мобильная)',
    accept: '.glb,model/gltf-binary',
    maxSize: 10 * 1024 * 1024,
    hint: 'Упрощенная версия для мобильных устройств. Формат: GLB. Размер: до 10MB. Меньше полигонов.',
  },
  texture: {
    label: 'Текстура (Texture)',
    accept: 'image/*',
    maxSize: 10 * 1024 * 1024,
    hint: 'Текстура для 3D модели. Формат: PNG, JPG, KTX2. Разрешение: 2048x2048px (степени двойки). Тип: diffuse, normal, roughness, metallic.',
  },
  'video-preview': {
    label: 'Видео (Preview)',
    accept: 'video/*',
    maxSize: 100 * 1024 * 1024,
    hint: 'Превью видео дизайна. Формат: MP4, WebM. Размер: до 100MB. Длительность: 15-30 секунд.',
  },
  'video-full': {
    label: 'Видео (Полное)',
    accept: 'video/*',
    maxSize: 500 * 1024 * 1024,
    hint: 'Полное видео дизайна. Формат: MP4, WebM. Размер: до 500MB.',
  },
  'video-tutorial': {
    label: 'Видео (Инструкция)',
    accept: 'video/*',
    maxSize: 200 * 1024 * 1024,
    hint: 'Видео-инструкция по применению. Формат: MP4, WebM. Размер: до 200MB.',
  },
  'blueprint-svg': {
    label: 'Схема (SVG)',
    accept: '.svg,image/svg+xml',
    maxSize: 10 * 1024 * 1024,
    hint: 'Векторная схема для раздела "How to Apply". Формат: SVG. Размер: до 10MB. Используется для интерактивной разметки.',
  },
  'blueprint-pdf': {
    label: 'Инструкция (PDF)',
    accept: '.pdf,application/pdf',
    maxSize: 10 * 1024 * 1024,
    hint: 'PDF инструкция по применению. Формат: PDF. Размер: до 10MB.',
  },
  thumbnail: {
    label: 'Миниатюра (Thumbnail)',
    accept: 'image/*',
    maxSize: 500 * 1024,
    hint: 'Миниатюра для быстрого отображения. Формат: JPG, PNG, WebP. Разрешение: 400x400px. Размер: до 500KB.',
  },
  'social-preview': {
    label: 'Превью для соцсетей',
    accept: 'image/*',
    maxSize: 2 * 1024 * 1024,
    hint: 'Изображение для соцсетей (Open Graph). Формат: JPG, PNG. Разрешение: 1200x630px. Размер: до 2MB.',
  },
}

export default function BatchUpload({ designId, onUploadComplete }: BatchUploadProps) {
  const [files, setFiles] = useState<FileWithMetadata[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('cover')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null, type?: string) => {
      if (!selectedFiles || selectedFiles.length === 0) return

      const typeToUse = type || selectedType
      const config = FILE_TYPE_CONFIG[typeToUse]

      if (!config) return

      const newFiles: FileWithMetadata[] = Array.from(selectedFiles).map(file => {
        // Валидация размера
        if (file.size > config.maxSize) {
          alert(`Файл ${file.name} превышает максимальный размер ${config.maxSize / 1024 / 1024}MB`)
          return null
        }

        return {
          file,
          type: typeToUse,
          id: `${Date.now()}-${Math.random()}`,
          status: 'pending',
          progress: 0,
        }
      }).filter(Boolean) as FileWithMetadata[]

      setFiles(prev => [...prev, ...newFiles])
    },
    [selectedType]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const droppedFiles = e.dataTransfer.files
      handleFileSelect(droppedFiles)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)

    try {
      const formData = new FormData()

      // Добавляем файлы
      files.forEach((fileWithMeta, index) => {
        formData.append('files', fileWithMeta.file)
        formData.append(`type_${fileWithMeta.file.name}`, fileWithMeta.type)
        if (fileWithMeta.metadata) {
          formData.append(`metadata_${fileWithMeta.file.name}`, JSON.stringify(fileWithMeta.metadata))
        }

        // Обновляем статус на uploading
        setFiles(prev =>
          prev.map(f => (f.id === fileWithMeta.id ? { ...f, status: 'uploading', progress: 10 } : f))
        )
      })

      const response = await fetch(`/api/designs/${designId}/assets/batch`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки')
      }

      // Обновляем статусы файлов
      setFiles(prev =>
        prev.map((f, index) => {
          const result = data.results?.[index]
          return {
            ...f,
            status: result ? 'success' : 'error',
            progress: 100,
            url: result?.url,
            error: result ? undefined : 'Ошибка загрузки',
          }
        })
      )

      if (onUploadComplete) {
        onUploadComplete(data.results || [])
      }

      // Очистка через 3 секунды
      setTimeout(() => {
        setFiles([])
        setUploading(false)
      }, 3000)
    } catch (error: any) {
      console.error('Upload error:', error)
      setFiles(prev =>
        prev.map(f => ({
          ...f,
          status: 'error',
          error: error.message || 'Ошибка загрузки',
        }))
      )
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'uploading':
        return '⏳'
      default:
        return '📄'
    }
  }

  return (
    <div className="space-y-6">
      {/* Выбор типа файла */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Тип файла для загрузки:
        </label>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white"
          disabled={uploading}
        >
          {Object.entries(FILE_TYPE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {/* Подсказка о параметрах */}
      <div
        className="p-4 rounded-2xl border border-[#00FFA9]/30 bg-[#00FFA9]/10"
        style={{
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-[#00FFA9] mb-1">Важные параметры:</h4>
            <p className="text-sm text-white/80 leading-relaxed">
              {FILE_TYPE_CONFIG[selectedType]?.hint}
            </p>
          </div>
        </div>
      </div>

      {/* Drag & Drop зона */}
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
          uploading
            ? 'border-white/20 bg-white/5 cursor-not-allowed'
            : 'border-white/30 bg-white/5 hover:border-[#00FFA9]/50 hover:bg-white/10 cursor-pointer'
        }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_TYPE_CONFIG[selectedType]?.accept}
          multiple={FILE_TYPE_CONFIG[selectedType]?.multiple || false}
          onChange={e => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />

        <div className="space-y-4">
          <div className="text-6xl">📦</div>
          <div>
            <p className="text-lg font-semibold text-white mb-2">
              {uploading ? 'Загрузка...' : 'Перетащите файлы сюда или нажмите для выбора'}
            </p>
            <p className="text-sm text-white/60">
              Поддерживаются: {FILE_TYPE_CONFIG[selectedType]?.accept}
            </p>
            <p className="text-xs text-white/40 mt-1">
              Максимальный размер: {formatFileSize(FILE_TYPE_CONFIG[selectedType]?.maxSize || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Список файлов */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-white">Загруженные файлы:</h3>
            {files.map(fileWithMeta => (
              <motion.div
                key={fileWithMeta.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getStatusIcon(fileWithMeta.status)}</span>
                      <span className="font-medium text-white truncate">{fileWithMeta.file.name}</span>
                      <span className="text-xs text-white/40">
                        ({formatFileSize(fileWithMeta.file.size)})
                      </span>
                    </div>
                    <div className="text-xs text-white/60 mb-2">
                      Тип: <span className="text-[#00FFA9]">{fileWithMeta.type}</span>
                    </div>
                    {fileWithMeta.status === 'uploading' && (
                      <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                        <div
                          className="bg-[#00FFA9] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${fileWithMeta.progress}%` }}
                        />
                      </div>
                    )}
                    {fileWithMeta.status === 'success' && fileWithMeta.url && (
                      <div className="text-xs text-[#00FFA9] mt-2 break-all">{fileWithMeta.url}</div>
                    )}
                    {fileWithMeta.status === 'error' && fileWithMeta.error && (
                      <div className="text-xs text-red-400 mt-2">{fileWithMeta.error}</div>
                    )}
                  </div>
                  {fileWithMeta.status !== 'uploading' && (
                    <button
                      onClick={() => removeFile(fileWithMeta.id)}
                      className="px-3 py-1 rounded-xl text-sm text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Кнопка загрузки */}
      {files.length > 0 && !uploading && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full px-6 py-4 rounded-2xl font-semibold text-black transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
            boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
          }}
        >
          Загрузить все файлы ({files.length})
        </button>
      )}
    </div>
  )
}

