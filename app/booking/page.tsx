import type { Metadata } from 'next'
import BookingClient from './BookingClient'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Book Installation',
  description:
    'Book professional vinyl wrap installation for your scooter. Choose date, time and workshop.',
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#00FFA9] border-t-transparent" />
          </div>
        }
      >
        <BookingClient />
      </Suspense>
    </div>
  )
}
