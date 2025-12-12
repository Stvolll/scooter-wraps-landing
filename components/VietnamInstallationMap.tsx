'use client'

/**
 * Asia Installation Map Component
 * Interactive map showing installation services across Asian countries
 * Hierarchical navigation: Countries -> Cities -> Partners
 * Using Google Maps Embed API with iOS 26 styling
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Tag,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Globe,
  Building2,
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
const countries: Country[] = [
  {
    id: 'vietnam',
    name: 'Vietnam',
    nameVi: 'Việt Nam',
    coordinates: { lat: 16.0544, lng: 108.2022 },
    cities: [
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
    ],
  },
  {
    id: 'thailand',
    name: 'Thailand',
    nameVi: 'Thái Lan',
    coordinates: { lat: 13.7563, lng: 100.5018 },
    cities: [
      {
        id: 'bangkok',
        name: 'Bangkok',
        coordinates: { lat: 13.7563, lng: 100.5018 },
        partners: [
          {
            id: 'bangkok-1',
            name: 'Bangkok Wrap Studio',
            address: '123 Sukhumvit Road, Bangkok',
            phone: '+66 2 1234 5678',
            email: 'bangkok@txd.bike',
            whatsapp: '+66 81 234 5678',
            priceRange: { min: 8000, max: 12000 },
            hasDiscount: false,
            status: 'active',
            coordinates: { lat: 13.7563, lng: 100.5018 },
          },
        ],
      },
    ],
  },
  {
    id: 'south-korea',
    name: 'South Korea',
    nameVi: 'Hàn Quốc',
    nameKo: '대한민국',
    coordinates: { lat: 37.5665, lng: 126.9780 },
    cities: [
      {
        id: 'seoul',
        name: 'Seoul',
        nameKo: '서울',
        coordinates: { lat: 37.5665, lng: 126.9780 },
        partners: [
          {
            id: 'seoul-1',
            name: 'Seoul Wrap Studio',
            address: '123 Gangnam-daero, Gangnam-gu, Seoul',
            phone: '+82 2 1234 5678',
            email: 'seoul@txd.bike',
            whatsapp: '+82 10 1234 5678',
            priceRange: { min: 150000, max: 250000 },
            hasDiscount: true,
            discountPercent: 15,
            status: 'active',
            coordinates: { lat: 37.5665, lng: 126.9780 },
          },
        ],
      },
    ],
  },
]

// Center of Asia for map view
const asiaCenter = '20.0,100.0' // Center of Asia
const asiaZoom = 4 // Zoom level to show all of Asia

export default function VietnamInstallationMap() {
  const { t, language } = useLanguage()
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedPartner, setSelectedPartner] = useState<InstallationPartner | null>(null)
  const [mapLocation, setMapLocation] = useState<string>(asiaCenter)
  const [mapZoom, setMapZoom] = useState<number>(asiaZoom)
  const [isMounted, setIsMounted] = useState(false)

  // Fix hydration error - only render map on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatPrice = (price: number, countryId?: string) => {
    if (countryId === 'thailand') {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
      }).format(price)
    } else if (countryId === 'south-korea') {
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        minimumFractionDigits: 0,
      }).format(price)
    }
    // Default to VND for Vietnam
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Get all partners from all countries
  const getAllPartners = (): InstallationPartner[] => {
    return countries.flatMap(country => 
      country.cities.flatMap(city => city.partners)
    )
  }

  // Generate Google Maps URL with markers
  const getMapUrl = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    
    // If country selected, show country markers
    // If city selected, show city markers
    // Otherwise show all partners
    let markers: InstallationPartner[] = []
    
    if (selectedCity) {
      markers = selectedCity.partners
    } else if (selectedCountry) {
      markers = selectedCountry.cities.flatMap(city => city.partners)
    } else {
      markers = getAllPartners()
    }

    if (!apiKey) {
      return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${mapLocation}&zoom=${mapZoom}&maptype=roadmap`
    }

    // Build markers query
    const markersQuery = markers
      .map(
        partner =>
          `markers=color:${partner.hasDiscount ? 'gold' : partner.status === 'active' ? '0x00FFA9' : 'gray'}|${partner.coordinates.lat},${partner.coordinates.lng}`
      )
      .join('&')

    return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${mapLocation}&zoom=${mapZoom}&maptype=roadmap&${markersQuery}`
  }

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country)
    setSelectedCity(null)
    setSelectedPartner(null)
    setMapLocation(`${country.coordinates.lat},${country.coordinates.lng}`)
    setMapZoom(6)
  }

  const handleCityClick = (city: City) => {
    setSelectedCity(city)
    setSelectedPartner(null)
    setMapLocation(`${city.coordinates.lat},${city.coordinates.lng}`)
    setMapZoom(10)
  }

  const handlePartnerClick = (partner: InstallationPartner) => {
    setSelectedPartner(partner)
    setMapLocation(`${partner.coordinates.lat},${partner.coordinates.lng}`)
    setMapZoom(12)
  }

  const handleBack = () => {
    if (selectedCity) {
      setSelectedCity(null)
      if (selectedCountry) {
        setMapLocation(`${selectedCountry.coordinates.lat},${selectedCountry.coordinates.lng}`)
        setMapZoom(6)
      }
    } else if (selectedCountry) {
      setSelectedCountry(null)
      setMapLocation(asiaCenter)
      setMapZoom(asiaZoom)
    }
    setSelectedPartner(null)
  }

  const getCountryName = (country: Country) => {
    if (language === 'vi') return country.nameVi
    if (language === 'ko' && country.nameKo) return country.nameKo
    return country.name
  }

  const getCityName = (city: City) => {
    if (language === 'ko' && city.nameKo) return city.nameKo
    return city.name
  }

  return (
    <section className="relative py-20 md:py-32 overflow-hidden min-h-screen rounded-3xl">
      {/* Map as Background */}
      <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden">
        {isMounted ? (
          <iframe
            width="100%"
            height="100%"
            style={{
              border: 0,
              filter: 'grayscale(100%) brightness(0.3) contrast(0.8) blur(2px)',
              pointerEvents: 'none',
            }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={getMapUrl()}
            title="Asia Installation Services Map Background"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-black" />
        )}
      </div>

      {/* Dark Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />

      {/* Content Layer */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-16 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FFA9]/10 border border-[#00FFA9]/20 mb-4 backdrop-blur-xl">
            <Globe className="w-4 h-4 text-[#00FFA9]" />
            <span className="text-xs font-semibold text-[#00FFA9] uppercase tracking-wider">
              {t('installationServices.installationNetwork')}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
            {t('installationServices.title')}
          </h2>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            {t('installationServices.subtitle')}
          </p>
        </motion.div>

        {/* Breadcrumb Navigation */}
        {(selectedCountry || selectedCity) && (
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
                {language === 'vi' ? 'Tất cả quốc gia' : 
                 language === 'ko' ? '모든 국가' : 
                 'All Countries'}
              </span>
            </button>
            {selectedCountry && (
              <>
                <ArrowRight className="w-4 h-4" />
                <button
                  onClick={() => {
                    setSelectedCity(null)
                    setSelectedPartner(null)
                    if (selectedCountry) {
                      setMapLocation(`${selectedCountry.coordinates.lat},${selectedCountry.coordinates.lng}`)
                      setMapZoom(6)
                    }
                  }}
                  className="hover:text-white transition-colors"
                >
                  {getCountryName(selectedCountry)}
                </button>
              </>
            )}
            {selectedCity && (
              <>
                <ArrowRight className="w-4 h-4" />
                <span className="text-white">{selectedCity.name}</span>
              </>
            )}
          </motion.div>
        )}

        {/* Countries Grid - Show when no country selected */}
        {!selectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12"
          >
            {countries.map((country, index) => {
              const totalPartners = country.cities.reduce((sum, city) => sum + city.partners.length, 0)
              const activePartners = country.cities.flatMap(city => city.partners).filter(p => p.status === 'active')
              const hasDiscount = country.cities.some(city => city.partners.some(p => p.hasDiscount))

              return (
                <motion.button
                  key={country.id}
                  onClick={() => handleCountryClick(country)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-left p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00FFA9]/30 transition-all backdrop-blur-xl group relative overflow-hidden flex flex-col"
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Discount badge */}
                  {hasDiscount && (
                    <div className="absolute top-3 right-3 z-10">
                      <motion.span
                        initial={{ scale: 0, rotate: -12 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#FFD700]/25 to-[#FFA500]/25 text-[#FFD700] text-[10px] font-bold border border-[#FFD700]/50 flex items-center gap-1"
                        style={{
                          boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
                        }}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{t('installationServices.sale')}</span>
                      </motion.span>
                    </div>
                  )}

                  {/* Icon and Country Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#00FFA9]/15 border border-[#00FFA9]/25 flex items-center justify-center group-hover:bg-[#00FFA9]/25 transition-colors flex-shrink-0">
                      <Globe className="w-6 h-6 text-[#00FFA9]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg leading-tight">{getCountryName(country)}</h3>
                      <p className="text-xs text-white/50 mt-1">
                        {activePartners.length} {activePartners.length > 1 ? t('installationServices.locations') : t('installationServices.location')}
                      </p>
                    </div>
                  </div>

                  {/* Cities count */}
                  <div className="mt-auto pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Building2 className="w-4 h-4" />
                      <span>
                        {country.cities.length} {
                          country.cities.length > 1 
                            ? (language === 'vi' ? 'thành phố' : language === 'ko' ? '도시' : 'cities')
                            : (language === 'vi' ? 'thành phố' : language === 'ko' ? '도시' : 'city')
                        }
                      </span>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        )}

        {/* Cities Grid - Show when country selected */}
        {selectedCountry && !selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12"
          >
            {selectedCountry.cities.map((city, index) => {
              const activePartner = city.partners.find(p => p.status === 'active')
              const hasDiscount = city.partners.some(p => p.hasDiscount)

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
                  {/* Discount badge */}
                  {hasDiscount && (
                    <div className="absolute top-3 right-3 z-10">
                      <motion.span
                        initial={{ scale: 0, rotate: -12 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#FFD700]/25 to-[#FFA500]/25 text-[#FFD700] text-[10px] font-bold border border-[#FFD700]/50 flex items-center gap-1"
                        style={{
                          boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
                        }}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{t('installationServices.sale')}</span>
                      </motion.span>
                    </div>
                  )}

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

                  {/* Price - Bottom */}
                  {activePartner && (
                    <div className="mt-auto pt-3 border-t border-white/5">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-lg font-bold text-[#00FFA9] leading-none">
                          {formatPrice(activePartner.priceRange.min, selectedCountry.id)}
                        </span>
                        <span className="text-white/30 text-sm">—</span>
                        <span className="text-lg font-bold text-[#00FFA9] leading-none break-words">
                          {formatPrice(activePartner.priceRange.max, selectedCountry.id)}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        )}

        {/* Partners Grid - Show when city selected */}
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12"
          >
            {selectedCity.partners.map((partner, index) => (
              <motion.button
                key={partner.id}
                onClick={() => handlePartnerClick(partner)}
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
                {/* Discount badge */}
                {partner.hasDiscount && (
                  <div className="absolute top-3 right-3 z-10">
                    <motion.span
                      initial={{ scale: 0, rotate: -12 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#FFD700]/25 to-[#FFA500]/25 text-[#FFD700] text-[10px] font-bold border border-[#FFD700]/50 flex items-center gap-1"
                      style={{
                        boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
                      }}
                    >
                      <Tag className="w-3 h-3" />
                      <span>{t('installationServices.sale')}</span>
                    </motion.span>
                  </div>
                )}

                {/* Partner Name */}
                <div className="mb-4">
                  <h3 className="font-bold text-white text-lg leading-tight mb-2">{partner.name}</h3>
                  <p className="text-xs text-white/60 line-clamp-2">{partner.address}</p>
                </div>

                {/* Price - Bottom */}
                <div className="mt-auto pt-3 border-t border-white/5">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-lg font-bold text-[#00FFA9] leading-none">
                      {formatPrice(partner.priceRange.min, selectedCountry?.id)}
                    </span>
                    <span className="text-white/30 text-sm">—</span>
                    <span className="text-lg font-bold text-[#00FFA9] leading-none break-words">
                      {formatPrice(partner.priceRange.max, selectedCountry?.id)}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl">
            <div className="w-4 h-4 rounded-full bg-[#00FFA9] shadow-lg shadow-[#00FFA9]/50" />
            <span className="text-sm font-medium text-white/90">{t('installationServices.activeService')}</span>
          </div>
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl">
            <div className="w-4 h-4 rounded-full bg-white/30 border border-white/20" />
            <span className="text-sm font-medium text-white/90">{t('installationServices.comingSoon')}</span>
          </div>
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl">
            <div className="w-4 h-4 rounded-full bg-[#FFD700] shadow-lg shadow-[#FFD700]/50" />
            <span className="text-sm font-medium text-white/90">{t('installationServices.specialDiscount')}</span>
          </div>
        </motion.div>

        {/* Partner Detail Modal */}
        <AnimatePresence>
          {selectedPartner && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                onClick={() => setSelectedPartner(null)}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50 bg-gradient-to-br from-neutral-900/95 via-neutral-950/95 to-black/95 border border-white/10 rounded-3xl p-8 overflow-y-auto max-h-[90vh] backdrop-blur-2xl"
                style={{
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
              >
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        {selectedPartner.name}
                      </h3>
                      {selectedPartner.hasDiscount && (
                        <span className="px-3 py-1 rounded-full bg-[#FFD700]/20 text-[#FFD700] text-sm font-medium border border-[#FFD700]/30 flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {selectedPartner.discountPercent}% {t('installationServices.off')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedCity && getCityName(selectedCity)}, {selectedCountry && getCountryName(selectedCountry)}</span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-[#00FFA9]" />
                      <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                        {t('installationServices.address')}
                      </div>
                    </div>
                    <div className="text-white leading-relaxed">{selectedPartner.address}</div>
                  </div>

                  {/* Price Range */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#00FFA9]/10 to-[#00D4FF]/10 border border-[#00FFA9]/20 backdrop-blur-xl">
                    <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                      {t('installationServices.installationPrice')}
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl md:text-4xl font-bold text-[#00FFA9]">
                        {formatPrice(selectedPartner.priceRange.min, selectedCountry?.id)}
                      </span>
                      <span className="text-xl text-white/40">—</span>
                      <span className="text-3xl md:text-4xl font-bold text-[#00FFA9]">
                        {formatPrice(selectedPartner.priceRange.max, selectedCountry?.id)}
                      </span>
                    </div>
                    {selectedPartner.hasDiscount && selectedPartner.discountPercent && (
                      <div className="mt-3 pt-3 border-t border-[#00FFA9]/20 flex items-center gap-3">
                        <span className="text-sm text-white/60 line-through">
                          {formatPrice(
                            selectedPartner.priceRange.max /
                              (1 - selectedPartner.discountPercent / 100),
                            selectedCountry?.id
                          )}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-[#FFD700]/20 text-[#FFD700] text-sm font-bold border border-[#FFD700]/40">
                          {t('installationServices.save')} {selectedPartner.discountPercent}% {t('installationServices.off')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
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
                        href={`https://wa.me/${selectedPartner.whatsapp.replace(/\s/g, '')}`}
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

                  {/* Status */}
                  <div className="flex items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                    {selectedPartner.status === 'active' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-[#00FFA9]" />
                        <span className="text-sm text-white/60">
                          Service is active and accepting bookings
                        </span>
                      </>
                    ) : selectedPartner.status === 'pending' ? (
                      <>
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm text-white/60">Service is pending approval</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-white/40" />
                        <span className="text-sm text-white/60">Coming soon</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
