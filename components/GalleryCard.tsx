'use client'

/**
 * GalleryCard Component
 * 
 * Individual design card in the gallery.
 * Displays:
 * - Design preview image
 * - Design name
 * - Description
 * - Price
 * - "View details" button
 * - "New" badge if applicable
 */

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Design } from '@/lib/designsData'
import { useLanguage } from '@/contexts/LanguageContext'

interface GalleryCardProps {
  design: Design
  language: 'en' | 'vi'
  onClick: () => void
}

export default function GalleryCard({ design, language, onClick }: GalleryCardProps) {
  const { t } = useLanguage()

  const displayName = language === 'vi' ? design.nameVi : design.name
  const displayDescription = language === 'vi' ? design.descriptionVi : design.description
  const priceText = design.priceFrom ? `from $${design.price}` : `$${design.price}`

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="premium-card overflow-hidden cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      {/* Image Preview */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-neutral-200 to-neutral-300 overflow-hidden">
        {design.image ? (
          <Image
            src={design.image}
            alt={displayName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl font-bold text-neutral-400 opacity-20">
              {design.name.charAt(0)}
            </div>
          </div>
        )}
        
        {/* New Badge */}
        {design.isNew && (
          <div className="absolute top-4 right-4 bg-accent-neon text-accent-dark px-3 py-1 rounded-full text-sm font-bold">
            NEW
          </div>
        )}

        {/* Style Tags */}
        {design.style.length > 0 && (
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {design.style.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-2xl font-bold mb-2">{displayName}</h3>
        <p className="text-neutral-600 mb-4 flex-1 line-clamp-2">{displayDescription}</p>
        
        {/* Price and CTA */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-200">
          <span className="text-2xl font-bold text-accent-neon">{priceText}</span>
          <button className="text-accent-neon font-semibold hover:underline">
            {t('common.viewDetails')} →
          </button>
        </div>
      </div>
    </motion.div>
  )
}

