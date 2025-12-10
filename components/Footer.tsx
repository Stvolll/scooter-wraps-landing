'use client'

/**
 * Footer Component - Modern iOS 26 Style
 *
 * Site footer with:
 * - Brand & description
 * - Navigation links
 * - Contact information
 * - Social media links
 * - Copyright
 */

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  ArrowUpRight,
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  const { t } = useLanguage()
  const [currentYear, setCurrentYear] = useState<number>(2024)

  // Fix hydration error by setting year on client side only
  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative w-full bg-gradient-to-b from-black via-neutral-950 to-black border-t border-white/10">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#00FFA9]/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative container mx-auto px-4 md:px-8 lg:px-16 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h3 className="text-2xl font-bold text-white mb-2 hover:text-[#00FFA9] transition-colors">
                TXD
              </h3>
              <p className="text-xs text-white/40 font-mono">tem xe dep</p>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              {t('footer.description') || 'Premium vinyl wraps for scooters. Transform your ride with professional design and installation.'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              {[
                { href: '/', label: 'Home' },
                { href: '/#gallery', label: 'Gallery' },
                { href: '/#process', label: 'Process' },
                { href: '/#faq', label: 'FAQ' },
                { href: '/#contact', label: 'Contact' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/60 hover:text-[#00FFA9] transition-colors flex items-center gap-2 group"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Contact</h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:info@txd.bike"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-[#00FFA9] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#00FFA9]/10 group-hover:border-[#00FFA9]/30 transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                <span>info@txd.bike</span>
              </a>
              <a
                href="tel:+84901234567"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-[#00FFA9] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#00FFA9]/10 group-hover:border-[#00FFA9]/30 transition-all">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+84 90 123 4567</span>
              </a>
              <a
                href="https://wa.me/84901234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-[#00FFA9] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#00FFA9]/10 group-hover:border-[#00FFA9]/30 transition-all">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span>WhatsApp</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-white/60">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Ho Chi Minh City, Vietnam</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Follow Us</h4>
            <div className="flex flex-col gap-3">
              {[
                { icon: Instagram, href: 'https://instagram.com/txd.bike', label: 'Instagram' },
                { icon: Facebook, href: 'https://facebook.com/txd.bike', label: 'Facebook' },
                { icon: Youtube, href: 'https://youtube.com/@txd.bike', label: 'YouTube' },
              ].map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-white/60 hover:text-[#00FFA9] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#00FFA9]/10 group-hover:border-[#00FFA9]/30 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{social.label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-sm text-white/40 text-center md:text-left">
              <p>
                © {currentYear} TXD. {t('footer.rights') || 'All rights reserved.'}
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-white/40 hover:text-white/60 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-white/40 hover:text-white/60 transition-colors"
              >
                Terms of Service
              </Link>
            </div>

            {/* Back to Top */}
            <motion.button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-[#00FFA9]/10 hover:border-[#00FFA9]/30 flex items-center justify-center text-white/60 hover:text-[#00FFA9] transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Back to top"
            >
              <ArrowUpRight className="w-5 h-5 rotate-[-45deg]" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  )
}
