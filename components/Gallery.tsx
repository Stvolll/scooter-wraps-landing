'use client'

/**
 * Gallery Component
 *
 * Displays a gallery of design collections for different scooter models.
 * Features:
 * - Model selector (tabs or dropdown)
 * - Grid of design cards for the selected model
 * - Each card shows preview, name, description, price, and CTA
 *
 * Clicking a design card navigates to the product detail page.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { models, getDesignsByModel, Design } from '@/lib/designsData'
import GalleryCard from './GalleryCard'

export default function Gallery() {
  const { language, t } = useLanguage()
  const router = useRouter()
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id || '')

  const selectedDesigns = getDesignsByModel(selectedModelId)

  const handleDesignClick = (design: Design) => {
    // Navigate to product detail page
    router.push(`/designs/${design.modelId}/${design.slug}`)
  }

  return (
    <section id="gallery" className="py-20 px-4 md:px-8 lg:px-16 bg-neutral-50">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{t('gallery.title')}</h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">{t('gallery.subtitle')}</p>
        </motion.div>

        {/* Model Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-wrap gap-4 justify-center">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  selectedModelId === model.id
                    ? 'bg-accent-neon text-accent-dark shadow-lg'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {language === 'vi' ? model.nameVi : model.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Design Grid */}
        {selectedDesigns.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {selectedDesigns.map((design, index) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GalleryCard
                  design={design}
                  language={language}
                  onClick={() => handleDesignClick(design)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 text-neutral-500">
            <p>{t('gallery.noDesigns')}</p>
          </div>
        )}
      </div>
    </section>
  )
}
