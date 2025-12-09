'use client'

/**
 * Footer Component
 *
 * Site footer with:
 * - Brand description
 * - Navigation links
 * - Language switcher
 * - Social links (placeholders)
 * - Copyright
 */

import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Footer() {
  const { t } = useLanguage()

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer
      className="bg-black text-neutral-300 py-16 px-4 md:px-8 lg:px-16 w-full relative"
      style={{
        zIndex: 100,
        backgroundColor: '#000000',
        minHeight: '200px',
      }}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Description */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">TXD</h3>
            <p className="text-neutral-400 leading-relaxed">{t('footer.description')}</p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('gallery')}
                  className="text-neutral-400 hover:text-accent-neon transition-colors"
                >
                  {t('footer.links.gallery')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-neutral-400 hover:text-accent-neon transition-colors"
                >
                  {t('footer.links.custom')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const donate = document.querySelector('[id*="donate"]')
                    donate?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-neutral-400 hover:text-accent-neon transition-colors"
                >
                  {t('footer.links.donate')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-neutral-400 hover:text-accent-neon transition-colors"
                >
                  {t('footer.links.contact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Social & Language */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t('footer.social')}</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                {/* Placeholder social links */}
                <a
                  href="#"
                  className="text-neutral-400 hover:text-accent-neon transition-colors"
                  aria-label="Facebook"
                >
                  Facebook
                </a>
                <a
                  href="#"
                  className="text-neutral-400 hover:text-accent-neon transition-colors"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
              </div>
              <div>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-800 pt-8 text-center text-neutral-500">
          <p>
            © {new Date().getFullYear()} TXD. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
