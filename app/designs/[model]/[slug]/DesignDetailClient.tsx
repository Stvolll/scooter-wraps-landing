'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface DesignDetailClientProps {
  scooter: any
  design: any
  modelId: string
  designId: string
}

export default function DesignDetailClient({
  scooter,
  design,
  modelId,
  designId,
}: DesignDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Get images array - handle all possible image sources
  // Ensure this is always an array to avoid hydration mismatches
  const images = useMemo(() => {
    if (design.images && Array.isArray(design.images) && design.images.length > 0) {
      return [...design.images]
    }
    if (design.preview) {
      return [design.preview]
    }
    if (design.texture) {
      return [design.texture]
    }
    return ['/images/studio-panorama.png'] // Fallback image
  }, [design.images, design.preview, design.texture])

  // Ensure currentImageIndex is always valid
  useEffect(() => {
    if (images.length > 0 && currentImageIndex >= images.length) {
      setCurrentImageIndex(0)
    }
  }, [images.length, currentImageIndex])

  const handleAddToCart = () => {
    console.log('Added to cart:', { modelId, designId })
  }

  const handleBookInstallation = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/booking?model=${modelId}&design=${designId}`
    }
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black" suppressHydrationWarning>
      {/* Back Button - Fixed position below main header */}
      <div className="fixed top-20 left-0 right-0 z-50 pointer-events-none" suppressHydrationWarning>
        <div className="container mx-auto px-4 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white hover:text-[#00FFA9] transition-colors pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-semibold text-sm">Back to Gallery</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900">
              <div className="absolute inset-0">
                <Image
                  src={images[currentImageIndex] || '/images/studio-panorama.png'}
                  alt={`${design.name} - View ${currentImageIndex + 1}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  key={currentImageIndex}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/studio-panorama.png'
                  }}
                />
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative aspect-square rounded-2xl overflow-hidden transition-all ${
                      idx === currentImageIndex
                        ? 'ring-2 ring-[#00FFA9] scale-105'
                        : 'hover:scale-105 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 200px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/studio-panorama.png'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-8">
            {/* Breadcrumb */}
            <div className="text-sm text-white/40">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span>{scooter.name}</span>
              <span className="mx-2">/</span>
              <span className="text-white/60">{design.name}</span>
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{design.name}</h1>
              <p className="text-xl text-white/60 mb-4">For {scooter.name}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-[#00FFA9]">
                  {design.price || '$180'}
                </span>
              </div>
            </div>

            {/* Description */}
            {design.description && (
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <p className="text-white/70 leading-relaxed">{design.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleBookInstallation}
                className="w-full py-4 rounded-2xl font-semibold text-black transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                  boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
                }}
              >
                Book Installation Now
              </button>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-2xl font-semibold text-white border-2 border-[#00FFA9] hover:bg-[#00FFA9] hover:text-black transition-all duration-300"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
