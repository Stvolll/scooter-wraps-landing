'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { DesignStatus } from '@prisma/client'
import DesignTimeline from './DesignTimeline'

interface DesignCardProps {
  design: {
    id: string
    title: string
    slug: string
    scooterModel: string
    description?: string | null
    price: number
    editionAvailable: number
    editionTotal: number
    coverImage?: string | null
    status: DesignStatus
    statusHistory?: Array<{ status: DesignStatus; at: Date; note?: string | null }>
  }
}

export default function DesignCard({ design }: DesignCardProps) {
  const canBuy = design.status === DesignStatus.FOR_SALE && design.editionAvailable > 0
  const isSoldOut = design.editionAvailable === 0 || design.status === DesignStatus.SOLD
  const isInDevelopment = design.status < DesignStatus.FOR_SALE

  return (
    <article
      className="rounded-[28px] overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
      }}
    >
      {design.coverImage && (
        <div className="relative w-full h-48">
          <Image
            src={design.coverImage}
            alt={design.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1">{design.title}</h3>
        <div className="text-sm text-white/60 mb-3">{design.scooterModel}</div>

        {/* Timeline */}
        {design.statusHistory && design.statusHistory.length > 0 && (
          <div className="mb-4">
            <DesignTimeline
              currentStatus={design.status}
              statusHistory={design.statusHistory}
              orientation="horizontal"
            />
          </div>
        )}

        {/* Status badge */}
        <div className="mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              canBuy
                ? 'bg-[#00FFA9]/20 text-[#00FFA9] border border-[#00FFA9]/30'
                : isSoldOut
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/10 text-white/60 border border-white/10'
            }`}
          >
            {canBuy
              ? `В продаже (${design.editionAvailable}/${design.editionTotal})`
              : isSoldOut
                ? 'Распродано'
                : 'В разработке'}
          </span>
        </div>

        {/* Action button */}
        <div className="mt-4">
          {canBuy ? (
            <Link
              href={`/designs/${design.slug}`}
              className="block w-full px-4 py-2 rounded-xl text-center font-medium text-black transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
              }}
            >
              Deal Open / Открыта сделка
            </Link>
          ) : isInDevelopment ? (
            <button
              className="w-full px-4 py-2 rounded-xl text-center font-medium text-white/60 transition-all cursor-not-allowed"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              disabled
            >
              In Development / Đang phát triển
            </button>
          ) : (
            <button
              className="w-full px-4 py-2 rounded-xl text-center font-medium text-white/60 transition-all cursor-not-allowed"
              style={{
                background: 'rgba(255, 59, 48, 0.1)',
                border: '1px solid rgba(255, 59, 48, 0.2)',
              }}
              disabled
            >
              Sold Out / Hết hàng
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
