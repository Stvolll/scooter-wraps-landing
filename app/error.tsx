'use client'

/**
 * Error Boundary Component
 * Handles runtime errors in the app
 * CRITICAL: No useEffect, no side effects - pure render only to avoid recursion
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Extract error message safely without any side effects
  const errorMessage = error?.message || error?.toString() || 'An unexpected error occurred'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Something went wrong!</h1>
        <p className="text-neutral-600 mb-6">{errorMessage}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#00FFA9] text-black rounded-lg font-semibold hover:bg-[#00E699] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
