'use client'

/**
 * ProcessSteps Component
 *
 * Displays the production pipeline in a left-to-right step-by-step layout.
 * Shows 5 steps: Creative Upload → Prepayment → Printing → Delivery → Installation
 */

import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { Upload, CreditCard, Printer, Truck, Wrench } from 'lucide-react'

const steps = [
  { key: 'step1', icon: Upload },
  { key: 'step2', icon: CreditCard },
  { key: 'step3', icon: Printer },
  { key: 'step4', icon: Truck },
  { key: 'step5', icon: Wrench },
]

export default function ProcessSteps() {
  const { t } = useLanguage()

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 bg-neutral-50">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{t('process.title')}</h2>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-accent-neon to-transparent -z-10" />
                )}

                {/* Step Card */}
                <div className="premium-card p-6 text-center h-full">
                  {/* Step Number */}
                  <div className="w-16 h-16 rounded-full bg-accent-neon/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-accent-neon" />
                  </div>

                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent-neon text-accent-dark font-bold flex items-center justify-center text-sm">
                    {index + 1}
                  </div>

                  {/* Step Content */}
                  <h3 className="text-xl font-bold mb-2">{t(`process.${step.key}.title`)}</h3>
                  <p className="text-neutral-600 text-sm">{t(`process.${step.key}.description`)}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
