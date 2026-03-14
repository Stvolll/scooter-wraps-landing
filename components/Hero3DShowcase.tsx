'use client'

/**
 * Hero3DShowcase - delegates to single loader only.
 * Does NOT call useGLTF. ModelViewer renders PlatformCanvasModelScene → ModelScene3D (useGLTF).
 */

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from '@/hooks/useTranslations'
import { ShoppingCart, ZoomIn } from 'lucide-react'
import CanvasWithModelScene from './CanvasWithModelScene'

const SCOOTER_MODELS = [
  { id: 'nvx', name: 'Yamaha NVX', glbPath: '/models/yamaha-nvx.glb' },
  { id: 'sh160', name: 'Honda SH160i', glbPath: '/models/sh160.glb' },
  { id: 'a-vision', name: 'A-Vision', glbPath: '/models/a-vision.glb' },
]

const DESIGN_VARIATIONS: Record<string, string[]> = {
  nvx: ['/textures/design-1.jpg', '/textures/design-2.jpg', '/textures/design-3.jpg'],
  sh160: ['/textures/design-1.jpg', '/textures/design-2.jpg', '/textures/design-3.jpg'],
  'a-vision': ['/textures/design-1.jpg', '/textures/design-2.jpg', '/textures/design-3.jpg'],
  vinfast: ['/textures/design-1.jpg', '/textures/design-2.jpg', '/textures/design-3.jpg'],
  vespa: ['/textures/design-1.jpg', '/textures/design-2.jpg', '/textures/design-3.jpg'],
}

function ModelViewer({
  modelId,
  designIndex,
  onDesignChange,
  onTap,
}: {
  modelId: string
  designIndex: number
  onDesignChange: (index: number) => void
  onTap: () => void
}) {
  const [isRotating, setIsRotating] = useState(false)
  const rotationRef = useRef(0)
  const { t } = useTranslations()

  const model = SCOOTER_MODELS.find(m => m.id === modelId)
  const modelUrl = model?.glbPath || '/models/yamaha-nvx.glb'

  const handlePointerDown = () => setIsRotating(true)

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isRotating) {
      rotationRef.current += e.movementX * 0.01
      const newDesignIndex = Math.floor(Math.abs(rotationRef.current) / ((Math.PI * 2) / 3)) % 3
      if (newDesignIndex !== designIndex) onDesignChange(newDesignIndex)
    }
  }

  const handlePointerUp = () => setIsRotating(false)

  return (
    <div
      className="relative w-full h-full"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={onTap}
    >
      <CanvasWithModelScene modelUrl={modelUrl} />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
        {t('hero.swipeHint')}
      </div>
    </div>
  )
}

export default function Hero3DShowcase() {
  const [selectedModel, setSelectedModel] = useState(0)
  const [designIndex, setDesignIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { t } = useTranslations()

  const scrollToDesigns = () => {
    const element = document.getElementById('designs')
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="models" className="hero-section bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t('hero.title')}</h1>
          <p className="text-xl text-gray-600">{t('hero.subtitle')}</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {SCOOTER_MODELS.map((model, index) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(index)
                setDesignIndex(0)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all min-h-[44px] ${
                selectedModel === index
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-2xl">
          <ModelViewer
            modelId={SCOOTER_MODELS[selectedModel].id}
            designIndex={designIndex}
            onDesignChange={setDesignIndex}
            onTap={scrollToDesigns}
          />
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors"
            aria-label="Fullscreen"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={scrollToDesigns}
            className="absolute top-4 left-4 p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-lg transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart size={20} />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {DESIGN_VARIATIONS[SCOOTER_MODELS[selectedModel].id]?.map((_, index) => (
            <button
              key={index}
              onClick={() => setDesignIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                designIndex === index ? 'bg-primary-600 w-8' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full h-full max-w-6xl"
              onClick={e => e.stopPropagation()}
            >
              <ModelViewer
                modelId={SCOOTER_MODELS[selectedModel].id}
                designIndex={designIndex}
                onDesignChange={setDesignIndex}
                onTap={() => {}}
              />
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-lg text-gray-900 font-bold"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
