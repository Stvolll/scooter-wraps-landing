'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SKU } from '@/types/sku'
import SKUPreview from '@/components/admin/SKUPreview'

export default function SKUPreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [sku, setSku] = useState<SKU | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSKU()
  }, [params.id])

  const fetchSKU = async () => {
    try {
      const res = await fetch(`/api/skus/${params.id}`)
      const data = await res.json()

      if (data.success) {
        setSku(data.data)
      } else {
        alert(data.error)
        router.push('/admin')
      }
    } catch (error) {
      console.error('Failed to fetch SKU:', error)
      alert('Failed to load SKU')
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!sku) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500">SKU not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-blue-600 hover:underline mb-4">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">SKU Preview</h1>
        </div>

        <SKUPreview sku={sku} />
      </div>
    </div>
  )
}
