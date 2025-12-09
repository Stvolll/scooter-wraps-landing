'use client'

/**
 * FAQ Section - Frequently Asked Questions
 * Modern approach: Collapsible accordion with search functionality
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

const faqs = [
  {
    id: 1,
    question: 'How long does the vinyl wrap last?',
    answer:
      'Our premium 3M™ vinyl wraps are designed to last 5-7 years with proper care. They resist UV damage, weather, and daily wear. We provide a 5-year warranty on all installations.',
  },
  {
    id: 2,
    question: 'Will the wrap damage my scooter&apos;s paint?',
    answer:
      'Absolutely not! Vinyl wraps actually protect your original paint from scratches, chips, and UV damage. When professionally removed, your paint will be in pristine condition underneath.',
  },
  {
    id: 3,
    question: 'Can I choose a custom design?',
    answer:
      'Yes! You can choose from our ready-made designs or create your own custom design. Upload your artwork or work with our design team to create something unique. Preview it in 3D before ordering.',
  },
  {
    id: 4,
    question: 'How long does installation take?',
    answer:
      "Professional installation typically takes 2-3 hours depending on the model and design complexity. We come to your location, so you don't need to leave your scooter anywhere.",
  },
  {
    id: 5,
    question: 'What&apos;s included in the price?',
    answer:
      'The price includes premium 3M vinyl material, professional installation at your location, quality guarantee, and 5-year warranty. No hidden fees!',
  },
  {
    id: 6,
    question: 'How do I maintain the wrap?',
    answer:
      'Simple! Wash with mild soap and water. Avoid high-pressure washers directly on seams. No waxing needed. Detailed care instructions are provided after installation.',
  },
  {
    id: 7,
    question: 'Can I remove the wrap later?',
    answer:
      'Yes, wraps can be professionally removed anytime without damaging the paint. Removal takes about 1-2 hours. We offer removal services at a discounted rate for our customers.',
  },
  {
    id: 8,
    question: 'Do you offer payment plans?',
    answer:
      'Yes! We offer flexible payment options including installment plans. Contact us to discuss the best option for you.',
  },
]

export default function FAQSection() {
  const { t } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)
  const [openId, setOpenId] = useState<number | null>(1)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id)
  }

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
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">{t('faq.subtitle')}</p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={isMounted ? { opacity: 0, y: 20 } : false}
              animate={isMounted ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div
                className="rounded-3xl overflow-hidden transition-all duration-300 hover:border-white/20"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openId === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <svg
                      className="w-6 h-6 text-[#00FFA9]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {openId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-white/70 leading-relaxed">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          animate={isMounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-white/60 mb-4">{t('faq.stillQuestions')}</p>
          <button className="px-8 py-3 rounded-2xl font-semibold text-white border-2 border-[#00FFA9] hover:bg-[#00FFA9] hover:text-black transition-all duration-300">
            {t('faq.contactSupport')}
          </button>
        </motion.div>
      </div>
    </section>
  )
}
