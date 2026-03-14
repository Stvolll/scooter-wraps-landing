'use client'

/**
 * DesignTextureViewer Component
 * 
 * Пример компонента для демонстрации динамической смены текстур на 3D модели.
 * Интегрирует ScooterViewer3D с карточками дизайнов для интерактивного просмотра.
 */

import { useState } from 'react'
import ScooterViewer3D from './ScooterViewer3D'

interface Design {
  id: string
  name: string
  textures?: {
    body?: string
    plastic?: string
    accents?: string
  }
  texture?: string // Legacy format
  preview?: string
  description?: string
}

interface DesignTextureViewerProps {
  modelPath: string
  designs: Design[]
  panoramaUrl?: string
  className?: string
}

export default function DesignTextureViewer({
  modelPath,
  designs,
  panoramaUrl,
  className = '',
}: DesignTextureViewerProps) {
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(designs[0] || null)

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>
      {/* 3D Viewer */}
      <div className="flex-1 aspect-square lg:aspect-auto lg:h-[600px] rounded-2xl overflow-hidden">
        <ScooterViewer3D
          modelPath={modelPath}
          selectedDesign={selectedDesign || undefined}
          panoramaUrl={panoramaUrl}
          className="w-full h-full"
        />
      </div>

      {/* Design Cards */}
      <div className="lg:w-80 space-y-4 overflow-y-auto max-h-[600px] pr-2">
        <h3 className="text-xl font-semibold text-white mb-4">Выберите дизайн:</h3>
        {designs.map(design => (
          <div
            key={design.id}
            onClick={() => setSelectedDesign(design)}
            className={`p-4 rounded-xl cursor-pointer transition-all ${
              selectedDesign?.id === design.id
                ? 'bg-[#00FFA9]/20 border-2 border-[#00FFA9]'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              {design.preview && (
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={design.preview}
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold truncate">{design.name}</h4>
                {design.description && (
                  <p className="text-white/60 text-sm mt-1 line-clamp-2">
                    {design.description}
                  </p>
                )}
                {selectedDesign?.id === design.id && (
                  <div className="mt-2 text-xs text-[#00FFA9]">
                    ✓ Активен
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}






