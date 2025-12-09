'use client'

import { useState, useEffect, FormEvent } from 'react'
import Image from 'next/image'
import { SKU, Category, MediaFile } from '@/types/sku'

interface SKUFormProps {
  sku?: SKU | null
  onSuccess?: () => void
}

export default function SKUForm({ sku, onSuccess }: SKUFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    code: sku?.code || '',
    title: sku?.title || '',
    description: sku?.description || '',
    price: sku?.price || 0,
    category_id: sku?.category_id || '',
    status: sku?.status || 'draft',
    metadata: JSON.stringify(sku?.metadata || {}, null, 2),
  })
  const [media, setMedia] = useState({
    images: sku?.media.images || [],
    videos: sku?.media.videos || [],
    description_file: sku?.media.description_file,
    thumbnail: sku?.media.thumbnail,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let metadata = {}
      try {
        metadata = JSON.parse(formData.metadata)
      } catch {
        alert('Invalid JSON in metadata field')
        setLoading(false)
        return
      }

      const payload = {
        ...formData,
        price: Number(formData.price),
        category_id: formData.category_id || null,
        metadata,
      }

      const url = sku ? `/api/skus/${sku.id}` : '/api/skus'
      const method = sku ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        // Update media if needed
        if (sku) {
          await updateMedia(sku.id)
        } else {
          await updateMedia(data.data.id)
        }

        alert(sku ? 'SKU updated successfully' : 'SKU created successfully')
        onSuccess?.()
      } else {
        alert(data.error || 'Failed to save SKU')
      }
    } catch (error) {
      console.error('Failed to save SKU:', error)
      alert('Failed to save SKU')
    } finally {
      setLoading(false)
    }
  }

  const updateMedia = async (skuId: string) => {
    try {
      await fetch(`/api/skus/${skuId}/media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(media),
      })
    } catch (error) {
      console.error('Failed to update media:', error)
    }
  }

  const handleFileUpload = async (
    file: File,
    type: 'images' | 'videos' | 'description_file' | 'thumbnail'
  ) => {
    try {
      // Step 1: Get signed URL from server
      const formData = new FormData()
      formData.append('file', file)
      formData.append(
        'type',
        type === 'images' ? 'images' : type === 'videos' ? 'videos' : 'documents'
      )

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!data.success) {
        alert(data.error || 'Failed to get upload URL')
        return
      }

      const { signedUrl, key, filename, mimetype, size } = data.data

      // Step 2: Upload file directly to S3 using signed URL
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': mimetype,
        },
      })

      if (!uploadRes.ok) {
        throw new Error(`Failed to upload to S3: ${uploadRes.statusText}`)
      }

      // Step 3: Get public URL
      const urlRes = await fetch(`/api/upload/url?key=${encodeURIComponent(key)}`)
      const urlData = await urlRes.json()

      if (!urlData.success) {
        throw new Error('Failed to get public URL')
      }

      const mediaFile: MediaFile = {
        url: urlData.data.url,
        filename: filename,
        mimetype: mimetype,
        size: size,
        uploadedAt: new Date().toISOString(),
      }

      if (type === 'images') {
        setMedia({ ...media, images: [...media.images, mediaFile] })
      } else if (type === 'videos') {
        setMedia({ ...media, videos: [...media.videos, mediaFile] })
      } else if (type === 'description_file') {
        setMedia({ ...media, description_file: mediaFile })
      } else if (type === 'thumbnail') {
        setMedia({ ...media, thumbnail: mediaFile })
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      alert('Failed to upload file: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const removeMedia = (type: 'images' | 'videos', index: number) => {
    if (type === 'images') {
      setMedia({ ...media, images: media.images.filter((_, i) => i !== index) })
    } else {
      setMedia({ ...media, videos: media.videos.filter((_, i) => i !== index) })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU Code *</label>
          <input
            type="text"
            required
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="SKU-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Product Title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Product description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (VND) *</label>
            <input
              type="number"
              required
              min="0"
              step="1000"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              required
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={formData.category_id}
            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Metadata (JSON)</h2>
        <textarea
          rows={6}
          value={formData.metadata}
          onChange={e => setFormData({ ...formData, metadata: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder='{"material": "carbon", "color": "black"}'
        />
      </div>

      {/* Media */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Media</h2>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file, 'thumbnail')
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          {media.thumbnail && (
            <div className="mt-2 relative h-20 w-20">
              <Image
                src={media.thumbnail.url}
                alt="Thumbnail"
                fill
                className="object-cover rounded"
                sizes="80px"
              />
            </div>
          )}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={e => {
              Array.from(e.target.files || []).forEach(file => {
                handleFileUpload(file, 'images')
              })
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {media.images.map((img, idx) => (
              <div key={idx} className="relative h-20 w-20">
                <Image
                  src={img.url}
                  alt={`Image ${idx + 1}`}
                  fill
                  className="object-cover rounded"
                  sizes="80px"
                />
                <button
                  type="button"
                  onClick={() => removeMedia('images', idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Videos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Videos</label>
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={e => {
              Array.from(e.target.files || []).forEach(file => {
                handleFileUpload(file, 'videos')
              })
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <div className="mt-2 space-y-2">
            {media.videos.map((vid, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{vid.filename}</span>
                <button
                  type="button"
                  onClick={() => removeMedia('videos', idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Description File */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description File (PDF/DOCX/TXT)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file, 'description_file')
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          {media.description_file && (
            <div className="mt-2">
              <a
                href={media.description_file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {media.description_file.filename}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4 pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : sku ? 'Update SKU' : 'Create SKU'}
        </button>
        <button
          type="button"
          onClick={() => onSuccess?.()}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
