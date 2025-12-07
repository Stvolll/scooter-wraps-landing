'use client'

import { useRouter } from 'next/navigation'
import SKUForm from '@/components/admin/SKUForm'

export default function NewSKUPage() {
  const router = useRouter()

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
          <h1 className="text-3xl font-bold text-gray-900">Create New SKU</h1>
        </div>

        <SKUForm onSuccess={() => router.push('/admin')} />
      </div>
    </div>
  )
}


