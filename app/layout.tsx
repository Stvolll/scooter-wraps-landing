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
  preload: true,
  adjustFontFallback: true,
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://txd.bike'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TXD — Premium Vinyl Wraps for Scooters',
    template: '%s | TXD',
  },
  description:
    'Premium vinyl wrap cover-sets for multiple scooter models. Explore ready-made styles or create your own custom design. Professional installation, 5-year warranty, 3D preview available.',
  keywords: [
    'vinyl wraps',
    'scooter wraps',
    'custom scooter design',
    'premium vinyl',
    'Honda Lead',
    'Honda Vision',
    'Honda PCX',
    'Honda SH',
    'Yamaha NVX',
    'scooter customization',
    '3M vinyl',
    'scooter wrap installation',
    'custom scooter graphics',
  ],
  authors: [{ name: 'TXD' }],
  creator: 'TXD',
  publisher: 'TXD',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['vi_VN', 'ko_KR'],
    url: siteUrl,
    siteName: 'TXD',
    title: 'TXD — Premium Vinyl Wraps for Scooters',
    description:
      'Premium vinyl wrap cover-sets for multiple scooter models. Explore ready-made styles or create your own custom design. Professional installation, 5-year warranty.',
    images: [
      {
        url: '/images/designs/honda lead/honda-lead-0.jpg',
        width: 1200,
        height: 630,
        alt: 'TXD Premium Vinyl Wraps for Scooters',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TXD — Premium Vinyl Wraps for Scooters',
    description:
      'Premium vinyl wrap cover-sets for multiple scooter models. Explore ready-made styles or create your own custom design.',
    images: ['/images/designs/honda lead/honda-lead-0.jpg'],
    creator: '@txd',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-US': siteUrl,
      'vi-VN': `${siteUrl}?lang=vi`,
      'ko-KR': `${siteUrl}?lang=ko`,
    },
  },
  category: 'Automotive',
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
        {/* Structured Data (JSON-LD) for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'TXD',
              url: siteUrl,
              logo: `${siteUrl}/favicon.svg`,
              description:
                'Premium vinyl wrap cover-sets for multiple scooter models. Professional installation, 5-year warranty.',
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                availableLanguage: ['English', 'Vietnamese', 'Korean'],
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'TXD',
              url: siteUrl,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${siteUrl}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
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
      <body className={`${inter.variable} font-sans antialiased`}>
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
