'use client'

/**
 * USP Section - Unique Selling Propositions
 * Modern approach: Icon-based value propositions with micro-interactions
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

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
      color: '#00FFA9'
    },
    {
      icon: '⚡',
      title: t('usp.fastInstallation.title'),
      description: t('usp.fastInstallation.description'),
      color: '#00D4FF'
    },
    {
      icon: '💎',
      title: t('usp.customDesign.title'),
      description: t('usp.customDesign.description'),
      color: '#B77EFF'
    },
    {
      icon: '🛡️',
      title: t('usp.protectionIncluded.title'),
      description: t('usp.protectionIncluded.description'),
      color: '#FFB800'
    }
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
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            {t('usp.subtitle')}
          </p>
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
                  boxShadow: '0 12px 40px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
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
                <h3 className="text-xl font-semibold text-white mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-white/60 leading-relaxed">
                  {item.description}
                </p>

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

        {/* Trust badges */}
        <motion.div
          initial={isMounted ? { opacity: 0 } : false}
          animate={isMounted ? { opacity: 1 } : false}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/40 text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>{t('usp.certified')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>{t('usp.warranty')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>{t('usp.clients')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>{t('usp.consultation')}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

