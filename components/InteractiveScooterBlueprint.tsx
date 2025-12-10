'use client'

/**
 * Interactive Scooter Blueprint Component
 * Linear 3D drawing with interactive zones showing installation information
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface InstallationZone {
  id: string
  x: number // Center X in percentage
  y: number // Center Y in percentage
  radius: number // Radius in percentage
  name: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  time: string
  steps: string[]
  tips: string[]
  side?: 'left' | 'right' // Which side to show info panel
}

const installationZones: InstallationZone[] = [
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
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [zones, setZones] = useState<InstallationZone[]>(installationZones)
  const [draggedZone, setDraggedZone] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeZoneData = zones.find(z => z.id === activeZone)

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
    switch (difficulty) {
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
    switch (difficulty) {
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
      {/* Sticky info panel - Redesigned with modern UI */}
      <AnimatePresence mode="wait">
        {(activeZone || hoveredZone) && (() => {
          const zone = zones.find(z => z.id === (activeZone || hoveredZone))
          if (!zone) return null
          
          const difficultyColor = getDifficultyColor(zone.difficulty)
          const difficultyGlow = getDifficultyGlow(zone.difficulty)
          
          return (
            <motion.div
              key={`info-${activeZone || hoveredZone}`}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 280, damping: 28 }}
              className="sticky bottom-0 z-[105] w-full mt-8"
              style={{
                background: `linear-gradient(to top, rgba(0, 0, 0, 0.99) 0%, rgba(0, 0, 0, 0.97) 40%, rgba(0, 0, 0, 0.94) 100%)`,
                backdropFilter: 'blur(28px) saturate(200%)',
                WebkitBackdropFilter: 'blur(28px) saturate(200%)',
                borderTop: `4px solid ${difficultyColor}70`,
                boxShadow: `0 -16px 64px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 60px ${difficultyGlow}50`,
              }}
            >
              <div className="container mx-auto px-5 md:px-10 lg:px-20 max-w-6xl">
                {/* Header Section - Polished */}
                <div className="py-7 border-b border-white/12">
                  <div className="flex items-start justify-between gap-5 mb-4">
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
                      {zone.name}
                    </h3>
                    <motion.button
                      onClick={() => {
                        setActiveZone(null)
                        setHoveredZone(null)
                      }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 border border-white/15 flex items-center justify-center transition-all"
                      aria-label="Close"
                    >
                      <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${difficultyColor}25, ${difficultyColor}15)`,
                        color: difficultyColor,
                        border: `2px solid ${difficultyColor}60`,
                        boxShadow: `0 4px 12px ${difficultyGlow}40, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                      }}
                    >
                      {zone.difficulty}
                    </motion.span>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center gap-2.5 text-white/75 text-sm"
                    >
                      <svg className="w-4.5 h-4.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">{zone.time}</span>
                    </motion.div>
                  </div>
                </div>

                {/* Content Grid - Two Columns - Polished */}
                <div className="grid md:grid-cols-2 gap-8 py-8">
                  {/* Installation Steps */}
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-1.5 h-7 rounded-full" style={{ background: difficultyColor, boxShadow: `0 0 12px ${difficultyGlow}60` }} />
                      <h4 className="text-xs font-bold text-white/90 uppercase tracking-widest">
                        Installation Steps
                      </h4>
                    </div>
                    <ol className="space-y-4">
                      {zone.steps.map((step, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.08, type: 'spring', stiffness: 300 }}
                          className="flex gap-4 group"
                        >
                          <motion.span
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border-2 transition-all"
                            style={{
                              background: `linear-gradient(135deg, ${difficultyColor}25, ${difficultyColor}15)`,
                              color: difficultyColor,
                              borderColor: `${difficultyColor}60`,
                              boxShadow: `0 4px 12px ${difficultyGlow}30, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                            }}
                          >
                            {index + 1}
                          </motion.span>
                          <span className="pt-1.5 text-sm text-white/90 leading-relaxed flex-1 font-medium">{step}</span>
                        </motion.li>
                      ))}
                    </ol>
                  </div>

                  {/* Pro Tips */}
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-1.5 h-7 rounded-full bg-[#00FFA9]" style={{ boxShadow: '0 0 12px rgba(0, 255, 169, 0.6)' }} />
                      <h4 className="text-xs font-bold text-white/90 uppercase tracking-widest">
                        Pro Tips
                      </h4>
                    </div>
                    <ul className="space-y-4">
                      {zone.tips.map((tip, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + (zone.steps.length + index) * 0.08, type: 'spring', stiffness: 300 }}
                          className="flex gap-4 group"
                        >
                          <motion.div
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#00FFA9]/25 to-[#00FFA9]/15 border-2 border-[#00FFA9]/40 flex items-center justify-center transition-all"
                            style={{
                              boxShadow: '0 4px 12px rgba(0, 255, 169, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            <span className="text-[#00FFA9] text-xl">💡</span>
                          </motion.div>
                          <span className="pt-1.5 text-sm text-white/90 leading-relaxed flex-1 font-medium">{tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* SVG Blueprint */}
      <div ref={containerRef} className="relative w-full aspect-[2816/1536] max-w-4xl mx-auto overflow-visible">
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
          {/* Load SVG from file based on model */}
          <image
            href={getSvgPath()}
            x="0"
            y="0"
            width="2816"
            height="1536"
            preserveAspectRatio="xMidYMid meet"
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
                      // Delay closing to allow moving to panel
                      setTimeout(() => {
                        setHoveredZone(null)
                        if (!isActive) {
                          setActiveZone(null)
                        }
                      }, 100)
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

