'use client'

/**
 * Footer Component
 *
 * Site footer with:
 * - Brand description
 * - Copyright
 */

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'

export default function Footer() {
  const { t } = useLanguage()
  const [currentYear, setCurrentYear] = useState<number>(2024)

  // Fix hydration error by setting year on client side only
  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <footer
      className="bg-black text-neutral-300 py-16 px-4 md:px-8 lg:px-16 w-full relative"
      style={{
        zIndex: 100,
        backgroundColor: '#000000',
        minHeight: '200px',
      }}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          {/* Brand Description */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">TXD</h3>
            <p className="text-neutral-400 leading-relaxed mb-4">{t('footer.description')}</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-800 pt-8 text-center text-neutral-500">
          <p>
            © {currentYear} TXD. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
