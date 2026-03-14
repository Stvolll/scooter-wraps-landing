'use client'

/**
 * ScooterViewerFallback - fallback компонент для случаев, когда 3D вьювер не работает
 */

import Image from 'next/image'

interface ScooterViewerFallbackProps {
  modelName?: string
  previewImage?: string
  className?: string
}

export default function ScooterViewerFallback({
  modelName = 'Scooter Model',
  previewImage,
  className = '',
}: ScooterViewerFallbackProps) {
  return (
    <div
      className={`relative w-full h-full ${className} flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800`}
    >
      {previewImage ? (
        <div className="relative w-full h-full">
          <Image
            src={previewImage}
            alt={`${modelName} preview`}
            fill
            className="object-contain"
            priority
          />
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 mx-auto mb-4"></div>
          <p className="text-white/60 mb-2">Loading 3D Model...</p>
          <p className="text-white/40 text-sm">
            Enable WebGL or update your browser for interactive 3D view
          </p>
        </div>
      )}
    </div>
  )
}




