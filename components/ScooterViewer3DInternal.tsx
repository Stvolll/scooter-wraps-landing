'use client'

/**
 * ScooterViewer3DInternal - delegates to single loader only.
 * Does NOT call useGLTF. Renders PlatformCanvasModelScene → ModelScene3D (useGLTF).
 */

import CanvasWithModelScene from './CanvasWithModelScene'

interface TextureSet {
  body?: string
  plastic?: string
  accents?: string
}

interface ScooterViewer3DInternalProps {
  modelPath: string
  selectedDesign?: {
    id?: string
    slug?: string
    name?: string
    textures?: TextureSet
    texture?: string
    designGlb?: string
  }
  panoramaUrl?: string
  className?: string
}

export default function ScooterViewer3DInternal({
  modelPath,
  selectedDesign,
  className = '',
}: ScooterViewer3DInternalProps) {
  if (typeof window === 'undefined') return null

  const modelUrl = modelPath.startsWith('/') ? modelPath : `/${modelPath}`
  const designId = selectedDesign?.id ?? selectedDesign?.slug ?? undefined

  if (!modelUrl) {
    return (
      <div
        className={`relative w-full h-full ${className}`}
        style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' }}
      >
        <p className="text-white/60 p-4">Model URL is not set</p>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' }}
    >
      <CanvasWithModelScene modelUrl={modelUrl} designId={designId} />
    </div>
  )
}
