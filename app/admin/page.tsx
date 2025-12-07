'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SKU } from '@/types/sku'

export default function AdminPage() {
  const [skus, setSkus] = useState<SKU[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  })

  useEffect(() => {
    fetchSkus()
  }, [filters])

  const fetchSkus = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      
      const res = await fetch(`/api/skus?${params}`)
      const data = await res.json()
      
      if (data.success) {
        setSkus(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch SKUs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SKU?')) return
    
    try {
      const res = await fetch(`/api/skus/${id}`, { method: 'DELETE' })
      const data = await res.json()
      
      if (data.success) {
        fetchSkus()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Failed to delete SKU:', error)
      alert('Failed to delete SKU')
    }
  }

  return (
    <div 
      className="min-h-screen p-8"
      style={{
        background: 'linear-gradient(180deg, #F5F5F7 0%, #FFFFFF 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">SKU Management</h1>
          <p className="text-gray-600">Manage your product SKUs</p>
        </div>

        <div 
          className="mb-6 p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            borderRadius: '28px',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05) inset',
          }}
        >
          <div className="flex gap-4 mb-6 flex-wrap">
            <input
              type="text"
              placeholder="Search SKUs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 min-w-[200px] px-4 py-3 rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04) inset',
              }}
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-3 rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04) inset',
              }}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <Link
              href="/admin/skus/new"
              className="px-6 py-3 rounded-2xl font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
              }}
            >
              + New SKU
            </Link>
            <Link
              href="/admin/categories"
              className="px-6 py-3 rounded-2xl font-semibold text-gray-700 transition-all"
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(10px)',
              }}
            >
              Categories
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : skus.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No SKUs found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {skus.map((sku) => (
                <div
                  key={sku.id}
                  className="p-4 rounded-2xl transition-all hover:scale-[1.01]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <code className="text-xs font-mono text-gray-500 block mb-1">{sku.code}</code>
                      <Link
                        href={`/admin/skus/${sku.id}`}
                        className="text-gray-900 font-semibold hover:text-blue-600 transition-colors"
                      >
                        {sku.title}
                      </Link>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900 mb-1">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(sku.price)}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-medium ${
                          sku.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : sku.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {sku.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/skus/${sku.id}`}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-blue-600 transition-all"
                        style={{
                          background: 'rgba(0, 122, 255, 0.1)',
                        }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(sku.id)}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 transition-all"
                        style={{
                          background: 'rgba(255, 59, 48, 0.1)',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

