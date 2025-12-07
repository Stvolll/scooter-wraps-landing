'use client'

/**
 * Testimonials Section - Social Proof
 * Modern approach: Authentic reviews with photos, ratings, and verified badges
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

const testimonials = [
  {
    id: 1,
    name: 'Nguyen Van A',
    location: 'Ho Chi Minh City',
    rating: 5,
    text: 'Absolutely stunning! The wrap quality exceeded my expectations. My Honda Lead looks like it came straight from a showroom. Professional team, fast service.',
    design: 'Neon Blade',
    model: 'Honda Lead',
    image: '/images/testimonials/customer-1.jpg',
    verified: true,
    date: '2 weeks ago'
  },
  {
    id: 2,
    name: 'Tran Thi B',
    location: 'Hanoi',
    rating: 5,
    text: 'I was skeptical at first, but the 3D preview convinced me. The installation was flawless and done at my office. Best decision ever!',
    design: 'Cyberpunk',
    model: 'Yamaha NVX',
    image: '/images/testimonials/customer-2.jpg',
    verified: true,
    date: '1 month ago'
  },
  {
    id: 3,
    name: 'Le Van C',
    location: 'Da Nang',
    rating: 5,
    text: 'The custom design service is incredible! They helped me create exactly what I envisioned. The wrap protects my scooter and looks amazing.',
    design: 'Custom Design',
    model: 'Honda SH',
    image: '/images/testimonials/customer-3.jpg',
    verified: true,
    date: '3 weeks ago'
  }
]

export default function TestimonialsSection() {
  const { t } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section className="relative pt-12 md:pt-16 pb-20 md:pb-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900 to-black" />

      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#00FFA9] rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-[#B77EFF] rounded-full blur-[128px]" />
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
            {t('testimonials.title')}
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>

          {/* Overall rating */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-6 h-6 text-[#FFB800]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-2xl font-bold text-white">{t('testimonials.rating')}</span>
            <span className="text-white/40">{t('testimonials.reviews')}</span>
          </div>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={isMounted ? { opacity: 0, y: 30 } : false}
              animate={isMounted ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={isMounted ? { y: -5 } : undefined}
              className="group"
            >
              <div
                className="relative h-full p-6 rounded-3xl transition-all duration-500 hover:bg-white/5"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 12px 40px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
                }}
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  {/* Avatar placeholder */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00FFA9] to-[#00D4FF] flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      {testimonial.verified && (
                        <svg className="w-4 h-4 text-[#00D4FF]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-white/40">{testimonial.location}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= testimonial.rating ? 'text-[#FFB800]' : 'text-white/20'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Review text */}
                <p className="text-sm text-white/70 leading-relaxed mb-4">
                  &quot;{testimonial.text}&quot;
                </p>

                {/* Design info */}
                <div className="flex items-center justify-between text-xs">
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                    {testimonial.design}
                  </div>
                  <span className="text-white/40">{testimonial.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={isMounted ? { opacity: 0 } : false}
          animate={isMounted ? { opacity: 1 } : false}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-white/40 mb-6">{t('testimonials.trusted')}</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-40">
            <div className="text-white">{t('testimonials.bestRated')}</div>
            <div className="text-white">{t('testimonials.premiumPartner')}</div>
            <div className="text-white">{t('testimonials.securePayment')}</div>
            <div className="text-white">{t('testimonials.support')}</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

