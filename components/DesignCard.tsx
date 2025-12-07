'use client'

/**
 * DesignCard Component
 * 
 * Product card for vinyl wrap designs
 * - Multiple photos of one model with one design
 * - iOS 26 glassmorphism style
 * - Smaller size, no click interaction
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface DesignCardProps {
  design: {
    id: string
    name: string
    texture: string
    preview?: string
    images?: string[] // Multiple photos of the design
    description?: string
    price?: string
  }
  modelName: string
  modelId: string
  index: number
  onImageClick?: () => void // Click on image - change 3D model
  onDetailsClick?: () => void // Click on info - go to details page
  isSelected?: boolean
}

export default function DesignCard({
  design,
  modelName,
  modelId,
  index,
  onImageClick,
  onDetailsClick,
  isSelected = false
}: DesignCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Fix hydration: only show interactive elements after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Get images array - use preview as first image, add texture if available
  const images = design.images || [
    design.preview || design.texture,
    design.texture,
  ].filter(Boolean)

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <motion.div
      initial={isMounted ? { opacity: 0, y: 20 } : false}
      animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={isMounted ? { scale: 1.03, y: -8 } : undefined}
      className="group relative overflow-hidden rounded-[28px] flex-shrink-0 w-[260px] md:w-[300px] will-change-transform"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      suppressHydrationWarning
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
      }}
    >
      {/* Image Carousel - Click to change 3D model */}
      <div 
        className="relative aspect-[4/5] overflow-hidden rounded-t-[28px] bg-gradient-to-br from-neutral-800 to-neutral-900 cursor-pointer"
        onClick={onImageClick}
        role="button"
        tabIndex={0}
        aria-label={`View ${design.name} in 3D`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onImageClick?.()
          }
        }}
      >
        {images.length > 0 && (
          <>
            {/* Main Image */}
            <motion.div
              key={currentImageIndex}
              initial={isMounted ? { opacity: 0 } : false}
              animate={isMounted ? { opacity: 1 } : { opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
              suppressHydrationWarning
            >
              <img
                src={images[currentImageIndex]}
                alt={`${design.name} - ${modelName}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/studio-panorama.png' // Fallback
                }}
              />
            </motion.div>

            {/* Image Navigation - Show on hover */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-opacity duration-200 z-10 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-label="Previous image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextImage}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-opacity duration-200 z-10 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-label="Next image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex(idx)
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === currentImageIndex
                          ? 'bg-white w-4'
                          : 'bg-white/40 hover:bg-white/60'
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Card Content - iOS 26 Style - Click to view details */}
      <div 
        className="p-4 md:p-5 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onDetailsClick}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${design.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onDetailsClick?.()
          }
        }}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-semibold text-white mb-1 flex items-center gap-2">
              {design.name}
              {/* Arrow icon */}
              <svg 
                className="w-5 h-5 text-white/60 group-hover:text-[#00FFA9] group-hover:translate-x-1 transition-all" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </h3>
            <p className="text-sm text-white/60 mb-3">
              {modelName}
            </p>
            {design.description && (
              <p className="text-sm text-white/60 leading-relaxed overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
              }}>
                {design.description}
              </p>
            )}
          </div>
        </div>

        {/* Price */}
        {design.price && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <span className="text-lg font-semibold text-white">
              {design.price}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
