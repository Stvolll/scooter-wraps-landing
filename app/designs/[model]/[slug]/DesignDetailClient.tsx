'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import DesignTimeline from '@/components/DesignTimeline'
import { DesignStatus } from '@prisma/client'
import {
  Shield,
  Truck,
  Clock,
  Star,
  MessageCircle,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Zap,
  Award,
  Users,
  TrendingUp,
} from 'lucide-react'

interface DesignDetailClientProps {
  scooter: any
  design: any
  modelId: string
  designId: string
}

export default function DesignDetailClient({
  scooter,
  design,
  modelId,
  designId,
}: DesignDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [showContactOptions, setShowContactOptions] = useState(false)

  // Mock data for conversion elements
  const rating = 4.8
  const reviewsCount = 127
  const soldCount = 89
  const availableCount = design.editionAvailable ?? 10
  const totalCount = design.editionTotal ?? 100
  const urgencyPercent = Math.round(((totalCount - availableCount) / totalCount) * 100)

  // Get images array - handle all possible image sources
  // Ensure this is always an array to avoid hydration mismatches
  const images = useMemo(() => {
    if (design.images && Array.isArray(design.images) && design.images.length > 0) {
      return [...design.images]
    }
    if (design.preview) {
      return [design.preview]
    }
    if (design.texture) {
      return [design.texture]
    }
    return ['/images/studio-panorama.png'] // Fallback image
  }, [design.images, design.preview, design.texture])

  // Ensure currentImageIndex is always valid
  useEffect(() => {
    if (images.length > 0 && currentImageIndex >= images.length) {
      setCurrentImageIndex(0)
    }
  }, [images.length, currentImageIndex])

  const handleAddToCart = () => {
    console.log('Added to cart:', { modelId, designId })
  }

  const handleBookInstallation = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/booking?model=${modelId}&design=${designId}`
    }
  }

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black">
      {/* Back Button - Fixed position below main header */}
      <div className="fixed top-20 left-0 right-0 z-50 pointer-events-none">
        <div className="container mx-auto px-4 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white hover:text-[#00FFA9] transition-colors pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-semibold text-sm">Back to Gallery</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900">
              {images.length > 0 && (
                <Image
                  src={images[currentImageIndex] || '/images/studio-panorama.png'}
                  alt={`${design.name} - View ${currentImageIndex + 1}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority={currentImageIndex === 0}
                  onError={e => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/studio-panorama.png'
                  }}
                />
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative aspect-square rounded-2xl overflow-hidden transition-all ${
                      idx === currentImageIndex
                        ? 'ring-2 ring-[#00FFA9] scale-105'
                        : 'hover:scale-105 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 200px"
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/studio-panorama.png'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-8">
            {/* Breadcrumb */}
            <div className="text-sm text-white/40">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span>{scooter.name}</span>
              <span className="mx-2">/</span>
              <span className="text-white/60">{design.name}</span>
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{design.name}</h1>
              <p className="text-xl text-white/60 mb-4">For {scooter.name}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-[#00FFA9]">{design.price || '$180'}</span>
              </div>
            </div>

            {/* Description */}
            {design.description && (
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <p className="text-white/70 leading-relaxed">{design.description}</p>
              </div>
            )}

            {/* Social Proof - Ratings & Reviews */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <div>
                  <span className="text-lg font-bold text-white">{rating}</span>
                  <span className="text-sm text-white/60 ml-1">({reviewsCount} reviews)</span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-white/70">
                  <Users className="w-4 h-4" />
                  <span>{soldCount} sold</span>
                </div>
                <div className="flex items-center gap-2 text-[#00FFA9]">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending</span>
                </div>
              </div>
            </div>

            {/* Limited Edition / Urgency */}
            {availableCount < totalCount && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#00FFA9]/10 to-[#00D4FF]/10 border border-[#00FFA9]/20 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#00FFA9]" />
                    <span className="font-semibold text-white">Limited Edition</span>
                  </div>
                  <span className="text-sm text-white/70">{availableCount} left</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-[#00FFA9] to-[#00D4FF] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${urgencyPercent}%` }}
                  />
                </div>
                <p className="text-xs text-white/60">
                  {urgencyPercent}% sold - Only {availableCount} remaining!
                </p>
              </div>
            )}

            {/* Status & Availability */}
            {(design.status || design.editionAvailable !== undefined) && (
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-xl">
                {design.status && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/60">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        design.status === 'FOR_SALE'
                          ? 'bg-[#00FFA9]/20 text-[#00FFA9] border border-[#00FFA9]/30'
                          : design.status === 'SOLD'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-white/10 text-white/60 border border-white/10'
                      }`}
                    >
                      {design.status === 'FOR_SALE' ? 'For Sale' : design.status === 'SOLD' ? 'Sold' : design.status}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#00FFA9]" />
                <div>
                  <div className="text-sm font-medium text-white">Secure Payment</div>
                  <div className="text-xs text-white/50">SSL Encrypted</div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#00FFA9]" />
                <div>
                  <div className="text-sm font-medium text-white">Fast Delivery</div>
                  <div className="text-xs text-white/50">2-5 days</div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3">
                <Award className="w-5 h-5 text-[#00FFA9]" />
                <div>
                  <div className="text-sm font-medium text-white">5 Year Warranty</div>
                  <div className="text-xs text-white/50">UV Protection</div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00FFA9]" />
                <div>
                  <div className="text-sm font-medium text-white">Money Back</div>
                  <div className="text-xs text-white/50">30 days</div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="text-sm text-white/60 mb-3">Accepted Payment Methods</div>
              <div className="flex items-center gap-3 flex-wrap">
                {['Visa', 'Mastercard', 'MoMo', 'ZaloPay', 'Bank Transfer'].map((method) => (
                  <div
                    key={method}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons - Enhanced */}
            <div className="space-y-3">
              <button
                onClick={handleBookInstallation}
                className="w-full py-4 rounded-2xl font-semibold text-black transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                  boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Book Installation Now
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </button>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-2xl font-semibold text-white border-2 border-[#00FFA9] hover:bg-[#00FFA9] hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Add to Cart
              </button>

              <button
                onClick={() => setShowContactOptions(!showContactOptions)}
                className="w-full py-3 rounded-2xl font-medium text-white/90 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Quick Contact
              </button>
            </div>

            {/* Quick Contact Options */}
            <AnimatePresence>
              {showContactOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-3 overflow-hidden"
                >
                <a
                  href="https://wa.me/84901234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-all"
                >
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <div className="font-medium text-white">WhatsApp</div>
                    <div className="text-xs text-white/60">Instant support</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </a>
                <a
                  href="tel:+84901234567"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Phone className="w-5 h-5 text-[#00FFA9]" />
                  <div className="flex-1">
                    <div className="font-medium text-white">Call Now</div>
                    <div className="text-xs text-white/60">+84 90 123 4567</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </a>
                <a
                  href="mailto:info@txd.bike"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Mail className="w-5 h-5 text-[#00FFA9]" />
                  <div className="flex-1">
                    <div className="font-medium text-white">Email</div>
                    <div className="text-xs text-white/60">info@txd.bike</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </a>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAQ Section */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
              <div className="space-y-2">
                {[
                  {
                    q: 'How long does installation take?',
                    a: 'Professional installation typically takes 2-4 hours depending on the complexity of the design.',
                  },
                  {
                    q: 'What is the warranty period?',
                    a: 'All wraps come with a 5-year UV protection warranty and 30-day money-back guarantee.',
                  },
                  {
                    q: 'Can I customize the design?',
                    a: 'Yes! We offer custom design services. Contact us to discuss your vision.',
                  },
                  {
                    q: 'Do you offer installation services?',
                    a: 'Yes, we provide professional installation at our studio or can arrange mobile installation.',
                  },
                ].map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-white/5 border border-white/10 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-all"
                    >
                      <span className="font-medium text-white text-sm">{faq.q}</span>
                      {expandedFAQ === idx ? (
                        <ChevronUp className="w-5 h-5 text-white/40 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedFAQ === idx && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 pb-4 text-sm text-white/70 overflow-hidden"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Installation Process - More relevant for customers */}
        {design.status === 'FOR_SALE' && (
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-2">Installation Process</h2>
              <p className="text-white/60 mb-8 text-sm">
                Simple steps to transform your ride with professional installation
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    step: '01',
                    title: 'Book Appointment',
                    description: 'Schedule your installation date',
                    icon: Clock,
                  },
                  {
                    step: '02',
                    title: 'Preparation',
                    description: 'Surface cleaning & preparation',
                    icon: CheckCircle2,
                  },
                  {
                    step: '03',
                    title: 'Installation',
                    description: 'Professional wrap application',
                    icon: Zap,
                  },
                  {
                    step: '04',
                    title: 'Ready to Ride',
                    description: 'Quality check & handover',
                    icon: Award,
                  },
                ].map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={idx}
                      className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00FFA9]/20 border border-[#00FFA9]/30 flex items-center justify-center text-[#00FFA9] font-bold text-sm">
                          {item.step}
                        </div>
                        <Icon className="w-5 h-5 text-[#00FFA9] group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-white/60">{item.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Design Story - Compact version for interested customers */}
        {design.status !== 'FOR_SALE' && (
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="max-w-7xl mx-auto">
              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">Design Story</h2>
                      <p className="text-sm text-white/60">
                        See how this design was created (for design enthusiasts)
                      </p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-white/40 group-open:rotate-180 transition-transform" />
                  </div>
                </summary>
                <div className="mt-4 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <DesignTimeline
                    currentStatus={design.status || DesignStatus.CREATIVE}
                    statusHistory={
                      design.statusHistory && Array.isArray(design.statusHistory) && design.statusHistory.length > 0
                        ? design.statusHistory.map(h => ({
                            status: h.status,
                            at: h.at instanceof Date ? h.at : new Date(h.at),
                            note: h.note || null,
                          }))
                        : [
                            {
                              status: design.status || DesignStatus.CREATIVE,
                              at: new Date(),
                              note: null,
                            },
                          ]
                    }
                    orientation="vertical"
                  />
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
