import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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
