'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from '@/hooks/useTranslations'
import { ShoppingCart, Filter, X } from 'lucide-react'
import CheckoutModal from './CheckoutModal'

interface Design {
  id: string
  modelId: string
  name: string
  image: string
  price: number
  isNew: boolean
  style: string
}

// Mock data - in production, this would come from API
const MOCK_DESIGNS: Design[] = [
  { id: '1', modelId: 'honda-lead', name: 'Carbon Fiber Black', image: '/designs/carbon-black.jpg', price: 500000, isNew: false, style: 'sport' },
  { id: '2', modelId: 'honda-lead', name: 'Racing Stripes Red', image: '/designs/racing-red.jpg', price: 600000, isNew: true, style: 'racing' },
  { id: '3', modelId: 'honda-vision', name: 'Matte Blue', image: '/designs/matte-blue.jpg', price: 550000, isNew: false, style: 'elegant' },
  { id: '4', modelId: 'yamaha-nvx', name: 'Camouflage Green', image: '/designs/camo-green.jpg', price: 650000, isNew: true, style: 'military' },
  { id: '5', modelId: 'vinfast', name: 'Electric Blue', image: '/designs/electric-blue.jpg', price: 700000, isNew: false, style: 'futuristic' },
  { id: '6', modelId: 'vespa', name: 'Vintage Cream', image: '/designs/vintage-cream.jpg', price: 800000, isNew: false, style: 'vintage' },
]

export default function DesignCatalog() {
  const [designs, setDesigns] = useState<Design[]>(MOCK_DESIGNS)
  const [filteredDesigns, setFilteredDesigns] = useState<Design[]>(MOCK_DESIGNS)
  const [selectedModel, setSelectedModel] = useState<string>('all')
  const [selectedStyle, setSelectedStyle] = useState<string>('all')
  const [showNewOnly, setShowNewOnly] = useState(false)
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const { t, lang } = useTranslations()
  const locale = lang === 'vi' ? 'vi-VN' : 'en-US'

  const filterLabel = lang === 'vi' ? 'Lọc:' : 'Filter:'
  const modelOptions = lang === 'vi'
    ? [
        { value: 'all', label: 'Tất cả mẫu xe' },
        { value: 'honda-lead', label: 'Honda Lead' },
        { value: 'honda-vision', label: 'Honda Vision' },
        { value: 'honda-airblade', label: 'Honda Air Blade' },
        { value: 'yamaha-nvx', label: 'Yamaha NVX' },
        { value: 'vinfast', label: 'VinFast' },
        { value: 'vespa', label: 'Vespa' },
      ]
    : [
        { value: 'all', label: 'All models' },
        { value: 'honda-lead', label: 'Honda Lead' },
        { value: 'honda-vision', label: 'Honda Vision' },
        { value: 'honda-airblade', label: 'Honda Air Blade' },
        { value: 'yamaha-nvx', label: 'Yamaha NVX' },
        { value: 'vinfast', label: 'VinFast' },
        { value: 'vespa', label: 'Vespa' },
      ]

  const styleOptions = lang === 'vi'
    ? [
        { value: 'all', label: 'Tất cả phong cách' },
        { value: 'sport', label: 'Thể thao' },
        { value: 'racing', label: 'Đua xe' },
        { value: 'elegant', label: 'Thanh lịch' },
        { value: 'military', label: 'Quân đội' },
        { value: 'futuristic', label: 'Tương lai' },
        { value: 'vintage', label: 'Cổ điển' },
      ]
    : [
        { value: 'all', label: 'All styles' },
        { value: 'sport', label: 'Sport' },
        { value: 'racing', label: 'Racing' },
        { value: 'elegant', label: 'Elegant' },
        { value: 'military', label: 'Military' },
        { value: 'futuristic', label: 'Futuristic' },
        { value: 'vintage', label: 'Vintage' },
      ]

  const clearFiltersLabel = lang === 'vi' ? 'Xóa bộ lọc' : 'Clear filters'
  const newBadgeLabel = lang === 'vi' ? 'MỚI' : 'NEW'
  const noResultsText =
    lang === 'vi'
      ? 'Không tìm thấy thiết kế nào phù hợp với bộ lọc của bạn.'
      : 'No designs match your filters.'

  useEffect(() => {
    let filtered = [...designs]

    if (selectedModel !== 'all') {
      filtered = filtered.filter(d => d.modelId === selectedModel)
    }

    if (selectedStyle !== 'all') {
      filtered = filtered.filter(d => d.style === selectedStyle)
    }

    if (showNewOnly) {
      filtered = filtered.filter(d => d.isNew)
    }

    setFilteredDesigns(filtered)
  }, [selectedModel, selectedStyle, showNewOnly, designs])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const handleBuy = (design: Design) => {
    setSelectedDesign(design)
    setShowCheckout(true)
  }

  const handleModelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(event.target.value)
  }

  const handleStyleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStyle(event.target.value)
  }

  return (
    <section id="designs" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('designs.title')}
          </h2>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <span className="font-medium text-gray-700">{filterLabel}</span>
            </div>

            {/* Model Filter */}
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white min-h-[44px]"
            >
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Style Filter */}
            <select
              value={selectedStyle}
              onChange={handleStyleChange}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white min-h-[44px]"
            >
              {styleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* New Only Toggle */}
            <button
              onClick={() => setShowNewOnly(!showNewOnly)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                showNewOnly
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('designs.filterNew')}
            </button>

            {/* Clear Filters */}
            {(selectedModel !== 'all' || selectedStyle !== 'all' || showNewOnly) && (
              <button
                onClick={() => {
                  setSelectedModel('all')
                  setSelectedStyle('all')
                  setShowNewOnly(false)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center space-x-1 min-h-[44px]"
              >
                <X size={16} />
                <span>{clearFiltersLabel}</span>
              </button>
            )}
          </div>
        </div>

        {/* Design Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesigns.map((design: Design, index: number) => (
            <motion.div
              key={design.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={design.image}
                  alt={design.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {design.isNew && (
                  <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold new-badge">
                    {newBadgeLabel}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => handleBuy(design)}
                    className="opacity-0 hover:opacity-100 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-opacity flex items-center space-x-2"
                  >
                    <ShoppingCart size={20} />
                    <span>{t('designs.buyNow')}</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {design.name}
                </h3>
                <p className="text-primary-600 font-bold text-xl mb-4">
                  {formatPrice(design.price)}
                </p>
                <button
                  onClick={() => handleBuy(design)}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors min-h-[44px]"
                >
                  {t('designs.buyNow')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDesigns.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {noResultsText}
          </div>
        )}
      </div>

      {showCheckout && selectedDesign && (
        <CheckoutModal
          design={selectedDesign}
          onClose={() => {
            setShowCheckout(false)
            setSelectedDesign(null)
          }}
        />
      )}
    </section>
  )
}

