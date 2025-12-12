'use client'

/**
 * LanguageSwitcher Component
 *
 * Language switcher with globe icon and dropdown menu.
 * Supports: vi-VN / ko-KR / en-US
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const languages = [
  { code: 'en', label: 'en-US', name: 'English' },
  { code: 'vi', label: 'vi-VN', name: 'Tiếng Việt' },
  { code: 'ko', label: 'ko-KR', name: '한국어' },
]

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  if (!mounted) {
    return (
      <button
        className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-300"
        aria-label="Switch language"
      >
        <Globe className="w-5 h-5 text-white/90" />
      </button>
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-300 group"
        aria-label="Switch language"
      >
        <Globe className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 z-50 min-w-[160px] rounded-xl overflow-hidden"
              style={{
                background: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
              }}
            >
              <div className="py-2">
                {languages.map((lang) => {
                  const isActive = lang.code === language
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as 'en' | 'vi' | 'ko')
                        setIsOpen(false)
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-all duration-200 flex items-center justify-between ${
                        isActive
                          ? 'bg-[#00FFA9]/10 text-[#00FFA9]'
                          : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{lang.label}</span>
                        <span className={`text-xs ${isActive ? 'text-[#00FFA9]/70' : 'text-white/50'}`}>
                          {lang.name}
                        </span>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-[#00FFA9]"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
