'use client'

/**
 * Main Landing Page with Full-Screen 3D Hero Scene
 *
 * Features:
 * - Full-screen 3D hero scene (100vh) using model-viewer
 * - Parallax scroll effect - scene scrolls out before revealing content
 * - Model switching via top menu (5 scooter models)
 * - Design switching via product cards
 * - Fixed scene until scroll trigger, then transitions to white block
 * - Product grid that updates dynamically based on selected model
 */

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { scooters, getDefaultScooter } from '@/config/scooters'
import { useLanguage } from '@/contexts/LanguageContext'
import LandingDesignCard from '@/components/LandingDesignCard'
import ThreeDViewerPlaceholder from '@/components/ThreeDViewerPlaceholder'

// Landing sections
import ProductExperience from '@/components/ProductExperience'
import USPSection from '@/components/sections/USPSection'
import ProcessSection from '@/components/sections/ProcessSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import GallerySection from '@/components/sections/GallerySection'
import FAQSection from '@/components/sections/FAQSection'
import ContactSection from '@/components/sections/ContactSection'
import CTASection from '@/components/sections/CTASection'

// Dynamically import heavy 3D components without SSR to avoid hydration errors and reduce initial bundle size
const ScooterViewer = dynamic(() => import('@/components/ScooterViewer'), {
  ssr: false,
  loading: () => <ThreeDViewerPlaceholder />,
})

const ScooterViewer3D = dynamic(() => import('@/components/ScooterViewer3D'), {
  ssr: false,
  loading: () => <ThreeDViewerPlaceholder />,
})

