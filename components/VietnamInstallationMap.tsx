'use client'

/**
 * Vietnam Installation Map Component
 * Interactive map showing installation services in major Vietnamese cities
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
} from 'lucide-react'

interface InstallationService {
  id: string
  city: string
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

// Mock data - в будущем заменить на данные из БД
const services: InstallationService[] = [
  {
    id: 'hcm-1',
    city: 'Ho Chi Minh City',
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
    id: 'hanoi-1',
    city: 'Hanoi',
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
    id: 'danang-1',
    city: 'Da Nang',
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
  {
    id: 'dalat-1',
    city: 'Da Lat',
    name: 'Mountain Wrap Studio',
    address: '321 Tran Phu Street, Da Lat City, Lam Dong',
    phone: '+84 263 1234 567',
    email: 'dalat@txd.bike',
    whatsapp: '+84 93 456 7890',
    priceRange: { min: 500000, max: 750000 },
    hasDiscount: false,
    status: 'pending',
    coordinates: { lat: 11.9404, lng: 108.4583 },
  },
  {
    id: 'nhatrang-1',
    city: 'Nha Trang',
    name: 'Beachside Installation',
    address: '654 Tran Phu Street, Nha Trang City, Khanh Hoa',
    phone: '+84 258 1234 567',
    email: 'nhatrang@txd.bike',
    whatsapp: '+84 94 567 8901',
    priceRange: { min: 520000, max: 780000 },
    hasDiscount: true,
    discountPercent: 20,
    status: 'active',
    coordinates: { lat: 12.2388, lng: 109.1967 },
  },
]

// Center of Vietnam for map view
const mapCenter = '16.0544,108.2022' // Da Nang (center of Vietnam)

export default function VietnamInstallationMap() {
  const [selectedService, setSelectedService] = useState<InstallationService | null>(null)
  const [mapLocation, setMapLocation] = useState<string>(mapCenter)
  const [isMounted, setIsMounted] = useState(false)

  // Fix hydration error - only render map on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatPriceRange = (min: number, max: number) => {
    // Format min without currency, max with dots as thousand separators
    const minFormatted = min.toString()
    const maxFormatted = max.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `${minFormatted} — ${maxFormatted}`
  }

  const getCityServices = (city: string) => {
    return services.filter(s => s.city === city)
  }

  // Generate Google Maps URL with markers
  const getMapUrl = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    if (!apiKey) {
      // Fallback to embed without API key (limited functionality)
      return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${mapLocation}&zoom=6&maptype=roadmap`
    }

    // Build markers query
    const markers = services
      .map(
        service =>
          `markers=color:${service.hasDiscount ? 'gold' : service.status === 'active' ? '0x00FFA9' : 'gray'}|${service.coordinates.lat},${service.coordinates.lng}`
      )
      .join('&')

    return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${mapLocation}&zoom=6&maptype=roadmap&${markers}`
  }

  const handleCityClick = (service: InstallationService) => {
    setSelectedService(service)
    setMapLocation(`${service.coordinates.lat},${service.coordinates.lng}`)
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
            title="Vietnam Installation Services Map Background"
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
            <MapPin className="w-4 h-4 text-[#00FFA9]" />
            <span className="text-xs font-semibold text-[#00FFA9] uppercase tracking-wider">
              Installation Network
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
            Installation Services
          </h2>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Find professional installation services near you. Click on a city to see available
            locations, prices, and contact information.
          </p>
        </motion.div>

        {/* Services Cards Grid - Redesigned */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {Array.from(new Set(services.map(s => s.city))).map((city, index) => {
            const cityServices = getCityServices(city)
            if (cityServices.length === 0) return null

            const activeService = cityServices.find(s => s.status === 'active')
            const hasDiscount = cityServices.some(s => s.hasDiscount)

            return (
              <motion.button
                key={city}
                onClick={() => handleCityClick(cityServices[0])}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00FFA9]/30 transition-all backdrop-blur-xl group relative overflow-hidden flex flex-col"
                style={{
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Discount badge - top right */}
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
                      <span>Sale</span>
                    </motion.span>
                  </div>
                )}

                {/* Icon and City Name - Top Left */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#00FFA9]/15 border border-[#00FFA9]/25 flex items-center justify-center group-hover:bg-[#00FFA9]/25 transition-colors flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#00FFA9]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base leading-tight truncate">{city}</h3>
                    {activeService && (
                      <p className="text-[11px] text-white/50 mt-0.5">
                        {cityServices.length} location{cityServices.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price - Bottom */}
                {activeService && (
                  <div className="mt-auto pt-3 border-t border-white/5">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="text-lg font-bold text-[#00FFA9] leading-none">
                        {formatPrice(activeService.priceRange.min)}
                      </span>
                      <span className="text-white/30 text-sm">—</span>
                      <span className="text-lg font-bold text-[#00FFA9] leading-none break-words">
                        {formatPrice(activeService.priceRange.max)}
                      </span>
                    </div>
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

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
            <span className="text-sm font-medium text-white/90">Active Service</span>
          </div>
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl">
            <div className="w-4 h-4 rounded-full bg-white/30 border border-white/20" />
            <span className="text-sm font-medium text-white/90">Coming Soon</span>
          </div>
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl">
            <div className="w-4 h-4 rounded-full bg-[#FFD700] shadow-lg shadow-[#FFD700]/50" />
            <span className="text-sm font-medium text-white/90">Special Discount</span>
          </div>
        </motion.div>

        {/* Service Detail Modal */}
        <AnimatePresence>
          {selectedService && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                onClick={() => setSelectedService(null)}
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
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        {selectedService.name}
                      </h3>
                      {selectedService.hasDiscount && (
                        <span className="px-3 py-1 rounded-full bg-[#FFD700]/20 text-[#FFD700] text-sm font-medium border border-[#FFD700]/30 flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {selectedService.discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedService.city}</span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-[#00FFA9]" />
                      <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Address
                      </div>
                    </div>
                    <div className="text-white leading-relaxed">{selectedService.address}</div>
                  </div>

                  {/* Price Range */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#00FFA9]/10 to-[#00D4FF]/10 border border-[#00FFA9]/20 backdrop-blur-xl">
                    <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                      Installation Price
                    </div>
                         <div className="flex items-baseline gap-2 mb-2">
                           <span className="text-3xl md:text-4xl font-bold text-[#00FFA9]">
                             {formatPrice(selectedService.priceRange.min)}
                           </span>
                           <span className="text-xl text-white/40">—</span>
                           <span className="text-3xl md:text-4xl font-bold text-[#00FFA9]">
                             {formatPrice(selectedService.priceRange.max)}
                           </span>
                         </div>
                    {selectedService.hasDiscount && selectedService.discountPercent && (
                      <div className="mt-3 pt-3 border-t border-[#00FFA9]/20 flex items-center gap-3">
                        <span className="text-sm text-white/60 line-through">
                          {formatPrice(
                            selectedService.priceRange.max /
                              (1 - selectedService.discountPercent / 100)
                          )}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-[#FFD700]/20 text-[#FFD700] text-sm font-bold border border-[#FFD700]/40">
                          Save {selectedService.discountPercent}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-white uppercase tracking-wider">
                      Contact
                    </div>
                    <a
                      href={`tel:${selectedService.phone}`}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#00FFA9]/10 border border-[#00FFA9]/30 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-[#00FFA9]" />
                      </div>
                      <div>
                        <div className="text-sm text-white/60">Phone</div>
                        <div className="text-white">{selectedService.phone}</div>
                      </div>
                    </a>

                    {selectedService.whatsapp && (
                      <a
                        href={`https://wa.me/${selectedService.whatsapp.replace(/\s/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm text-white/60">WhatsApp</div>
                          <div className="text-white">{selectedService.whatsapp}</div>
                        </div>
                      </a>
                    )}

                    {selectedService.email && (
                      <a
                        href={`mailto:${selectedService.email}`}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#00FFA9]/10 border border-[#00FFA9]/30 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-[#00FFA9]" />
                        </div>
                        <div>
                          <div className="text-sm text-white/60">Email</div>
                          <div className="text-white">{selectedService.email}</div>
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                    {selectedService.status === 'active' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-[#00FFA9]" />
                        <span className="text-sm text-white/60">
                          Service is active and accepting bookings
                        </span>
                      </>
                    ) : selectedService.status === 'pending' ? (
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
