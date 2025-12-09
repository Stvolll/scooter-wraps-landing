'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Category } from '@/types/sku'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
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
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editing ? `/api/categories/${editing.id}` : '/api/categories'
      const method = editing ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parent_id: formData.parent_id || null,
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        fetchCategories()
        setShowForm(false)
        setEditing(null)
        setFormData({ name: '', parent_id: '' })
      } else {
        alert(data.error || 'Failed to save category')
      }
    } catch (error) {
      console.error('Failed to save category:', error)
      alert('Failed to save category')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      
      if (data.success) {
        fetchCategories()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('Failed to delete category')
    }
  }

  const handleEdit = (category: Category) => {
    setEditing(category)
    setFormData({
      name: category.name,
      parent_id: category.parent_id || '',
    })
    setShowForm(true)
  }

  const getCategoryName = (id: string | null) => {
    if (!id) return null
    return categories.find(c => c.id === id)?.name || null
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
          <Link 
            href="/admin" 
            className="text-[#00FFA9] hover:text-[#00D4FF] transition-colors mb-4 block text-sm font-medium"
          >
            ← Back to SKUs
          </Link>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">Categories</h1>
          <p className="text-white/60">Manage product categories</p>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Category List</h2>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditing(null)
                setFormData({ name: '', parent_id: '' })
              }}
              className="px-6 py-3 rounded-2xl font-semibold text-white transition-all hover:bg-white/10"
              style={{
                background: showForm ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: showForm ? 'none' : '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
              }}
            >
              {showForm ? 'Cancel' : '+ New Category'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-2xl space-y-4" style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
                  style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Parent Category
                </label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white"
                  style={{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
                  }}
                >
                  <option value="" className="bg-neutral-900 text-white">No Parent</option>
                  {categories
                    .filter(c => !editing || c.id !== editing.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-neutral-900 text-white">
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl font-semibold text-black transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                  boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
                }}
              >
                {editing ? 'Update' : 'Create'} Category
              </button>
            </form>
          )}

          {loading ? (
            <p className="text-white/60 text-center py-12">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-white/60 text-center py-12">No categories found</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-4 rounded-2xl transition-all hover:scale-[1.01] hover:bg-white/10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div>
                    <span className="font-medium text-white">{cat.name}</span>
                    {cat.parent_id && (
                      <span className="text-sm text-white/50 ml-2">
                        (Parent: {getCategoryName(cat.parent_id)})
                      </span>
                    )}
                    <span className="text-xs text-white/40 ml-2">/{cat.slug}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-[#00FFA9] transition-all hover:bg-[#00FFA9]/10"
                      style={{
                        background: 'rgba(0, 255, 169, 0.1)',
                        border: '1px solid rgba(0, 255, 169, 0.2)',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


