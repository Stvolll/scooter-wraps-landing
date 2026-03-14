/**
 * Background Applier Component (Refactored)
 * Per Project Rules: uses BackgroundRenderer from infrastructure only;
 * no domain or Three.js imports in presentation.
 */

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { BackgroundRenderer } from '@/infrastructure/renderers/three/BackgroundRenderer'
import type { BackgroundRenderData } from '@/shared-core'

interface BackgroundApplierProps {
  background: BackgroundRenderData | null
}

export function BackgroundApplierRefactored({ background }: BackgroundApplierProps) {
  const { scene } = useThree()
  const backgroundRendererRef = useRef<BackgroundRenderer | null>(null)

  useEffect(() => {
    if (!backgroundRendererRef.current) {
      backgroundRendererRef.current = new BackgroundRenderer()
    }
  }, [])

  useEffect(() => {
    if (!backgroundRendererRef.current) return
    try {
      if (!background) {
        backgroundRendererRef.current.clearSceneBackground(scene)
        return
      }
      backgroundRendererRef.current.renderFromRenderData(scene, background)
      console.log('✅ [BackgroundApplier] Background applied successfully')
    } catch (error) {
      console.error('❌ [BackgroundApplier] Error applying background:', error)
    }
  }, [background, scene])

  return null
}


