'use client'

import React from 'react'
import { DesignStatus } from '@prisma/client'

const STATUS_ORDER: DesignStatus[] = [
  DesignStatus.CREATIVE,
  DesignStatus.MODELING_3D,
  DesignStatus.UV_TEMPLATE,
  DesignStatus.PRINTING,
  DesignStatus.FOR_SALE,
  DesignStatus.SOLD,
  DesignStatus.DELIVERY,
  DesignStatus.FEEDBACK,
]

const STATUS_LABELS: Record<DesignStatus, { active: string; past: string }> = {
  [DesignStatus.CREATIVE]: {
    active: 'В разработке',
    past: 'Разработано',
  },
  [DesignStatus.MODELING_3D]: {
    active: '3D моделирование',
    past: 'Смоделировано',
  },
  [DesignStatus.UV_TEMPLATE]: {
    active: 'UV развертка',
    past: 'Развернуто',
  },
  [DesignStatus.PRINTING]: {
    active: 'В печати',
    past: 'Напечатано',
  },
  [DesignStatus.FOR_SALE]: {
    active: 'В продаже',
    past: 'Продано',
  },
  [DesignStatus.SOLD]: {
    active: 'Продано',
    past: 'Продано',
  },
  [DesignStatus.DELIVERY]: {
    active: 'Доставка',
    past: 'Доставлено',
  },
  [DesignStatus.FEEDBACK]: {
    active: 'Обратная связь',
    past: 'Завершено',
  },
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
  const getStatusDate = (status: DesignStatus): Date | null => {
    const historyEntry = statusHistory.find(h => h.status === status)
    return historyEntry ? new Date(historyEntry.at) : null
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
      <div className="space-y-4">
        {STATUS_ORDER.map((status, index) => {
          const isCompleted = isStatusCompleted(status)
          const isActive = isStatusActive(status)
          const date = getStatusDate(status)
          const labels = STATUS_LABELS[status]

          return (
            <div key={status} className="flex items-start gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isActive
                      ? 'bg-[#00FFA9] ring-4 ring-[#00FFA9]/30'
                      : isCompleted
                        ? 'bg-[#00FFA9]'
                        : 'bg-white/20'
                  }`}
                />
                {index < STATUS_ORDER.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 mt-2 ${
                      isCompleted ? 'bg-[#00FFA9]' : 'bg-white/10'
                    }`}
                    style={{ minHeight: '40px' }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div
                  className={`font-medium ${
                    isActive
                      ? 'text-[#00FFA9]'
                      : isCompleted
                        ? 'text-white'
                        : 'text-white/40'
                  }`}
                >
                  {isActive ? labels.active : isCompleted ? labels.past : labels.active}
                </div>
                {date && (
                  <div className="text-xs text-white/50 mt-1">
                    {new Date(date).toLocaleString('ru-RU')}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Horizontal timeline
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-4">
      {STATUS_ORDER.map((status, index) => {
        const isCompleted = isStatusCompleted(status)
        const isActive = isStatusActive(status)
        const date = getStatusDate(status)
        const labels = STATUS_LABELS[status]

        return (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center min-w-[100px]">
              <div
                className={`w-3 h-3 rounded-full mb-2 ${
                  isActive
                    ? 'bg-[#00FFA9] ring-4 ring-[#00FFA9]/30'
                    : isCompleted
                      ? 'bg-[#00FFA9]'
                      : 'bg-white/20'
                }`}
              />
              <div
                className={`text-xs text-center ${
                  isActive
                    ? 'text-[#00FFA9] font-semibold'
                    : isCompleted
                      ? 'text-white'
                      : 'text-white/40'
                }`}
              >
                {isActive ? labels.active : isCompleted ? labels.past : labels.active}
              </div>
              {date && (
                <div className="text-xs text-white/50 mt-1 text-center">
                  {new Date(date).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </div>
              )}
            </div>
            {index < STATUS_ORDER.length - 1 && (
              <div
                className={`h-0.5 flex-1 min-w-[40px] ${
                  isCompleted ? 'bg-[#00FFA9]' : 'bg-white/10'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

