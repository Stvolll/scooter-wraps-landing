'use client'

/**
 * ThreeDViewer - delegates to single loader only.
 * Does NOT call useGLTF. Renders PlatformCanvasModelScene → ModelScene3D (useGLTF).
 */

import { useState, useEffect } from 'react'
import CanvasWithModelScene from './CanvasWithModelScene'

interface ThreeDViewerProps {
  modelPath?: string
  designs: Array<{
    id: string
    name: string
    texturePath?: string
    color?: string
  }>
  defaultDesignIndex?: number
}

export default function ThreeDViewer({
  modelPath,
  designs,
  defaultDesignIndex = 0,
}: ThreeDViewerProps) {
  const [currentDesignIndex, setCurrentDesignIndex] = useState(defaultDesignIndex)

  useEffect(() => {
    setCurrentDesignIndex(defaultDesignIndex)
  }, [defaultDesignIndex])

  const modelUrl = modelPath?.startsWith('/') ? modelPath : modelPath ? `/${modelPath}` : '/models/yamaha-nvx.glb'
  const designId = designs[currentDesignIndex]?.id

  return (
    <div className="w-full h-full min-h-[500px] bg-gradient-to-b from-neutral-100 to-neutral-50 rounded-2xl overflow-hidden relative">
      <CanvasWithModelScene modelUrl={modelUrl} designId={designId} />
      {designs.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
          {designs[currentDesignIndex]?.name || `Design ${currentDesignIndex + 1}`}
        </div>
      )}
    </div>
  )
}
