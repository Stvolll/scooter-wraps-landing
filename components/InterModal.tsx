'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface InterModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InterModal({ isOpen, onClose }: InterModalProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (username === 'Stvolll' && password === 'a840309A') {
      router.push('/admin')
      onClose()
    } else {
      setError(t('inter.error'))
    }

    setLoading(false)
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
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md mx-4 p-8 rounded-3xl bg-white/5 border border-white/10"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">{t('inter.title')}</h2>
            <p className="text-sm text-white/60">{t('inter.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                {t('inter.username')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#00FFA9] focus:bg-white/10 transition-all"
                placeholder={t('inter.usernamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                {t('inter.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#00FFA9] focus:bg-white/10 transition-all"
                placeholder={t('inter.passwordPlaceholder')}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/20 border border-red-500/30 p-3 rounded-2xl">
                {error}
              </div>
            )}

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
                {loading ? t('inter.logging') : t('inter.login')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-2xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all border border-white/20"
              >
                {t('inter.cancel')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
