'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Scooter {
  id: string
  name: string
  model: string
  panorama?: string
  designs: any[]
}

interface ModelsListClientProps {
  initialScooters: Record<string, Scooter>
  usesDatabase?: boolean
}

export default function ModelsListClient({ initialScooters, usesDatabase = true }: ModelsListClientProps) {
  const [scooters, setScooters] = useState<Record<string, Scooter>>(initialScooters)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить модель "${name}"?\n\nВсе дизайны этой модели также будут удалены.`)) {
      return
    }

    setDeleting(id)
    try {
      const response = await fetch(`/api/admin/models/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete model')
      }

      // Обновляем список
      const updatedScooters = { ...scooters }
      delete updatedScooters[id]
      setScooters(updatedScooters)
      
      alert(`Модель "${name}" успешно удалена`)
    } catch (error: any) {
      console.error('Error deleting model:', error)
      alert(`Ошибка удаления: ${error.message}`)
    } finally {
      setDeleting(null)
    }
  }

  const scootersList = Object.values(scooters)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-8 lg:px-16">
      {scootersList.map((scooter) => (
        <div
          key={scooter.id}
          className="bg-[#1C1C1E] rounded-3xl p-6 border border-white/10 shadow-2xl hover:border-[#007AFF]/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white">{scooter.name}</h3>
            <span className="text-4xl">🏍️</span>
          </div>
          
          <div className="space-y-2 text-white/60 text-sm mb-6">
            <div className="flex items-center gap-2">
              <span className="text-[#007AFF]">📊</span>
              <span>Дизайнов: <strong className="text-white">{scooter.designs?.length || 0}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#007AFF]">📦</span>
              <span className="truncate font-mono text-xs">{scooter.model.split('/').pop()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Link href={`/admin/models/${scooter.id}`} className="block">
              <button className="w-full bg-[#007AFF] hover:bg-[#0051D5] text-white px-4 py-3 rounded-xl font-semibold transition-all active:scale-95">
                Управление дизайнами →
              </button>
            </Link>
            
            <div className="flex gap-2">
              <Link href={`/admin/models/${scooter.id}/edit`} className="flex-1">
                <button className="w-full bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white px-4 py-2.5 rounded-xl font-medium transition-all active:scale-95 text-sm">
                  ✏️ Редактировать
                </button>
              </Link>
              
              <button
                onClick={() => handleDelete(scooter.id, scooter.name)}
                disabled={deleting === scooter.id}
                className="flex-1 bg-[#2C2C2E] hover:bg-[#FF3B30]/20 hover:text-[#FF3B30] text-white/70 px-4 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {deleting === scooter.id ? '...' : '🗑️ Удалить'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

