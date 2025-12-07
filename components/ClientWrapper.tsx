'use client'

import { LanguageProvider } from '@/contexts/LanguageContext'
import { ReactNode } from 'react'

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>
}

