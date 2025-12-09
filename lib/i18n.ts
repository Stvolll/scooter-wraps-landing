export type Language = 'en' | 'vi'

import enTranslations from '@/locales/en.json'
import viTranslations from '@/locales/vi.json'

const translations = {
  en: enTranslations,
  vi: viTranslations,
}

export function useTranslations(language: Language) {
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) {
        // Fallback to English if translation missing
        value = translations.en
        for (const k2 of keys) {
          value = value?.[k2]
        }
        break
      }
    }

    return value || key
  }

  return t
}
