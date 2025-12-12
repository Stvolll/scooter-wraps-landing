'use client'

/**
 * ProductExperience Component
 * Three high-performance sections in Premium Industrial/Brutalist style:
 * 1. Blueprint Tech-Specs (Interactive CAD-style map)
 * 2. Production Protocol (Vertical timeline)
 * 3. Visual Request Terminal (Concierge form with before/after slider)
 */

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Palette, Monitor, Printer, Truck, ChevronRight, Wrench, Droplet, Scissors, Wind, Sparkles } from 'lucide-react'
import InteractiveScooterBlueprint from './InteractiveScooterBlueprint'
import VietnamInstallationMap from './VietnamInstallationMap'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'


// Production protocol steps
const protocolSteps = [
  {
    number: '01',
    title: 'CREATIVE',
    description: 'Design adaptation for specific geometry.',
    icon: Palette,
  },
  {
    number: '02',
    title: 'RENDER',
    description: '3D Visualization verification.',
    icon: Monitor,
  },
  {
    number: '03',
    title: 'EXECUTION',
    description: 'High-DPI Printing & lamination.',
    icon: Printer,
  },
  {
    number: '04',
    title: 'DEPLOY',
    description: 'Shipping & Installation support.',
    icon: Truck,
  },
]

interface ProductExperienceProps {
  selectedModel?: string
  scooterName?: string
}

