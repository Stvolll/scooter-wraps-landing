'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { DesignStatus } from '@prisma/client'
import DesignTimeline from '@/components/DesignTimeline'

interface DesignDetailClientProps {
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
    galleryImages: string[]
    videoPreview?: string | null
    glbModelUrl?: string | null
    textureUrl?: string | null
    status: DesignStatus
    statusHistory: Array<{ status: DesignStatus; at: Date; note?: string | null }>
  }
}

export default function DesignDetailClient({ design }: DesignDetailClientProps) {
  const canBuy = design.status === DesignStatus.FOR_SALE && design.editionAvailable > 0
  const isSoldOut = design.editionAvailable === 0 || design.status === DesignStatus.SOLD
  const isInDevelopment = design.status < DesignStatus.FOR_SALE

  const images = design.galleryImages.length > 0 ? design.galleryImages : design.coverImage ? [design.coverImage] : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white hover:text-[#00FFA9] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-semibold">Back to Gallery</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {images.length > 0 && (
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900">
                <Image
                  src={images[0]}
                  alt={design.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            )}

            {/* Timeline */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Production Status</h3>
              <DesignTimeline
                currentStatus={design.status}
                statusHistory={design.statusHistory}
                orientation="vertical"
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{design.title}</h1>
              <p className="text-xl text-white/60 mb-4">For {design.scooterModel}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-[#00FFA9]">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(design.price)}
                </span>
              </div>
            </div>

            {design.description && (
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <p className="text-white/70 leading-relaxed">{design.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {canBuy ? (
                <button
                  className="w-full py-4 rounded-2xl font-semibold text-black transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                    boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
                  }}
                >
                  Book Installation Now
                </button>
              ) : isInDevelopment ? (
                <button
                  className="w-full py-4 rounded-2xl font-semibold text-white/60 transition-all cursor-not-allowed"
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
                  className="w-full py-4 rounded-2xl font-semibold text-white/60 transition-all cursor-not-allowed"
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
        </div>
      </div>
    </div>
  )
}

