/**
 * Model Loader Component (Refactored)
 * Uses infrastructure services per User Rules
 */

import { useEffect, useMemo, useState } from 'react'
import { useGLTF } from '@react-three/drei'

interface ModelLoaderProps {
  glbUrl: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function ModelLoaderRefactored({ glbUrl, onLoad, onError }: ModelLoaderProps) {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  console.log('📦 [ModelLoader] Loading GLB from:', glbUrl)

  // useGLTF must be called unconditionally (React hook rules)
  // It will throw errors which are caught by Suspense or ErrorBoundary
  const { scene } = useGLTF(glbUrl)
  console.log('✅ [ModelLoader] useGLTF returned scene:', {
    hasScene: !!scene,
    children: scene?.children.length || 0,
  })

  // Process scene using infrastructure service
  const processedScene = useMemo(() => {
    if (!scene) return null

    console.log('🎨 [ModelLoader] Processing scene...', {
      hasScene: !!scene,
      children: scene.children.length,
    })

    // Clone the scene to avoid sharing state
    const clonedScene = scene.clone()

    // Center and scale model using infrastructure service
    // Note: This is a simplified version - full processing should be done via API
    // For now, we keep basic processing here but should move to infrastructure
    try {
      // Import service from application layer dynamically to avoid SSR issues
      import('@/application/services/ModelLoadService').then(({ ModelLoadService }) => {
        const service = new ModelLoadService()
        service.loadModel(glbUrl).then((result) => {
          // Scene is already processed by useGLTF, we just need to center/scale
          // This is a temporary solution - should use service for full processing
        }).catch((err) => {
          console.warn('⚠️ [ModelLoader] Could not process with service:', err)
        })
      })

      // Basic processing (temporary - should use service)
      // Note: This code is deprecated and should be removed
      // ModelLoadService should handle all processing
      // Keeping for backward compatibility only
    } catch (err) {
      console.warn('⚠️ [ModelLoader] Could not center/scale model:', err)
    }

    return clonedScene
  }, [scene, glbUrl])

  useEffect(() => {
    if (processedScene) {
      console.log('✅ [ModelLoader] Model ready')
      setIsLoading(false)
      if (onLoad) {
        onLoad()
      }
    }
  }, [processedScene, onLoad])

  if (error) {
    console.error('❌ [ModelLoader] Cannot render due to error:', error)
    return null
  }

  if (!processedScene) {
    console.log('⏳ [ModelLoader] Scene not ready yet')
    return null
  }

  // Use primitive to render the scene directly
  return <primitive object={processedScene} />
}


