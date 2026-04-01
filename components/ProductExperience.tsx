'use client'

/**
 * ProductExperience Component
 * Installation guide, tools, map, bento, and production protocol.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, Droplet, Scissors, Wind, Sparkles } from 'lucide-react'
import VietnamInstallationMap from './VietnamInstallationMap'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

const TOOL_TITLE_CLASS = 'text-xl md:text-2xl font-semibold leading-snug'

const toolDescriptions = {
  en: {
    solution: {
      title: 'Application Solution',
      intro: 'Used for wet installation to allow repositioning before fixing.',
      points: [
        { icon: '💧', label: 'Mix ratio', text: '2–3 drops of soap per 0.5–1L water' },
        { icon: '🧼', label: 'Surface', text: 'Slightly wet, not flooded' },
        { icon: '⚡', label: 'Timing', text: 'Work quickly — adhesive activates after water removal' },
      ],
    },
    knife: {
      title: 'Precision Knife',
      intro: 'For accurate trimming along edges and cutouts.',
      points: [
        { icon: '🔪', label: 'Blade', text: 'Use a sharp new blade' },
        { icon: '✂️', label: 'Cutting', text: 'Light pressure, multiple passes' },
        { icon: '⚠️', label: 'Safety', text: 'Avoid cutting directly on painted surfaces' },
      ],
    },
    heatgun: {
      title: 'Heat Gun',
      intro: 'Helps apply film on curves and complex shapes.',
      points: [
        { icon: '🔥', label: 'Heat', text: 'Use moderate temperature' },
        { icon: '🌪', label: 'Movement', text: "Keep moving, don't stay in one spot" },
        { icon: '❄️', label: 'Fixing', text: 'Let film cool to lock shape' },
      ],
    },
    squeegee: {
      title: 'Squeegee',
      intro: 'Removes water and air bubbles.',
      points: [
        { icon: '➡️', label: 'Direction', text: 'Move from center to edges' },
        { icon: '📏', label: 'Pressure', text: 'Apply evenly' },
        { icon: '🛡', label: 'Protection', text: 'Use soft edge (felt) to avoid scratches' },
      ],
    },
  },
  vi: {
    solution: {
      title: 'Dung dịch thi công (Application Solution)',
      intro: 'Dùng cho phương pháp dán ướt để có thể điều chỉnh vị trí trước khi cố định.',
      points: [
        { icon: '💧', label: 'Tỷ lệ', text: '2–3 giọt xà phòng / 0.5–1L nước' },
        { icon: '🧼', label: 'Bề mặt', text: 'Chỉ cần ẩm nhẹ, không đọng nước' },
        { icon: '⚡', label: 'Thời điểm', text: 'Làm nhanh, keo sẽ bám sau khi gạt nước' },
      ],
    },
    knife: {
      title: 'Dao cắt (Precision Knife)',
      intro: 'Dùng để cắt chính xác theo mép và chi tiết.',
      points: [
        { icon: '🔪', label: 'Lưỡi dao', text: 'Dùng lưỡi dao mới, sắc' },
        { icon: '✂️', label: 'Thao tác', text: 'Cắt nhẹ, nhiều lần' },
        { icon: '⚠️', label: 'An toàn', text: 'Tránh cắt trực tiếp lên bề mặt sơn' },
      ],
    },
    heatgun: {
      title: 'Máy khò nhiệt (Heat Gun)',
      intro: 'Giúp dán ở các bề mặt cong và phức tạp.',
      points: [
        { icon: '🔥', label: 'Nhiệt', text: 'Dùng nhiệt vừa phải' },
        { icon: '🌪', label: 'Di chuyển', text: 'Di chuyển liên tục' },
        { icon: '❄️', label: 'Cố định', text: 'Để nguội để cố định form' },
      ],
    },
    squeegee: {
      title: 'Gạt (Squeegee)',
      intro: 'Dùng để loại bỏ nước và bọt khí.',
      points: [
        { icon: '➡️', label: 'Hướng gạt', text: 'Gạt từ trung tâm ra ngoài' },
        { icon: '📏', label: 'Lực', text: 'Lực đều tay' },
        { icon: '🛡', label: 'Bảo vệ', text: 'Dùng loại có mép mềm để tránh trầy' },
      ],
    },
  },
} as const

interface ProductExperienceProps {
  selectedModel?: string
  scooterName?: string
}

export default function ProductExperience({ selectedModel: _selectedModel, scooterName }: ProductExperienceProps) {
  const { t, language } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)
  const [detailToolId, setDetailToolId] = useState<string | null>(null)
  const [isCoarsePointer, setIsCoarsePointer] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(pointer: coarse)').matches
  })
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const detailLang = language === 'vi' ? 'vi' : 'en'

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
  }, [])

  const showToolDetail = useCallback(
    (id: string) => {
      clearLeaveTimer()
      setDetailToolId(id)
    },
    [clearLeaveTimer]
  )

  const scheduleHideToolDetail = useCallback(() => {
    clearLeaveTimer()
    leaveTimerRef.current = setTimeout(() => setDetailToolId(null), 200)
  }, [clearLeaveTimer])

  const toggleToolDetailMobile = useCallback(
    (id: string) => {
      setDetailToolId(prev => (prev === id ? null : id))
    },
    []
  )
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(pointer: coarse)')
    const update = () => setIsCoarsePointer(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => {
      mq.removeEventListener('change', update)
      clearLeaveTimer()
    }
  }, [clearLeaveTimer])


  return (
    <div className="relative text-white">
      {/* SECTION 1: Interactive Installation Guide - Redesigned */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00FFA9] rounded-full blur-[120px] opacity-10" />
        </div>
        
        <div className="relative container mx-auto px-4 md:px-8 lg:px-16 max-w-7xl flex flex-col">
          {/* Section header — типографика как у «{model} Designs» на главной */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FFA9]/10 border border-[#00FFA9]/20 mb-6">
              <span className="text-xs font-semibold text-[#00FFA9] uppercase tracking-wider">
                {t('installationGuide.title')}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 pb-2 text-center bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent leading-tight">
              {t('installationGuide.howToApply')}
            </h2>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              {scooterName ? (
                <>
                  {t('installationGuide.interactiveGuideFor')} <span className="text-[#00FFA9] font-medium">{scooterName}</span>
                </>
              ) : (
                t('installationGuide.interactiveGuide')
              )}
            </p>
          </motion.div>

          {/* Required Tools & Accessories - Redesigned */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12 order-2"
          >
            <div
              className="p-6 pb-8 md:p-8 md:pb-10 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#00FFA9]/10 border border-[#00FFA9]/20 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-[#00FFA9]" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  {t('installationGuide.requiredTools')}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    id: 'solution',
                    icon: Droplet,
                    name: t('installationGuide.tools.applicationSolution.name'),
                    desc: t('installationGuide.tools.applicationSolution.desc'),
                    image: '/images/application-solution.webp',
                  },
                  {
                    id: 'knife',
                    icon: Scissors,
                    name: t('installationGuide.tools.precisionKnife.name'),
                    desc: t('installationGuide.tools.precisionKnife.desc'),
                    image: '/images/precision-knife.webp',
                  },
                  {
                    id: 'heatgun',
                    icon: Wind,
                    name: t('installationGuide.tools.heatGun.name'),
                    desc: t('installationGuide.tools.heatGun.desc'),
                    image: '/images/heat-gun.webp',
                  },
                  {
                    id: 'squeegee',
                    icon: Sparkles,
                    name: t('installationGuide.tools.squeegee.name'),
                    desc: t('installationGuide.tools.squeegee.desc'),
                    image: '/images/squeegee.webp',
                  },
                ].map((item, index) => {
                  const Icon = item.icon
                  const isActive = detailToolId === item.id
                  return (
                    <motion.div
                      key={item.id}
                      role="button"
                      aria-pressed={isActive}
                      tabIndex={0}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={isMounted ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      className={`relative p-4 rounded-xl border transition-all duration-200 overflow-hidden aspect-square flex flex-col group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFA9]/60 ${
                        isCoarsePointer ? 'cursor-pointer active:scale-[0.98]' : ''
                      } ${isActive ? 'ring-2 ring-[#00FFA9]/45 shadow-[0_0_28px_rgba(0,255,169,0.2)]' : ''}`}
                      style={{
                        borderColor: isActive ? 'rgba(0, 255, 169, 0.45)' : 'rgba(255, 255, 255, 0.08)',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.11)' : 'rgba(255, 255, 255, 0.04)',
                        boxShadow: isActive
                          ? '0 6px 28px -2px rgba(0, 255, 169, 0.28), 0 0 0 1px rgba(0, 255, 169, 0.22) inset'
                          : '0 2px 12px -2px rgba(0, 0, 0, 0.15)',
                      }}
                      whileHover={isCoarsePointer ? undefined : { scale: 1.02, y: -2, transition: { duration: 0.2 } }}
                      onMouseEnter={() => {
                        if (!isCoarsePointer) showToolDetail(item.id)
                      }}
                      onMouseLeave={() => {
                        if (!isCoarsePointer) scheduleHideToolDetail()
                      }}
                      onClick={() => {
                        if (isCoarsePointer) toggleToolDetailMobile(item.id)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleToolDetailMobile(item.id)
                        }
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            key={`overlay-${item.id}`}
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 32, duration: 0.35 }}
                            className="absolute inset-0 rounded-xl overflow-hidden z-[15] pointer-events-none"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div
                        className={`relative z-20 mt-auto pt-2 transition-all duration-200 ${
                          isActive ? 'bg-black/30 backdrop-blur-[2px] rounded-md p-2 -m-2' : ''
                        }`}
                      >
                        <div className={`${TOOL_TITLE_CLASS} text-white mb-1`}>{item.name}</div>
                        <div className="text-xs md:text-sm text-white/60 leading-snug font-medium line-clamp-2">
                          {item.desc}
                        </div>
                      </div>

                      <div className="absolute top-3 left-3 z-30">
                        <div
                          className="w-9 h-9 rounded-lg bg-[#00FFA9]/12 border border-[#00FFA9]/25 flex items-center justify-center transition-transform duration-200"
                          style={{
                            transform: isActive ? 'scale(1.08) rotate(4deg)' : 'scale(1) rotate(0deg)',
                          }}
                        >
                          <Icon className="w-5 h-5 text-[#00FFA9]" />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Floating detail panel — clean inline text (no card box) */}
              <div className="relative mt-6 min-h-[280px] md:min-h-[260px]">
                <AnimatePresence mode="wait">
                  {detailToolId && detailToolId in toolDescriptions.en ? (
                    <motion.div
                      key={`${detailToolId}-${detailLang}`}
                      role="region"
                      aria-live="polite"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="absolute top-0 left-0 w-full max-w-2xl pl-4 md:pl-4 pr-2 pb-6 md:pb-8 text-left"
                      onMouseEnter={clearLeaveTimer}
                      onMouseLeave={() => {
                        if (!isCoarsePointer) scheduleHideToolDetail()
                      }}
                    >
                      <h4 className={`${TOOL_TITLE_CLASS} text-white mb-3`}>
                        {toolDescriptions[detailLang][detailToolId as keyof typeof toolDescriptions.en].title}
                      </h4>
                      <p className="text-sm md:text-base text-white/75 leading-relaxed mb-4">
                        {toolDescriptions[detailLang][detailToolId as keyof typeof toolDescriptions.en].intro}
                      </p>
                      <ul className="space-y-3">
                        {toolDescriptions[detailLang][detailToolId as keyof typeof toolDescriptions.en].points.map(
                          point => (
                            <li key={point.label} className="leading-relaxed">
                              <div className="text-sm md:text-base text-white/90 font-medium">
                                {point.icon} {point.label}
                              </div>
                              <div className="text-sm md:text-base text-white/70 mt-0.5">{point.text}</div>
                            </li>
                          )
                        )}
                      </ul>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Installation Services Map - Moved above Premium Print Quality */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16 order-3"
          >
            <VietnamInstallationMap />
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 order-1">
            {/* Large card: Film texture macro */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isMounted ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2 lg:row-span-2 rounded-3xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              }}
            >
              <div className="relative w-full h-full aspect-square lg:aspect-auto lg:h-full min-h-[400px]">
                <Image
                  src="/images/placeholders/film-texture-macro.svg"
                  alt="Premium film texture macro photography"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                  <div className="p-6 w-full">
                    <h3 className="text-2xl font-bold text-white mb-1">Premium Print Quality</h3>
                    <p className="text-white/80 text-sm">Macro photography showing texture detail</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Small card: Film stretch video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isMounted ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-3xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] relative"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              }}
            >
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00FFA9]/20 to-[#00D4FF]/20 flex items-center justify-center">
                  <div className="text-center p-6">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="w-20 h-20 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center border border-white/20"
                    >
                      <span className="text-4xl">🎬</span>
                    </motion.div>
                    <h3 className="text-lg font-bold text-white mb-1">Elasticity</h3>
                    <p className="text-xs text-white/60">Stretch demonstration</p>
                    <p className="text-xs text-white/40 mt-2">Placeholder: film-stretch.webm</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Typography card: 5 Year Warranty */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isMounted ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="rounded-3xl p-8 flex flex-col justify-center group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 169, 0.15), rgba(0, 212, 255, 0.15))',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(0, 255, 169, 0.3)',
                boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              }}
            >
              <div className="text-center">
                <div className="text-6xl md:text-7xl font-bold text-[#00FFA9] mb-2">5</div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">Years</div>
                <div className="text-sm text-white/80 font-semibold uppercase tracking-wide">
                  Color Guarantee
                </div>
              </div>
            </motion.div>

            {/* Packaging card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isMounted ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="rounded-3xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              }}
            >
              <div className="relative w-full aspect-square">
                <Image
                  src="/images/placeholders/packaging-tube.svg"
                  alt="Secure packaging tube"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                  <div className="p-4 w-full">
                    <h3 className="text-lg font-bold text-white mb-1">Secure Packaging</h3>
                    <p className="text-xs text-white/80">Protective tube delivery</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  )
}
