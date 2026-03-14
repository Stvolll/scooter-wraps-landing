'use client'

import { usePathname } from 'next/navigation'
import AdminLayout from './AdminLayout'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/')

  if (isLogin) {
    return <>{children}</>
  }

  return <AdminLayout>{children}</AdminLayout>
}
