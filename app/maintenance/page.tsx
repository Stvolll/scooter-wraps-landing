'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

export default function MaintenancePage() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-black p-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t('maintenance.title') || 'Site Under Maintenance'}
        </h1>
        <p className="text-lg text-white/70 mb-8">
          {t('maintenance.message') ||
            "We're currently performing scheduled maintenance. Please check back soon."}
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-[#00FFA9] text-black rounded-lg font-semibold hover:bg-[#00E699] transition-colors"
        >
          {t('maintenance.backHome') || 'Go Home'}
        </Link>
      </div>
    </div>
  )
}
