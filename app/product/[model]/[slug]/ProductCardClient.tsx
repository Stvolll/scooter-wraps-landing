'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, CreditCard, Zap, Shield, X, Maximize2, Play, Share2, ShoppingBag, Truck, Package } from 'lucide-react'

type MediaItem = { type: 'image'; url: string } | { type: 'video'; url: string }

interface ProductCardClientProps {
  scooter: { id: string; name: string; model?: string; panorama?: string }
  design: {
    id?: string
    name: string
    slug?: string
    preview?: string
    images?: string[]
    texture?: string
    description?: string
    price?: string
    video?: string
    panorama?: string
  }
  modelId: string
  designId: string
}

function normalizePath(path: string): string {
  if (!path) return ''
  if (path.startsWith('/uploads/') || path.startsWith('http')) return path
  if (path.startsWith('/images/') || path.startsWith('/textures/')) {
    const filename = path.split('/').pop() || ''
    return `/uploads/images/${filename}`
  }
  return path
}

function buildMediaItems(design: ProductCardClientProps['design']): MediaItem[] {
  const items: MediaItem[] = []
  const seen = new Set<string>()
  const addImage = (url: string) => {
    const n = normalizePath(url) || url
    if (!n || seen.has(n)) return
    seen.add(n)
    items.push({ type: 'image', url: n })
  }
  const addVideo = (url: string) => {
    const n = normalizePath(url) || url
    if (!n || seen.has(n)) return
    seen.add(n)
    items.push({ type: 'video', url: n })
  }
  if (design.preview) addImage(design.preview)
  if (design.images?.length) design.images.forEach(addImage)
  if (design.texture) addImage(design.texture)
  if (design.video) addVideo(design.video)
  return items.length ? items : [{ type: 'image', url: '/images/studio-panorama.png' }]
}

