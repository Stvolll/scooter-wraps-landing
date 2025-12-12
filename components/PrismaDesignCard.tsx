'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function PrismaDesignCard({ design }: { design: any }) {
  const stages = design.stages || {}
  const published = !!design.published

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
      {design.coverImage ? (
        <div className="relative w-full h-48">
          <Image
            src={design.coverImage}
            alt={design.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : null}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1">{design.title}</h3>
        <div className="text-sm text-white/60 mb-3">{design.scooterModel}</div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {Object.entries(stages).map(([k, v]: any) => (
            <span
              key={k}
              className={`px-2 py-1 rounded text-xs ${
                v.done
                  ? 'bg-[#00FFA9]/20 text-[#00FFA9] border border-[#00FFA9]/30'
                  : 'bg-white/10 text-white/60 border border-white/10'
              }`}
            >
              {k} {v.done ? '✓' : ''}
            </span>
          ))}
        </div>

        <div className="mt-4">
          {published && design.editionAvailable > 0 ? (
            <Link
              href={`/designs/${design.slug}`}
              className="block w-full px-4 py-2 rounded-xl text-center font-medium text-black transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
                boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
              }}
            >
              Buy / Deal Open
            </Link>
          ) : !published ? (
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


