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

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { scooters as fallbackScooters } from '@/config/scooters'
import { useLanguage } from '@/contexts/LanguageContext'
import LandingDesignCard from '@/components/LandingDesignCard'

// Landing sections
import ProductExperience from '@/components/ProductExperience'
import USPSection from '@/components/sections/USPSection'
import ProcessSection from '@/components/sections/ProcessSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import GallerySection from '@/components/sections/GallerySection'
import FAQSection from '@/components/sections/FAQSection'
import ContactSection from '@/components/sections/ContactSection'
import CTASection from '@/components/sections/CTASection'

const ScooterViewer = dynamic(() => import('@/components/ScooterViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black" />
  ),
})

export default function Home() {
  const { t, language } = useLanguage()
  const DEFAULT_PANORAMA = '/hdr/panoramic_3.webp'
  // Default to first available model with designs - dynamically determined to avoid hardcoding
  const getFirstModelWithDesigns = (scootersObj: Record<string, any>) => {
    // Find first model with designs
    for (const [key, scooter] of Object.entries(scootersObj)) {
      if (scooter.designs && Array.isArray(scooter.designs) && scooter.designs.length > 0) {
        return key
      }
    }
    // Fallback to first available model
    return Object.keys(scootersObj).length > 0 ? Object.keys(scootersObj)[0] : null
  }
  const firstModelKey = getFirstModelWithDesigns(fallbackScooters)
  const [selectedModel, setSelectedModel] = useState<string | null>(firstModelKey)
  const [scooters, setScooters] = useState<Record<string, any>>(fallbackScooters)
  const [isLoadingScooters, setIsLoadingScooters] = useState(true)
  
  // Function to translate model names - memoized to avoid hydration issues
  const getModelName = useMemo(() => {
    return (modelId: string, defaultName: string) => {
      const modelKey = modelId.toLowerCase().replace(/\s+/g, '')
      const translationKey = `designCards.models.${modelKey}`
      const translated = t(translationKey)
      // If translation returns the key itself, use default name
      return translated === translationKey ? defaultName : translated
    }
  }, [t])
  
  const [selectedDesign, setSelectedDesign] = useState<any>(null)
  const [scenePanoramaUrl, setScenePanoramaUrl] = useState<string>(DEFAULT_PANORAMA)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isPastTrigger, setIsPastTrigger] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const sceneLoadTokenRef = useRef(0)

  // Load scooters from API with fallback to config file (with timeout to prevent hanging)
  const loadScootersDidRun = useRef(false)
  const lastScootersRef = useRef<string>('')
  const isLoadingRef = useRef(false) // Prevent concurrent requests
  
  const loadScooters = useMemo(() => {
    return async (force = false) => {
      // Skip if already loading (unless forced)
      if (isLoadingRef.current && !force) {
        console.log('⏭️ Skipping loadScooters - already loading')
        return
      }
      
      // Skip if already ran (unless forced)
      if (!force && loadScootersDidRun.current) {
        console.log('⏭️ Skipping loadScooters - already ran (use force=true to reload)')
        return
      }
      
      isLoadingRef.current = true
      
      try {
        // Add timeout to prevent hanging (10 seconds to allow cold start)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          controller.abort()
          console.warn('⏱️ API request timeout after 10s, using fallback')
        }, 10000)
        
        // Add timestamp to prevent caching
        const timestamp = Date.now()
        const response = await fetch(`/api/scooters?t=${timestamp}`, {
          signal: controller.signal,
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          if (data.scooters && Object.keys(data.scooters).length > 0) {
            // Check if data actually changed
            const dataString = JSON.stringify(data.scooters)
            if (dataString !== lastScootersRef.current) {
              lastScootersRef.current = dataString
              console.log('✅ Loaded scooters from API:', Object.keys(data.scooters).length, 'models')
              // Always update if data changed (even if keys are the same, content might have changed)
              setScooters(data.scooters)
              // Update selectedModel using functional update to avoid dependency issues
              setSelectedModel(prevModel => {
                // Keep current model if it exists (even without designs - for A-Vision)
                if (prevModel && data.scooters[prevModel]) {
                  return prevModel // Keep current model selection
                }
                // Otherwise find first model with designs (for initial load)
                const modelWithDesigns = getFirstModelWithDesigns(data.scooters)
                return modelWithDesigns || prevModel
              })
            } else {
              console.log('ℹ️ Data unchanged, skipping update')
            }
          } else {
            console.warn('⚠️ API response not OK:', response.status, 'using fallback')
            // Keep fallback scooters
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.warn('⚠️ API request timeout, using fallback')
        } else {
          console.warn('⚠️ Failed to load scooters from API, using fallback:', error.message)
        }
        // Keep fallback scooters - они уже установлены в useState
      } finally {
        loadScootersDidRun.current = true
        isLoadingRef.current = false
        setIsLoadingScooters(false)
      }
    }
  }, [])
  
  useEffect(() => {
    // Initial load - only once
    if (!loadScootersDidRun.current) {
      loadScooters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Reload data when window gains focus (user returns from admin panel)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleFocus = () => {
      console.log('🔄 Window focused, reloading scooters data...')
      loadScootersDidRun.current = false
      loadScooters(true)
    }
    
    // Also listen for storage events (admin panel updates)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'admin-update') {
        console.log('🔄 Admin update detected, reloading scooters data...')
        loadScootersDidRun.current = false
        loadScooters(true)
      }
    }
    
    window.addEventListener('focus', handleFocus)
    window.addEventListener('storage', handleStorage)
    
    // Also check localStorage periodically for admin updates (increased interval to reduce load)
    const checkAdminUpdate = () => {
      if (typeof window === 'undefined') return
      try {
        const lastUpdate = localStorage.getItem('admin-update')
        if (lastUpdate) {
          const updateTime = parseInt(lastUpdate, 10)
          const now = Date.now()
          // If update was within last 5 seconds, reload
          if (now - updateTime < 5000) {
            console.log('🔄 Recent admin update detected, reloading scooters data...')
            loadScootersDidRun.current = false
            loadScooters(true)
            localStorage.removeItem('admin-update')
          }
        }
      } catch (e) {
        // Ignore localStorage errors (private browsing, etc.)
      }
    }
    
    const checkInterval = setInterval(checkAdminUpdate, 5000) // Check every 5 seconds (reduced frequency)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('storage', handleStorage)
      clearInterval(checkInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // loadScooters is stable (useMemo)

  // Reload data periodically (every 60 seconds) to catch updates (reduced frequency)
  useEffect(() => {
    // Only set up periodic reload if we're in browser
    if (typeof window === 'undefined') return
    
    const interval = setInterval(() => {
      // Only reload if page is visible (not in background)
      if (document.visibilityState === 'visible') {
        console.log('🔄 Periodic reload of scooters data...')
        loadScootersDidRun.current = false
        loadScooters(true)
      }
    }, 60000) // 60 seconds (reduced frequency to prevent hanging)
    
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // loadScooters is stable (useMemo)

  // Set mounted state (client-side only)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Get current scooter config with fallback - always use same logic to avoid hydration mismatch
  // Use useMemo to ensure consistent value between server and client
  // Memoize by selectedModel only - scooters object reference may change but content is stable
  const currentScooter = useMemo(() => {
    if (!selectedModel) return null
    
    const scooter = (scooters as Record<string, any>)[selectedModel]
    
    // Allow selecting any model, even without designs (for A-Vision)
    // Don't auto-switch to another model - let user choose
    if (scooter && (!scooter.designs || scooter.designs.length === 0)) {
      console.log(`ℹ️ Model ${selectedModel} has no designs, but keeping selection`)
    }
    
    return scooter || Object.values(scooters)[0] || null
  }, [selectedModel, scooters])

  // ✅ FIX: Ensure selectedModel is valid after mount - use ref to prevent loops
  const lastScootersKeysRef = useRef<string>('')
  const lastSelectedModelRef = useRef<string | null>(null)
  
  // ✅ FIX: Use useMemo to track scooters keys changes without dependency
  const scootersKeysString = useMemo(() => Object.keys(scooters).sort().join(','), [scooters])
  const scootersDesignsSignature = useMemo(() => {
    return JSON.stringify(
      Object.entries(scooters).reduce((acc, [key, scooter]) => {
        acc[key] = {
          panorama: scooter?.panorama || null,
          designIds: Array.isArray(scooter?.designs)
            ? scooter.designs.map((design: any) => design?.id || design?.slug || null)
            : [],
        }
        return acc
      }, {} as Record<string, any>)
    )
  }, [scooters])
  
  useEffect(() => {
    if (!isMounted) return
    
    const scootersKeys = Object.keys(scooters)
    if (scootersKeys.length === 0) return
    
    // Check if scooters actually changed by comparing keys
    const scootersChanged = scootersKeysString !== lastScootersKeysRef.current
    
    if (scootersChanged) {
      lastScootersKeysRef.current = scootersKeysString
    }
    
    // ✅ FIX: Only update selectedModel if it's invalid or scooters changed
    const currentModel = selectedModel
    const isModelValid = currentModel && (scooters as Record<string, any>)[currentModel]
    
    // Skip if model is valid and scooters didn't change
    if (isModelValid && !scootersChanged && lastSelectedModelRef.current === currentModel) {
      return
    }
    
    // Update ref to prevent re-running
    lastSelectedModelRef.current = currentModel
    
    // Use functional update to avoid dependency on selectedModel
    setSelectedModel(prevModel => {
      if (!prevModel || !(scooters as Record<string, any>)[prevModel]) {
        const defaultModel = scootersKeys[0]
        if (defaultModel) {
          return defaultModel
        }
      }
      return prevModel // Keep current if valid
    })
    // ✅ FIX: Depend on scootersKeysString (memoized) instead of ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, scootersKeysString])

  // ✅ FIX: Set default design when model or scooters data changes
  const lastModelRef = useRef<string | null>(null)
  const lastDesignIdRef = useRef<string | null>(null)
  
  useEffect(() => {
    if (!isMounted || !selectedModel) return
    
    // ✅ FIX: Skip if we already processed this model AND design is already set
    if (lastModelRef.current === selectedModel) {
      // Check if design is still valid for this model
      const scooter = (scooters as Record<string, any>)[selectedModel]
      if (scooter && Array.isArray(scooter.designs) && scooter.designs.length > 0) {
        const firstDesignId = scooter.designs[0]?.id
        if (firstDesignId && lastDesignIdRef.current === firstDesignId) {
          return // Everything is already set correctly
        }
      }
    }
    
    lastModelRef.current = selectedModel
    
    try {
      // Access scooters directly to avoid dependency on currentScooter (which is derived)
      const scooter = (scooters as Record<string, any>)[selectedModel]
      if (scooter && Array.isArray(scooter.designs) && scooter.designs.length > 0) {
        const firstDesign = scooter.designs[0]
        if (!firstDesign || !firstDesign.id) {
          console.warn('⚠️ First design is invalid:', firstDesign)
          return
        }
        
        const firstDesignId = firstDesign.id
        
        // ✅ FIX: Skip if design ID hasn't changed
        if (lastDesignIdRef.current === firstDesignId) {
          return
        }
        
        lastDesignIdRef.current = firstDesignId
        
        const rawPanorama =
          (firstDesign as any).panorama ||
          (firstDesign as any).bg_webp ||
          (firstDesign as any).background ||
          scooter.panorama ||
          DEFAULT_PANORAMA
        const panorama = typeof rawPanorama === 'string' && rawPanorama.trim() !== '' ? rawPanorama : DEFAULT_PANORAMA

        // Keep model/design card linkage and apply matching scene panorama atomically.
        setSelectedDesign((prevDesign: any) => {
          const currentDesignId = (prevDesign as any)?.id
          if (!currentDesignId || currentDesignId !== firstDesignId) {
            console.log('🎨 Setting default design:', {
              model: scooter.id,
              designId: firstDesignId,
              designName: firstDesign.name || firstDesign.title || 'Unknown',
            })
            return firstDesign
          }
          return prevDesign
        })
        setScenePanoramaUrl(panorama)
      } else if (scooter) {
        console.warn('⚠️ No designs found for model:', scooter?.id, scooter?.name)
        // Clear selected design if model has no designs
        if (lastDesignIdRef.current !== null) {
          lastDesignIdRef.current = null
          setSelectedDesign(null)
          setScenePanoramaUrl(
            typeof scooter.panorama === 'string' && scooter.panorama.trim() !== ''
              ? scooter.panorama
              : DEFAULT_PANORAMA
          )
        }
      }
    } catch (err) {
      console.error('Error setting default design:', err)
    }
    // Re-run when scooters payload changes to pick first design from fresh API data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel, isMounted, scootersDesignsSignature])

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

  // ВРЕМЕННО: Убрана адаптация для старого компонента
  // TODO: Вернуть после исправления нового движка

  // Handle model switching
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    // Reset scroll position to top (but don't reload page)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const normalizeAssetUrl = useCallback((value?: string | null): string | null => {
    if (!value || typeof value !== 'string') return null
    const trimmed = value.trim()
    if (!trimmed) return null
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  }, [])

  const preloadImage = useCallback((url: string): Promise<void> => {
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => resolve()
      img.src = url
    })
  }, [])

  // Scene update contract: preload texture/panorama, then commit together.
  const applyDesignToScene = useCallback(async (design: any, modelFallbackPanorama?: string) => {
    const token = ++sceneLoadTokenRef.current
    const nextTexture = normalizeAssetUrl(design?.texture || design?.textureUrl)
    const nextPanorama =
      normalizeAssetUrl(design?.panorama || design?.bg_webp || design?.background) ||
      normalizeAssetUrl(modelFallbackPanorama) ||
      DEFAULT_PANORAMA

    const preloadTasks: Promise<void>[] = [preloadImage(nextPanorama)]
    if (nextTexture) preloadTasks.push(preloadImage(nextTexture))
    await Promise.all(preloadTasks)

    if (token !== sceneLoadTokenRef.current) return
    setSelectedDesign(design)
    setScenePanoramaUrl(nextPanorama)
  }, [normalizeAssetUrl, preloadImage, DEFAULT_PANORAMA])

  // ✅ FIX из рабочего проекта: Debounce для design selection
  const designSelectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Handle design selection - change 3D model without scrolling
  const handleDesignSelect = useCallback((design: any) => {
    // Очищаем предыдущий timeout
    if (designSelectTimeoutRef.current) {
      clearTimeout(designSelectTimeoutRef.current)
    }
    
    // ✅ FIX: Небольшая задержка для batch rapid clicks (50ms debounce)
    designSelectTimeoutRef.current = setTimeout(() => {
      applyDesignToScene(design, currentScooter?.panorama)
    }, 50)
  }, [applyDesignToScene, currentScooter?.panorama])
  
  // ✅ FIX: Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (designSelectTimeoutRef.current) {
        clearTimeout(designSelectTimeoutRef.current)
      }
    }
  }, [])

  // Handle details view - navigate to detailed page
  const handleViewDetails = (design: any) => {
    // Navigate to design details page
    // ✅ FIX: Используем slug если есть, иначе id
    // Формат URL: /designs/{model-slug}/{design-slug}
    if (typeof window !== 'undefined' && currentScooter) {
      // Приоритет: design.slug > design.id
      // Если slug содержит префикс модели, используем только slug
      // Иначе используем формат {model-slug}-{design-slug}
      const designSlug = design.slug || design.id
      const modelSlug = currentScooter.id || currentScooter.slug
      
      // Если slug уже содержит префикс модели, используем его как есть
      // Иначе формируем полный slug
      let finalSlug = designSlug
      if (designSlug && !designSlug.startsWith(`${modelSlug}-`)) {
        // Проверяем, может быть slug уже полный
        finalSlug = designSlug.includes('-') ? designSlug : `${modelSlug}-${designSlug}`
      }
      
      window.location.href = `/designs/${modelSlug}/${finalSlug}`
    }
  }

  // Фон 3D-сцены: у каждой карточки свой panorama; при смене карточки меняется фон
  const currentPanorama = useMemo(() => scenePanoramaUrl || DEFAULT_PANORAMA, [scenePanoramaUrl, DEFAULT_PANORAMA])

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
          position: 'fixed', // ✅ FIX: Явно указываем position для правильного расчета scroll offset
          top: 0,
          left: 0,
          right: 0,
        }}
      >
                <div className="absolute inset-0 w-full h-full" suppressHydrationWarning>
                  {currentScooter && (currentScooter.glbModelUrl || currentScooter.model) ? (
                    <ScooterViewer
                      modelPath={currentScooter.glbModelUrl || currentScooter.model}
                      selectedDesign={selectedDesign}
                      panoramaUrl={currentPanorama}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-black" />
                  )}
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
              {isLoadingScooters ? (
                /* Skeleton: 3 placeholders while models load */
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[42px] w-[140px] md:w-[160px] flex-shrink-0 rounded-2xl bg-white/10 animate-pulse"
                    aria-hidden
                  />
                ))
              ) : Object.keys(scooters).length === 0 ? (
                <div className="text-white/60 text-sm px-4 py-2">
                  No models available
                </div>
              ) : (
                Object.entries(scooters).map(([id, scooter]) => {
                // Determine if buttons are over white background (when scrolled)
                // Always use false on server to ensure consistent rendering
                // On client, this will be updated after mount via useEffect
                const isOverWhiteBackground = false // Always false for SSR consistency
                const textColor = selectedModel === id
                  ? 'text-white'
                  : 'text-white/90'
                const borderColor = selectedModel === id
                  ? 'rgba(255, 255, 255, 0.4)'
                  : 'rgba(255, 255, 255, 0.2)'
                const backgroundOpacity = selectedModel === id
                  ? 0.15
                  : 0.08

                return (
                  <button
                    key={id}
                    onClick={() => handleModelChange(id)}
                    suppressHydrationWarning
                    className={`px-5 py-2.5 rounded-2xl font-semibold text-sm md:text-base transition-all duration-300 relative overflow-hidden whitespace-nowrap flex-shrink-0 ${textColor} ${selectedModel === id ? 'ios-glass-button-active' : ''}`}
                    style={{
                      background: `rgba(255, 255, 255, ${backgroundOpacity})`,
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      border:
                        selectedModel === id
                          ? `1.5px solid ${borderColor}`
                          : `1px solid ${borderColor}`,
                      boxShadow:
                        selectedModel === id
                          ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset, 0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(0, 255, 136, 0.2)'
                          : '0 4px 16px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                    }}
                    onMouseEnter={e => {
                      if (selectedModel !== id) {
                        // Use actual scrollProgress for hover effects (client-side only)
                        const actualIsOverWhite = isMounted && scrollProgress > 0.3
                        if (actualIsOverWhite) {
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
                        // Reset to initial state
                        e.currentTarget.style.background = `rgba(255, 255, 255, ${backgroundOpacity})`
                        e.currentTarget.style.border = `1px solid ${borderColor}`
                        e.currentTarget.style.boxShadow =
                          '0 4px 16px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                      }
                    }}
                  >
                    {/* Glow effect overlay for selected */}
                    {selectedModel === id && (
                      <span
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        suppressHydrationWarning
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
              }))}
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
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 pb-2 text-center bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent leading-tight">
                  {currentScooter ? `${getModelName(currentScooter.id, currentScooter.name)} ${t('hero3d.designs')}` : t('hero3d.designs')}
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
              {currentScooter && currentScooter.designs && currentScooter.designs.length > 0 ? (
                (currentScooter.designs as any[]).map((design: any, index: number) => {
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
                      modelName={currentScooter ? getModelName(currentScooter.id, currentScooter.name) : 'Scooter'}
                      modelId={currentScooter?.id || ''}
                      index={index}
                      isSelected={isSelected}
                      onImageClick={() => handleDesignSelect(design)}
                      onDetailsClick={() => handleViewDetails(design)}
                    />
                  </motion.div>
                )
              })) : (
                <div className="flex flex-col items-center justify-center min-w-[280px] md:min-w-[320px] h-[400px] rounded-3xl bg-white/5 border border-white/10 p-8 text-center">
                  <svg className="w-16 h-16 text-white/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-semibold text-white mb-2">No designs available</p>
                  <p className="text-sm text-white/60">Designs for {currentScooter?.name || 'this model'} will be available soon</p>
                </div>
              )}
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
        <ProductExperience selectedModel={selectedModel || ''} scooterName={currentScooter ? getModelName(currentScooter.id, currentScooter.name) : 'Scooter'} />
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
