'use client'

/**
 * ClientScooterViewer - безопасный компонент для основного сайта
 * 
 * Особенности:
 * - Импортирует Three.js ТОЛЬКО на клиенте
 * - Использует динамический импорт с lazy loading
 * - Не имеет импортов Three.js на верхнем уровне
 * - Проверяет поддержку WebGL
 * - Имеет fallback при ошибках
 */

import { Suspense, lazy, useState, useEffect } from 'react'
import ScooterViewerLoading from './ScooterViewerLoading'
import { checkWebGLSupport } from './scooter-viewer/utils'

interface TextureSet {
  body?: string
  plastic?: string
  accents?: string
}

interface ClientScooterViewerProps {
  modelPath: string
  selectedDesign?: {
    id?: string
    name?: string
    textures?: TextureSet
    texture?: string
    bg_webp?: string
    panorama?: string
  }
  panoramaUrl?: string
  className?: string
}

// Динамический импорт без SSR
const SceneRenderer = lazy(() => 
  import('./scooter-viewer/SceneRenderer').then(mod => ({ default: mod.default }))
    .catch(error => {
      console.error('❌ [ClientScooterViewer] Failed to load SceneRenderer:', error)
      // Возвращаем fallback компонент
      return {
        default: () => (
          <div className="flex items-center justify-center h-full bg-gradient-to-b from-neutral-900 to-neutral-800">
            <div className="text-center">
              <h3 className="text-white text-lg mb-2">Failed to load 3D Viewer</h3>
              <button 
                onClick={() => window.location.reload()}
                className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-6 py-2 rounded-lg mt-4"
              >
                Retry
              </button>
              <p className="text-white/60 text-sm mt-4">For the best experience, please use a modern browser</p>
            </div>
          </div>
        )
      }
    })
)

// Error fallback component
function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800">
      <div className="text-center max-w-md px-4">
        <h3 className="text-white text-xl font-semibold mb-3">Failed to load 3D Viewer</h3>
        <p className="text-white/70 mb-6">
          We couldn't load the 3D viewer. This might be due to:
        </p>
        <ul className="text-white/60 text-sm text-left mb-6 space-y-2">
          <li>• Your browser doesn't support WebGL</li>
          <li>• JavaScript is disabled</li>
          <li>• Network connectivity issues</li>
        </ul>
        <button 
          onClick={onRetry}
          className="bg-[#007AFF] hover:bg-[#0051D5] active:scale-95 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg"
        >
          Retry
        </button>
        <p className="text-white/50 text-xs mt-4">
          For the best experience, please use a modern browser with WebGL support
        </p>
      </div>
    </div>
  )
}

export default function ClientScooterViewer({
  modelPath,
  selectedDesign,
  panoramaUrl = '/images/studio-panorama.png',
  className = '',
}: ClientScooterViewerProps) {
  const [isClient, setIsClient] = useState(false)
  const [hasWebGL, setHasWebGL] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return
    
    setIsClient(true)
    
    // Проверяем поддержку WebGL
    const webglSupported = checkWebGLSupport()
    setHasWebGL(webglSupported)
    
    if (!webglSupported) {
      console.warn('⚠️ WebGL is not supported in this browser')
      setError(new Error('WebGL not supported'))
    }
  }, [])

  // Обработка ошибок при загрузке
  const handleError = (error: Error) => {
    console.error('❌ [ClientScooterViewer] Error:', error)
    setError(error)
  }

  const handleRetry = () => {
    setError(null)
    setRetryKey(prev => prev + 1)
  }

  // Не рендерим на сервере
  if (!isClient) {
    return <ScooterViewerLoading />
  }

  // Показываем ошибку, если WebGL не поддерживается
  if (!hasWebGL) {
    return <ErrorFallback onRetry={handleRetry} />
  }

  // Показываем ошибку, если была ошибка загрузки
  if (error) {
    return <ErrorFallback onRetry={handleRetry} />
  }

  // Преобразуем selectedDesign в textures для SceneRenderer
  const textures = selectedDesign?.textures || (selectedDesign?.texture ? {
    body: selectedDesign.texture,
    plastic: selectedDesign.texture,
    accents: selectedDesign.texture,
  } : undefined)

  const finalPanoramaUrl = selectedDesign?.panorama || selectedDesign?.bg_webp || panoramaUrl

  return (
    <Suspense fallback={<ScooterViewerLoading />}>
      <SceneRenderer
        key={retryKey}
        modelPath={modelPath}
        textures={textures}
        panoramaUrl={finalPanoramaUrl}
        className={className}
      />
    </Suspense>
  )
}




