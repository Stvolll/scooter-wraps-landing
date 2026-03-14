// app/admin/content/contact/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ContactAdminPage() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')?.value

  if (!authCookie || authCookie !== 'authenticated') {
    redirect('/admin/login')
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
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">Contact Settings</h1>
          <p className="text-white/60">Manage contact information and form settings</p>
        </div>

        <div
          className="p-6 mx-4 md:mx-8 lg:mx-16 rounded-3xl mb-6"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">📧 Contact Management Process</h2>
          <div className="mb-4">
            <p className="text-white/70 mb-4">
              Contact информация управляется через компоненты и файлы переводов. Контактная форма отправляет данные 
              через API endpoint <code className="text-[#00FFA9]">/api/contact</code>.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00FFA9]/20 flex items-center justify-center text-[#00FFA9] font-bold text-sm">1</div>
                  <h3 className="text-white font-semibold text-sm">Contact Info</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Email, телефон, адрес управляются через Footer компонент и locales
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] font-bold text-sm">2</div>
                  <h3 className="text-white font-semibold text-sm">Contact Form</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Форма отправляет данные на /api/contact для обработки
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00FFA9]/20 flex items-center justify-center text-[#00FFA9] font-bold text-sm">3</div>
                  <h3 className="text-white font-semibold text-sm">Social Links</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Ссылки на соцсети управляются через Footer и locales
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Contact Information Locations:</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Footer Component:</strong> components/Footer.tsx - основной компонент с контактной информацией</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Contact Section:</strong> components/sections/ContactSection.tsx - секция контактов на главной</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>API Endpoint:</strong> app/api/contact/route.ts - обработка отправки формы</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Translations:</strong> locales/*.json - тексты для контактной формы и информации</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Current Contact Settings:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-sm font-semibold text-[#00FFA9] mb-2">Email</div>
                <div className="text-white/80 text-sm">info@txd.bike</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-sm font-semibold text-[#00FFA9] mb-2">Phone</div>
                <div className="text-white/80 text-sm">+84 90 123 4567</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-sm font-semibold text-[#00FFA9] mb-2">Location</div>
                <div className="text-white/80 text-sm">Ho Chi Minh City, Vietnam</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-sm font-semibold text-[#00FFA9] mb-2">Social Media</div>
                <div className="text-white/80 text-sm">Instagram, Facebook, YouTube</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}






