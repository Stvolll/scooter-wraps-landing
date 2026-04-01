'use client'

/**
 * Asia Installation Map Component
 * Interactive map showing installation services across Asian countries
 * Hierarchical navigation: Countries -> Cities -> Partners
 * Using Google Maps Embed API with iOS 26 styling
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Globe,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface InstallationPartner {
  id: string
  name: string
  address: string
  phone: string
  email?: string
  whatsapp?: string
  priceRange: {
    min: number
    max: number
  }
  hasDiscount: boolean
  discountPercent?: number
  status: 'active' | 'pending' | 'coming-soon'
  coordinates: {
    lat: number
    lng: number
  }
}

interface City {
  id: string
  name: string
  nameKo?: string
  coordinates: {
    lat: number
    lng: number
  }
  partners: InstallationPartner[]
}

interface Country {
  id: string
  name: string
  nameVi: string
  nameKo?: string
  coordinates: {
    lat: number
    lng: number
  }
  cities: City[]
}

// Mock data - в будущем заменить на данные из БД
// Только Вьетнам, разделенный по городам
const cities: City[] = [
  {
    id: 'hcm',
    name: 'Ho Chi Minh City',
    coordinates: { lat: 10.7769, lng: 106.7009 },
    partners: [
      {
        id: 'hcm-1',
        name: 'Premium Wrap Studio HCM',
        address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
        phone: '+84 28 1234 5678',
        email: 'hcm@txd.bike',
        whatsapp: '+84 90 123 4567',
        priceRange: { min: 500000, max: 800000 },
        hasDiscount: true,
        discountPercent: 15,
        status: 'active',
        coordinates: { lat: 10.7769, lng: 106.7009 },
      },
      {
        id: 'hcm-2',
        name: 'District 7 Installation Point',
        address: '456 Nguyen Van Linh Street, District 7, Ho Chi Minh City',
        phone: '+84 28 2345 6789',
        email: 'hcm2@txd.bike',
        whatsapp: '+84 91 234 5678',
        priceRange: { min: 550000, max: 850000 },
        hasDiscount: false,
        status: 'active',
        coordinates: { lat: 10.7300, lng: 106.7200 },
      },
    ],
  },
  {
    id: 'hanoi',
    name: 'Hanoi',
    coordinates: { lat: 21.0285, lng: 105.8542 },
    partners: [
      {
        id: 'hanoi-1',
        name: 'TXD Installation Center Hanoi',
        address: '456 Hoan Kiem Street, Hoan Kiem District, Hanoi',
        phone: '+84 24 5678 9012',
        email: 'hanoi@txd.bike',
        whatsapp: '+84 91 234 5678',
        priceRange: { min: 600000, max: 900000 },
        hasDiscount: false,
        status: 'active',
        coordinates: { lat: 21.0285, lng: 105.8542 },
      },
      {
        id: 'hanoi-2',
        name: 'Cau Giay Installation Point',
        address: '789 Cau Giay Street, Cau Giay District, Hanoi',
        phone: '+84 24 6789 0123',
        email: 'hanoi2@txd.bike',
        whatsapp: '+84 92 345 6789',
        priceRange: { min: 650000, max: 950000 },
        hasDiscount: true,
        discountPercent: 10,
        status: 'active',
        coordinates: { lat: 21.0400, lng: 105.8000 },
      },
    ],
  },
  {
    id: 'danang',
    name: 'Da Nang',
    coordinates: { lat: 16.0544, lng: 108.2022 },
    partners: [
      {
        id: 'danang-1',
        name: 'Coastal Wrap Services',
        address: '789 Bach Dang Street, Hai Chau District, Da Nang',
        phone: '+84 236 1234 567',
        email: 'danang@txd.bike',
        whatsapp: '+84 92 345 6789',
        priceRange: { min: 550000, max: 850000 },
        hasDiscount: true,
        discountPercent: 10,
        status: 'active',
        coordinates: { lat: 16.0544, lng: 108.2022 },
      },
    ],
  },
]

export default function VietnamInstallationMap() {
  const { t, language } = useLanguage()
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedPartner, setSelectedPartner] = useState<InstallationPartner | null>(null)

  const handleCityClick = (city: City) => {
    setSelectedCity(city)
    setSelectedPartner(null)
  }

  const handlePartnerClick = (partner: InstallationPartner) => {
    setSelectedPartner(prev => (prev?.id === partner.id ? null : partner))
  }

  const handleBack = () => {
    if (selectedCity) {
      setSelectedCity(null)
    }
    setSelectedPartner(null)
  }

  const getCityName = (city: City) => {
    return city.name
  }

  return (
    <section className="relative py-12 md:py-20 overflow-hidden rounded-3xl">
      {/* Clean background */}
      <div className="absolute inset-0 bg-neutral-950" />

      {/* Content Layer */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FFA9]/10 border border-[#00FFA9]/20 mb-6 backdrop-blur-xl">
            <Globe className="w-4 h-4 text-[#00FFA9]" />
            <span className="text-xs font-semibold text-[#00FFA9] uppercase tracking-wider">
              {t('installationServices.installationNetwork')}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 pb-2 text-center bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent leading-tight">
            {t('installationServices.title')}
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            {t('installationServices.subtitle')}
          </p>
        </motion.div>

        {/* Breadcrumb Navigation */}
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 text-sm text-white/60"
          >
            <button
              onClick={handleBack}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>
                {language === 'vi' ? 'Tất cả thành phố' : 'All Cities'}
              </span>
            </button>
            {selectedCity && (
              <>
                <ArrowRight className="w-4 h-4" />
                <span className="text-white">{selectedCity.name}</span>
              </>
            )}
          </motion.div>
        )}

        {/* Cities Grid - Show when no city selected */}
        {!selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6"
          >
            {cities.map((city, index) => {
              const activePartner = city.partners.find(p => p.status === 'active')

              return (
                <motion.button
                  key={city.id}
                  onClick={() => handleCityClick(city)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00FFA9]/30 transition-all backdrop-blur-xl group relative overflow-hidden flex flex-col"
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Icon and City Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#00FFA9]/15 border border-[#00FFA9]/25 flex items-center justify-center group-hover:bg-[#00FFA9]/25 transition-colors flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#00FFA9]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-base leading-tight truncate">{getCityName(city)}</h3>
                      {activePartner && (
                        <p className="text-[11px] text-white/50 mt-0.5">
                          {city.partners.length} {city.partners.length > 1 ? t('installationServices.locations') : t('installationServices.location')}
                        </p>
                      )}
                    </div>
                  </div>

                </motion.button>
              )
            })}
          </motion.div>
        )}

        {/* Partners Grid - Show when city selected */}
        {selectedCity && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {selectedCity.partners.map((partner, index) => {
                const isSelected = selectedPartner?.id === partner.id
                return (
                  <motion.button
                    key={partner.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handlePartnerClick(partner)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`text-left p-5 rounded-2xl border transition-all backdrop-blur-xl group relative overflow-hidden flex flex-col ${
                      isSelected
                        ? 'ring-2 ring-[#00FFA9]/45 border-[#00FFA9]/35 bg-white/10 shadow-[0_0_28px_rgba(0,255,169,0.15)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#00FFA9]/30'
                    }`}
                    style={{
                      boxShadow: isSelected
                        ? '0 6px 28px -2px rgba(0, 255, 169, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                        : '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="mb-4">
                      <h3 className="font-bold text-white text-lg leading-tight mb-2">{partner.name}</h3>
                      <p className="text-xs text-white/60 line-clamp-2">{partner.address}</p>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>

            <div
              className={`relative transition-all duration-300 ease-out ${
                selectedPartner ? 'mt-6 pb-2' : 'mt-2'
              }`}
            >
              <AnimatePresence mode="wait">
                {selectedPartner && selectedCity && (
                  <motion.div
                    key={selectedPartner.id}
                    role="region"
                    aria-live="polite"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="top-0 left-0 w-full max-w-2xl text-left rounded-2xl p-6 md:p-8"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(16px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                      boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{selectedPartner.name}</h3>
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span>
                            {getCityName(selectedCity)}, {language === 'vi' ? 'Việt Nam' : 'Vietnam'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPartner(null)}
                        className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                        aria-label={language === 'vi' ? 'Đóng chi tiết' : 'Close details'}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-[#00FFA9]" />
                          <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                            {t('installationServices.address')}
                          </div>
                        </div>
                        <div className="text-white leading-relaxed">{selectedPartner.address}</div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-white uppercase tracking-wider">
                          {t('installationServices.contact')}
                        </div>
                        <a
                          href={`tel:${selectedPartner.phone}`}
                          className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#00FFA9]/10 border border-[#00FFA9]/30 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-[#00FFA9]" />
                          </div>
                          <div>
                            <div className="text-sm text-white/60">{t('installationServices.phone')}</div>
                            <div className="text-white">{selectedPartner.phone}</div>
                          </div>
                        </a>

                        {selectedPartner.whatsapp && (
                          <a
                            href={`https://wa.me/${selectedPartner.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                          >
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                              <MessageCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <div className="text-sm text-white/60">{t('installationServices.whatsapp')}</div>
                              <div className="text-white">{selectedPartner.whatsapp}</div>
                            </div>
                          </a>
                        )}

                        {selectedPartner.email && (
                          <a
                            href={`mailto:${selectedPartner.email}`}
                            className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                          >
                            <div className="w-10 h-10 rounded-xl bg-[#00FFA9]/10 border border-[#00FFA9]/30 flex items-center justify-center">
                              <Mail className="w-5 h-5 text-[#00FFA9]" />
                            </div>
                            <div>
                              <div className="text-sm text-white/60">{t('installationServices.email')}</div>
                              <div className="text-white">{selectedPartner.email}</div>
                            </div>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                        {selectedPartner.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-[#00FFA9] shrink-0" />
                            <span className="text-sm text-white/60">
                              Service is active and accepting bookings
                            </span>
                          </>
                        ) : selectedPartner.status === 'pending' ? (
                          <>
                            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
                            <span className="text-sm text-white/60">Service is pending approval</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-white/40 shrink-0" />
                            <span className="text-sm text-white/60">Coming soon</span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
