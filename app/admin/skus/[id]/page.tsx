'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SKU, Category } from '@/types/sku'
import SKUForm from '@/components/admin/SKUForm'

export default function EditSKUPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [sku, setSku] = useState<SKU | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id === 'new') {
      setLoading(false)
      return
    }
    
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to list
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {params.id === 'new' ? 'Create New SKU' : 'Edit SKU'}
          </h1>
        </div>

        {params.id !== 'new' && sku && (
          <div className="mb-4">
            <Link
              href={`/admin/skus/${params.id}/preview`}
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Preview SKU
            </Link>
          </div>
        )}

        <SKUForm sku={sku} onSuccess={() => router.push('/admin')} />
      </div>
    </div>
  )
}

