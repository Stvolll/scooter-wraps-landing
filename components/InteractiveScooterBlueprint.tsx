'use client'

/**
 * Interactive Scooter Blueprint Component
 * Linear 3D drawing with interactive zones showing installation information
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface InstallationZone {
  id: string
  x: number // Center X in percentage
  y: number // Center Y in percentage
  radius: number // Radius in percentage
  name: string
  difficulty: string // 'Easy' | 'Medium' | 'Hard' or translated versions
  time: string
  steps: string[]
  tips: string[]
  side?: 'left' | 'right' // Which side to show info panel
}

// Default zones (will be replaced by translated versions in useEffect)
const defaultZones: InstallationZone[] = [
  {
    id: 'under-seat',
    x: 50,
    y: 35,
    radius: 12,
    name: 'Under Seat Panel',
    difficulty: 'Medium',
    time: '15-20 min',
    side: 'right',
    steps: [
      'Remove seat if possible',
      'Clean surface with isopropyl alcohol',
      'Apply from center, work outward',
      'Use squeegee to remove bubbles',
    ],
    tips: [
      'Remove seat for easier access',
      'Work in sections',
      'Keep surface wet during application',
    ],
  },
  {
    id: 'foot-panel',
    x: 50,
    y: 55,
    radius: 12,
    name: 'Foot Panel',
    difficulty: 'Hard',
    time: '25-35 min',
    side: 'left',
    steps: [
      'Remove footrests if possible',
      'Clean thoroughly with degreaser',
      'Apply in one continuous motion',
      'Trim excess with precision knife',
    ],
    tips: [
      'Most visible area - take your time',
      'Work from top to bottom',
      'Use heat gun for complex curves',
    ],
  },
  {
    id: 'handlebar-area',
    x: 35,
    y: 25,
    radius: 12,
    name: 'Handlebar Area',
    difficulty: 'Easy',
    time: '10-15 min',
    side: 'right',
    steps: [
      'Clean surface around handlebar',
      'Apply from top edge',
      'Smooth downward carefully',
      'Trim edges near controls',
    ],
    tips: [
      'Be careful around controls',
      'Work quickly before solution dries',
      'Use masking tape for protection',
    ],
  },
  {
    id: 'front-wheel-panel',
    x: 35,
    y: 75,
    radius: 12,
    name: 'Front Wheel Panel',
    difficulty: 'Medium',
    time: '20-25 min',
    side: 'left',
    steps: [
      'Clean area above front wheel',
      'Apply with extra solution',
      'Smooth carefully around wheel arch',
      'Allow extra time to dry',
    ],
    tips: [
      'Watch for wheel arch curves',
      'Use longer squeegee',
      'Check for bubbles after 24h',
    ],
  },
]

interface InteractiveScooterBlueprintProps {
  selectedModel?: string
}

export default function InteractiveScooterBlueprint({ selectedModel = 'vision' }: InteractiveScooterBlueprintProps) {
  const { t, language } = useLanguage()
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [zones, setZones] = useState<InstallationZone[]>(defaultZones)
  const [draggedZone, setDraggedZone] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeZoneData = zones.find(z => z.id === activeZone)

  // Update zones when language changes
  useEffect(() => {
    setZones([
      {
        id: 'under-seat',
        x: zones.find(z => z.id === 'under-seat')?.x || 50,
        y: zones.find(z => z.id === 'under-seat')?.y || 35,
        radius: 12,
        name: t('installationGuide.zones.underSeat.name'),
        difficulty: language === 'vi' ? 'Trung Bình' : 'Medium',
        time: t('installationGuide.zones.underSeat.time'),
        side: 'right',
        steps: [
          t('installationGuide.zones.underSeat.steps.0'),
          t('installationGuide.zones.underSeat.steps.1'),
          t('installationGuide.zones.underSeat.steps.2'),
          t('installationGuide.zones.underSeat.steps.3'),
        ],
        tips: [
          t('installationGuide.zones.underSeat.tips.0'),
          t('installationGuide.zones.underSeat.tips.1'),
          t('installationGuide.zones.underSeat.tips.2'),
        ],
      },
      {
        id: 'foot-panel',
        x: zones.find(z => z.id === 'foot-panel')?.x || 50,
        y: zones.find(z => z.id === 'foot-panel')?.y || 55,
        radius: 12,
        name: t('installationGuide.zones.footPanel.name'),
        difficulty: language === 'vi' ? 'Khó' : 'Hard',
        time: t('installationGuide.zones.footPanel.time'),
        side: 'left',
        steps: [
          t('installationGuide.zones.footPanel.steps.0'),
          t('installationGuide.zones.footPanel.steps.1'),
          t('installationGuide.zones.footPanel.steps.2'),
          t('installationGuide.zones.footPanel.steps.3'),
        ],
        tips: [
          t('installationGuide.zones.footPanel.tips.0'),
          t('installationGuide.zones.footPanel.tips.1'),
          t('installationGuide.zones.footPanel.tips.2'),
        ],
      },
      {
        id: 'handlebar-area',
        x: zones.find(z => z.id === 'handlebar-area')?.x || 35,
        y: zones.find(z => z.id === 'handlebar-area')?.y || 25,
        radius: 12,
        name: t('installationGuide.zones.handlebarArea.name'),
        difficulty: language === 'vi' ? 'Dễ' : 'Easy',
        time: t('installationGuide.zones.handlebarArea.time'),
        side: 'right',
        steps: [
          t('installationGuide.zones.handlebarArea.steps.0'),
          t('installationGuide.zones.handlebarArea.steps.1'),
          t('installationGuide.zones.handlebarArea.steps.2'),
          t('installationGuide.zones.handlebarArea.steps.3'),
        ],
        tips: [
          t('installationGuide.zones.handlebarArea.tips.0'),
          t('installationGuide.zones.handlebarArea.tips.1'),
          t('installationGuide.zones.handlebarArea.tips.2'),
        ],
      },
      {
        id: 'front-wheel-panel',
        x: zones.find(z => z.id === 'front-wheel-panel')?.x || 35,
        y: zones.find(z => z.id === 'front-wheel-panel')?.y || 75,
        radius: 12,
        name: t('installationGuide.zones.frontWheelPanel.name'),
        difficulty: language === 'vi' ? 'Trung Bình' : 'Medium',
        time: t('installationGuide.zones.frontWheelPanel.time'),
        side: 'left',
        steps: [
          t('installationGuide.zones.frontWheelPanel.steps.0'),
          t('installationGuide.zones.frontWheelPanel.steps.1'),
          t('installationGuide.zones.frontWheelPanel.steps.2'),
          t('installationGuide.zones.frontWheelPanel.steps.3'),
        ],
        tips: [
          t('installationGuide.zones.frontWheelPanel.tips.0'),
          t('installationGuide.zones.frontWheelPanel.tips.1'),
          t('installationGuide.zones.frontWheelPanel.tips.2'),
        ],
      },
    ])
  }, [language, t])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Get SVG path based on model
  const getSvgPath = () => {
    const svgMap: Record<string, string> = {
      vision: '/honda-vision-map.svg',
      lead: '/honda-lead-map.svg',
      sh: '/honda-sh-map.svg',
      pcx: '/honda-pcx-map.svg',
      nvx: '/yamaha-nvx-map.svg',
    }
    return svgMap[selectedModel] || '/honda-vision-map.svg'
  }

  const getDifficultyColor = (difficulty: string) => {
    const normalizedDifficulty = difficulty === 'Dễ' || difficulty === 'Easy' ? 'Easy' :
                                 difficulty === 'Trung Bình' || difficulty === 'Medium' ? 'Medium' :
                                 difficulty === 'Khó' || difficulty === 'Hard' ? 'Hard' : difficulty
    switch (normalizedDifficulty) {
      case 'Easy':
        return '#00FFA9'
      case 'Medium':
        return '#FFB800'
      case 'Hard':
        return '#FF6B6B'
      default:
        return '#00FFA9'
    }
  }

  const getDifficultyGlow = (difficulty: string) => {
    const normalizedDifficulty = difficulty === 'Dễ' || difficulty === 'Easy' ? 'Easy' :
                                 difficulty === 'Trung Bình' || difficulty === 'Medium' ? 'Medium' :
                                 difficulty === 'Khó' || difficulty === 'Hard' ? 'Hard' : difficulty
    switch (normalizedDifficulty) {
      case 'Easy':
        return 'rgba(0, 255, 169, 0.6)'
      case 'Medium':
        return 'rgba(255, 184, 0, 0.6)'
      case 'Hard':
        return 'rgba(255, 107, 107, 0.6)'
      default:
        return 'rgba(0, 255, 169, 0.6)'
    }
  }

  // Handle drag for circles
  const handleMouseDown = (e: React.MouseEvent, zoneId: string) => {
    if (!svgRef.current) return
    
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const svgPoint = svg.createSVGPoint()
    svgPoint.x = e.clientX
    svgPoint.y = e.clientY
    const point = svgPoint.matrixTransform(svg.getScreenCTM()?.inverse())
    
    const zone = zones.find(z => z.id === zoneId)
    if (!zone) return
    
    const centerX = (zone.x / 100) * 2816
    const centerY = (zone.y / 100) * 1536
    
    setDraggedZone(zoneId)
    setDragOffset({
      x: point.x - centerX,
      y: point.y - centerY,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedZone || !dragOffset || !svgRef.current) return
    
    const svg = svgRef.current
    const svgPoint = svg.createSVGPoint()
    svgPoint.x = e.clientX
    svgPoint.y = e.clientY
    const point = svgPoint.matrixTransform(svg.getScreenCTM()?.inverse())
    
    const newX = ((point.x - dragOffset.x) / 2816) * 100
    const newY = ((point.y - dragOffset.y) / 1536) * 100
    
    setZones(prevZones =>
      prevZones.map(zone =>
        zone.id === draggedZone
          ? { ...zone, x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) }
          : zone
      )
    )
  }

  const handleMouseUp = () => {
    setDraggedZone(null)
    setDragOffset(null)
  }

  useEffect(() => {
    if (draggedZone) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!dragOffset || !svgRef.current) return
        
        const svg = svgRef.current
        const svgPoint = svg.createSVGPoint()
        svgPoint.x = e.clientX
        svgPoint.y = e.clientY
        const point = svgPoint.matrixTransform(svg.getScreenCTM()?.inverse())
        
        const newX = ((point.x - dragOffset.x) / 2816) * 100
        const newY = ((point.y - dragOffset.y) / 1536) * 100
        
        setZones(prevZones =>
          prevZones.map(zone =>
            zone.id === draggedZone
              ? { ...zone, x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) }
              : zone
          )
        )
      }

      const handleGlobalMouseUp = () => {
        setDraggedZone(null)
        setDragOffset(null)
      }

      window.addEventListener('mousemove', handleGlobalMouseMove)
      window.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove)
        window.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [draggedZone, dragOffset])

  // Handle touch outside for mobile
  useEffect(() => {
    if (!activeZone) return

    const handleTouchOutside = (e: TouchEvent) => {
      if (activeZone && !draggedZone) {
        const target = e.target as HTMLElement
        if (!target.closest('[data-zone-panel]') && !target.closest('[data-zone-circle]')) {
          setActiveZone(null)
          setHoveredZone(null)
        }
      }
    }

    document.addEventListener('touchstart', handleTouchOutside)
    return () => {
      document.removeEventListener('touchstart', handleTouchOutside)
    }
  }, [activeZone, draggedZone])

  return (
    <div className="relative w-full">
      {/* SVG Blueprint Container */}
      <div ref={containerRef} className="relative w-full aspect-[2816/1536] max-w-4xl mx-auto overflow-visible">
        {/* Info panel - Positioned above SVG, below header */}
        {isMounted && (
          <AnimatePresence mode="wait">
            {(activeZone || hoveredZone) && (() => {
            const zone = zones.find(z => z.id === (activeZone || hoveredZone))
            if (!zone) return null
            
            const difficultyColor = getDifficultyColor(zone.difficulty)
            const difficultyGlow = getDifficultyGlow(zone.difficulty)
            
            return (
              <motion.div
                key={`info-${activeZone || hoveredZone}`}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.35, type: 'spring', stiffness: 320, damping: 28 }}
                className="absolute -top-28 md:-top-32 left-0 right-0 z-50"
                style={{
                  pointerEvents: 'auto',
                }}
              >
              <div
                className="relative rounded-2xl mx-auto max-w-5xl"
                style={{
                  background: `linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.96) 100%)`,
                  backdropFilter: 'blur(32px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                  border: `2px solid ${difficultyColor}50`,
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.15) inset, 0 0 40px ${difficultyGlow}40`,
                }}
              >
                <div className="p-5 md:p-6">
                  {/* Header Section - Compact */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-white leading-tight mb-2" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}>
                        {zone.name}
                      </h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className="px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{
                            background: `linear-gradient(135deg, ${difficultyColor}25, ${difficultyColor}15)`,
                            color: difficultyColor,
                            border: `1.5px solid ${difficultyColor}50`,
                            boxShadow: `0 2px 8px ${difficultyGlow}30`,
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                          }}
                        >
                          {zone.difficulty}
                        </span>
                        <div className="flex items-center gap-2 text-white/90 text-xs" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)' }}>
                          <svg className="w-3.5 h-3.5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold">{zone.time}</span>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => {
                        setActiveZone(null)
                        setHoveredZone(null)
                      }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/8 hover:bg-white/15 border border-white/15 flex items-center justify-center transition-all"
                      aria-label="Close"
                    >
                      <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Content Grid - Compact Two Columns */}
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    {/* Installation Steps */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 rounded-full" style={{ background: difficultyColor, boxShadow: `0 0 8px ${difficultyGlow}50` }} />
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-wider" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)' }}>
                          {t('installationGuide.steps')}
                        </h4>
                      </div>
                      <ol className="space-y-2.5">
                        {zone.steps.map((step, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.05, type: 'spring', stiffness: 300 }}
                            className="flex gap-2.5 items-start"
                          >
                            <span
                              className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs border transition-all"
                              style={{
                                background: `linear-gradient(135deg, ${difficultyColor}20, ${difficultyColor}10)`,
                                color: difficultyColor,
                                borderColor: `${difficultyColor}40`,
                                boxShadow: `0 2px 6px ${difficultyGlow}20`,
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                              }}
                            >
                              {index + 1}
                            </span>
                            <span className="pt-0.5 text-sm text-white leading-relaxed flex-1 font-medium" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)' }}>{step}</span>
                          </motion.li>
                        ))}
                      </ol>
                    </div>

                    {/* Pro Tips */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 rounded-full bg-[#00FFA9]" style={{ boxShadow: '0 0 8px rgba(0, 255, 169, 0.5)' }} />
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-wider" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)' }}>
                          {t('installationGuide.tips')}
                        </h4>
                      </div>
                      <ul className="space-y-2.5">
                        {zone.tips.map((tip, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + (zone.steps.length + index) * 0.05, type: 'spring', stiffness: 300 }}
                            className="flex gap-2.5 items-start"
                          >
                            <div
                              className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-[#00FFA9]/20 to-[#00FFA9]/10 border border-[#00FFA9]/30 flex items-center justify-center transition-all"
                              style={{
                                boxShadow: '0 2px 6px rgba(0, 255, 169, 0.2)',
                              }}
                            >
                              <span className="text-[#00FFA9] text-sm">💡</span>
                            </div>
                            <span className="pt-0.5 text-sm text-white leading-relaxed flex-1 font-medium" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)' }}>{tip}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })()}
          </AnimatePresence>
        )}

        <svg
          ref={svgRef}
          viewBox="0 0 2816 1536"
          className="w-full h-full"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(0, 255, 169, 0.3))',
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Load SVG from file based on model - Light graphite color */}
          <image
            href={getSvgPath()}
            x="0"
            y="0"
            width="2816"
            height="1536"
            preserveAspectRatio="xMidYMid meet"
            style={{
              filter: 'brightness(0.85) saturate(0.3) contrast(1.1)',
              opacity: 0.9,
            }}
          />

          {/* Interactive zones as circles */}
          {zones.map(zone => {
            const isActive = activeZone === zone.id
            const isHovered = hoveredZone === zone.id
            const color = getDifficultyColor(zone.difficulty)
            const glowColor = getDifficultyGlow(zone.difficulty)
            
            // Convert percentage coordinates to viewBox coordinates
            const centerX = (zone.x / 100) * 2816
            const centerY = (zone.y / 100) * 1536
            const radius = (zone.radius / 100) * Math.min(2816, 1536)
            
            return (
              <g key={zone.id}>
                {/* Pulsating glow effect (double radius) */}
                {(isActive || isHovered) && (
                  <motion.circle
                    cx={centerX}
                    cy={centerY}
                    r={radius * 2}
                    fill="none"
                    stroke={glowColor}
                    strokeWidth="3"
                    opacity={0.4}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: [0.4, 0.6, 0.4],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* Outer glow circle */}
                {(isActive || isHovered) && (
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius * 1.5}
                    fill="none"
                    stroke={glowColor}
                    strokeWidth="2"
                    opacity={0.3}
                    style={{
                      filter: `drop-shadow(0 0 ${radius}px ${glowColor})`,
                    }}
                  />
                )}

                {/* Main circle - Larger and more visible */}
                <circle
                  data-zone-circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill={isActive || isHovered ? `${color}50` : `${color}30`}
                  stroke={color}
                  strokeWidth={isActive || isHovered ? '6' : '4'}
                  style={{
                    cursor: draggedZone === zone.id ? 'grabbing' : 'grab',
                    filter: isActive || isHovered 
                      ? `drop-shadow(0 0 ${radius * 0.8}px ${glowColor}) drop-shadow(0 0 ${radius * 1.2}px ${glowColor}80)`
                      : `drop-shadow(0 0 ${radius * 0.4}px ${glowColor}60)`,
                    transition: draggedZone === zone.id ? 'none' : 'all 0.3s ease',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleMouseDown(e, zone.id)
                  }}
                  onMouseEnter={() => {
                    if (!draggedZone) {
                      setHoveredZone(zone.id)
                      setActiveZone(zone.id)
                    }
                  }}
                  onMouseLeave={() => {
                    if (!draggedZone) {
                      // Don't close immediately - allow moving to panel
                      setTimeout(() => {
                        setHoveredZone(null)
                        if (!isActive) {
                          setActiveZone(null)
                        }
                      }, 200)
                    }
                  }}
                  onClick={(e) => {
                    if (!draggedZone) {
                      setActiveZone(isActive ? null : zone.id)
                    }
                  }}
                  onTouchStart={(e) => {
                    if (!draggedZone) {
                      setHoveredZone(zone.id)
                      setActiveZone(zone.id)
                    }
                  }}
                />
              </g>
            )
          })}
        </svg>

      </div>
    </div>
  )
}

