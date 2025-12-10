'use client'

/**
 * Contact Section - Get In Touch
 * Modern approach: Multiple contact methods, instant messaging, form with real-time validation
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ContactSection() {
  const { t } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    model: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message')
      }

      setSuccess(true)
      // Reset form
      setFormData({
        name: '',
        phone: '',
        model: '',
        message: '',
      })

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactMethods = [
    {
      icon: '📱',
      title: 'WhatsApp',
      value: '+84 xxx xxx xxx',
      action: t('contactSection.chatNow'),
      color: '#25D366',
      link: 'https://wa.me/84xxxxxxxxx',
    },
    {
      icon: '📞',
      title: 'Phone',
      value: '+84 xxx xxx xxx',
      action: t('contactSection.callNow'),
      color: '#00D4FF',
      link: 'tel:+84xxxxxxxxx',
    },
    {
      icon: '✉️',
      title: 'Email',
      value: 'hello@txd.vn',
      action: t('contactSection.sendEmail'),
      color: '#B77EFF',
      link: 'mailto:hello@txd.vn',
    },
    {
      icon: '📍',
      title: 'Location',
      value: 'Ho Chi Minh City',
      action: t('contactSection.getDirections'),
      color: '#FFB800',
      link: '#',
    },
  ]

  const socialMedia = [
    { name: 'Facebook', icon: 'facebook', link: '#', color: '#1877F2' },
    { name: 'Instagram', icon: 'instagram', link: '#', color: '#E4405F' },
    { name: 'Zalo', icon: 'zalo', link: '#', color: '#0068FF' },
    { name: 'TikTok', icon: 'tiktok', link: '#', color: '#000000' },
  ]

  return (
    <section className="relative pt-12 md:pt-16 pb-20 md:pb-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900 to-black" />

      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00FFA9] rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00D4FF] rounded-full blur-[128px]" />
      </div>

      <div className="relative container mx-auto px-4 md:px-8 lg:px-16">
        {/* Section header */}
        <motion.div
          initial={isMounted ? { opacity: 0, y: 20 } : false}
          animate={isMounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {t('contactSection.title')}
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            {t('contactSection.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left: Contact Methods */}
          <motion.div
            initial={isMounted ? { opacity: 0, x: -30 } : false}
            animate={isMounted ? { opacity: 1, x: 0 } : false}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold text-white mb-6">
              {t('contactSection.contactMethods')}
            </h3>

            {/* Quick contact cards */}
            <div className="space-y-4 mb-8">
              {contactMethods.map((method, index) => (
                <motion.a
                  key={method.title}
                  href={method.link}
                  initial={isMounted ? { opacity: 0, x: -20 } : false}
                  animate={isMounted ? { opacity: 1, x: 0 } : false}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={isMounted ? { scale: 1.02, x: 5 } : undefined}
                  className="block group"
                >
                  <div
                    className="p-4 rounded-2xl flex items-center gap-4 transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{
                        background: `${method.color}20`,
                        border: `1px solid ${method.color}40`,
                      }}
                    >
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white/60">{method.title}</div>
                      <div className="text-white font-semibold">{method.value}</div>
                    </div>
                    <div className="text-sm font-medium text-white/60 group-hover:text-[#00FFA9] transition-colors">
                      {method.action} →
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Social media */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                {t('contactSection.followUs')}
              </h4>
              <div className="flex gap-3">
                {socialMedia.map(social => (
                  <a
                    key={social.name}
                    href={social.link}
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    aria-label={social.name}
                  >
                    <span className="text-xl">
                      {social.icon === 'facebook'
                        ? '📘'
                        : social.icon === 'instagram'
                          ? '📸'
                          : social.icon === 'zalo'
                            ? '💬'
                            : '🎵'}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Business hours */}
            <div
              className="mt-8 p-4 rounded-2xl"
              style={{
                background: 'rgba(0, 255, 169, 0.05)',
                border: '1px solid rgba(0, 255, 169, 0.2)',
              }}
            >
              <h4 className="text-white font-semibold mb-2">{t('contactSection.businessHours')}</h4>
              <div className="text-sm text-white/60 space-y-1">
                <div>{t('contactSection.mondaySaturday')}</div>
                <div>{t('contactSection.sunday')}</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={isMounted ? { opacity: 0, x: 30 } : false}
            animate={isMounted ? { opacity: 1, x: 0 } : false}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-2xl font-semibold text-white mb-6">
              {t('contactSection.sendMessage')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  {t('contactSection.yourName')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFA9] transition-colors"
                  placeholder="Nguyen Van A"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  {t('contactSection.phoneNumber')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFA9] transition-colors"
                  placeholder="+84 xxx xxx xxx"
                  required
                />
              </div>

              {/* Scooter Model */}
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  {t('contactSection.scooterModel')}
                </label>
                <select
                  value={formData.model}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00FFA9] transition-colors"
                  required
                >
                  <option value="">{t('contactSection.selectModel')}</option>
                  <option value="lead">Honda Lead</option>
                  <option value="vision">Honda Vision</option>
                  <option value="sh">Honda SH</option>
                  <option value="pcx">Honda PCX</option>
                  <option value="nvx">Yamaha NVX</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  {t('contactSection.messageOptional')}
                </label>
                <textarea
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFA9] transition-colors resize-none"
                  placeholder={t('contactSection.messagePlaceholder')}
                  rows={4}
                />
              </div>

              {/* Success message */}
              {success && (
                <div className="p-4 rounded-2xl bg-[#00FFA9]/20 border border-[#00FFA9]/30 text-[#00FFA9] text-sm">
                  {t('contactSection.success') || 'Thank you! We will contact you within 2 hours.'}
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-black transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                  boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
                }}
              >
                {loading
                  ? t('contactSection.sending') || 'Sending...'
                  : t('contactSection.send')}
              </button>

              {/* Privacy note */}
              <p className="text-xs text-white/40 text-center">{t('contactSection.privacyNote')}</p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
