import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ContentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')?.value

  if (!authCookie || authCookie !== 'authenticated') {
    redirect('/admin/login')
  }

  return <>{children}</>
}






