'use client'

/**
 * ContactForm Component
 * 
 * Form for custom design requests.
 * Fields: name, email, phone/messenger, scooter model, message/brief
 * 
 * In production, wire to backend API endpoint.
 */

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { models } from '@/lib/designsData'

export default function ContactForm() {
  const { language, t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    model: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    // TODO: Wire to backend API
    // Example:
    // try {
    //   const response = await fetch('/api/contact', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData),
    //   })
    //   if (response.ok) {
    //     setSubmitStatus('success')
    //     setFormData({ name: '', email: '', phone: '', model: '', message: '' })
    //   } else {
    //     setSubmitStatus('error')
    //   }
    // } catch (error) {
    //   setSubmitStatus('error')
    // } finally {
    //   setIsSubmitting(false)
    // }

    // Mock submission for now
    setTimeout(() => {
      setSubmitStatus('success')
      setIsSubmitting(false)
      setFormData({ name: '', email: '', phone: '', model: '', message: '' })
    }, 1000)
  }

  return (
    <section id="contact" className="py-20 px-4 md:px-8 lg:px-16 bg-neutral-50">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-neutral-600">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="premium-card p-8 space-y-6"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-2">
              {t('contact.name')}
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-accent-neon"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              {t('contact.email')}
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-accent-neon"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold mb-2">
              {t('contact.phone')}
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-accent-neon"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-semibold mb-2">
              {t('contact.model')}
            </label>
            <select
              id="model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-accent-neon"
            >
              <option value="">{t('contact.model')}</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {language === 'vi' ? model.nameVi : model.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-semibold mb-2">
              {t('contact.message')}
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-accent-neon resize-none"
            />
          </div>

          {submitStatus === 'success' && (
            <div className="p-4 bg-green-100 text-green-700 rounded-lg">
              {t('contact.success')}
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {t('contact.error')}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : t('contact.send')}
          </motion.button>
        </motion.form>
      </div>
    </section>
  )
}

