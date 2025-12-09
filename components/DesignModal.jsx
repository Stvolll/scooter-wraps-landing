'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DesignModal({ design, scooter, isOpen, onClose, onBuy }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !design) return null

  const handleBuy = () => {
    // GA4 event tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase_intent', {
        item_name: `${scooter.name} - ${design.name}`,
        item_category: 'scooter_wrap',
        value: 0,
        currency: 'USD',
      })
    }

    // DataLayer event
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'design_selected',
        design_id: design.id,
        scooter_name: scooter.name,
        design_name: design.name,
      })
    }

    onBuy?.(design)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 text-2xl"
        >
          ×
        </button>

        <div className="p-8">
          <h2 className="text-3xl font-bold mb-4">{design.name}</h2>
          <p className="text-neutral-600 mb-6">{scooter.name}</p>

          {design.preview && (
            <div className="relative w-full aspect-video mb-6">
              <Image
                src={design.preview}
                alt={design.name}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          )}

          <button
            onClick={handleBuy}
            className="w-full py-4 bg-accent-neon text-accent-dark font-semibold rounded-lg hover:bg-accent-neon/90 transition-colors"
          >
            Купить
          </button>
        </div>
      </div>
    </div>
  )
}
