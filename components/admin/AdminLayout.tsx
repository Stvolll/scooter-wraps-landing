'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/models', label: 'Models', icon: '🚗' },
    { href: '/admin/designs', label: 'Designs', icon: '🎨' },
  ]

  return (
    <div className="flex min-h-screen bg-[#000000]">
      <aside
        className="w-56 shrink-0 border-r border-white/10 flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(15,15,15,1) 100%)',
        }}
      >
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-[#007AFF] text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            title="Back to site"
          >
            <span className="text-lg">🏠</span>
            <span>Back to site</span>
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
