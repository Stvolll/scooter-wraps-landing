'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-[#1C1C1E] rounded-3xl p-8 text-center border border-white/10">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-3xl font-bold text-white mb-4">Что-то пошло не так!</h2>
        <p className="text-white/60 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-8 py-4 rounded-2xl font-semibold transition-all active:scale-95"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  )
}






