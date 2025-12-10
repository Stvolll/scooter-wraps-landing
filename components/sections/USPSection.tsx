'use client'

/**
 * USP Section - Unique Selling Propositions
 * Modern approach: Icon-based value propositions with micro-interactions
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'

export default function USPSection() {
  const { t } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const uspItems = [
    {
      icon: '🎨',
      title: t('usp.premiumMaterials.title'),
      description: t('usp.premiumMaterials.description'),
      color: '#00FFA9',
    },
    {
      icon: '⚡',
      title: t('usp.fastInstallation.title'),
      description: t('usp.fastInstallation.description'),
      color: '#00D4FF',
    },
    {
      icon: '💎',
      title: t('usp.customDesign.title'),
      description: t('usp.customDesign.description'),
      color: '#B77EFF',
    },
    {
      icon: '🛡️',
      title: t('usp.protectionIncluded.title'),
      description: t('usp.protectionIncluded.description'),
      color: '#FFB800',
    },
  ]

  return (
    <section className="relative pt-12 md:pt-16 pb-20 md:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900 to-black" />

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FFA9] rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D4FF] rounded-full blur-[128px]" />
      </div>

      <div className="relative container mx-auto px-4 md:px-8 lg:px-16">
        {/* Section header */}
        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          animate={isMounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {t('usp.title')}
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">{t('usp.subtitle')}</p>
        </motion.div>

        {/* USP Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {uspItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={isMounted ? { opacity: 0, y: 30 } : false}
              animate={isMounted ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={isMounted ? { scale: 1.05, y: -5 } : undefined}
              className="group relative"
            >
              <div
                className="relative h-full p-6 rounded-3xl transition-all duration-500"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow:
                    '0 12px 40px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
                }}
              >
                {/* Icon */}
                <div
                  className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    filter: `drop-shadow(0 0 20px ${item.color}40)`,
                  }}
                >
                  {item.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>

                {/* Description */}
                <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>

                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${item.color}15, transparent 70%)`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          animate={isMounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 mb-12"
        >
          <h3 className="text-center text-lg font-semibold text-white/80 mb-6">
            {t('usp.certifications') || 'Certified Premium Materials'}
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {/* 3M Certification */}
            <motion.div
              initial={isMounted ? { opacity: 0, scale: 0.9 } : false}
              animate={isMounted ? { opacity: 1, scale: 1 } : false}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="p-4 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white">
                  3M
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">3M™ Certified</div>
                  <div className="text-xs text-white/60">Premium Vinyl</div>
                </div>
              </div>
            </motion.div>

            {/* Avery Dennison Certification */}
            <motion.div
              initial={isMounted ? { opacity: 0, scale: 0.9 } : false}
              animate={isMounted ? { opacity: 1, scale: 1 } : false}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="p-4 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                  AVERY
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Avery Dennison</div>
                  <div className="text-xs text-white/60">Authorized Partner</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Trust badges with numbers */}
        <motion.div
          initial={isMounted ? { opacity: 0 } : false}
          animate={isMounted ? { opacity: 1 } : false}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <motion.div
              initial={isMounted ? { opacity: 0, y: 10 } : false}
              animate={isMounted ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-center p-4 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="text-3xl font-bold text-[#00FFA9] mb-1">500+</div>
              <div className="text-xs text-white/60">{t('usp.clients')}</div>
            </motion.div>

            <motion.div
              initial={isMounted ? { opacity: 0, y: 10 } : false}
              animate={isMounted ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="text-center p-4 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="text-3xl font-bold text-[#00D4FF] mb-1">5</div>
              <div className="text-xs text-white/60">{t('usp.warranty')}</div>
            </motion.div>

            <motion.div
              initial={isMounted ? { opacity: 0, y: 10 } : false}
              animate={isMounted ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="text-center p-4 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="text-3xl font-bold text-[#B77EFF] mb-1">100%</div>
              <div className="text-xs text-white/60">{t('usp.certified')}</div>
            </motion.div>

            <motion.div
              initial={isMounted ? { opacity: 0, y: 10 } : false}
              animate={isMounted ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="text-center p-4 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="text-3xl font-bold text-[#FFB800] mb-1">24/7</div>
              <div className="text-xs text-white/60">{t('usp.consultation')}</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
