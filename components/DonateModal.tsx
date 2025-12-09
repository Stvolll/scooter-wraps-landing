'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface DonateModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DonateModal({ isOpen, onClose }: DonateModalProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    amount: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        setSuccess(false)
        onClose()
        setFormData({ name: '', email: '', amount: '', message: '' })
      }, 2000)
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-md mx-4 p-8 rounded-3xl bg-white/5 border border-white/10"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">{t('donate.title')}</h2>
            <p className="text-sm text-white/60">{t('donate.subtitle')}</p>
          </div>

          {success ? (
            <div className="text-center py-12">
              <div className="text-[#00FFA9] text-6xl mb-4">✓</div>
              <p className="text-white font-semibold text-lg">{t('donate.success')}</p>
              <p className="text-white/60 text-sm mt-2">{t('donate.successDescription')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  {t('donate.name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#00FFA9] focus:bg-white/10 transition-all"
                  placeholder={t('donate.name')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  {t('donate.email')} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#00FFA9] focus:bg-white/10 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  {t('donate.amount')} *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  required
                  min="1"
                  step="1"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#00FFA9] focus:bg-white/10 transition-all"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  {t('donate.message')}
                </label>
                <textarea
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#00FFA9] focus:bg-white/10 transition-all resize-none"
                  placeholder={t('donate.messagePlaceholder')}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-2xl font-semibold text-black transition-all duration-300 hover:scale-105 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                    boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
                  }}
                >
                  {loading ? t('donate.investing') : t('donate.invest')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all border border-white/20"
                >
                  {t('donate.cancel')}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
