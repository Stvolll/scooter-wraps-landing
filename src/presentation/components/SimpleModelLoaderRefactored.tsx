/**
 * Simple Model Loader Component (Refactored)
 * Uses infrastructure services per User Rules
 */

import { useEffect, useRef, useState } from 'react'

interface SimpleModelLoaderProps {
  glbUrl: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

/**
 * Alternative model loader using infrastructure service
 * Use this if useGLTF from drei doesn't work
 */
export function SimpleModelLoaderRefactored({
  glbUrl,
  onLoad,
  onError,
}: SimpleModelLoaderProps) {
  const groupRef = useRef<any>(null)
  const [model, setModel] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!groupRef.current) return

    console.log('📦 [SimpleModelLoader] Loading GLB from:', glbUrl)

    // Dynamically import service from application layer to avoid SSR issues
    import('@/application/services/ModelLoadService').then(
      ({ ModelLoadService }) => {
        const service = new ModelLoadService()
        let isCancelled = false

        service
          .loadModel(glbUrl)
          .then((result) => {
            if (isCancelled) return

            console.log('✅ [SimpleModelLoader] Model loaded:', {
              scene: !!result.scene,
              meshes: result.meshes.length,
            })

            setModel(result.scene)

            if (onLoad) {
              onLoad()
            }
          })
          .catch((err) => {
            if (isCancelled) return
            console.error('❌ [SimpleModelLoader] Load error:', err)
            const errorObj = err instanceof Error ? err : new Error('Failed to load GLB')
            setError(errorObj)
            if (onError) {
              onError(errorObj)
            }
          })

        return () => {
          isCancelled = true
        }
      }
    )
  }, [glbUrl, onLoad, onError])

  if (error) {
    return null
  }

  if (!model) {
    return null
  }

  return <primitive ref={groupRef} object={model} />
}


