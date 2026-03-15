'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CreditCard, Truck, Package, Zap } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function CartPage() {
  const { t } = useLanguage()
  const [paymentId, setPaymentId] = useState<string>('')
  const [deliveryId, setDeliveryId] = useState<string>('')

  const PAYMENT_OPTIONS = [
    { id: 'momo', nameKey: 'cart.momo' },
    { id: 'zalopay', nameKey: 'cart.zalopay' },
    { id: 'cod', nameKey: 'cart.cod' },
    { id: 'bank', nameKey: 'cart.bankTransfer' },
    { id: 'card', nameKey: 'cart.visaMastercard' },
  ]

  const COURIER_OPTIONS = [
    { id: 'ghn', nameKey: 'cart.ghn', descKey: 'cart.ghnDesc' },
    { id: 'ghtk', nameKey: 'cart.ghtk', descKey: 'cart.ghtkDesc' },
    { id: 'viettel', nameKey: 'cart.viettelPost', descKey: 'cart.viettelPostDesc' },
    { id: 'vnpost', nameKey: 'cart.vnpost', descKey: 'cart.vnpostDesc' },
  ]

  const APP_DELIVERY_OPTIONS = [
    { id: 'grab', nameKey: 'cart.grab' },
    { id: 'be', nameKey: 'cart.be' },
  ]

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(15, 15, 15, 1) 5%, rgba(15, 15, 15, 1) 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto pt-24">
        <div className="mb-8 px-4 md:px-8 lg:px-16">
          <Link
            href="/"
            className="text-[#00FFA9] hover:text-[#00D4FF] transition-colors mb-4 block text-sm font-medium"
          >
            ← {t('cart.backToHome')}
          </Link>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">{t('cart.title')}</h1>
          <p className="text-white/60">{t('cart.subtitle')}</p>
        </div>

        <div
          className="p-6 mx-4 md:mx-8 lg:mx-16"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRadius: '28px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow:
              '0 8px 32px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
          }}
        >
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-6xl mb-4"
            >
              🛒
            </motion.div>
            <h2 className="text-2xl font-semibold text-white mb-2">{t('cart.emptyTitle')}</h2>
            <p className="text-white/60 mb-6">{t('cart.emptyHint')}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-2xl font-semibold text-black transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
              }}
            >
              {t('cart.continueShopping')}
            </Link>
          </div>

          {/* Payment and delivery options */}
          <div className="mt-10 pt-8 border-t border-white/10 space-y-8">
            <h2 className="text-xl font-semibold text-white">{t('cart.paymentAndDelivery')}</h2>

            <div>
              <h3 className="flex items-center gap-2 text-lg font-medium text-white mb-3">
                <CreditCard className="w-5 h-5 text-[#00FFA9]" />
                {t('cart.paymentMethod')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentId(opt.id)}
                    className={`px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                      paymentId === opt.id
                        ? 'bg-[#00FFA9]/20 border-2 border-[#00FFA9] text-white'
                        : 'bg-white/5 border border-white/10 text-white/90 hover:border-white/20'
                    }`}
                  >
                    {t(opt.nameKey)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                <Truck className="w-5 h-5 text-[#00FFA9]" />
                {t('cart.courierServices')}
              </h3>
              <p className="text-sm text-white/60 mb-3">
                {t('cart.courierDescription')}
              </p>
              <div className="space-y-2">
                {COURIER_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDeliveryId(opt.id)}
                    className={`w-full flex gap-3 p-3 rounded-xl text-left transition-all ${
                      deliveryId === opt.id
                        ? 'bg-[#00FFA9]/20 border-2 border-[#00FFA9]'
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Package className="w-4 h-4 text-[#00FFA9] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-white text-sm">{t(opt.nameKey)}</div>
                      <div className="text-xs text-white/60">{t(opt.descKey)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-lg font-medium text-white mb-2">
                <Zap className="w-5 h-5 text-[#00FFA9]" />
                {t('cart.fastCityDelivery')}
              </h3>
              <p className="text-sm text-white/60 mb-3">
                {t('cart.fastCityDesc')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {APP_DELIVERY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDeliveryId(opt.id)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      deliveryId === opt.id
                        ? 'bg-[#00FFA9]/20 border-2 border-[#00FFA9] text-white'
                        : 'bg-white/5 border border-white/10 text-white/90 hover:border-white/20'
                    }`}
                  >
                    {t(opt.nameKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}







