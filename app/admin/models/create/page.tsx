import { redirect } from 'next/navigation'

export default function CreateModelRedirect() {
  redirect('/admin/models/new')
}
