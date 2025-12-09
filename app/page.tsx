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
import { scooters, getDefaultScooter } from '@/config/scooters'
import { useLanguage } from '@/contexts/LanguageContext'
import LandingDesignCard from '@/components/LandingDesignCard'
import ThreeDViewerPlaceholder from '@/components/ThreeDViewerPlaceholder'

// Landing sections
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
  const { t } = useLanguage()
  // Default to Honda Vision
  const [selectedModel, setSelectedModel] = useState('vision')
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

  // Get current scooter config with fallback - only after mount
  const currentScooter = isMounted
    ? (scooters as Record<string, any>)[selectedModel] || getDefaultScooter()
    : getDefaultScooter()

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

  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const triggerPoint = windowHeight * 0.8 // Trigger at 80% of viewport height

      setScrollProgress(Math.min(scrollY / windowHeight, 1))
      setIsPastTrigger(scrollY > triggerPoint)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle model switching
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    // Reset scroll position to top (but don't reload page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle design selection - change 3D model without scrolling
  const handleDesignSelect = (design: any) => {
    setSelectedDesign(design)
    // Don't scroll - let user stay on current position to view designs
  }

  // Handle details view - navigate to detailed page
  const handleViewDetails = (design: any) => {
    // Navigate to design details page
    window.location.href = `/designs/${currentScooter.id}/${design.id}`
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
        suppressHydrationWarning
      >
        <div className="absolute inset-0 w-full h-full" suppressHydrationWarning>
          <ScooterViewer
            modelPath={currentScooter.model}
            selectedDesign={selectedDesign}
            environmentImage={'/hdr/studio.hdr' as any}
            panoramaUrl={getCurrentPanorama()}
            className="w-full h-full"
          />
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
                    <span className="relative z-10">{scooter.name}</span>
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
        <div className="pt-8 md:pt-12 pb-20 md:pb-32">
          {/* Product Strip - Horizontal Scroll */}
          <div className="mb-16">
            {/* Title Container */}
            <div className="container mx-auto px-4 md:px-6 lg:px-8 mb-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 text-center text-white">
                {currentScooter.name} {t('hero3d.designs')}
              </h2>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto text-center">
                {t('page.chooseDesign')}
              </p>
            </div>

            {/* Horizontal Scroll Container - Full Width */}
            <div
              className="overflow-x-auto overflow-y-visible no-scrollbar snap-x snap-mandatory flex gap-6 px-4 md:px-8 py-6"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
              }}
              suppressHydrationWarning
            >
              {(currentScooter.designs as any[]).map((design: any, index: number) => {
                const isSelected = (selectedDesign as any)?.id === design.id

                return (
                  <div key={design.id} className="snap-start">
                    <LandingDesignCard
                      design={design}
                      modelName={currentScooter.name}
                      modelId={currentScooter.id}
                      index={index}
                      isSelected={isSelected}
                      onImageClick={() => handleDesignSelect(design)}
                      onDetailsClick={() => handleViewDetails(design)}
                    />
                  </div>
                )
              })}
            </div>

            {/* Scroll hint (mobile) */}
            <div className="mt-6 text-center md:hidden">
              <p className="text-white/40 text-sm">{t('page.swipeToExplore')}</p>
            </div>
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
