export type Language = 'en' | 'vi'

import enTranslations from '@/locales/en.json'
import viTranslations from '@/locales/vi.json'

const translations = {
  en: enTranslations,
  vi: viTranslations,
}

// Translation function factory - creates stable function references
function createTranslationFunction(lang: Language) {
  return (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[lang]

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
    if (value === undefined && lang !== 'en') {
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

    // If still not found, return key (don't log warning to prevent spam)
    if (value === undefined || (typeof value === 'object' && value !== null)) {
      return key
    }

    // Return the translation string
    return String(value)
  }
}

// Cache translation functions per language to ensure stable references
const translationCache: Record<Language, (key: string) => string> = {
  en: createTranslationFunction('en'),
  vi: createTranslationFunction('vi'),
}

export function useTranslations(language: Language) {
  // Return cached function to ensure stable reference
  return translationCache[language]
}