export default function ProductCardClient({
  scooter,
  design,
  modelId,
  designId,
}: ProductCardClientProps) {
  const mediaItems = React.useMemo(() => buildMediaItems(design), [design])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [buyOptionsOpen, setBuyOptionsOpen] = useState(false)

  useEffect(() => {
    if (mediaItems.length && currentIndex >= mediaItems.length) setCurrentIndex(0)
  }, [mediaItems.length, currentIndex])

  const currentMedia = mediaItems[currentIndex]
  const goPrev = useCallback(
    () => setCurrentIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length),
    [mediaItems.length]
  )
  const goNext = useCallback(
    () => setCurrentIndex((i) => (i + 1) % mediaItems.length),
    [mediaItems.length]
  )

  useEffect(() => {
    if (!fullscreenOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenOpen(false)
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [fullscreenOpen, goPrev, goNext])

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}/product/${modelId}/${designId}`
    const title = `${design.name} - ${scooter.name} | TXD`
    const text = design.description
      ? `${design.name} for ${scooter.name}. ${design.description.slice(0, 100)}...`
      : `Premium vinyl wrap "${design.name}" for ${scooter.name}.`
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      } else {
        await navigator.clipboard.writeText(url)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      } catch {
        // ignore
      }
    }
  }, [modelId, designId, design.name, design.description, scooter.name])

  const handleAddToCart = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/cart?add=${modelId}:${designId}`
    }
  }

  const handleBookInstallation = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/booking?model=${modelId}&design=${designId}`
    }
  }

  const fullDetailsHref = `/designs/${modelId}/${designId}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black">
      {/* Back */}
      <div className="fixed top-20 left-0 right-0 z-50 pointer-events-none">
        <div className="container mx-auto px-4 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white hover:text-[#00FFA9] transition-colors pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold text-sm">Back</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 pt-28 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.06) inset',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Gallery — click to open fullscreen */}
              <div
                className="relative aspect-square md:aspect-auto md:min-h-[420px] bg-neutral-900/50 cursor-pointer group"
                onClick={() => setFullscreenOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setFullscreenOpen(true)}
                aria-label="Open fullscreen"
              >
                {currentMedia.type === 'image' ? (
                  <Image
                    src={currentMedia.url || '/images/studio-panorama.png'}
                    alt={`${design.name} - ${scooter.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    unoptimized
                    onError={(e) => {
                      const t = e.target as HTMLImageElement
                      t.src = '/images/studio-panorama.png'
                    }}
                  />
                ) : (
                  <video
                    src={currentMedia.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                )}
                {/* Expand icon */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-3 bg-black/50 backdrop-blur-sm">
                    {currentMedia.type === 'video' ? (
                      <Play className="w-8 h-8 text-white fill-white" />
                    ) : (
                      <Maximize2 className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                {mediaItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); goPrev() }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-all"
                      aria-label="Previous"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); goNext() }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-all"
                      aria-label="Next"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Info */}
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className="text-sm text-white/50 mb-2">
                  <Link href="/" className="hover:text-white/70">Home</Link>
                  <span className="mx-2">/</span>
                  <span>{scooter.name}</span>
                  <span className="mx-2">/</span>
                  <span className="text-white/70">{design.name}</span>
                </div>

                <div className="flex items-start justify-between gap-4 mb-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white flex-1">{design.name}</h1>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex-shrink-0 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00FFA9]/30 text-white/80 hover:text-[#00FFA9] transition-all flex items-center gap-2"
                    title="Share"
                    aria-label="Share"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">
                      {shareCopied ? 'Link copied!' : 'Share'}
                    </span>
                  </button>
                </div>
                <p className="text-lg text-white/60 mb-4">For {scooter.name}</p>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold text-[#00FFA9]">{design.price || '$180'}</span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 rounded-2xl font-semibold text-black mb-3 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                    boxShadow: '0 6px 24px -2px rgba(0, 255, 169, 0.35)',
                  }}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => setBuyOptionsOpen(true)}
                  className="text-sm text-white/50 hover:text-[#00FFA9] transition-colors mb-6"
                >
                  Payment & delivery options
                </button>

                {design.description && (
                  <p className="text-white/70 text-sm leading-relaxed mb-6 line-clamp-3">{design.description}</p>
                )}

                <div className="flex items-center gap-2 mb-6 text-sm text-white/50">
                  <Shield className="w-4 h-4 text-[#00FFA9]" />
                  <span>5-year warranty · Secure payment</span>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleBookInstallation}
                    className="w-full py-4 rounded-2xl font-semibold text-black transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                      boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
                    }}
                  >
                    <Zap className="w-5 h-5" />
                    Book Installation
                  </button>
                  <Link
                    href={fullDetailsHref}
                    className="w-full py-3 rounded-2xl font-medium text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    Full details
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Buy options modal — оплата и доставка */}
      <AnimatePresence>
        {buyOptionsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setBuyOptionsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/95 backdrop-blur">
                <h2 className="text-xl font-bold text-white">Купить — оплата и доставка</h2>
                <button
                  type="button"
                  onClick={() => setBuyOptionsOpen(false)}
                  className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-6 space-y-8">
                {/* Способы оплаты */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                    <CreditCard className="w-5 h-5 text-[#00FFA9]" />
                    Способы оплаты
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['MoMo', 'ZaloPay', 'COD (при получении)', 'Bank Transfer', 'Visa / Mastercard'].map((method) => (
                      <div
                        key={method}
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90"
                      >
                        {method}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Курьерские службы */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-2">
                    <Truck className="w-5 h-5 text-[#00FFA9]" />
                    Курьерские службы
                  </h3>
                  <p className="text-sm text-white/60 mb-3">
                    Забор → сортировка → доставка до двери. Часто доступна оплата при получении (COD).
                  </p>
                  <ul className="space-y-2">
                    {[
                      { name: 'Giao Hàng Nhanh (GHN)', desc: 'Одна из самых быстрых, популярна у интернет-магазинов' },
                      { name: 'Giao Hàng Tiết Kiệm (GHTK)', desc: 'Дешевле, подходит для неторопливой доставки' },
                      { name: 'Viettel Post', desc: 'Крупная сеть по всей стране, удобно между провинциями' },
                      { name: 'Vietnam Post (VNPost)', desc: 'Государственная почта, работает везде' },
                    ].map((item) => (
                      <li key={item.name} className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <Package className="w-4 h-4 text-[#00FFA9] flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-white text-sm">{item.name}</div>
                          <div className="text-xs text-white/60">{item.desc}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Доставка через приложения */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-2">
                    <Zap className="w-5 h-5 text-[#00FFA9]" />
                    Быстрая доставка по городу
                  </h3>
                  <p className="text-sm text-white/60 mb-3">
                    Мотокурьер через приложение — документы, небольшие коробки, срочные заказы.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Grab', 'Be'].map((app) => (
                      <div
                        key={app}
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white"
                      >
                        {app}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBuyOptionsOpen(false)}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-white/10 border border-white/10 hover:bg-white/15 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen media viewer */}
      <AnimatePresence>
        {fullscreenOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => setFullscreenOpen(false)}
          >
            <button
              type="button"
              onClick={() => setFullscreenOpen(false)}
              className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {mediaItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goPrev() }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Previous"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goNext() }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Next"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div
              className="relative w-full max-w-6xl max-h-[90vh] h-[85vh] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                {currentMedia.type === 'image' ? (
                  <motion.div
                    key={`img-${currentIndex}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full h-full min-h-[60vh]"
                  >
                    <Image
                      src={currentMedia.url}
                      alt={`${design.name} fullscreen`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      unoptimized
                      onError={(e) => {
                        const t = e.target as HTMLImageElement
                        t.src = '/images/studio-panorama.png'
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`vid-${currentIndex}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full aspect-video max-h-[80vh]"
                  >
                    <video
                      src={currentMedia.url}
                      className="w-full h-full object-contain rounded-lg"
                      controls
                      autoPlay
                      playsInline
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {currentIndex + 1} / {mediaItems.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
