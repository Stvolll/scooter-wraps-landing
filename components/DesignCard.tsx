'use client'

/**
 * DesignCard Component
 * Displays a design card with media preview and 3D preview with bg_webp
 */

import Image from 'next/image'
import { useState } from 'react'

interface DesignCardProps {
  design: {
    id: string
    name: string
    slug: string
    texture_webp: string | null
    bg_webp: string | null
    design_info: {
      film_type: string | null
      seo_title: string
    }
    media: string[]
    preview: string | null
    description: string | null
    price: string | undefined
    editions: number
    available: number
  }
  onClick?: () => void
  isSelected?: boolean
}

export default function DesignCard({ design, onClick, isSelected = false }: DesignCardProps) {
  const [imageError, setImageError] = useState(false)

  const mainImage = design.preview || design.media[0] || null
  const bgImage = design.bg_webp || null

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-lg overflow-hidden cursor-pointer transition-all
        ${isSelected ? 'ring-2 ring-[#00FFA9] shadow-lg' : 'hover:shadow-md'}
      `}
    >
      {/* Main Image or 3D Preview */}
      <div className="aspect-square relative bg-neutral-200">
        {mainImage && !imageError ? (
          <Image
            src={mainImage}
            alt={design.design_info.seo_title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Background WebP overlay (for 3D preview effect) */}
        {bgImage && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <Image
              src={bgImage}
              alt=""
              fill
              className="object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Film Type Badge */}
        {design.design_info.film_type && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
            {design.design_info.film_type}
          </div>
        )}
      </div>

      {/* Design Info */}
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1">
          {design.design_info.seo_title}
        </h3>
        {design.price && (
          <p className="text-[#00FFA9] font-bold">{design.price}</p>
        )}
        <div className="text-xs text-neutral-500 mt-2">
          {design.available} / {design.editions} available
        </div>
      </div>
    </div>
  )
}
