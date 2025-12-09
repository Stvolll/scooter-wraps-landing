// app/admin/designs/page.tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DesignsPage() {
  let designs: any[] = []
  let dbError: string | null = null

  try {
    designs = await prisma.design.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        statusHistory: {
          orderBy: { at: 'desc' },
          take: 1,
        },
      },
    })
  } catch (error: any) {
    console.error('Database error:', error.message)
    dbError = error.message || 'Database connection error'
    // If database is not configured, show empty state
  }

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
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">Designs</h1>
          <p className="text-white/60">Manage your design collection</p>
          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-sm text-white/70">
              <strong>💡 Подсказка:</strong> Создайте новый дизайн, загрузите файлы (обложка, 3D
              модель, текстура), и управляйте этапами производства через систему стадий.
            </p>
          </div>
        </div>

        <div
          className="mb-6 p-6 mx-4 md:mx-8 lg:mx-16"
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
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/admin"
              className="text-[#00FFA9] hover:text-[#00D4FF] transition-colors text-sm font-medium"
            >
              ← Back to Admin
            </Link>
            <Link
              href="/admin/designs/new"
              className="px-6 py-3 rounded-2xl font-semibold text-black transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
              }}
            >
              + New Design
            </Link>
          </div>

          {dbError ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-2">Database Error</p>
              <p className="text-white/60 text-sm mb-4">{dbError}</p>
              <p className="text-white/40 text-xs">
                Please check your DATABASE_URL in .env.local and ensure Prisma is properly
                configured.
              </p>
            </div>
          ) : designs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60">No designs found</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {designs.map(d => (
                <li
                  key={d.id}
                  className="p-4 rounded-2xl transition-all hover:scale-[1.01] hover:bg-white/10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <Link
                        href={`/admin/designs/${d.id}`}
                        className="text-white font-semibold hover:text-[#00FFA9] transition-colors block mb-1"
                      >
                        {d.title}
                      </Link>
                      <div className="text-sm text-white/50">
                        {d.scooterModel} • {d.editionAvailable}/{d.editionTotal} editions
                      </div>
                      <div className="text-xs text-white/40 mt-1 flex items-center gap-2">
                        {d.published ? (
                          <span className="text-[#00FFA9]">● Published</span>
                        ) : (
                          <span className="text-white/40">○ Draft</span>
                        )}
                        <span className="text-white/30">•</span>
                        <span className="capitalize">
                          {d.status?.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/designs/${d.slug}`}
                        target="_blank"
                        className="px-4 py-2 rounded-xl text-sm font-medium text-[#00FFA9] transition-all hover:bg-[#00FFA9]/10"
                        style={{
                          background: 'rgba(0, 255, 169, 0.1)',
                          border: '1px solid rgba(0, 255, 169, 0.2)',
                        }}
                      >
                        View on site
                      </Link>
                      <Link
                        href={`/admin/designs/${d.id}`}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:bg-white/10"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
