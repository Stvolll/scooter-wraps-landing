'use client'

import React, { useState } from 'react'
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

interface StageChecklistProps {
  currentStatus: DesignStatus
  statusHistory: Array<{ status: DesignStatus; at: Date; note?: string | null }>
  designId: string
}

export default function StageChecklist({
  currentStatus,
  statusHistory,
  designId,
}: StageChecklistProps) {
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState('')

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

  const canMoveToStatus = (status: DesignStatus): boolean => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus)
    const targetIndex = STATUS_ORDER.indexOf(status)
    // Can only move forward, and only to next status
    return targetIndex === currentIndex + 1
  }

  async function updateStatus(status: DesignStatus) {
    if (!canMoveToStatus(status)) {
      alert('Можно переходить только к следующему этапу')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/designs/${designId}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          note: note || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status')
      }

      // Reload page to show updated status
      window.location.reload()
    } catch (e: any) {
      console.error(e)
      alert(e.message || 'Ошибка при обновлении статуса')
    } finally {
      setSaving(false)
      setNote('')
    }
  }

  return (
    <div className="space-y-3">
      {STATUS_ORDER.map(status => {
        const isCompleted = isStatusCompleted(status)
        const isActive = isStatusActive(status)
        const date = getStatusDate(status)
        const labels = STATUS_LABELS[status]

        return (
          <div
            key={status}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
              isActive
                ? 'bg-[#00FFA9]/10 border-2 border-[#00FFA9]'
                : isCompleted
                  ? 'bg-[#00FFA9]/5 border border-[#00FFA9]/30'
                  : 'bg-white/5 border border-white/10'
            }`}
          >
            <input
              type="checkbox"
              checked={isCompleted || isActive}
              disabled={!canMoveToStatus(status) && !isCompleted}
              onChange={() => {
                if (canMoveToStatus(status)) {
                  updateStatus(status)
                }
              }}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#00FFA9] focus:ring-[#00FFA9] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex-1">
              <div className="font-medium text-white">
                {isActive ? labels.active : isCompleted ? labels.past : labels.active}
              </div>
              <div className="text-xs text-white/50">
                {date ? new Date(date).toLocaleString('ru-RU') : 'Не начато'}
              </div>
            </div>
            {isActive && canMoveToStatus(STATUS_ORDER[STATUS_ORDER.indexOf(status) + 1]) && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Примечание (опционально)"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const nextStatus = STATUS_ORDER[STATUS_ORDER.indexOf(status) + 1]
                      updateStatus(nextStatus)
                    }
                  }}
                />
              </div>
            )}
            {(isCompleted || isActive) && <span className="text-[#00FFA9] text-lg">✓</span>}
          </div>
        )
      })}
      {saving && <div className="text-white/60 text-sm">Сохранение…</div>}
    </div>
  )
}
