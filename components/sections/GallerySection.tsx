'use client'

/**
 * Gallery Section - Showcase of Completed Wraps
 * Modern approach: Masonry grid with filters, lightbox for detailed view
 * Loads real images from database via API
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'
import Link from 'next/link'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryItem {
  id: string
  designId: string
  designSlug: string
  title: string
  model: string
  image: string
  category: string
  price: number
  isPrimary: boolean
}

export default function GallerySection() {
  const { t } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Load gallery items from API
  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await fetch('/api/gallery')
        const data = await response.json()
        setGalleryItems(data.items || [])
      } catch (error) {
        console.error('Failed to load gallery:', error)
        setGalleryItems([])
      } finally {
        setLoading(false)
        setIsMounted(true)
      }
    }
    loadGallery()
  }, [])

  // Extract unique categories from gallery items
  const categories = [
    { id: 'all', label: t('gallery.allModels') },
    ...Array.from(
      new Set(galleryItems.map(item => item.category))
    )
      .filter(Boolean)
      .map(category => ({
        id: category,
        label: galleryItems.find(item => item.category === category)?.model || category,
      })),
  ]

  const filteredItems =
    activeCategory === 'all'
      ? galleryItems.filter(item => item.isPrimary) // Show only primary images when "all" is selected
      : galleryItems.filter(item => item.category === activeCategory && item.isPrimary)

  // Get all images for lightbox (including non-primary)
  const allLightboxItems = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory)

  const openLightbox = (index: number) => {
    const item = filteredItems[index]
    const lightboxItemIndex = allLightboxItems.findIndex(li => li.id === item.id)
    setLightboxIndex(lightboxItemIndex >= 0 ? lightboxItemIndex : 0)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % allLightboxItems.length)
  }

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + allLightboxItems.length) % allLightboxItems.length)
  }

  return (
    <section className="relative pt-12 md:pt-16 pb-20 md:pb-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />

      <div className="relative container mx-auto px-4 md:px-8 lg:px-16">
        {/* Section header */}
        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          animate={isMounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {t('gallery.title')}
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            {t('gallery.subtitle')}
          </p>
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          animate={isMounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id ? 'text-black' : 'text-white/60 hover:text-white'
              }`}
              style={{
                background:
                  activeCategory === category.id
                    ? 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                border:
                  activeCategory === category.id ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Gallery grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-3xl bg-white/5 animate-pulse"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60">{t('gallery.noItems') || 'No gallery items available'}</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={isMounted ? { opacity: 0, scale: 0.9 } : false}
                animate={isMounted ? { opacity: 1, scale: 1 } : false}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={isMounted ? { scale: 1.05 } : undefined}
                className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                {/* Real image */}
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={`${item.title} - ${item.model}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={item.image.startsWith('http')} // Allow external images from S3
                  />
                ) : (
                  // Fallback gradient if no image
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900"
                    style={{
                      backgroundImage: `linear-gradient(135deg, 
                        ${index % 3 === 0 ? '#00FFA920' : index % 3 === 1 ? '#00D4FF20' : '#B77EFF20'}, 
                        transparent)`,
                    }}
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      href={`/designs/${item.designSlug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="block"
                    >
                      <h3 className="text-xl font-semibold text-white mb-1 hover:text-[#00FFA9] transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-white/70">{item.model}</p>
                    {item.price > 0 && (
                      <p className="text-sm text-[#00FFA9] font-semibold mt-1">
                        ${(item.price / 100).toFixed(2)}
                      </p>
                    )}
                  </motion.div>
                </div>

                {/* Zoom icon */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                    />
                  </svg>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxOpen && allLightboxItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
              onClick={closeLightbox}
            >
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation buttons */}
              {allLightboxItems.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      prevImage()
                    }}
                    className="absolute left-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      nextImage()
                    }}
                    className="absolute right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-8"
                onClick={(e) => e.stopPropagation()}
              >
                {allLightboxItems[lightboxIndex] && (
                  <>
                    <Image
                      src={allLightboxItems[lightboxIndex].image}
                      alt={`${allLightboxItems[lightboxIndex].title} - ${allLightboxItems[lightboxIndex].model}`}
                      width={1920}
                      height={1080}
                      className="object-contain max-w-full max-h-full rounded-2xl"
                      unoptimized={allLightboxItems[lightboxIndex].image.startsWith('http')}
                    />
                    {/* Image info */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {allLightboxItems[lightboxIndex].title}
                      </h3>
                      <p className="text-sm text-white/70">{allLightboxItems[lightboxIndex].model}</p>
                      <p className="text-xs text-white/50 mt-2">
                        {lightboxIndex + 1} / {allLightboxItems.length}
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          animate={isMounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-white/60 mb-4">{t('gallery.wantMore')}</p>
          <button className="px-8 py-3 rounded-2xl font-semibold text-white border-2 border-[#00FFA9] hover:bg-[#00FFA9] hover:text-black transition-all duration-300">
            {t('gallery.viewPortfolio')}
          </button>
        </motion.div>
      </div>
    </section>
  )
}
