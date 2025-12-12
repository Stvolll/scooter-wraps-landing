'use client'

/**
 * Language Context for TXD project
 *
 * This context manages the current language state (EN/VI) across the app.
 * It stores the preference in localStorage so it persists across page reloads.
 *
 * Usage in components:
 *   import { useLanguage } from '@/contexts/LanguageContext'
 *   const { language, setLanguage, t } = useLanguage()
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { Language, useTranslations } from '@/lib/i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English, but check localStorage for saved preference
  const [language, setLanguageState] = useState<Language>('en')

  // Load language from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const saved = localStorage.getItem('txd-language') as Language | null
    if (saved === 'en' || saved === 'vi' || saved === 'ko') {
      setLanguageState(saved)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0]
      if (browserLang === 'vi') {
        setLanguageState('vi')
      } else if (browserLang === 'ko') {
        setLanguageState('ko')
      }
    }
  }, [])

  // Save language preference to localStorage (client-side only)
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('txd-language', lang)
    }
  }

  // Get translation function (hooks must be called at top level)
  const translationFn = useTranslations(language)

  // Memoize translation wrapper function
  const t = useMemo(() => {
    return (key: string): string => {
      try {
        return translationFn(key)
      } catch (error) {
        console.error('Translation error:', error, 'for key:', key)
        return key
      }
    }
  }, [translationFn])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
