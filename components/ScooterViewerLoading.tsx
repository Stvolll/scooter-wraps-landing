'use client'

/**
 * Загрузочный экран для 3D вьювера
 */
export default function ScooterViewerLoading() {
  return (
    <div
      className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800"
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 mx-auto mb-4"></div>
        <p className="text-white/60">Loading 3D Viewer...</p>
      </div>
    </div>
  )
}




