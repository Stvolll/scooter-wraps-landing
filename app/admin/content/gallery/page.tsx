// app/admin/content/gallery/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function GalleryAdminPage() {
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
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">Gallery Section Management</h1>
          <p className="text-white/60">Manage gallery content displayed on the landing page</p>
        </div>

        <div
          className="p-6 mx-4 md:mx-8 lg:mx-16 rounded-3xl mb-6"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">🖼️ Gallery Management Process</h2>
          <div className="mb-4">
            <p className="text-white/70 mb-4">
              Gallery раздел автоматически отображает дизайны из базы данных. Управление происходит через раздел 
              <Link href="/admin/designs" className="text-[#00FFA9] hover:text-[#00D4FF] mx-1">Manage Designs</Link>.
              Публикованные дизайны автоматически появляются в галерее.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00FFA9]/20 flex items-center justify-center text-[#00FFA9] font-bold text-sm">1</div>
                  <h3 className="text-white font-semibold text-sm">Create Design</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Создайте дизайн через "Create New Design" или "Manage Designs"
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] font-bold text-sm">2</div>
                  <h3 className="text-white font-semibold text-sm">Publish</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Опубликуйте дизайн через переключатель на странице редактирования
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00FFA9]/20 flex items-center justify-center text-[#00FFA9] font-bold text-sm">3</div>
                  <h3 className="text-white font-semibold text-sm">Auto Display</h3>
                </div>
                <p className="text-white/60 text-xs">
                  Опубликованные дизайны автоматически отображаются в галерее на сайте
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Gallery Features:</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Automatic Display:</strong> Gallery автоматически показывает все опубликованные дизайны из базы данных</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Model Filtering:</strong> Пользователи могут фильтровать дизайны по модели скутера</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Design Cards:</strong> Каждая карточка показывает обложку, название, модель и статус дизайна</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FFA9]">•</span>
                <span><strong>Quick Actions:</strong> Переход к странице дизайна для просмотра деталей и добавления в корзину</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <Link
              href="/admin/designs"
              className="inline-block px-6 py-3 rounded-2xl font-semibold text-black transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
              }}
            >
              Go to Manage Designs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}






