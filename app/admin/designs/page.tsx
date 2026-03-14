import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DesignsListClient from './DesignsListClient'

export default async function DesignsPage() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')?.value

  if (!authCookie || authCookie !== 'authenticated') {
    redirect('/admin/login')
  }

  return <DesignsListClient />
}
