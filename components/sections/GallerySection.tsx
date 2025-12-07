'use client'

/**
 * Gallery Section - Showcase of Completed Wraps
 * Modern approach: Masonry grid with filters, before/after slider
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

const galleryItems = [
  {
    id: 1,
    model: 'Honda Lead',
    design: 'Neon Blade',
    image: '/images/gallery/lead-neon.jpg',
    category: 'lead'
  },
  {
    id: 2,
    model: 'Yamaha NVX',
    design: 'Cyberpunk',
    image: '/images/gallery/nvx-cyber.jpg',
    category: 'nvx'
  },
  {
    id: 3,
    model: 'Honda SH',
    design: 'Minimal White',
    image: '/images/gallery/sh-minimal.jpg',
    category: 'sh'
  },
  {
    id: 4,
    model: 'Honda Vision',
    design: 'Carbon Fiber',
    image: '/images/gallery/vision-carbon.jpg',
    category: 'vision'
  },
  {
    id: 5,
    model: 'Honda PCX',
    design: 'Matte Black',
    image: '/images/gallery/pcx-matte.jpg',
    category: 'pcx'
  },
  {
    id: 6,
    model: 'Honda Lead',
    design: 'Racing Stripes',
    image: '/images/gallery/lead-racing.jpg',
    category: 'lead'
  }
]

export default function GallerySection() {
  const { t } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', label: t('gallery.allModels') },
    { id: 'lead', label: 'Honda Lead' },
    { id: 'vision', label: 'Honda Vision' },
    { id: 'sh', label: 'Honda SH' },
    { id: 'pcx', label: 'Honda PCX' },
    { id: 'nvx', label: 'Yamaha NVX' }
  ]

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const filteredItems = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory)

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
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'text-black'
                  : 'text-white/60 hover:text-white'
              }`}
              style={{
                background: activeCategory === category.id
                  ? 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: activeCategory === category.id
                  ? 'none'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Gallery grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
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
            >
              {/* Placeholder image with gradient */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900"
                style={{
                  backgroundImage: `linear-gradient(135deg, 
                    ${index % 3 === 0 ? '#00FFA920' : index % 3 === 1 ? '#00D4FF20' : '#B77EFF20'}, 
                    transparent)`,
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {item.design}
                  </h3>
                  <p className="text-sm text-white/70">{item.model}</p>
                </motion.div>
              </div>

              {/* Zoom icon */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          animate={isMounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-white/60 mb-4">{t('gallery.wantMore')}</p>
          <button
            className="px-8 py-3 rounded-2xl font-semibold text-white border-2 border-[#00FFA9] hover:bg-[#00FFA9] hover:text-black transition-all duration-300"
          >
            {t('gallery.viewPortfolio')}
          </button>
        </motion.div>
      </div>
    </section>
  )
}

