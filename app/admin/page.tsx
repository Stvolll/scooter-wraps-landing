import Link from 'next/link'

export default function AdminPage() {
  return (
    <div
      className="min-h-screen p-8"
      style={{
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(15, 15, 15, 1) 5%, rgba(15, 15, 15, 1) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pt-24 px-4 md:px-8 lg:px-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">Admin Dashboard</h1>
          <p className="text-white/60">Manage your design lifecycle</p>
        </div>

        <div
          className="p-6 mx-4 md:mx-8 lg:mx-16"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRadius: '28px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow:
              '0 8px 32px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
          }}
        >
          <div className="flex flex-col gap-4">
            <Link
              href="/admin/designs"
              className="px-6 py-4 rounded-2xl font-semibold text-black transition-all hover:scale-105 text-center"
              style={{
                background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
              }}
            >
              Manage Designs
            </Link>
            <Link
              href="/admin/designs/new"
              className="px-6 py-4 rounded-2xl font-semibold text-white transition-all hover:bg-white/10 text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              Create New Design
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