export default function ProductExperience({ selectedModel = 'vision', scooterName }: ProductExperienceProps) {
  const { t, language } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)
  const protocolRef = useRef<HTMLDivElement>(null)
  
  // Production protocol steps with translations
  const protocolSteps = [
    {
      number: '01',
      title: t('productionProcess.steps.creative.title'),
      description: t('productionProcess.steps.creative.description'),
      icon: Palette,
    },
    {
      number: '02',
      title: t('productionProcess.steps.render.title'),
      description: t('productionProcess.steps.render.description'),
      icon: Monitor,
    },
    {
      number: '03',
      title: t('productionProcess.steps.execution.title'),
      description: t('productionProcess.steps.execution.description'),
      icon: Printer,
    },
    {
      number: '04',
      title: t('productionProcess.steps.deploy.title'),
      description: t('productionProcess.steps.deploy.description'),
      icon: Truck,
    },
  ]
  
  // Scroll progress for protocol section
  const { scrollYProgress } = useScroll({
    target: protocolRef,
    offset: ['start end', 'end start'],
  })

  // Pre-calculate transforms for all steps (hooks must be called at top level)
  // Use fallback values to prevent errors during SSR
  const step0Transform = useTransform(scrollYProgress, [0, 1], [0, 0])
  const step1Transform = useTransform(scrollYProgress, [0, 1], [0, -50])
  const step2Transform = useTransform(scrollYProgress, [0, 1], [0, -100])
  const step3Transform = useTransform(scrollYProgress, [0, 1], [0, -150])
  const stepTransforms = [step0Transform, step1Transform, step2Transform, step3Transform]

  useEffect(() => {
    setIsMounted(true)
  }, [])


  return (
    <div className="relative text-white">
      {/* SECTION 1: Interactive Installation Guide - Redesigned */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00FFA9] rounded-full blur-[120px] opacity-10" />
        </div>
        
        <div className="relative container mx-auto px-4 md:px-8 lg:px-16 max-w-7xl">
          {/* Section Header - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FFA9]/10 border border-[#00FFA9]/20 mb-4">
              <span className="text-[10px] font-semibold text-[#00FFA9] uppercase tracking-wider">
                {t('installationGuide.title')}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-white">
              {t('installationGuide.howToApply')}
            </h2>
            <p className="text-sm md:text-base text-white/60 max-w-xl mx-auto">
              {scooterName ? (
                <>
                  {t('installationGuide.interactiveGuideFor')} <span className="text-[#00FFA9] font-medium">{scooterName}</span>
                </>
              ) : (
                t('installationGuide.interactiveGuide')
              )}
            </p>
          </motion.div>

          {/* Required Tools & Accessories - Redesigned */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div
              className="p-6 md:p-8 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#00FFA9]/10 border border-[#00FFA9]/20 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-[#00FFA9]" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  {t('installationGuide.requiredTools')}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Tool items */}
                {[
                  { 
                    id: 'solution',
                    icon: Droplet, 
                    name: t('installationGuide.tools.applicationSolution.name'), 
                    desc: t('installationGuide.tools.applicationSolution.desc'),
                    image: '/images/application-solution.webp'
                  },
                  { 
                    id: 'knife',
                    icon: Scissors, 
                    name: t('installationGuide.tools.precisionKnife.name'), 
                    desc: t('installationGuide.tools.precisionKnife.desc'),
                    image: '/images/precision-knife.webp'
                  },
                  { 
                    id: 'heatgun',
                    icon: Wind, 
                    name: t('installationGuide.tools.heatGun.name'), 
                    desc: t('installationGuide.tools.heatGun.desc'),
                    image: '/images/heat-gun.webp'
                  },
                  { 
                    id: 'squeegee',
                    icon: Sparkles, 
                    name: t('installationGuide.tools.squeegee.name'), 
                    desc: t('installationGuide.tools.squeegee.desc'),
                    image: '/images/squeegee.webp'
                  },
                ].map((item, index) => {
                  const Icon = item.icon
                  const isHovered = hoveredTool === item.id
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={isMounted ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      className="relative p-4 rounded-xl border transition-all overflow-hidden aspect-square flex flex-col group"
                      style={{
                        borderColor: isHovered ? 'rgba(0, 255, 169, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                        backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                        boxShadow: isHovered 
                          ? '0 6px 24px -2px rgba(0, 255, 169, 0.25), 0 0 0 1px rgba(0, 255, 169, 0.2) inset' 
                          : '0 2px 12px -2px rgba(0, 0, 0, 0.15)',
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.2 }
                      }}
                      onMouseEnter={() => setHoveredTool(item.id)}
                      onMouseLeave={() => setHoveredTool(null)}
                      onTouchStart={() => setHoveredTool(hoveredTool === item.id ? null : item.id)}
                    >
                      {/* Image that slides in from right - under text */}
                      <AnimatePresence mode="wait">
                        {isHovered && (
                          <motion.div
                            key={`image-${item.id}`}
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ 
                              type: 'spring', 
                              stiffness: 300, 
                              damping: 30,
                              duration: 0.35 
                            }}
                            className="absolute inset-0 rounded-xl overflow-hidden z-10"
                            style={{ pointerEvents: 'none' }}
                          >
                            <div className="relative w-full h-full">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.style.background = 'linear-gradient(135deg, rgba(0, 255, 169, 0.2), rgba(0, 212, 255, 0.2))'
                                  }
                                }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Text - Bottom (above image) */}
                      <div className="relative z-20 mt-auto pt-2">
                        <div className="text-sm font-bold text-white mb-0.5 leading-tight">{item.name}</div>
                        <div className="text-xs text-white/60 leading-snug">{item.desc}</div>
                      </div>

                      {/* Icon - Top Left (above everything) */}
                      <div className="absolute top-3 left-3 z-30">
                        <div className="w-9 h-9 rounded-lg bg-[#00FFA9]/12 border border-[#00FFA9]/25 flex items-center justify-center transition-transform duration-200"
                          style={{
                            transform: isHovered ? 'scale(1.08) rotate(4deg)' : 'scale(1) rotate(0deg)',
                          }}
                        >
                          <Icon className="w-5 h-5 text-[#00FFA9]" />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Interactive Blueprint - Redesigned */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-16"
          >
            <div
              className="p-6 md:p-8 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#00FFA9]/10 border border-[#00FFA9]/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#00FFA9]" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  {t('installationGuide.interactiveInstallationGuide')}
                </h3>
              </div>
              <InteractiveScooterBlueprint selectedModel={selectedModel} />
            </div>
          </motion.div>

          {/* Installation Services Map - Moved above Premium Print Quality */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <VietnamInstallationMap />
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Large card: Film texture macro */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isMounted ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2 lg:row-span-2 rounded-3xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              }}
            >
              <div className="relative w-full h-full aspect-square lg:aspect-auto lg:h-full min-h-[400px]">
                <Image
                  src="/images/placeholders/film-texture-macro.svg"
                  alt="Premium film texture macro photography"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                  <div className="p-6 w-full">
                    <h3 className="text-2xl font-bold text-white mb-1">Premium Print Quality</h3>
                    <p className="text-white/80 text-sm">Macro photography showing texture detail</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Small card: Film stretch video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isMounted ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-3xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] relative"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              }}
            >
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00FFA9]/20 to-[#00D4FF]/20 flex items-center justify-center">
                  <div className="text-center p-6">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="w-20 h-20 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center border border-white/20"
                    >
                      <span className="text-4xl">🎬</span>
                    </motion.div>
                    <h3 className="text-lg font-bold text-white mb-1">Elasticity</h3>
                    <p className="text-xs text-white/60">Stretch demonstration</p>
                    <p className="text-xs text-white/40 mt-2">Placeholder: film-stretch.webm</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Typography card: 5 Year Warranty */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isMounted ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="rounded-3xl p-8 flex flex-col justify-center group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 169, 0.15), rgba(0, 212, 255, 0.15))',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(0, 255, 169, 0.3)',
                boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              }}
            >
              <div className="text-center">
                <div className="text-6xl md:text-7xl font-bold text-[#00FFA9] mb-2">5</div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">Years</div>
                <div className="text-sm text-white/80 font-semibold uppercase tracking-wide">
                  Color Guarantee
                </div>
              </div>
            </motion.div>

            {/* Packaging card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isMounted ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="rounded-3xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              }}
            >
              <div className="relative w-full aspect-square">
                <Image
                  src="/images/placeholders/packaging-tube.svg"
                  alt="Secure packaging tube"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                  <div className="p-4 w-full">
                    <h3 className="text-lg font-bold text-white mb-1">Secure Packaging</h3>
                    <p className="text-xs text-white/80">Protective tube delivery</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Production Protocol */}
      <section ref={protocolRef} className="relative py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {t('productionProcess.title')}
            </h2>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
              {t('productionProcess.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Side: Sticky Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isMounted ? { opacity: 1 } : { opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3 lg:sticky lg:top-24 h-fit"
            >
              <div
                className="p-8 rounded-3xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                  {t('productionProcess.our')}
                </h2>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#00FFA9]">
                  {t('productionProcess.ourProcess')}
                </h2>
              </div>
            </motion.div>

            {/* Right Side: Scrollable Steps */}
            <div className="lg:col-span-9 space-y-0">
              {protocolSteps.map((step, index) => {
                const Icon = step.icon
                const yTransform = stepTransforms[index]

                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: 50 }}
                    animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    style={{ y: yTransform }}
                    className="mb-6"
                  >
                    <div
                      className="p-6 rounded-3xl transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                      }}
                    >
                      <div className="flex items-start gap-6">
                        {/* Step Number */}
                        <div className="flex-shrink-0">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, rgba(0, 255, 169, 0.2), rgba(0, 212, 255, 0.2))',
                              border: '1px solid rgba(0, 255, 169, 0.3)',
                            }}
                          >
                            <span className="text-2xl font-bold text-[#00FFA9]">{step.number}</span>
                          </div>
                        </div>

                        {/* Icon */}
                        <div className="flex-shrink-0 mt-2">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                            }}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                            {step.title}
                          </h3>
                          <p className="text-sm md:text-base text-white/60 leading-relaxed">
                            {step.description}
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0 mt-2">
                          <ChevronRight className="w-6 h-6 text-white/40" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
