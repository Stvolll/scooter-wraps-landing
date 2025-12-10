'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
    <motion.article
      className={`relative w-[280px] md:w-[320px] flex-shrink-0 rounded-3xl overflow-hidden transition-all duration-300 ${
        isSelected ? 'ring-2 ring-[#00FFA9]' : ''
      }`}
      style={{
        background: isSelected 
          ? 'rgba(255, 255, 255, 0.12)' 
          : 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: isSelected 
          ? '1.5px solid rgba(0, 255, 169, 0.4)' 
          : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: isSelected
          ? '0 12px 40px -4px rgba(0, 255, 169, 0.3), 0 0 0 1px rgba(0, 255, 169, 0.2) inset, 0 0 30px rgba(0, 255, 169, 0.15)'
          : '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
      }}
      whileHover={{ 
        scale: 1.05,
        y: -8,
        transition: { duration: 0.3, type: 'spring', stiffness: 300, damping: 20 }
      }}
      whileTap={{ scale: 0.98 }}
      animate={isSelected ? { 
        scale: 1.05,
        y: -8,
      } : {
        scale: 1,
        y: 0,
      }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
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
        
        {/* Status Badge (if available) */}
        {design.status && (
          <div className="mb-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                design.status === 'FOR_SALE'
                  ? 'bg-[#00FFA9]/20 text-[#00FFA9] border border-[#00FFA9]/30'
                  : design.status === 'SOLD'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/10 text-white/60 border border-white/10'
              }`}
            >
              {design.status === 'FOR_SALE' ? 'For Sale' : design.status === 'SOLD' ? 'Sold' : 'In Development'}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-[#00FFA9]">{design.price || '$180'}</div>
          <Link
            href={`/designs/${modelId}/${design.id}`}
            onClick={onDetailsClick}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 hover:bg-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
