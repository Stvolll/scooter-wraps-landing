'use client'

/**
 * Design Detail Page
 * Detailed view of a specific vinyl wrap design with purchase options
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scooters } from '@/config/scooters'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'

export default function DesignDetailPage() {
  const params = useParams()
  const modelId = params.model as string
  const designId = params.slug as string
  
  const [isMounted, setIsMounted] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Find the scooter and design
  const scooter = (scooters as any)[modelId]
  const design = scooter?.designs.find((d: any) => d.id === designId)

  if (!scooter || !design) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Design Not Found</h1>
          <Link href="/" className="text-[#00FFA9] hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const images = design.images || [design.preview || design.texture]

  const handleAddToCart = () => {
    // Add to cart logic
    console.log('Added to cart:', { modelId, designId, color: selectedColor })
  }

  const handleBookInstallation = () => {
    // Navigate to booking
    window.location.href = `/booking?model=${modelId}&design=${designId}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-[#00FFA9] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold">Back to Gallery</span>
          </Link>
          
          <div className="flex gap-4">
            <button className="px-6 py-2 rounded-2xl font-medium text-white border border-white/20 hover:border-[#00FFA9] hover:bg-white/5 transition-all">
              Share
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Left: Image Gallery */}
          <motion.div
            initial={isMounted ? { opacity: 0, x: -30 } : false}
            animate={isMounted ? { opacity: 1, x: 0 } : false}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <img
                    src={images[currentImageIndex]}
                    alt={`${design.name} - View ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/images/studio-panorama.png'
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/studio-panorama.png'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Product Info */}
          <motion.div
            initial={isMounted ? { opacity: 0, x: 30 } : false}
            animate={isMounted ? { opacity: 1, x: 0 } : false}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Breadcrumb */}
            <div className="text-sm text-white/40">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span>{scooter.name}</span>
              <span className="mx-2">/</span>
              <span className="text-white/60">{design.name}</span>
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {design.name}
              </h1>
              <p className="text-xl text-white/60 mb-4">For {scooter.name}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-[#00FFA9]">
                  {design.price || '$180'}
                </span>
                <span className="text-lg text-white/40 line-through">$225</span>
                <span className="px-3 py-1 rounded-full bg-[#00FFA9]/20 text-[#00FFA9] text-sm font-semibold">
                  Save 20%
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <p className="text-white/70 leading-relaxed">
                {design.description || 'Premium vinyl wrap design featuring high-quality 3M material with professional installation included. This design transforms your scooter with stunning visuals while protecting the original paint.'}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">What&apos;s Included:</h3>
              <div className="space-y-2">
                {[
                  'Premium 3M™ vinyl material',
                  'Professional installation (2-3 hours)',
                  'At-home service available',
                  '5-year durability warranty',
                  'UV & scratch protection',
                  'Free maintenance guide'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-white/70">
                    <svg className="w-5 h-5 text-[#00FFA9] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

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

              <button className="w-full py-4 rounded-2xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Contact Us for Custom Design
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-1">🛡️</div>
                  <div className="text-xs text-white/60">5-Year Warranty</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">🚚</div>
                  <div className="text-xs text-white/60">Free Installation</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-xs text-white/60">4.9/5 Rating</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Sections */}
        <div className="mt-20 max-w-7xl mx-auto">
          {/* Specifications */}
          <motion.div
            initial={isMounted ? { opacity: 0, y: 30 } : false}
            animate={isMounted ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-white/40 mb-1">Material</div>
                <div className="text-white">3M™ 2080 Series Vinyl</div>
              </div>
              <div>
                <div className="text-sm text-white/40 mb-1">Finish</div>
                <div className="text-white">Glossy / Matte Available</div>
              </div>
              <div>
                <div className="text-sm text-white/40 mb-1">Durability</div>
                <div className="text-white">5-7 Years Outdoor</div>
              </div>
              <div>
                <div className="text-sm text-white/40 mb-1">Installation Time</div>
                <div className="text-white">2-3 Hours</div>
              </div>
              <div>
                <div className="text-sm text-white/40 mb-1">Compatible Models</div>
                <div className="text-white">{scooter.name} (All Years)</div>
              </div>
              <div>
                <div className="text-sm text-white/40 mb-1">Removable</div>
                <div className="text-white">Yes, No Paint Damage</div>
              </div>
            </div>
          </motion.div>

          {/* Related Designs */}
          <motion.div
            initial={isMounted ? { opacity: 0, y: 30 } : false}
            animate={isMounted ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">More Designs for {scooter.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {scooter.designs.slice(0, 4).map((relatedDesign: any) => (
                <Link
                  key={relatedDesign.id}
                  href={`/designs/${modelId}/${relatedDesign.id}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <h3 className="text-white font-semibold">{relatedDesign.name}</h3>
                    <p className="text-sm text-white/60">{relatedDesign.price || '$180'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
