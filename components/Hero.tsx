'use client'

/**
 * Hero Section Component
 *
 * The main hero section of the TXD landing page.
 * Features:
 * - Interactive 3D scooter model with kaleidoscope effect
 * - Headline and subheading
 * - Primary and secondary CTAs
 * - Scroll anchor to gallery section
 *
 * The 3D model cycles through different designs as the user rotates it.
 */

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import ThreeDViewerPlaceholder from './ThreeDViewerPlaceholder'
import { models, getDesignsByModel } from '@/lib/designsData'

// Dynamically import heavy 3D viewer to reduce initial bundle size
const ThreeDViewer = dynamic(() => import('./ThreeDViewer'), {
  ssr: false,
  loading: () => <ThreeDViewerPlaceholder />,
})

export default function Hero() {
  const { t } = useLanguage()

  // Get default model (first one) and its designs
  const defaultModel = models[0]
  const defaultDesigns = getDesignsByModel(defaultModel.id)

  // Prepare designs for 3D viewer with textures
  // Get texture path based on model name
  const getTexturePath = (modelId: string) => {
    const textureMap: Record<string, string> = {
      'honda-lead-110': '/textures/honda-lead/3DModel.jpg',
      'yamaha-nvx': '/textures/yamaha-nvx/3DModel.jpg',
    }
    return textureMap[modelId] || ''
  }

  const viewerDesigns = defaultDesigns.map((design, index) => ({
    id: design.id,
    name: design.name,
    texturePath: getTexturePath(defaultModel.id), // Use texture from textures folder
    color: getColorForDesign(index), // Fallback color
  }))

  // Scroll to gallery section
  const scrollToGallery = () => {
    const gallery = document.getElementById('gallery')
    if (gallery) {
      gallery.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 md:px-8 lg:px-16 py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 -z-10" />

      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 text-center lg:text-left"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              {t('hero.headline')}
            </h1>

            <p className="text-xl md:text-2xl text-neutral-600 max-w-2xl mx-auto lg:mx-0">
              {t('hero.subheading')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToGallery}
                className="btn-primary"
              >
                {t('hero.ctaPrimary')}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const contact = document.getElementById('contact')
                  contact?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="btn-secondary"
              >
                {t('hero.ctaSecondary')}
              </motion.button>
            </div>
          </motion.div>

          {/* Right side: 3D Model Viewer */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-2xl mx-auto">
              <ThreeDViewer
                modelPath={defaultModel.glbPath}
                designs={viewerDesigns}
                defaultDesignIndex={0}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        onClick={scrollToGallery}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-600 hover:text-accent-neon transition-colors"
        aria-label={t('common.scrollToDesigns')}
      >
        <span className="text-sm font-medium">{t('common.scrollToDesigns')}</span>
        <ChevronDown className="w-6 h-6 animate-bounce" />
      </motion.button>
    </section>
  )
}

// Helper function to get colors for designs (placeholder)
function getColorForDesign(index: number): string {
  const colors = [
    '#00ff88', // Neon green
    '#0066ff', // Electric blue
    '#ff0066', // Neon pink
    '#ffaa00', // Orange
    '#aa00ff', // Purple
    '#00ffff', // Cyan
  ]
  return colors[index % colors.length]
}
