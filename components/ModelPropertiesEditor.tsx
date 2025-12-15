'use client'

import React, { useState, useEffect } from 'react'

interface ModelProperties {
  cameraPosition?: { x: number; y: number; z: number; rotation?: { x: number; y: number; z: number } }
  cameraTarget?: { x: number; y: number; z: number }
  lighting?: {
    ambient: number
    directional?: { color: string; intensity: number }
    shadows: boolean
  }
  materials?: {
    metalness: number
    roughness: number
    emissive?: { color: string; intensity: number }
  }
  environmentMap?: string
}

interface ModelPropertiesEditorProps {
  designId: string
  initialProperties?: ModelProperties
  onSave?: (properties: ModelProperties) => void
}

export default function ModelPropertiesEditor({
  designId,
  initialProperties,
  onSave,
}: ModelPropertiesEditorProps) {
  const [properties, setProperties] = useState<ModelProperties>(initialProperties || {})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialProperties) {
      setProperties(initialProperties)
    }
  }, [initialProperties])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/designs/${designId}/model-properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(properties),
      })

      if (!response.ok) {
        throw new Error('Failed to save model properties')
      }

      if (onSave) {
        onSave(properties)
      }

      alert('Свойства модели сохранены!')
    } catch (error: any) {
      console.error('Save error:', error)
      alert('Ошибка сохранения: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const updateCameraPosition = (axis: 'x' | 'y' | 'z', value: number) => {
    setProperties(prev => ({
      ...prev,
      cameraPosition: {
        ...prev.cameraPosition,
        [axis]: value,
      } as any,
    }))
  }

  const updateLighting = (field: string, value: any) => {
    setProperties(prev => ({
      ...prev,
      lighting: {
        ...prev.lighting,
        [field]: value,
      } as any,
    }))
  }

  const updateMaterials = (field: string, value: number) => {
    setProperties(prev => ({
      ...prev,
      materials: {
        ...prev.materials,
        [field]: value,
      } as any,
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">⚙️ Свойства 3D модели</h3>
        <p className="text-sm text-white/60 mb-4">
          Настройте параметры камеры, освещения и материалов для оптимального отображения модели.
        </p>
      </div>

      {/* Camera Position */}
      <div
        className="p-4 rounded-2xl bg-white/5 border border-white/10"
      >
        <h4 className="text-sm font-semibold text-white mb-3">📷 Позиция камеры</h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-white/60 mb-1">X</label>
            <input
              type="number"
              step="0.1"
              value={properties.cameraPosition?.x || 0}
              onChange={e => updateCameraPosition('x', parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Y</label>
            <input
              type="number"
              step="0.1"
              value={properties.cameraPosition?.y || 0}
              onChange={e => updateCameraPosition('y', parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Z</label>
            <input
              type="number"
              step="0.1"
              value={properties.cameraPosition?.z || 0}
              onChange={e => updateCameraPosition('z', parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-white/40 mt-2">
          💡 Используйте функцию <code className="text-[#00FFA9]">window.getCurrentCameraPosition()</code> в консоли браузера для получения текущей позиции камеры
        </p>
      </div>

      {/* Lighting */}
      <div
        className="p-4 rounded-2xl bg-white/5 border border-white/10"
      >
        <h4 className="text-sm font-semibold text-white mb-3">💡 Освещение</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-white/60 mb-1">Ambient (Окружающее)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={properties.lighting?.ambient || 0.5}
              onChange={e => updateLighting('ambient', parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Shadows (Тени)</label>
            <input
              type="checkbox"
              checked={properties.lighting?.shadows || false}
              onChange={e => updateLighting('shadows', e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00FFA9] focus:ring-[#00FFA9]"
            />
          </div>
        </div>
      </div>

      {/* Materials */}
      <div
        className="p-4 rounded-2xl bg-white/5 border border-white/10"
      >
        <h4 className="text-sm font-semibold text-white mb-3">🎨 Материалы</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-white/60 mb-1">Metalness (Металличность)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={properties.materials?.metalness || 0.5}
              onChange={e => updateMaterials('metalness', parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Roughness (Шероховатость)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={properties.materials?.roughness || 0.5}
              onChange={e => updateMaterials('roughness', parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-6 py-3 rounded-2xl font-semibold text-black transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
          boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
        }}
      >
        {saving ? 'Сохранение...' : 'Сохранить свойства модели'}
      </button>
    </div>
  )
}