export default function Home() {
  const { t, language } = useLanguage()
  // Default to Honda Vision
  const [selectedModel, setSelectedModel] = useState('vision')
  
  // Function to translate model names
  const getModelName = (modelId: string, defaultName: string) => {
    const modelKey = modelId.toLowerCase().replace(/\s+/g, '')
    const translationKey = `designCards.models.${modelKey}`
    const translated = t(translationKey)
    // If translation returns the key itself, use default name
    return translated === translationKey ? defaultName : translated
  }
  const [selectedDesign, setSelectedDesign] = useState<any>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isPastTrigger, setIsPastTrigger] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Set mounted state (client-side only)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Get current scooter config with fallback - always use same logic to avoid hydration mismatch
  const currentScooter = (scooters as Record<string, any>)[selectedModel] || getDefaultScooter()

  // Ensure selectedModel is valid after mount
  useEffect(() => {
    if (isMounted) {
      if (!(scooters as Record<string, any>)[selectedModel]) {
        const defaultModel = Object.keys(scooters)[0]
        if (defaultModel && defaultModel !== selectedModel) {
          setSelectedModel(defaultModel)
        }
      }
    }
  }, [isMounted, selectedModel])

  // Set default design when model changes (client-side only to avoid hydration issues)
  useEffect(() => {
    if (isMounted && currentScooter && currentScooter.designs.length > 0) {
      const firstDesign = currentScooter.designs[0]
      if (!selectedDesign || (selectedDesign as any)?.id !== firstDesign.id) {
        setSelectedDesign(firstDesign)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel, isMounted])

  // Handle scroll for parallax effect (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const triggerPoint = windowHeight * 0.8 // Trigger at 80% of viewport height

      setScrollProgress(Math.min(scrollY / windowHeight, 1))
      setIsPastTrigger(scrollY > triggerPoint)
    }

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      handleScroll() // Initial call
      window.addEventListener('scroll', handleScroll, { passive: true })
    })

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  // Handle model switching
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    // Reset scroll position to top (but don't reload page)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Handle design selection - change 3D model without scrolling
  const handleDesignSelect = (design: any) => {
    setSelectedDesign(design)
    // Don't scroll - let user stay on current position to view designs
  }

  // Handle details view - navigate to detailed page
  const handleViewDetails = (design: any) => {
    // Navigate to design details page
    if (typeof window !== 'undefined') {
      window.location.href = `/designs/${currentScooter.id}/${design.id}`
    }
  }

  // Get current panorama based on selected design
  const getCurrentPanorama = () => {
    if (selectedDesign && (selectedDesign as any).background) {
      return (selectedDesign as any).background
    }
    return (currentScooter as any).panorama || '/images/studio-panorama.png'
  }

  return (
    <>
      {/* Dark background fill below 3D scene */}
      <div className="fixed top-0 left-0 w-full h-screen bg-gradient-to-b from-neutral-900 via-neutral-950 to-black z-0" />

      {/* Full-Screen 3D Hero Scene - Always visible */}
      <section
        ref={heroRef}
        className="fixed top-0 left-0 w-full z-10"
        style={{
          height: '70vh', // 70% высоты экрана - cards visible below
        }}
      >
        <div className="absolute inset-0 w-full h-full">
          {isMounted && (
            <ScooterViewer
              modelPath={currentScooter.model}
              selectedDesign={selectedDesign}
              environmentImage={'/hdr/studio.hdr' as any}
              panoramaUrl={getCurrentPanorama()}
              className="w-full h-full"
            />
          )}
          {!isMounted && <ThreeDViewerPlaceholder />}
        </div>

        {/* Model Selection Menu Overlay - iOS 26 Glassmorphism Style */}
        <div
          className="absolute bottom-11 left-0 right-0 z-30 flex justify-center"
          style={{ pointerEvents: 'auto', transform: 'scale(1.1)' }}
        >
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
            <div
              className="flex flex-nowrap gap-2 md:gap-4 overflow-x-auto scrollbar-hide justify-center"
              style={{
                scrollbarWidth: 'none' /* Firefox */,
                msOverflowStyle: 'none' /* IE and Edge */,
                WebkitOverflowScrolling: 'touch' /* iOS smooth scroll */,
                paddingLeft: '1rem' /* Space for first button when scrolling */,
                paddingRight: '1rem' /* Space for last button when scrolling */,
              }}
            >
              {Object.entries(scooters).map(([id, scooter]) => {
                // Determine if buttons are over white background (when scrolled)
                const isOverWhiteBackground = scrollProgress > 0.3 // When scrolled past 30%, buttons are over white
                const textColor = isOverWhiteBackground
                  ? selectedModel === id
                    ? 'text-neutral-900'
                    : 'text-neutral-700'
                  : selectedModel === id
                    ? 'text-white'
                    : 'text-white/90'
                const borderColor = isOverWhiteBackground
                  ? selectedModel === id
                    ? 'rgba(0, 0, 0, 0.2)'
                    : 'rgba(0, 0, 0, 0.1)'
                  : selectedModel === id
                    ? 'rgba(255, 255, 255, 0.4)'
                    : 'rgba(255, 255, 255, 0.2)'
                const backgroundOpacity = isOverWhiteBackground
                  ? selectedModel === id
                    ? 0.25
                    : 0.15
                  : selectedModel === id
                    ? 0.15
                    : 0.08

                return (
                  <button
                    key={id}
                    onClick={() => handleModelChange(id)}
                    className={`px-5 py-2.5 rounded-2xl font-semibold text-sm md:text-base transition-all duration-300 relative overflow-hidden whitespace-nowrap flex-shrink-0 ${textColor} ${selectedModel === id && !isOverWhiteBackground ? 'ios-glass-button-active' : ''}`}
                    style={{
                      background: `rgba(${isOverWhiteBackground ? '0, 0, 0' : '255, 255, 255'}, ${backgroundOpacity})`,
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      border:
                        selectedModel === id
                          ? `1.5px solid ${borderColor}`
                          : `1px solid ${borderColor}`,
                      boxShadow:
                        selectedModel === id
                          ? isOverWhiteBackground
                            ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.1) inset, 0 0 20px rgba(0, 0, 0, 0.1)'
                            : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset, 0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(0, 255, 136, 0.2)'
                          : '0 4px 16px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                    }}
                    onMouseEnter={e => {
                      if (selectedModel !== id) {
                        if (isOverWhiteBackground) {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'
                          e.currentTarget.style.border = '1px solid rgba(0, 0, 0, 0.15)'
                          e.currentTarget.style.boxShadow =
                            '0 6px 24px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.1) inset'
                        } else {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.3)'
                          e.currentTarget.style.boxShadow =
                            '0 6px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.15) inset, 0 0 15px rgba(255, 255, 255, 0.2)'
                        }
                      }
                    }}
                    onMouseLeave={e => {
                      if (selectedModel !== id) {
                        if (isOverWhiteBackground) {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)'
                          e.currentTarget.style.border = `1px solid ${borderColor}`
                          e.currentTarget.style.boxShadow =
                            '0 4px 16px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.1) inset'
                        } else {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)'
                          e.currentTarget.style.boxShadow =
                            '0 4px 16px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                        }
                      }
                    }}
                  >
                    {/* Glow effect overlay for selected */}
                    {selectedModel === id && !isOverWhiteBackground && (
                      <span
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 200, 0.1) 100%)',
                          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                        }}
                      />
                    )}
                    <span className="relative z-10">{getModelName(scooter.id, scooter.name)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Dark Content Block (appears after scroll) - Transparent background */}
      <div
        ref={contentRef}
        className="relative z-20 min-h-screen"
        style={{
          marginTop: '70vh', // Push content below the hero scene - cards peek through
          background: `linear-gradient(180deg, 
            rgba(15, 15, 15, ${1 - scrollProgress * 0.85}) 0%, 
            rgba(18, 18, 18, 0.1) 45%, 
            rgba(15, 15, 15, 0.3) 70%,
            rgba(12, 12, 12, 0.5) 78%,
            rgba(10, 10, 10, 0.65) 83%,
            rgba(8, 8, 8, 0.75) 87%,
            rgba(6, 6, 6, 0.83) 90%,
            rgba(4, 4, 4, 0.9) 93%,
            rgba(2, 2, 2, 0.95) 96%,
            rgba(0, 0, 0, 0.98) 98%,
            rgba(0, 0, 0, 1) 100%)`,
          transition: 'background 0.3s ease-out',
        }}
      >
        <div className="pb-20 md:pb-32" style={{ paddingTop: 'calc(5rem - 44px)' }}>
          {/* Product Strip - Horizontal Scroll */}
          <div className="mb-20">
            {/* Title Container - Enhanced with gradient and badge */}
            <div className="container mx-auto px-4 md:px-6 lg:px-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -100px 0px' }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FFA9]/10 border border-[#00FFA9]/20 mb-6">
                  <span className="text-xs font-semibold text-[#00FFA9] uppercase tracking-wider">
                    {t('designCards.premiumDesigns')}
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  {getModelName(currentScooter.id, currentScooter.name)} {t('hero3d.designs')}
                </h2>
                <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                  {t('page.chooseDesign')}
                </p>
              </motion.div>
            </div>

            {/* Horizontal Scroll Container - Full Width with enhanced styling */}
            <div
              className="overflow-x-auto overflow-y-visible no-scrollbar snap-x snap-mandatory flex gap-6 px-4 md:px-8 py-8"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
              }}
            >
              {(currentScooter.designs as any[]).map((design: any, index: number) => {
                const isSelected = (selectedDesign as any)?.id === design.id

                return (
                  <motion.div
                    key={design.id}
                    className="snap-start"
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 100,
                      damping: 15
                    }}
                  >
                    <LandingDesignCard
                      design={design}
                      modelName={getModelName(currentScooter.id, currentScooter.name)}
                      modelId={currentScooter.id}
                      index={index}
                      isSelected={isSelected}
                      onImageClick={() => handleDesignSelect(design)}
                      onDetailsClick={() => handleViewDetails(design)}
                    />
                  </motion.div>
                )
              })}
            </div>

            {/* Scroll hint (mobile) - Enhanced */}
            <motion.div 
              className="mt-8 text-center md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <p className="text-white/50 text-sm">{t('page.swipeToExplore')}</p>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Landing Sections - Dark graphite with subtle glow */}
      <div
        className="relative z-30"
        style={{
          background:
            'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(15, 15, 15, 1) 5%, rgba(15, 15, 15, 1) 100%)',
        }}
      >
        <ProductExperience selectedModel={selectedModel} scooterName={getModelName(currentScooter.id, currentScooter.name)} />
        <USPSection />
        <ProcessSection />
        <GallerySection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <ContactSection />
      </div>
    </>
  )
}
