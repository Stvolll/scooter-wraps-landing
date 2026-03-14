// app/admin/content/testimonials/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
// Testimonials are fetched from API endpoint

export default async function TestimonialsAdminPage() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')?.value

  if (!authCookie || authCookie !== 'authenticated') {
    redirect('/admin/login')
  }

  // Fetch testimonials from database (if using DB) or from API
  let testimonials: any[] = []
  try {
    // Try to fetch from API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/testimonials`, {
      cache: 'no-store',
    })
    if (response.ok) {
      testimonials = await response.json()
    }
  } catch (error) {
    console.error('Error fetching testimonials:', error)
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
          <Link
            href="/admin"
            className="text-[#00FFA9] hover:text-[#00D4FF] transition-colors mb-4 block text-sm font-medium"
          >
            ← Back to Admin
          </Link>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">Testimonials Management</h1>
          <p className="text-white/60">Manage customer testimonials and reviews</p>
        </div>

        <div
          className="p-6 mx-4 md:mx-8 lg:mx-16 rounded-3xl mb-6"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">💬 Testimonials Management Process</h2>
          <div className="mb-4">
            <p className="text-white/70 mb-4">
              Testimonials управляются через API endpoint <code className="text-[#00FFA9]">/api/testimonials</code>. 
              Отзывы могут быть получены из базы данных (Deal.feedback) или из статических данных.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00FFA9]/20 flex items-center justify-center text-[#00FFA9] font-bold text-sm">1</div>
                  <h3 className="text-white font-semibold text-sm">Source</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Отзывы берутся из Deal.feedback или статических данных
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] font-bold text-sm">2</div>
                  <h3 className="text-white font-semibold text-sm">API</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Endpoint: /api/testimonials возвращает список отзывов
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00FFA9]/20 flex items-center justify-center text-[#00FFA9] font-bold text-sm">3</div>
                  <h3 className="text-white font-semibold text-sm">Display</h3>
                </div>
                <p className="text-white/60 text-xs">
                  TestimonialsSection отображает отзывы на главной странице
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Current Testimonials:</h3>
            {testimonials.length > 0 ? (
              <div className="space-y-3">
                {testimonials.map((testimonial: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-sm font-semibold text-[#00FFA9] mb-1">{testimonial.name || 'Anonymous'}</div>
                    <div className="text-white/80 text-sm mb-1">{testimonial.text}</div>
                    {testimonial.rating && (
                      <div className="text-white/60 text-xs">Rating: {testimonial.rating}/5</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-sm">No testimonials found. Check /api/testimonials endpoint or Deal.feedback in database.</p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Management Options:</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Database:</strong> Отзывы из Deal.feedback автоматически попадают в testimonials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>API Endpoint:</strong> Редактируйте app/api/testimonials/route.ts для управления статическими отзывами</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Component:</strong> TestimonialsSection автоматически загружает и отображает отзывы</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

