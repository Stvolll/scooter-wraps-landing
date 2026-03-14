'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/verify', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.authenticated) {
            setIsAuthenticated(true)
          } else {
            setIsAuthenticated(false)
            router.replace('/admin/login')
          }
        } else {
          setIsAuthenticated(false)
          router.replace('/admin/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
        router.replace('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading || isAuthenticated === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{
          background:
            'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(15, 15, 15, 1) 5%, rgba(15, 15, 15, 1) 100%)',
        }}
      >
        <div className="animate-pulse text-white/60">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(15, 15, 15, 1) 5%, rgba(15, 15, 15, 1) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pt-24 px-4 md:px-8 lg:px-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">Admin Dashboard</h1>
          <p className="text-white/60">Welcome, Stvolll</p>
          
          {/* Admin Role & Project Map */}
          <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">👤 Admin Role & Responsibilities</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Design Management:</strong> Создание, редактирование, публикация дизайнов, управление стадиями производства</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Content Management:</strong> Управление контентом лицевой части (FAQ, Gallery, Testimonials, Contact)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Analytics:</strong> Мониторинг метрик бизнеса, заказов, доходов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>File Management:</strong> Загрузка и управление файлами (обложки, 3D модели, текстуры) в AWS S3</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="p-6 mx-4 md:mx-8 lg:mx-16"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRadius: '28px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow:
              '0 8px 32px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
          }}
        >
          <div className="space-y-6">
            {/* Main Sections */}
            <div>
              <h2 className="text-lg font-semibold text-white/80 mb-3 px-2">Main Sections</h2>
              <div className="flex flex-col gap-3">
                <Link
                  href="/admin/analytics"
                  className="px-6 py-4 rounded-2xl font-semibold text-black transition-all hover:scale-105 text-center"
                  style={{
                    background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                    boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
                  }}
                >
                  📊 Analytics Dashboard
                </Link>
                <Link
                  href="/admin/models"
                  className="px-6 py-4 rounded-2xl font-semibold text-black transition-all hover:scale-105 text-center"
                  style={{
                    background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                    boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
                  }}
                >
                  🏍️ Scooter Models
                </Link>
                <Link
                  href="/admin/designs"
                  className="px-6 py-4 rounded-2xl font-semibold text-black transition-all hover:scale-105 text-center"
                  style={{
                    background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                    boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
                  }}
                >
                  🎨 Designs
                </Link>
              </div>
            </div>

            {/* Content Management */}
            <div>
              <h2 className="text-lg font-semibold text-white/80 mb-3 px-2">Content Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link
                  href="/admin/content/faq"
                  className="px-6 py-4 rounded-2xl font-semibold text-white transition-all hover:bg-white/10 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  ❓ FAQ Section
                </Link>
                <Link
                  href="/admin/content/gallery"
                  className="px-6 py-4 rounded-2xl font-semibold text-white transition-all hover:bg-white/10 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  🖼️ Gallery Section
                </Link>
                <Link
                  href="/admin/content/testimonials"
                  className="px-6 py-4 rounded-2xl font-semibold text-white transition-all hover:bg-white/10 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  💬 Testimonials
                </Link>
                <Link
                  href="/admin/content/contact"
                  className="px-6 py-4 rounded-2xl font-semibold text-white transition-all hover:bg-white/10 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  📧 Contact Settings
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <LogoutButton />
            </div>
          </div>

          {/* Project Map */}
          <div
            className="p-6 mx-4 md:mx-8 lg:mx-16 mt-6 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <h2 className="text-2xl font-semibold text-white mb-4">🗺️ Project Structure Map</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Admin Panel Structure</h3>
                <div className="space-y-2 text-white/70 text-sm font-mono">
                  <div className="pl-2 border-l-2 border-[#00FFA9]">
                    <div className="text-[#00FFA9]">/admin</div>
                    <div className="pl-4 text-white/60">
                      <div>├─ /analytics - Analytics Dashboard</div>
                      <div>├─ /designs - Manage Designs</div>
                      <div>│  ├─ /new - Create New Design</div>
                      <div>│  └─ /[id] - Edit Design</div>
                      <div>└─ /content - Content Management</div>
                      <div className="pl-4 text-white/50">
                        <div>├─ /faq - FAQ Section</div>
                        <div>├─ /gallery - Gallery Section</div>
                        <div>├─ /testimonials - Testimonials</div>
                        <div>└─ /contact - Contact Settings</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Frontend Structure</h3>
                <div className="space-y-2 text-white/70 text-sm font-mono">
                  <div className="pl-2 border-l-2 border-[#00D4FF]">
                    <div className="text-[#00D4FF]">/ (Landing Page)</div>
                    <div className="pl-4 text-white/60">
                      <div>├─ Hero Section (3D Viewer)</div>
                      <div>├─ Gallery Section</div>
                      <div>├─ Process Section</div>
                      <div>├─ Testimonials Section</div>
                      <div>├─ FAQ Section</div>
                      <div>├─ Contact Section</div>
                      <div>└─ CTA Section</div>
                    </div>
                    <div className="text-[#00D4FF] mt-2">/designs/[model]/[slug]</div>
                    <div className="pl-4 text-white/60">
                      <div>└─ Design Detail Page</div>
                    </div>
                    <div className="text-[#00D4FF] mt-2">/cart</div>
                    <div className="pl-4 text-white/60">
                      <div>└─ Shopping Cart</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
