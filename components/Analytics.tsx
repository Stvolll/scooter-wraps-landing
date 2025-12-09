'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function Analytics() {
  useEffect(() => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('config', 'G-XXXXXXXXXX', {
        page_path: window.location.pathname,
      })
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'PageView')
    }

    // Track 3D model interactions
    const track3DInteraction = (event: string, data?: any) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', event, data)
      }
    }

    // Listen for custom events
    window.addEventListener('3d-model-rotate', ((e: CustomEvent) => {
      track3DInteraction('3d_model_rotate', { model: e.detail.modelId })
    }) as EventListener)

    window.addEventListener('3d-design-change', ((e: CustomEvent) => {
      track3DInteraction('3d_design_change', {
        model: e.detail.modelId,
        designIndex: e.detail.designIndex,
      })
    }) as EventListener)

    return () => {
      window.removeEventListener('3d-model-rotate', () => {})
      window.removeEventListener('3d-design-change', () => {})
    }
  }, [])

  return (
    <>
      {/* Google Analytics 4 */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        `}
      </Script>

      {/* Facebook Pixel */}
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', 'YOUR_PIXEL_ID');
          fbq('track', 'PageView');
        `}
      </Script>
    </>
  )
}
