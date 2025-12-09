'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface LandingDesignCardProps {
  design: any
  modelName: string
  modelId: string
  index: number
  isSelected: boolean
  onImageClick: () => void
  onDetailsClick: () => void
}

export default function LandingDesignCard({
  design,
  modelName,
  modelId,
  index,
  isSelected,
  onImageClick,
  onDetailsClick,
}: LandingDesignCardProps) {
  const images = design.images || [design.preview || design.texture]
  const currentImage = images[0] || '/images/studio-panorama.png'

  return (
    <article
      className={`relative w-[280px] md:w-[320px] flex-shrink-0 rounded-3xl overflow-hidden transition-all duration-300 ${
        isSelected ? 'ring-2 ring-[#00FFA9] scale-105' : 'hover:scale-105'
      }`}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
      }}
    >
      <div className="relative aspect-square cursor-pointer" onClick={onImageClick}>
        <Image
          src={currentImage}
          alt={`${design.name} - ${modelName}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 280px, 320px"
          onError={e => {
            const target = e.target as HTMLImageElement
            target.src = '/images/studio-panorama.png'
          }}
        />
        {isSelected && (
          <div className="absolute inset-0 bg-[#00FFA9]/20 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#00FFA9] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1">{design.name}</h3>
        <div className="text-sm text-white/60 mb-3">{modelName}</div>
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-[#00FFA9]">{design.price || '$180'}</div>
          <Link
            href={`/designs/${modelId}/${design.id}`}
            onClick={onDetailsClick}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:bg-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  )
}
