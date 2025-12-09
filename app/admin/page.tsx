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
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(15, 15, 15, 1) 5%, rgba(15, 15, 15, 1) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pt-24 px-4 md:px-8 lg:px-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">SKU Management</h1>
          <p className="text-white/60">Manage your product SKUs</p>
        </div>

        <div 
          className="mb-6 p-6 mx-4 md:mx-8 lg:mx-16"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRadius: '28px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
          }}
        >
          <div className="flex gap-4 mb-6 flex-wrap">
            <input
              type="text"
              placeholder="Search SKUs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 min-w-[200px] px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
              }}
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
              }}
            >
              <option value="" className="bg-neutral-900 text-white">All Status</option>
              <option value="draft" className="bg-neutral-900 text-white">Draft</option>
              <option value="active" className="bg-neutral-900 text-white">Active</option>
              <option value="archived" className="bg-neutral-900 text-white">Archived</option>
            </select>
            <Link
              href="/admin/skus/new"
              className="px-6 py-3 rounded-2xl font-semibold text-black transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
              }}
            >
              + New SKU
            </Link>
            <Link
              href="/admin/categories"
              className="px-6 py-3 rounded-2xl font-semibold text-white transition-all hover:bg-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              Categories
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-white/60">Loading...</p>
            </div>
          ) : skus.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60">No SKUs found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {skus.map((sku) => (
                <div
                  key={sku.id}
                  className="p-4 rounded-2xl transition-all hover:scale-[1.01] hover:bg-white/10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <code className="text-xs font-mono text-white/40 block mb-1">{sku.code}</code>
                      <Link
                        href={`/admin/skus/${sku.id}`}
                        className="text-white font-semibold hover:text-[#00FFA9] transition-colors"
                      >
                        {sku.title}
                      </Link>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white mb-1">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(sku.price)}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-medium ${
                          sku.status === 'active'
                            ? 'bg-[#00FFA9]/20 text-[#00FFA9] border border-[#00FFA9]/30'
                            : sku.status === 'draft'
                            ? 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30'
                            : 'bg-white/10 text-white/60 border border-white/10'
                        }`}
                      >
                        {sku.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/skus/${sku.id}`}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-[#00FFA9] transition-all hover:bg-[#00FFA9]/10"
                        style={{
                          background: 'rgba(0, 255, 169, 0.1)',
                          border: '1px solid rgba(0, 255, 169, 0.2)',
                        }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(sku.id)}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
                        style={{
                          background: 'rgba(255, 59, 48, 0.1)',
                          border: '1px solid rgba(255, 59, 48, 0.2)',
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

