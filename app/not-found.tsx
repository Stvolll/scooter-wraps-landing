/**
 * Not Found Page
 * Handles 404 errors
 */

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Page Not Found</h1>
        <p className="text-neutral-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-[#00FFA9] text-black rounded-lg font-semibold hover:bg-[#00E699] transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}
