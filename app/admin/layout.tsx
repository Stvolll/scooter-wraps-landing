import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'TXD Admin Dashboard - Manage designs and analytics',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },
}

import AdminShell from '@/components/admin/AdminShell'

// Layout doesn't check auth to prevent redirect loops
// Individual pages (except login) will check auth themselves
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
