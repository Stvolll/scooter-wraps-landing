'use client'

import { usePathname } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

interface ConditionalLayoutProps {
  children: ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin') || false

  useEffect(() => {
    // Добавляем класс на body для админки
    if (isAdmin) {
      document.body.classList.add('admin-page')
    } else {
      document.body.classList.remove('admin-page')
    }
  }, [isAdmin])

  // Всегда показываем children (Header, main, Footer)
  // Скрытие происходит через CSS класс на body
  return <>{children}</>
}
