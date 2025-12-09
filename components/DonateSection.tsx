'use client'

/**
 * DonateSection Component
 *
 * Section for accepting donations to support project development.
 * Includes description and donation button.
 *
 * In production, wire the button to PayPal, Stripe, or other payment processor.
 */

import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DonateSection() {
  const { t } = useLanguage()

  const handleDonate = () => {
    // TODO: Open donation modal or redirect to payment processor
    // For now, just log
    console.log('Donate clicked - wire to payment processor')
    // Example: window.open('https://paypal.me/txd', '_blank')
  }

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">{t('donate.title')}</h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            {t('donate.description')}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDonate}
            className="btn-primary mt-8"
          >
            {t('donate.button')}
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
