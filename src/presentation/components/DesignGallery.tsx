import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DesignGalleryProps {
  modelId?: string
  onDesignSelect?: (designId: string) => void
  selectedDesignId?: string
}

interface Design {
  id: string
  name: string
  previewImageUrl: string
  mainTexture?: {
    payload: {
      url: string
    }
  }
  supportMaterials?: {
    photos?: Array<{
      payload: {
        thumbnailUrl: string
        originalUrl: string
      }
    }>
    videos?: Array<{
      payload: {
        thumbnailUrl: string
        url: string
      }
    }>
    sceneBackground?: {
      payload: {
        type: string
        url?: string
        color?: string
        gradient?: {
          from: string
          to: string
        }
      }
    }
  }
}

export default function DesignGallery({ 
  modelId, 
  onDesignSelect,
  selectedDesignId 
}: DesignGalleryProps) {
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDesigns = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = modelId
          ? `/api/designs?modelId=${modelId}&published=true`
          : '/api/designs?published=true'
        
        console.log('[DesignGallery] Fetching designs from:', url)
        const response = await fetch(url)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[DesignGallery] HTTP error:', response.status, errorText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('[DesignGallery] Designs received:', data.designs?.length || 0)
        
        if (data.designs && Array.isArray(data.designs)) {
          setDesigns(data.designs)
          console.log('[DesignGallery] Set designs:', data.designs.length)
        } else {
          console.warn('[DesignGallery] No designs in response:', data)
          setDesigns([])
        }
      } catch (err) {
        console.error('[DesignGallery] Failed to fetch designs:', err)
        setError('Failed to load designs')
        setDesigns([])
      } finally {
        setLoading(false)
      }
    }

    fetchDesigns()
  }, [modelId])

  if (loading) {
    return <div className="design-gallery-loading">Loading designs...</div>
  }

  if (error) {
    return (
      <div className="design-gallery-empty">
        <p>{error}</p>
      </div>
    )
  }

  const handleCardClick = (designId: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (onDesignSelect) {
      onDesignSelect(designId)
    } else {
      // Fallback to navigation
      window.location.href = `/designs/${designId}`
    }
  }

  console.log('[DesignGallery] Rendering gallery with', designs.length, 'designs', {
    loading,
    error,
    designs: designs.map(d => ({ id: d.id, name: d.name }))
  })
  
  if (designs.length === 0 && !loading && !error) {
    return (
      <div className="design-gallery-empty">
        <p>No designs available for this model.</p>
      </div>
    )
  }
  
  // ✅ ALTERNATIVE FIX: Add debug wrapper to ensure visibility
  return (
    <div className="design-gallery-wrapper" style={{ width: '100%', padding: '2rem 0' }}>
      <div className="design-gallery" style={{ visibility: 'visible', display: 'grid', minHeight: '200px', width: '100%' }}>
      {designs.map((design) => {
        const isSelected = selectedDesignId === design.id
        const photos = design.supportMaterials?.photos || []
        const videos = design.supportMaterials?.videos || []
        const hasBackground = !!design.supportMaterials?.sceneBackground
        const previewUrl = design.previewImageUrl || '/images/placeholder.jpg'
        
        // Log first design for debugging
        if (design.id === designs[0]?.id) {
          console.log('[DesignGallery] Rendering design card:', {
            id: design.id,
            name: design.name,
            previewUrl,
            hasPreview: !!design.previewImageUrl
          })
        }
        
        return (
          <div
            key={design.id}
            className={`design-gallery-item ${isSelected ? 'selected' : ''}`}
            onClick={(e) => handleCardClick(design.id, e)}
            style={{ 
              cursor: 'pointer',
              display: 'block',
              visibility: 'visible',
              opacity: 1,
              minHeight: '200px',
              width: '100%'
            }}
          >
            <div className="design-gallery-card">
              {/* ✅ FIX: Use img element for better error handling */}
              <img
                src={previewUrl}
                alt={design.name}
                className="design-gallery-card-image"
                onError={(e) => {
                  console.error('[DesignGallery] Image load error:', previewUrl)
                  e.currentTarget.src = '/images/placeholder.jpg'
                }}
                onLoad={() => {
                  console.log('[DesignGallery] Image loaded:', previewUrl)
                }}
              />
              <div className="design-gallery-overlay">
                <h3>{design.name}</h3>
                <div className="design-gallery-materials">
                  {photos.length > 0 && (
                    <span className="material-badge" title={`${photos.length} photos`}>
                      📸 {photos.length}
                    </span>
                  )}
                  {videos.length > 0 && (
                    <span className="material-badge" title={`${videos.length} videos`}>
                      🎬 {videos.length}
                    </span>
                  )}
                  {hasBackground && (
                    <span className="material-badge" title="Custom background">
                      🌅
                    </span>
                  )}
                  {design.mainTexture && (
                    <span className="material-badge" title="Texture applied">
                      🎨
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
      </div>
    </div>
  )
}
