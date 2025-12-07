'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import InterModal from './InterModal'
import ContactModal from './ContactModal'
import DonateModal from './DonateModal'

export default function Header() {
  const { t } = useLanguage()
  const [isLogoHovered, setIsLogoHovered] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isInterOpen, setIsInterOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isDonateOpen, setIsDonateOpen] = useState(false)

  // Close menu when clicking outside
  useEffect(() => {
    if (isMenuOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (!target.closest('.menu-container')) {
          setIsMenuOpen(false)
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleMenuClick = (action: 'inter' | 'contact' | 'donate') => {
    setIsMenuOpen(false)
    if (action === 'inter') setIsInterOpen(true)
    if (action === 'contact') setIsContactOpen(true)
    if (action === 'donate') setIsDonateOpen(true)
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-transparent"
    >
      <nav className="container mx-auto px-4 md:px-8 lg:px-16 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
                  filter: 'brightness(0) saturate(100%) invert(45%) sepia(85%) saturate(2500%) hue-rotate(160deg) brightness(95%) contrast(105%)',
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
          </motion.button>

          {/* Navigation Menu */}
          <div className="flex items-center gap-4">
            {/* Menu Items - horizontal */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-4"
                >
                  <button
                    onClick={() => handleMenuClick('inter')}
                    className="text-white/90 hover:text-white transition-colors font-medium px-3 py-2 rounded-xl hover:bg-white/10"
                  >
                    {t('menu.inter')}
                  </button>
                  <button
                    onClick={() => handleMenuClick('contact')}
                    className="text-white/90 hover:text-white transition-colors font-medium px-3 py-2 rounded-xl hover:bg-white/10"
                  >
                    {t('menu.contact')}
                  </button>
                  <button
                    onClick={() => handleMenuClick('donate')}
                    className="text-white/90 hover:text-white transition-colors font-medium px-3 py-2 rounded-xl hover:bg-white/10"
                  >
                    {t('menu.donate')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Hamburger Menu Button */}
            <div className="menu-container relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMenuOpen(!isMenuOpen)
                }}
                className="relative w-10 h-10 flex flex-col justify-center items-center gap-1.5 transition-all duration-300 rounded-xl hover:bg-white/10"
                aria-label="Menu"
              >
                <span
                  className={`w-6 h-0.5 transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '2px',
                  }}
                />
                <span
                  className={`w-6 h-0.5 transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0' : ''
                  }`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '2px',
                  }}
                />
                <span
                  className={`w-6 h-0.5 transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '2px',
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <InterModal isOpen={isInterOpen} onClose={() => setIsInterOpen(false)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <DonateModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
    </header>
  )
}
