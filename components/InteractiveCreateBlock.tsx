'use client'

/**
 * InteractiveCreateBlock Component
 *
 * The "you bike create now" interactive block.
 * Features three main actions:
 * 1. Upload - for users who have a design preview
 * 2. Create - for users who want to generate a design
 * 3. Order - for users who want to order existing or custom design
 *
 * This block is central to the TXD concept of user co-creation.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Sparkles, ShoppingCart } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function InteractiveCreateBlock() {
  const { t } = useLanguage()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // Handle file upload (mock implementation)
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      // In production, upload to backend here
      // For now, just store in state
      console.log('File uploaded:', file.name)
      // TODO: Wire to backend API endpoint
    }
  }

  // Handle Create button click
  const handleCreate = () => {
    // Scroll to contact/custom design section
    const contact = document.getElementById('contact')
    contact?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle Order button click
  const handleOrder = () => {
    // Scroll to gallery or open order flow
    const gallery = document.getElementById('gallery')
    gallery?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Title with strikethrough effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="inline-block">{t('interactiveCreate.title')}</span>{' '}
            <span className="inline-block relative">
              <span className="line-through decoration-4 decoration-accent-neon">
                {t('interactiveCreate.titleStrikethrough')}
              </span>
            </span>{' '}
            <span className="inline-block text-accent-neon">
              {t('interactiveCreate.titleAfter')}
            </span>
          </h2>
        </motion.div>

        {/* Three action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Upload Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <label className="block">
              <input
                type="file"
                accept="image/*,.psd,.ai"
                onChange={handleUpload}
                className="hidden"
              />
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="premium-card p-8 cursor-pointer h-full flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-accent-neon/10 flex items-center justify-center mb-6 group-hover:bg-accent-neon/20 transition-colors">
                  <Upload className="w-8 h-8 text-accent-neon" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{t('interactiveCreate.upload')}</h3>
                <p className="text-neutral-600 mb-4">{t('interactiveCreate.uploadDescription')}</p>
                {uploadedFile && (
                  <div className="mt-auto pt-4 text-sm text-accent-neon">✓ {uploadedFile.name}</div>
                )}
              </motion.div>
            </label>
          </motion.div>

          {/* Create Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              className="premium-card p-8 w-full h-full flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-accent-electric/10 flex items-center justify-center mb-6 group-hover:bg-accent-electric/20 transition-colors">
                <Sparkles className="w-8 h-8 text-accent-electric" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{t('interactiveCreate.create')}</h3>
              <p className="text-neutral-600">{t('interactiveCreate.createDescription')}</p>
            </motion.button>
          </motion.div>

          {/* Order Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOrder}
              className="premium-card p-8 w-full h-full flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-accent-neon/10 flex items-center justify-center mb-6 group-hover:bg-accent-neon/20 transition-colors">
                <ShoppingCart className="w-8 h-8 text-accent-neon" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{t('interactiveCreate.order')}</h3>
              <p className="text-neutral-600">{t('interactiveCreate.orderDescription')}</p>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
