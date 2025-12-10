'use client'

/**
 * Interactive Scooter Blueprint Component
 * Linear 3D drawing with interactive zones showing installation information
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface InstallationZone {
  id: string
  x: number
  y: number
  width: number
  height: number
  name: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  time: string
  steps: string[]
  tips: string[]
}

const installationZones: InstallationZone[] = [
  {
    id: 'front-panel',
    x: 30,
    y: 25,
    width: 40,
    height: 25,
    name: 'Front Panel',
    difficulty: 'Medium',
    time: '15-20 min',
    steps: [
      'Clean surface with isopropyl alcohol',
      'Apply application solution',
      'Start from center, work outward',
      'Use squeegee to remove bubbles',
    ],
    tips: [
      'Work in sections',
      'Keep surface wet during application',
      'Use heat gun for curves',
    ],
  },
  {
    id: 'side-panels',
    x: 20,
    y: 50,
    width: 60,
    height: 30,
    name: 'Side Panels',
    difficulty: 'Hard',
    time: '30-45 min',
    steps: [
      'Remove all panels if possible',
      'Clean thoroughly',
      'Apply in one continuous motion',
      'Trim excess with precision knife',
    ],
    tips: [
      'Remove panels for best results',
      'Work from top to bottom',
      'Use relief cuts for complex curves',
    ],
  },
  {
    id: 'rear-cover',
    x: 70,
    y: 55,
    width: 30,
    height: 20,
    name: 'Rear Cover',
    difficulty: 'Easy',
    time: '10-15 min',
    steps: [
      'Clean surface',
      'Apply from top edge',
      'Smooth downward',
      'Trim edges',
    ],
    tips: ['Flat surface - easiest part', 'Work quickly before solution dries'],
  },
  {
    id: 'under-panel',
    x: 25,
    y: 75,
    width: 50,
    height: 15,
    name: 'Under Panel',
    difficulty: 'Medium',
    time: '20-25 min',
    steps: [
      'Lift scooter if needed',
      'Clean underside thoroughly',
      'Apply with extra solution',
      'Allow extra time to dry',
    ],
    tips: [
      'Hardest to reach area',
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
  const activeZoneData = installationZones.find(z => z.id === activeZone)

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

  return (
    <div className="relative w-full">
      {/* SVG Blueprint */}
      <div className="relative w-full aspect-square max-w-2xl mx-auto">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(0, 255, 169, 0.3))',
          }}
        >
          {/* Scooter body outline - linear 3D style */}
          <g stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Main body frame */}
            <rect x="30" y="40" width="140" height="80" rx="5" opacity="0.9" />
            
            {/* 3D perspective lines */}
            <line x1="30" y1="40" x2="25" y2="35" opacity="0.6" />
            <line x1="170" y1="40" x2="175" y2="35" opacity="0.6" />
            <line x1="30" y1="120" x2="25" y2="125" opacity="0.6" />
            <line x1="170" y1="120" x2="175" y2="125" opacity="0.6" />
            
            {/* Front wheel */}
            <circle cx="50" cy="140" r="20" opacity="0.9" />
            <circle cx="50" cy="140" r="15" opacity="0.5" />
            <line x1="50" y1="120" x2="50" y2="140" opacity="0.6" />
            
            {/* Rear wheel */}
            <circle cx="150" cy="140" r="20" opacity="0.9" />
            <circle cx="150" cy="140" r="15" opacity="0.5" />
            <line x1="150" y1="120" x2="150" y2="140" opacity="0.6" />
            
            {/* Handlebar */}
            <line x1="50" y1="40" x2="50" y2="20" opacity="0.9" />
            <line x1="50" y1="20" x2="70" y2="20" opacity="0.9" />
            <line x1="70" y1="20" x2="70" y2="40" opacity="0.9" />
            <line x1="50" y1="20" x2="45" y2="18" opacity="0.6" />
            <line x1="70" y1="20" x2="75" y2="18" opacity="0.6" />
            
            {/* Seat */}
            <ellipse cx="100" cy="40" rx="30" ry="15" opacity="0.9" />
            <ellipse cx="100" cy="40" rx="25" ry="12" opacity="0.5" />
            
            {/* Additional detail lines */}
            <line x1="60" y1="50" x2="140" y2="50" opacity="0.4" strokeDasharray="2,2" />
            <line x1="60" y1="70" x2="140" y2="70" opacity="0.4" strokeDasharray="2,2" />
            <line x1="60" y1="90" x2="140" y2="90" opacity="0.4" strokeDasharray="2,2" />
            <line x1="60" y1="110" x2="140" y2="110" opacity="0.4" strokeDasharray="2,2" />
          </g>

          {/* Interactive zones */}
          {installationZones.map(zone => {
            const isActive = activeZone === zone.id
            return (
              <g key={zone.id}>
                {/* Zone area */}
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  fill={isActive ? 'rgba(0, 255, 169, 0.2)' : 'transparent'}
                  stroke={isActive ? '#00FFA9' : 'rgba(255, 255, 255, 0.3)'}
                  strokeWidth={isActive ? '2' : '1'}
                  strokeDasharray={isActive ? '0' : '4,4'}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setActiveZone(zone.id)}
                  onMouseLeave={() => setActiveZone(null)}
                  onClick={() => setActiveZone(isActive ? null : zone.id)}
                />
                
                {/* Zone label */}
                {isActive && (
                  <motion.text
                    x={zone.x + zone.width / 2}
                    y={zone.y + zone.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#00FFA9"
                    fontSize="10"
                    fontWeight="bold"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {zone.name}
                  </motion.text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Information Panel */}
      <AnimatePresence>
        {activeZoneData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-8 p-6 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{activeZoneData.name}</h3>
                <div className="flex items-center gap-4">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      background: `${getDifficultyColor(activeZoneData.difficulty)}20`,
                      color: getDifficultyColor(activeZoneData.difficulty),
                      border: `1px solid ${getDifficultyColor(activeZoneData.difficulty)}40`,
                    }}
                  >
                    {activeZoneData.difficulty}
                  </span>
                  <span className="text-white/60 text-sm">⏱ {activeZoneData.time}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveZone(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Steps */}
              <div>
                <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">
                  Installation Steps
                </h4>
                <ol className="space-y-2">
                  {activeZoneData.steps.map((step, index) => (
                    <li key={index} className="flex gap-3 text-sm text-white/70">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00FFA9]/20 text-[#00FFA9] flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              <div>
                <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">
                  Pro Tips
                </h4>
                <ul className="space-y-2">
                  {activeZoneData.tips.map((tip, index) => (
                    <li key={index} className="flex gap-3 text-sm text-white/70">
                      <span className="text-[#00FFA9] mt-1">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

