export type Language = 'en' | 'vi' | 'ko'

import enTranslations from '@/locales/en.json'
import viTranslations from '@/locales/vi.json'
import koTranslations from '@/locales/ko.json'

const translations = {
  en: enTranslations,
  vi: viTranslations,
  ko: koTranslations,
}

export function useTranslations(language: Language) {
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]

    // Navigate through the translation object
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        value = undefined
        break
      }
    }

    // If translation not found, try English fallback
    if (value === undefined) {
      value = translations.en
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k]
        } else {
          value = undefined
          break
        }
      }
    }

    // If still not found, return key and log warning
    if (value === undefined || (typeof value === 'object' && value !== null)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Translation missing for key: ${key} in language: ${language}`)
      }
      return key
    }

    // Return the translation string
    return String(value)
  }

  return t
}
