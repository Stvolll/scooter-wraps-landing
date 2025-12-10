/**
 * Placeholder component for 3D viewer loading state
 * Used while heavy 3D libraries are being loaded
 */

export default function ThreeDViewerPlaceholder() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-neutral-100 to-neutral-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-400 mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading 3D Viewer...</p>
      </div>
    </div>
  )
}

