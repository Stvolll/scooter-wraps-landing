'use client'

/**
 * Wrapper для ModelScene3D - адаптирует текущий формат selectedDesign к ModelScene3D
 * Сохраняет текущий UI и параметры камеры
 */

import { useState, useEffect, Suspense, lazy } from 'react'

// ✅ FIX: Используем React.lazy вместо next/dynamic для более надежной изоляции
// Загружаем компонент только после полной готовности React
const CanvasWithModelScene = lazy(() => import('./CanvasWithModelScene'))

interface ModelScene3DWrapperProps {
  modelUrl: string
  selectedDesign?: {
    id?: string
    name?: string
    texture?: string
    textures?: {
      body?: string
      plastic?: string
      accents?: string
    }
  }
  panoramaUrl?: string
  className?: string
  onLoadingChange?: (loading: boolean) => void
  onError?: (error: Error) => void
}

export default function ModelScene3DWrapper({
  modelUrl,
  selectedDesign,
  panoramaUrl,
  className = '',
  onLoadingChange,
  onError,
}: ModelScene3DWrapperProps) {
  // ✅ FIX: Проверка на клиент (из scooter-wraps-platform)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true)
    }
  }, [])

  // Извлекаем designId из selectedDesign
  const designId = selectedDesign?.id

  if (!mounted) {
    return (
      <div
        className={`relative w-full h-full ${className}`}
        style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 mx-auto mb-4"></div>
            <p className="text-white/60">Loading 3D Viewer...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' }}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 mx-auto mb-4"></div>
              <p className="text-white/60">Loading 3D Viewer...</p>
            </div>
          </div>
        }
      >
        <CanvasWithModelScene
          modelUrl={modelUrl}
          designId={designId}
          onLoadingChange={onLoadingChange}
          onError={onError}
        />
      </Suspense>
    </div>
  )
}

