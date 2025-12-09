'use client'

/**
 * LanguageSwitcher Component
 *
 * Simple language switcher button (EN / VN).
 * Updates the language context when clicked.
 */

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en')
  }

  return (
    <button
      onClick={toggleLanguage}
      className="font-semibold text-sm md:text-base transition-all duration-300 text-white/90 hover:text-white px-2 py-1"
      aria-label="Switch language"
    >
      {language === 'en' ? 'VN' : 'EN'}
    </button>
  )
}
