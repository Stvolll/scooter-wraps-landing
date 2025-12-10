'use client'

/**
 * Client Journey Section - Your Experience
 * Focus on customer experience from consultation to support
 * Different from ProductExperience which shows internal production process
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ProcessSection() {
  const { t } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const steps = [
    {
      number: '01',
      title: t('clientJourney.step1.title'),
      description: t('clientJourney.step1.description'),
      icon: '💬',
      duration: t('clientJourney.step1.duration'),
      highlight: 'Free',
    },
    {
      number: '02',
      title: t('clientJourney.step2.title'),
      description: t('clientJourney.step2.description'),
      icon: '📝',
      duration: t('clientJourney.step2.duration'),
      highlight: 'Secure',
    },
    {
      number: '03',
      title: t('clientJourney.step3.title'),
      description: t('clientJourney.step3.description'),
      icon: '🏭',
      duration: t('clientJourney.step3.duration'),
      highlight: 'Premium',
    },
    {
      number: '04',
      title: t('clientJourney.step4.title'),
      description: t('clientJourney.step4.description'),
      icon: '🔧',
      duration: t('clientJourney.step4.duration'),
      highlight: 'Professional',
    },
    {
      number: '05',
      title: t('clientJourney.step5.title'),
      description: t('clientJourney.step5.description'),
      icon: '🛡️',
      duration: t('clientJourney.step5.duration'),
      highlight: 'Lifetime',
    },
  ]

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
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {t('clientJourney.title')}
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            {t('clientJourney.subtitle')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00FFA9]/20 via-[#00D4FF]/20 to-[#B77EFF]/20 -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={isMounted ? { opacity: 0, y: 30 } : false}
                animate={isMounted ? { opacity: 1, y: 0 } : false}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                {/* Card */}
                <div
                  className="relative p-6 rounded-3xl h-full transition-all duration-500 hover:bg-white/5"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {/* Step number badge */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FFA9]/20 to-[#00D4FF]/20 border border-[#00FFA9]/30 mb-4">
                    <span className="text-2xl font-bold text-[#00FFA9]">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div className="text-4xl mb-3">{step.icon}</div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-white/60 leading-relaxed mb-4">{step.description}</p>

                  {/* Duration and highlight badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <span className="text-xs text-white/40">⏱</span>
                      <span className="text-xs text-white/60">{step.duration}</span>
                    </div>
                    {step.highlight && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#00FFA9]/10 border border-[#00FFA9]/30">
                        <span className="text-xs text-[#00FFA9] font-semibold">{step.highlight}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connecting arrow (mobile/tablet) */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <svg
                      className="w-6 h-6 text-[#00FFA9]/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          animate={isMounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <button
            className="group relative px-8 py-4 rounded-2xl font-semibold text-black transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
              boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
            }}
          >
            <span className="relative z-10">{t('clientJourney.startJourney')}</span>
            <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
