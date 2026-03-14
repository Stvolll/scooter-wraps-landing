'use client'

/**
 * AdminScooterViewer - delegates to single loader only.
 * Does NOT call useGLTF. Renders PlatformCanvasModelScene → ModelScene3D (useGLTF).
 * Note: Custom textures (body/plastic/accents) are not applied; designId can be added if admin uses design API.
 */

import { useState, useEffect } from 'react'
import CanvasWithModelScene from './CanvasWithModelScene'

interface TextureSet {
  body?: string
  plastic?: string
  accents?: string
}

interface AdminScooterViewerProps {
  modelPath: string
  textures?: TextureSet
  panoramaUrl?: string
  className?: string
}

export default function AdminScooterViewer({
  modelPath,
  className = '',
}: AdminScooterViewerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div
        className={`relative w-full h-full ${className} flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 mx-auto mb-4"></div>
          <p className="text-white/60">Loading 3D Viewer...</p>
        </div>
      </div>
    )
  }

  const modelUrl = modelPath.startsWith('/') ? modelPath : `/${modelPath}`

  if (!modelUrl) {
    return (
      <div
        className={`relative w-full h-full ${className} flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800`}
      >
        <p className="text-white/60">Model URL is not set</p>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' }}
    >
      <CanvasWithModelScene modelUrl={modelUrl} />
    </div>
  )
}
