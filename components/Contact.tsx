'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'

export default function Contact() {
  const { lang } = useTranslations()
  const sectionTitle = lang === 'vi' ? 'Liên hệ với chúng tôi' : 'Contact us'
  const sectionSubtitle =
    lang === 'vi'
      ? 'Có câu hỏi? Chúng tôi luôn sẵn sàng hỗ trợ bạn'
      : 'Have a question? Our team is here to help you.'
  const phoneLabel = lang === 'vi' ? 'Điện thoại' : 'Phone'
  const emailLabel = lang === 'vi' ? 'Email' : 'Email'
  const zaloLabel = lang === 'vi' ? 'Zalo' : 'Zalo'
  const zaloCta = lang === 'vi' ? 'Chat ngay' : 'Chat now'
  const addressLabel = lang === 'vi' ? 'Địa chỉ' : 'Address'
  const addressValue = lang === 'vi' ? '123 Trần Phú, Nha Trang' : '123 Tran Phu Street, Nha Trang'
  const socialTitle =
    lang === 'vi' ? 'Theo dõi chúng tôi trên mạng xã hội' : 'Follow us on social media'

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{sectionTitle}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{sectionSubtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.a
            href="tel:+84123456789"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary-50 rounded-xl p-6 text-center hover:bg-primary-100 transition-colors"
          >
            <Phone className="text-primary-600 mx-auto mb-4" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">{phoneLabel}</h3>
            <p className="text-primary-600 font-medium">+84 123 456 789</p>
          </motion.a>

          <motion.a
            href="mailto:info@decalwrap.vn"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-primary-50 rounded-xl p-6 text-center hover:bg-primary-100 transition-colors"
          >
            <Mail className="text-primary-600 mx-auto mb-4" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">{emailLabel}</h3>
            <p className="text-primary-600 font-medium">info@decalwrap.vn</p>
          </motion.a>

          <motion.a
            href="https://zalo.me/123456789"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-primary-50 rounded-xl p-6 text-center hover:bg-primary-100 transition-colors"
          >
            <MessageCircle className="text-primary-600 mx-auto mb-4" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">{zaloLabel}</h3>
            <p className="text-primary-600 font-medium">{zaloCta}</p>
          </motion.a>

          <motion.a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-primary-50 rounded-xl p-6 text-center hover:bg-primary-100 transition-colors"
          >
            <MapPin className="text-primary-600 mx-auto mb-4" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">{addressLabel}</h3>
            <p className="text-primary-600 font-medium text-sm">{addressValue}</p>
          </motion.a>
        </div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{socialTitle}</h3>
          <div className="flex justify-center space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={24} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
