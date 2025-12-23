import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coming Soon',
  description: 'TXD is launching soon. Get ready for premium scooter wraps and custom designs.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

