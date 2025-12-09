// app/admin/designs/new/page.tsx
'use client'

import { createDesign } from '../actions'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload'
import UploadGuide from '@/components/UploadGuide'

export default function NewDesignPage() {
  const router = useRouter()
  const [coverImage, setCoverImage] = useState<string>('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [glbModelUrl, setGlbModelUrl] = useState<string>('')
  const [textureUrl, setTextureUrl] = useState<string>('')

  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setError('')
    setLoading(true)

    try {
      const title = formData.get('title') as string
      const slug = formData.get('slug') as string
      const scooterModel = formData.get('scooterModel') as string
      const price = Number(formData.get('price') || 0)
      const editionTotal = Number(formData.get('editionTotal') || 5)
      const description = formData.get('description') as string

      await createDesign({
        title,
        slug,
        scooterModel,
        price,
        editionTotal,
        description,
        coverImage: coverImage || undefined,
        galleryImages,
        glbModelUrl: glbModelUrl || undefined,
        textureUrl: textureUrl || undefined,
      })

      router.push('/admin/designs')
    } catch (err: any) {
      console.error('Error creating design:', err)
      setError(err.message || 'Failed to create design. Please check your database connection.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(15, 15, 15, 1) 5%, rgba(15, 15, 15, 1) 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 pt-24 px-4 md:px-8 lg:px-16">
          <Link
            href="/admin/designs"
            className="text-[#00FFA9] hover:text-[#00D4FF] transition-colors mb-4 block text-sm font-medium"
          >
            ← Back to Designs
          </Link>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">New Design</h1>
          <p className="text-white/60">Create a new design entry</p>
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
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Title *</label>
              <input
                name="title"
                required
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Slug *</label>
              <input
                name="slug"
                required
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Scooter Model *
              </label>
              <input
                name="scooterModel"
                required
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Price</label>
              <input
                name="price"
                type="number"
                defaultValue={0}
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Edition Total</label>
              <input
                name="editionTotal"
                type="number"
                defaultValue={5}
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Description</label>
              <textarea
                name="description"
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                }}
              />
            </div>

            {/* Upload Guide */}
            <div className="pt-4 border-t border-white/10">
              <UploadGuide />
            </div>

            {/* File Uploads */}
            <div className="space-y-4 pt-4">
              <FileUpload
                label="Cover Image"
                accept="image/*"
                onUploadComplete={(url) => setCoverImage(url)}
              />
              <FileUpload
                label="3D Model (GLB)"
                accept=".glb,model/gltf-binary"
                maxSize={50 * 1024 * 1024}
                onUploadComplete={(url) => setGlbModelUrl(url)}
              />
              <FileUpload
                label="Texture"
                accept="image/*"
                onUploadComplete={(url) => setTextureUrl(url)}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl font-semibold text-black transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
              }}
            >
              {loading ? 'Creating...' : 'Create Design'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
