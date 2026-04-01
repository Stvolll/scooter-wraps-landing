'use client'

/**
 * Model Page - Displays a single model with all its designs
 * Route: /model/:id
 * 
 * Features:
 * - 3D viewer with model.glb + active design texture
 * - Tabs: Design 11 | Design 12 | Design 13...
 * - SEO meta from model.seo_info
 */

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
// Metadata will be handled via metadata export in future
import ThreeDViewerPlaceholder from '@/components/ThreeDViewerPlaceholder'
import DesignCard from '@/components/DesignCard'

// ИЗМЕНЕНО: Используем новый движок ScooterViewer3DWithDesigns
import ScooterViewer from '@/components/ScooterViewer3DWithDesignsWrapper'

interface ModelData {
  model: {
    id: string
    name: string
    model: string
    glbModelUrl: string | null
    glbModelCompressed: string | null
    glbModelMobile: string | null
    seo_info: {
      title: string
      description: string | null
    }
  }
  designs: Array<{
    id: string
    name: string
    slug: string
    texture_webp: string | null
    texture?: string | null
    textures?: { body?: string; plastic?: string; accents?: string }
    bg_webp: string | null
    design_info: {
      film_type: string | null
      seo_title: string
    }
    media: string[]
    preview: string | null
    description: string | null
    price: string | undefined
    editions: number
    available: number
    materials: Array<{
      id: string
      format: string
      url: string
      metadata: any
    }>
  }>
}

export default function ModelPage() {
  const params = useParams()
  const modelId = (params?.id as string) ?? ''
  
  const [modelData, setModelData] = useState<ModelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDesignIndex, setSelectedDesignIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Update document title when model loads
  useEffect(() => {
    if (modelData?.model) {
      document.title = `${modelData.model.seo_info.title} - TXD Premium Wraps`
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription && modelData.model.seo_info.description) {
        metaDescription.setAttribute('content', modelData.model.seo_info.description)
      }
    }
  }, [modelData])

  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/models/${modelId}`)
        
        if (!response.ok) {
          throw new Error(`Failed to load model: ${response.status}`)
        }
        
        const data = await response.json()
        setModelData(data)
      } catch (err: any) {
        console.error('Error loading model:', err)
        setError(err.message || 'Failed to load model')
      } finally {
        setLoading(false)
      }
    }

    if (modelId) {
      loadModel()
    }
  }, [modelId])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFA9] mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading model...</p>
        </div>
      </div>
    )
  }

  if (error || !modelData) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Model not found</h1>
          <p className="text-neutral-600 mb-4">{error || 'The requested model could not be loaded.'}</p>
          <a href="/" className="text-[#00FFA9] hover:underline">← Back to home</a>
        </div>
      </div>
    )
  }

  const { model, designs } = modelData
  const selectedDesign = designs[selectedDesignIndex] || null

  // Функция для адаптации дизайна для 3D viewer (новый движок)
  const adaptDesignForViewer = (design: typeof selectedDesign) => {
    if (!design) return undefined
    
    return {
      id: design.id,
      name: design.name,
      texture: design.texture_webp || design.texture || undefined,
      textures: design.textures || undefined,
    }
  }

  return (
    <>
      {/* SEO Meta - using useEffect for client-side updates */}

      <div className="min-h-screen bg-neutral-50">
        {/* Hero Section with 3D Viewer */}
        <section className="relative h-screen w-full bg-neutral-900">
          <ScooterViewer
            modelPath={model.glbModelUrl || model.glbModelCompressed || model.glbModelMobile || ''}
            selectedDesign={adaptDesignForViewer(selectedDesign)}
            panoramaUrl={selectedDesign?.bg_webp || undefined}
          />
        </section>

        {/* Design Tabs Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            Available Designs for {model.name}
          </h2>

          {/* Design Tabs */}
          <div className="mb-8 border-b border-neutral-200">
            <div className="flex flex-wrap gap-2">
              {designs.map((design, index) => (
                <button
                  key={design.id}
                  onClick={() => setSelectedDesignIndex(index)}
                  className={`px-6 py-3 font-semibold transition-colors ${
                    selectedDesignIndex === index
                      ? 'border-b-2 border-[#00FFA9] text-[#00FFA9]'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {design.design_info.film_type || design.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Design Details */}
          {selectedDesign && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Design Info */}
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  {selectedDesign.design_info.seo_title}
                </h3>
                {selectedDesign.design_info.film_type && (
                  <p className="text-lg text-neutral-600 mb-4">
                    Film Type: {selectedDesign.design_info.film_type}
                  </p>
                )}
                {selectedDesign.description && (
                  <p className="text-neutral-700 mb-4">{selectedDesign.description}</p>
                )}
                {selectedDesign.price && (
                  <p className="text-2xl font-bold text-[#00FFA9] mb-4">
                    {selectedDesign.price}
                  </p>
                )}
                <div className="text-sm text-neutral-500">
                  <p>Editions: {selectedDesign.editions}</p>
                  <p>Available: {selectedDesign.available}</p>
                </div>
              </div>

              {/* Design Media Gallery */}
              <div>
                {selectedDesign.media && selectedDesign.media.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedDesign.media.slice(0, 4).map((mediaUrl, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-neutral-200">
                        <img
                          src={mediaUrl}
                          alt={`${selectedDesign.name} - Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

