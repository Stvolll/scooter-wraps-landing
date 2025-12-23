import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')?.value

  // Check if user is authenticated
  // Login page has its own layout that bypasses this check
  if (!authCookie || authCookie !== 'authenticated') {
    redirect('/admin/login')
  }

  return <>{children}</>
}
