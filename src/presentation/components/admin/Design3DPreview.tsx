/**
 * 3D Preview Component for Design
 * Fetches model URL and displays with Babylon.js
 */

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const BabylonViewer = dynamic(
  () => import('@/presentation/components/admin/BabylonViewer'),
  { ssr: false, loading: () => <div>Loading 3D viewer...</div> }
)

interface Design3DPreviewProps {
  modelId: string
  design: any
}

export default function Design3DPreview({ modelId, design }: Design3DPreviewProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch model URL
    fetch(`/api/models/${modelId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.model && data.model.glbUrl) {
          setModelUrl(data.model.glbUrl)
        } else {
          setError('Model not found or has no GLB URL')
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching model:', err)
        setError('Failed to load model')
        setLoading(false)
      })
  }, [modelId])

  if (loading) {
    return (
      <div className="design-preview" style={{ marginTop: '2rem' }}>
        <h3>3D Preview with Materials</h3>
        <div
          style={{
            width: '100%',
            height: '600px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#000',
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <p>Loading model...</p>
        </div>
      </div>
    )
  }

  if (error || !modelUrl) {
    return (
      <div className="design-preview" style={{ marginTop: '2rem' }}>
        <h3>3D Preview with Materials</h3>
        <div
          style={{
            width: '100%',
            height: '600px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#000',
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f44',
          }}
        >
          <p>{error || 'Model URL not available'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="design-preview" style={{ marginTop: '2rem' }}>
      <h3>3D Preview with Materials</h3>
      <div
        style={{
          width: '100%',
          height: '600px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#000',
          marginTop: '1rem',
          position: 'relative',
        }}
      >
        <BabylonViewer
          modelUrl={modelUrl}
          textureUrl={design.mainTexture?.payload?.url}
          background={
            design.supportMaterials?.sceneBackground?.payload
              ? {
                  type: design.supportMaterials.sceneBackground.payload.type,
                  color: design.supportMaterials.sceneBackground.payload.color,
                  gradient: design.supportMaterials.sceneBackground.payload.gradient,
                  url: design.supportMaterials.sceneBackground.payload.url,
                }
              : undefined
          }
        />
      </div>
    </div>
  )
}


