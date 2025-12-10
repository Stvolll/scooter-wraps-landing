'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
// Модальные окна временно отключены - можно вернуть в будущем
// import InterModal from './InterModal'
// import ContactModal from './ContactModal'
// import DonateModal from './DonateModal'

export default function Header() {
  const { t } = useLanguage()
  const [isLogoHovered, setIsLogoHovered] = useState(false)
  const [cartItemsCount] = useState(0) // TODO: Подключить реальную корзину

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <nav className="container mx-auto px-4 md:px-8 lg:px-16 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
              className="relative flex items-center gap-3"
            >
              <div className="relative h-[53px] w-auto flex items-center">
                <img
                  src="/hdr/TXD_logo.svg"
                  alt="TXD Logo"
                  className="h-[53px] w-auto object-contain logo-animated"
                  style={{
                    filter:
                      'brightness(0) saturate(100%) invert(45%) sepia(85%) saturate(2500%) hue-rotate(160deg) brightness(95%) contrast(105%)',
                  }}
                />
              </div>
              <AnimatePresence>
                {isLogoHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm text-white/60 font-normal whitespace-nowrap"
                  >
                    tem xe dep
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          {/* Navigation Menu */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Paper Roll Icon - Using paper-roll.svg */}
            <Link
              href="/cart"
              className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-300 group"
              aria-label="Shopping Cart"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative w-6 h-6"
              >
                <img
                  src="/paper-roll.svg"
                  alt="Paper Roll"
                  className="w-6 h-6 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(1)',
                  }}
                />
              </motion.div>
              {cartItemsCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-[#00FFA9] text-black text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Modals - временно отключены, можно вернуть в будущем */}
      {/* <InterModal isOpen={isInterOpen} onClose={() => setIsInterOpen(false)} /> */}
      {/* <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} /> */}
      {/* <DonateModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} /> */}
    </header>
  )
}
