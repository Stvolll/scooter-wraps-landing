'use client'

/**
 * FAQ Component
 *
 * Frequently Asked Questions section with expandable answers.
 * Uses accordion-style interaction.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { ChevronDown } from 'lucide-react'

const faqItems = [
  { key: 'durability' },
  { key: 'quality' },
  { key: 'installation' },
  { key: 'shipping' },
  { key: 'custom' },
]

export default function FAQ() {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{t('faq.title')}</h2>
        </motion.div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="premium-card overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
              >
                <h3 className="text-xl font-semibold pr-8">{t(`faq.${item.key}.question`)}</h3>
                <ChevronDown
                  className={`w-6 h-6 text-neutral-400 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-neutral-600">{t(`faq.${item.key}.answer`)}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
