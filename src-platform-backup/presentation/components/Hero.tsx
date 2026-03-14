import { useEffect, useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import client components
const ModelSelector = dynamic(() => import('./ModelSelector'), {
  ssr: false,
  loading: () => null,
})

// ✅ ALTERNATIVE FIX: Use direct import instead of dynamic to ensure component renders
import DesignGallery from './DesignGallery'

const Hero3DViewer = dynamic(() => import('./Hero3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="hero-3d-placeholder">
      <div className="hero-3d-content">
        <div className="hero-3d-loading">Loading 3D model...</div>
      </div>
    </div>
  ),
})

interface HeroProps {
  models: any[] // Use any to avoid serialization issues
  selectedModelId?: string
  selectedDesignId?: string
}

export default function Hero({
  models,
  selectedModelId,
  selectedDesignId,
}: HeroProps) {
  const [mounted, setMounted] = useState(false)
  const [currentDesignId, setCurrentDesignId] = useState<string | undefined>(selectedDesignId)
  
  // ✅ FIX: Debounce design selection to prevent rapid switching
  const designSelectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const handleDesignSelect = useCallback((designId: string) => {
    // Clear previous timeout
    if (designSelectTimeoutRef.current) {
      clearTimeout(designSelectTimeoutRef.current)
    }
    
    // ✅ FIX: Small delay to batch rapid clicks (50ms debounce)
    designSelectTimeoutRef.current = setTimeout(() => {
      setCurrentDesignId(designId)
    }, 50)
  }, [])

  useEffect(() => {
    console.log('[Hero] Component mounted')
    setMounted(true)
    
    // ✅ FIX: Cleanup timeout on unmount
    return () => {
      if (designSelectTimeoutRef.current) {
        clearTimeout(designSelectTimeoutRef.current)
      }
    }
  }, [])

  // Don't wait for mounted - render immediately
  // if (!mounted) {
  //   return (
  //     <section className="hero">
  //       <div className="hero-background">
  //         <div className="hero-3d-container">
  //           <div className="hero-3d-placeholder">
  //             <div className="hero-3d-content">
  //               <div className="hero-3d-loading">Loading...</div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </section>
  //   )
  // }

  const safeModels = Array.isArray(models) ? models : []
  const selectedModel = safeModels.find((m: any) => String(m.id) === String(selectedModelId))

  console.log('[Hero] Models:', safeModels.length, 'Selected:', selectedModelId)
  console.log('[Hero] Selected model:', selectedModel)
  console.log('[Hero] All models:', safeModels.map((m: any) => ({ id: m.id, name: m.name })))

  // Show message if no models
  if (safeModels.length === 0) {
    return (
      <section className="hero">
        <div className="hero-background">
          <div className="hero-3d-container">
            <div className="hero-3d-placeholder">
              <div className="hero-3d-content">
                <div className="hero-3d-loading">No models available</div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">No Models Available</h1>
          <p className="hero-subtitle">Please create a model in the admin panel first.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="hero">
      {/* ✅ ALTERNATIVE FIX: Background layer */}
      <div className="hero-background" />
      
      {/* ✅ ALTERNATIVE FIX: 3D viewer in fixed height container */}
      <div className="hero-3d-section">
        <div className="hero-3d-container">
          <Hero3DViewer
            modelId={selectedModelId}
            designId={currentDesignId}
          />
        </div>
      </div>

      {/* ✅ ALTERNATIVE FIX: Controls below 3D viewer - always visible */}
      <div className="hero-controls" data-testid="hero-controls">
        <ModelSelector models={safeModels} selectedModelId={selectedModelId} />
      </div>

      {/* ✅ ALTERNATIVE FIX: Content immediately after controls - always visible */}
      <div className="hero-content" data-testid="hero-content">
        <h1 className="hero-title">
          {selectedModel?.name || safeModels[0]?.name || 'Scooter'} Designs
        </h1>
        <p className="hero-subtitle">Choose your design or create your own</p>
        {selectedModelId && (
          <div data-testid="design-gallery-wrapper">
            <DesignGallery 
              modelId={selectedModelId}
              onDesignSelect={handleDesignSelect}
              selectedDesignId={currentDesignId}
            />
          </div>
        )}
        {!selectedModelId && (
          <div className="design-gallery-empty">
            <p>Please select a model to view designs.</p>
          </div>
        )}
      </div>
    </section>
  )
}
