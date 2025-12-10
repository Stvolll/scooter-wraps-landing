'use client'

/**
 * ProductExperience Component
 * Three high-performance sections in Premium Industrial/Brutalist style:
 * 1. Blueprint Tech-Specs (Interactive CAD-style map)
 * 2. Production Protocol (Vertical timeline)
 * 3. Visual Request Terminal (Concierge form with before/after slider)
 */

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Palette, Monitor, Printer, Truck, ChevronRight } from 'lucide-react'
import InteractiveScooterBlueprint from './InteractiveScooterBlueprint'
import Image from 'next/image'


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
  const [isMounted, setIsMounted] = useState(false)
  const protocolRef = useRef<HTMLDivElement>(null)
  
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
      {/* SECTION 1: Interactive Installation Guide */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Glow effect in center background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00FFA9] rounded-full blur-[150px] opacity-15" />
        </div>
        
        <div className="relative container mx-auto px-4 md:px-8 lg:px-16">
          {/* Section Header */}
          <motion.div
            initial={isMounted ? { opacity: 0, y: 20 } : false}
            animate={isMounted ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              How to Apply
            </h2>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
              {scooterName ? (
                <>
                  Interactive guide for{' '}
                  <span className="text-[#00FFA9] font-semibold">{scooterName}</span>
                  : hover or tap on parts to see installation details
                </>
              ) : (
                'Interactive guide: hover or tap on parts to see installation details'
              )}
            </p>
          </motion.div>

          {/* Interactive Blueprint */}
          <motion.div
            initial={isMounted ? { opacity: 0, y: 20 } : false}
            animate={isMounted ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <div
              className="p-8 md:p-12 rounded-3xl"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              }}
            >
              <InteractiveScooterBlueprint selectedModel={selectedModel} />
            </div>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Large card: Film texture macro */}
            <motion.div
              initial={isMounted ? { opacity: 0, scale: 0.9 } : false}
              animate={isMounted ? { opacity: 1, scale: 1 } : false}
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
              initial={isMounted ? { opacity: 0, scale: 0.9 } : false}
              animate={isMounted ? { opacity: 1, scale: 1 } : false}
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
              initial={isMounted ? { opacity: 0, scale: 0.9 } : false}
              animate={isMounted ? { opacity: 1, scale: 1 } : false}
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
              initial={isMounted ? { opacity: 0, scale: 0.9 } : false}
              animate={isMounted ? { opacity: 1, scale: 1 } : false}
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
            initial={isMounted ? { opacity: 0, y: 20 } : false}
            animate={isMounted ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Production Process
            </h2>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
              From concept to completion - our workflow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Side: Sticky Header */}
            <motion.div
              initial={isMounted ? { opacity: 0 } : false}
              animate={isMounted ? { opacity: 1 } : false}
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
                  Our
                </h2>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#00FFA9]">
                  Process
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
                    initial={isMounted ? { opacity: 0, x: 50 } : false}
                    animate={isMounted ? { opacity: 1, x: 0 } : false}
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
