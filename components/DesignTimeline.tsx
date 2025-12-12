'use client'

import React, { useMemo } from 'react'
import { DesignStatus } from '@prisma/client'
import {
  Palette,
  Box,
  Layers,
  Printer,
  ShoppingCart,
  Truck,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'

const STATUS_ORDER: DesignStatus[] = [
  DesignStatus.CREATIVE,
  DesignStatus.MODELING_3D,
  DesignStatus.UV_TEMPLATE,
  DesignStatus.PRINTING,
  DesignStatus.FOR_SALE,
  DesignStatus.DELIVERY,
  DesignStatus.FEEDBACK,
]

const STATUS_LABELS: Record<DesignStatus, { active: string; past: string }> = {
  [DesignStatus.CREATIVE]: {
    active: 'Creative',
    past: 'Creative',
  },
  [DesignStatus.MODELING_3D]: {
    active: '3D',
    past: '3D',
  },
  [DesignStatus.UV_TEMPLATE]: {
    active: 'UV Template',
    past: 'UV Template',
  },
  [DesignStatus.PRINTING]: {
    active: 'Printing',
    past: 'Printing',
  },
  [DesignStatus.FOR_SALE]: {
    active: 'For Sale',
    past: 'For Sale',
  },
  [DesignStatus.DELIVERY]: {
    active: 'Delivery',
    past: 'Delivery',
  },
  [DesignStatus.FEEDBACK]: {
    active: 'Feedback',
    past: 'Feedback',
  },
  [DesignStatus.SOLD]: {
    active: 'Sold',
    past: 'Sold',
  },
}

const STATUS_ICONS: Record<DesignStatus, React.ComponentType<{ className?: string }>> = {
  [DesignStatus.CREATIVE]: Palette,
  [DesignStatus.MODELING_3D]: Box,
  [DesignStatus.UV_TEMPLATE]: Layers,
  [DesignStatus.PRINTING]: Printer,
  [DesignStatus.FOR_SALE]: ShoppingCart,
  [DesignStatus.DELIVERY]: Truck,
  [DesignStatus.FEEDBACK]: MessageSquare,
  [DesignStatus.SOLD]: CheckCircle2,
}

interface DesignTimelineProps {
  currentStatus: DesignStatus
  statusHistory: Array<{ status: DesignStatus; at: Date; note?: string | null }>
  orientation?: 'horizontal' | 'vertical'
}

export default function DesignTimeline({
  currentStatus,
  statusHistory,
  orientation = 'horizontal',
}: DesignTimelineProps) {
  // Normalize statusHistory to ensure dates are Date objects
  const normalizedHistory = useMemo(() => {
    return statusHistory.map(h => ({
      ...h,
      at: h.at instanceof Date ? h.at : new Date(h.at),
    }))
  }, [statusHistory])

  const getStatusDate = (status: DesignStatus): Date | null => {
    const historyEntry = normalizedHistory.find(h => h.status === status)
    return historyEntry ? historyEntry.at : null
  }

  const isStatusCompleted = (status: DesignStatus): boolean => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus)
    const statusIndex = STATUS_ORDER.indexOf(status)
    return statusIndex < currentIndex
  }

  const isStatusActive = (status: DesignStatus): boolean => {
    return status === currentStatus
  }

  if (orientation === 'vertical') {
    return (
      <div className="space-y-6">
        {STATUS_ORDER.map((status, index) => {
          const isCompleted = isStatusCompleted(status)
          const isActive = isStatusActive(status)
          const date = getStatusDate(status)
          const labels = STATUS_LABELS[status]
          const Icon = STATUS_ICONS[status]

          // Format date consistently
          const formattedDate = date
            ? date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : null

          return (
            <div key={status} className="flex items-start gap-4 relative">
              {/* Icon container - iOS 26 vertical */}
              <div className="flex flex-col items-center relative">
                {/* Icon node - iOS 26 glassmorphism */}
                <div className="relative">
                  {isActive && (
                    <div 
                      className="absolute inset-0 rounded-2xl bg-[#00FFA9]/20 backdrop-blur-xl animate-pulse" 
                      style={{ 
                        transform: 'scale(1.4)',
                        filter: 'blur(8px)',
                      }} 
                    />
                  )}
                  <div
                    className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isActive
                        ? 'bg-[#00FFA9]/30 backdrop-blur-2xl border border-[#00FFA9]/40 scale-110'
                        : isCompleted
                          ? 'bg-[#00FFA9]/20 backdrop-blur-xl border border-[#00FFA9]/30'
                          : 'bg-white/5 backdrop-blur-xl border border-white/10'
                    }`}
                    style={{
                      boxShadow: isActive
                        ? '0 8px 32px rgba(0, 255, 169, 0.3), 0 0 0 1px rgba(0, 255, 169, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : isCompleted
                          ? '0 4px 16px rgba(0, 255, 169, 0.2), 0 0 0 1px rgba(0, 255, 169, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                          : '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <Icon
                      className={`w-5 h-5 transition-all duration-300 ${
                        isActive || isCompleted
                          ? 'text-[#00FFA9]'
                          : 'text-white/40'
                      }`}
                    />
                    {isCompleted && !isActive && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00FFA9] flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Connecting line - iOS 26 style */}
                {index < STATUS_ORDER.length - 1 && (
                  <div className="flex flex-col items-center mt-3">
                    <ChevronRight
                      className={`w-5 h-5 rotate-90 transition-all duration-300 ${
                        isCompleted
                          ? 'text-[#00FFA9]/60'
                          : 'text-white/20'
                      }`}
                    />
                    <div
                      className={`w-0.5 flex-1 rounded-full transition-all duration-1000 backdrop-blur-sm ${
                        isCompleted ? 'bg-[#00FFA9]/30' : 'bg-white/10'
                      }`}
                      style={{
                        minHeight: '40px',
                        boxShadow: isCompleted 
                          ? '0 2px 8px rgba(0, 255, 169, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                          : '0 1px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                        border: isCompleted 
                          ? '1px solid rgba(0, 255, 169, 0.2)' 
                          : '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Content - iOS 26 style */}
              <div className="flex-1 pb-4 pt-1">
                <div
                  className={`font-medium text-base mb-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'text-[#00FFA9] bg-[#00FFA9]/10 backdrop-blur-sm scale-105' 
                      : isCompleted 
                        ? 'text-white/90' 
                        : 'text-white/50'
                  }`}
                  style={{
                    textShadow: isActive 
                      ? '0 1px 2px rgba(0, 255, 169, 0.3)' 
                      : 'none',
                  }}
                >
                  {isActive ? labels.active : isCompleted ? labels.past : labels.active}
                </div>
                {formattedDate && (
                  <div className={`text-xs mt-1 px-3 py-0.5 rounded-md transition-all duration-300 ${
                    isActive || isCompleted 
                      ? 'text-white/70 bg-white/5 backdrop-blur-sm' 
                      : 'text-white/40'
                  }`}>
                    {formattedDate}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Horizontal timeline - iOS 26 Chain of Events Design with Icons
  return (
    <div className="relative w-full py-8">
      <div className="relative flex items-center justify-center gap-2 overflow-x-auto pb-4">
        {STATUS_ORDER.map((status, index) => {
          const isCompleted = isStatusCompleted(status)
          const isActive = isStatusActive(status)
          const date = getStatusDate(status)
          const labels = STATUS_LABELS[status]
          const Icon = STATUS_ICONS[status]

          // Format date consistently
          const formattedDate = date
            ? date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
              })
            : null

          return (
            <React.Fragment key={status}>
              <div className="relative flex flex-col items-center min-w-[100px] z-10">
                {/* Icon container - iOS 26 glassmorphism */}
                <div className="relative mb-3">
                  {/* Outer glow ring for active - iOS 26 soft glow */}
                  {isActive && (
                    <div 
                      className="absolute inset-0 rounded-2xl bg-[#00FFA9]/20 backdrop-blur-xl animate-pulse" 
                      style={{ 
                        transform: 'scale(1.4)',
                        filter: 'blur(8px)',
                      }} 
                    />
                  )}
                  
                  {/* Icon container - iOS 26 glassmorphism */}
                  <div
                    className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isActive
                        ? 'bg-[#00FFA9]/30 backdrop-blur-2xl border border-[#00FFA9]/40 scale-110'
                        : isCompleted
                          ? 'bg-[#00FFA9]/20 backdrop-blur-xl border border-[#00FFA9]/30'
                          : 'bg-white/5 backdrop-blur-xl border border-white/10'
                    }`}
                    style={{
                      boxShadow: isActive
                        ? '0 8px 32px rgba(0, 255, 169, 0.3), 0 0 0 1px rgba(0, 255, 169, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : isCompleted
                          ? '0 4px 16px rgba(0, 255, 169, 0.2), 0 0 0 1px rgba(0, 255, 169, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                          : '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {/* Icon */}
                    <Icon
                      className={`w-6 h-6 transition-all duration-300 ${
                        isActive || isCompleted
                          ? 'text-[#00FFA9]'
                          : 'text-white/40'
                      }`}
                    />
                    
                    {/* Checkmark overlay for completed */}
                    {isCompleted && !isActive && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00FFA9] flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Label - iOS 26 typography */}
                <div
                  className={`text-sm font-medium text-center mb-1.5 transition-all duration-300 px-2 py-1 rounded-lg ${
                    isActive
                      ? 'text-[#00FFA9] bg-[#00FFA9]/10 backdrop-blur-sm scale-105'
                      : isCompleted
                        ? 'text-white/90'
                        : 'text-white/50'
                  }`}
                  style={{
                    textShadow: isActive 
                      ? '0 1px 2px rgba(0, 255, 169, 0.3)' 
                      : 'none',
                  }}
                >
                  {isActive ? labels.active : isCompleted ? labels.past : labels.active}
                </div>

                {/* Date - iOS 26 style */}
                {formattedDate && (
                  <div
                    className={`text-xs text-center transition-all duration-300 px-2 py-0.5 rounded-md ${
                      isActive || isCompleted 
                        ? 'text-white/70 bg-white/5 backdrop-blur-sm' 
                        : 'text-white/40'
                    }`}
                  >
                    {formattedDate}
                  </div>
                )}
              </div>

              {/* Chevron arrow between icons */}
              {index < STATUS_ORDER.length - 1 && (
                <div className="flex items-center px-2">
                  <ChevronRight
                    className={`w-6 h-6 transition-all duration-300 ${
                      isCompleted
                        ? 'text-[#00FFA9]/60'
                        : 'text-white/20'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
