// app/admin/designs/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import StageChecklist from '@/components/StageChecklist'
import { togglePublish } from '../actions'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import BatchUploadClient from '@/components/BatchUploadClient'
import ModelPropertiesEditorClient from '@/components/ModelPropertiesEditorClient'

export default async function DesignEditPage({ params }: { params: { id: string } }) {
  let design: any = null
  try {
    design = await prisma.design.findUnique({
      where: { id: params.id },
      include: {
        statusHistory: {
          orderBy: { at: 'desc' },
        },
        modelProperties: true,
        textures: {
          orderBy: { layer: 'asc' },
        },
      },
    })
  } catch (error: any) {
    console.error('Database error:', error.message)
  }

  if (!design) {
    return (
      <div
        className="min-h-screen p-8 flex items-center justify-center"
        style={{
          background:
            'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(15, 15, 15, 1) 5%, rgba(15, 15, 15, 1) 100%)',
        }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">Design Not Found</h1>
          <p className="text-white/60 mb-4">
            {design === null
              ? 'Database not configured. Please set DATABASE_URL in .env.local'
              : 'Design does not exist'}
          </p>
          <Link
            href="/admin/designs"
            className="text-[#00FFA9] hover:text-[#00D4FF] transition-colors"
          >
            ← Back to Designs
          </Link>
        </div>
      </div>
    )
  }

  async function handleTogglePublish() {
    'use server'
    await togglePublish(design.id, !design.published)
    redirect(`/admin/designs/${design.id}`)
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
          <Link
            href="/admin/designs"
            className="text-[#00FFA9] hover:text-[#00D4FF] transition-colors mb-4 block text-sm font-medium"
          >
            ← Back to Designs
          </Link>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">
            Edit: {design.title}
          </h1>
          <p className="text-white/60">Manage design details and stages</p>
        </div>

        <div
          className="p-6 mx-4 md:mx-8 lg:mx-16 mb-6"
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
          <div className="mb-4">
            <div className="text-white/60 mb-2">
              <strong className="text-white">Model:</strong> {design.scooterModel}
            </div>
            <div className="text-white/60 mb-2">
              <strong className="text-white">Editions:</strong> {design.editionAvailable}/
              {design.editionTotal}
            </div>
            <div className="text-white/60 mb-4">
              <strong className="text-white">Status:</strong>{' '}
              {design.published ? (
                <span className="text-[#00FFA9]">Published</span>
              ) : (
                <span className="text-white/40">Draft</span>
              )}
            </div>
            <form action={handleTogglePublish}>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl font-semibold text-white transition-all hover:scale-105"
                style={{
                  background: design.published
                    ? 'rgba(255, 59, 48, 0.2)'
                    : 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                  border: design.published ? '1px solid rgba(255, 59, 48, 0.3)' : 'none',
                  boxShadow: design.published ? 'none' : '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
                }}
              >
                {design.published ? 'Unpublish' : 'Publish'}
              </button>
            </form>
          </div>
        </div>

        <div
          className="p-6 mx-4 md:mx-8 lg:mx-16 mb-6"
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
          <h2 className="text-2xl font-semibold text-white mb-4">📦 Пакетная загрузка контента</h2>
          <p className="text-sm text-white/60 mb-6">
            Загрузите все файлы для этого дизайна: 3D модели, текстуры, видео, схемы и другие материалы.
          </p>
          <BatchUploadClient designId={design.id} />
        </div>

        <div
          className="p-6 mx-4 md:mx-8 lg:mx-16 mb-6"
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
          <ModelPropertiesEditorClient designId={design.id} initialProperties={design?.modelProperties || null} />
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
          <h2 className="text-2xl font-semibold text-white mb-4">Production Stages</h2>
          <StageChecklist
            currentStatus={design.status}
            statusHistory={design.statusHistory || []}
            designId={design.id}
          />
        </div>
      </div>
    </div>
  )
}
