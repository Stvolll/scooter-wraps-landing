// app/admin/content/faq/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { readFile } from 'fs/promises'
import { join } from 'path'

export default async function FAQAdminPage() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')?.value

  if (!authCookie || authCookie !== 'authenticated') {
    redirect('/admin/login')
  }

  // Load FAQ data from locales
  let faqData: any = null
  try {
    const enPath = join(process.cwd(), 'locales', 'en.json')
    const enContent = await readFile(enPath, 'utf-8')
    const enData = JSON.parse(enContent)
    faqData = enData.faq
  } catch (error) {
    console.error('Error loading FAQ:', error)
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
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">FAQ Section Management</h1>
          <p className="text-white/60">Manage frequently asked questions for the landing page</p>
        </div>

        <div
          className="p-6 mx-4 md:mx-8 lg:mx-16 rounded-3xl mb-6"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">📋 FAQ Management Process</h2>
          <div className="mb-4">
            <p className="text-white/70 mb-4">
              FAQ раздел управляется через файлы переводов в <code className="text-[#00FFA9]">locales/*.json</code>. 
              Каждый вопрос и ответ должны быть переведены на все языки (en, vi).
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00FFA9]/20 flex items-center justify-center text-[#00FFA9] font-bold text-sm">1</div>
                  <h3 className="text-white font-semibold text-sm">Edit Locales</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Редактируйте файлы locales/en.json, locales/vi.json
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] font-bold text-sm">2</div>
                  <h3 className="text-white font-semibold text-sm">Structure</h3>
                </div>
                <p className="text-white/60 text-xs">
                  FAQ структура: faq.title, faq.items.{'{key}'}.question, faq.items.{'{key}'}.answer
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00FFA9]/20 flex items-center justify-center text-[#00FFA9] font-bold text-sm">3</div>
                  <h3 className="text-white font-semibold text-sm">Sync</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Убедитесь, что все ключи синхронизированы между всеми языками
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Current FAQ Items:</h3>
            {faqData?.items ? (
              <div className="space-y-3">
                {Object.entries(faqData.items).map(([key, item]: [string, any]) => (
                  <div key={key} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-sm font-semibold text-[#00FFA9] mb-1">{key}</div>
                    <div className="text-white/80 text-sm mb-1">Q: {item.question}</div>
                    <div className="text-white/60 text-xs">A: {item.answer.substring(0, 100)}...</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-sm">No FAQ items found. Check locales/en.json</p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">File Locations:</h3>
            <ul className="space-y-2 text-white/70 text-sm font-mono">
              <li className="flex items-center gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span>locales/en.json - English translations</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span>locales/vi.json - Vietnamese translations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

