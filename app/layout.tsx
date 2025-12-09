import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientWrapper from '@/components/ClientWrapper'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ConditionalLayout from '@/components/ConditionalLayout'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TXD — Premium Vinyl Wraps for Scooters',
  description:
    'Premium vinyl wrap cover-sets for multiple scooter models. Explore ready-made styles or create your own custom design.',
  keywords:
    'vinyl wraps, scooter wraps, custom scooter design, premium vinyl, Honda Lead, Yamaha Nouvo, scooter customization',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'TXD — Premium Vinyl Wraps for Scooters',
    description:
      'Premium vinyl wrap cover-sets for multiple scooter models. Explore ready-made styles or create your own custom design.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'vi_VN',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#00ff88" />
        {/* Load model-viewer web component - must load before React hydration */}
        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
          async
        />
        {/* Google Analytics GA4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ClientWrapper>
          <ConditionalLayout>
            <Header />
            <main>{children}</main>
            <Footer />
          </ConditionalLayout>
        </ClientWrapper>
      </body>
    </html>
  )
}
