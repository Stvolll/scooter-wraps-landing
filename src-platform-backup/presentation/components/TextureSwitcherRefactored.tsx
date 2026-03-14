/**
 * Texture Switcher Component (Refactored)
 * Per Project Rules: uses TextureRenderer from infrastructure only;
 * no domain or Three.js imports in presentation.
 */

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { TextureRenderer } from '@/infrastructure/renderers/three/TextureRenderer'

interface TextureSwitcherProps {
  textureUrl: string | null
  onTextureLoaded?: () => void
  onTextureError?: (error: Error) => void
}

export function TextureSwitcherRefactored({
  textureUrl,
  onTextureLoaded,
  onTextureError,
}: TextureSwitcherProps) {
  const { scene } = useThree()
  const textureRendererRef = useRef<TextureRenderer | null>(null)

  useEffect(() => {
    if (!textureRendererRef.current) {
      textureRendererRef.current = new TextureRenderer()
    }
  }, [])

  useEffect(() => {
    if (!textureUrl || !textureRendererRef.current) return
    console.log('🎨 [TextureSwitcher] Loading texture:', textureUrl)
    textureRendererRef.current
      .renderTextureByUrl(scene, textureUrl)
      .then(() => {
        console.log('✅ [TextureSwitcher] Texture applied successfully')
        onTextureLoaded?.()
      })
      .catch((error) => {
        console.error('❌ [TextureSwitcher] Error applying texture:', error)
        onTextureError?.(error instanceof Error ? error : new Error(String(error)))
      })
  }, [textureUrl, scene, onTextureLoaded, onTextureError])

  return null
}


