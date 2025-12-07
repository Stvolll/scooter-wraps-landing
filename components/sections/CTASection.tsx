'use client'

/**
 * CTA Section - Call To Action
 * Modern approach: FOMO elements, urgency, clear value proposition
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function CTASection() {
  const { t } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900 to-black" />
      
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00FFA9] rounded-full blur-[200px] opacity-20 animate-pulse" />
      </div>

      <div className="relative container mx-auto px-4 md:px-8 lg:px-16">
        <motion.div
          initial={isMounted ? { opacity: 0, y: 30 } : false}
          animate={isMounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Limited offer badge */}
          <motion.div
            initial={isMounted ? { opacity: 0, scale: 0.8 } : false}
            animate={isMounted ? { opacity: 1, scale: 1 } : false}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.2), rgba(255, 119, 0, 0.2))',
              border: '1px solid rgba(255, 184, 0, 0.3)',
              boxShadow: '0 0 30px rgba(255, 184, 0, 0.2)',
            }}
          >
            <span className="text-2xl">🔥</span>
            <span className="font-semibold text-[#FFB800]">
              {t('cta.limitedOffer')}
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h2
            initial={isMounted ? { opacity: 0, y: 20 } : false}
            animate={isMounted ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            {t('cta.readyToTransform')}
            <br />
            {t('cta.yourRide')}
          </motion.h2>

          {/* Subheading */}
          <motion.p
            initial={isMounted ? { opacity: 0, y: 20 } : false}
            animate={isMounted ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto"
          >
            {t('cta.subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={isMounted ? { opacity: 0, y: 20 } : false}
            animate={isMounted ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            {/* Primary CTA */}
            <button
              className="group relative px-8 py-4 rounded-2xl font-semibold text-black transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              style={{
                background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.5)',
              }}
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                {t('cta.getPreview')}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>

            {/* Secondary CTA */}
            <button
              className="px-8 py-4 rounded-2xl font-semibold text-white border-2 border-white/20 hover:border-[#00FFA9] hover:bg-white/5 transition-all duration-300 w-full sm:w-auto"
            >
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {t('cta.scheduleCall')}
              </span>
            </button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={isMounted ? { opacity: 0 } : false}
            animate={isMounted ? { opacity: 1 } : false}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap justify-center items-center gap-8 text-white/40 text-sm"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00FFA9]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t('cta.freeConsultation')}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00FFA9]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t('cta.noCommitment')}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00FFA9]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t('cta.responseTime')}</span>
            </div>
          </motion.div>

          {/* Social proof counter */}
          <motion.div
            initial={isMounted ? { opacity: 0, y: 20 } : false}
            animate={isMounted ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 pt-12 border-t border-white/10"
          >
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[#00FFA9] mb-1">500+</div>
                <div className="text-sm text-white/60">{t('cta.happyRiders')}</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[#00D4FF] mb-1">5.0</div>
                <div className="text-sm text-white/60">{t('cta.averageRating')}</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[#B77EFF] mb-1">5Y</div>
                <div className="text-sm text-white/60">{t('cta.warranty')}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

