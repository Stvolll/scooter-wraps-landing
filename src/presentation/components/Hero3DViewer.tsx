import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Three.js components to avoid SSR issues
const Canvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  { ssr: false, loading: () => null }
)

const ModelScene = dynamic(
  () => import('./ModelScene3DRefactored').then(mod => {
    console.log('[Hero3DViewer] ModelScene module loaded:', mod)
    return mod
  }).catch(err => {
    console.error('[Hero3DViewer] Error loading ModelScene:', err)
    throw err
  }),
  { 
    ssr: false, 
    loading: () => {
      console.log('[Hero3DViewer] Loading ModelScene component...')
      return null
    }
  }
)

interface Hero3DViewerProps {
  modelId?: string
  designId?: string
}

export default function Hero3DViewer({
  modelId,
  designId,
}: Hero3DViewerProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [designLoading, setDesignLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    async function loadModel() {
      console.log('[Hero3DViewer] Loading model, modelId:', modelId)
      
      if (!modelId) {
        console.warn('[Hero3DViewer] No modelId provided')
        setLoading(false)
        return
      }

      try {
        setError(null)
        console.log('[Hero3DViewer] Fetching model from:', `/api/models/${modelId}`)
        const response = await fetch(`/api/models/${modelId}`)
        console.log('[Hero3DViewer] Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[Hero3DViewer] Failed to fetch model:', response.status, errorText)
          throw new Error(`Failed to fetch model: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('[Hero3DViewer] Model data received:', data)
        
        if (data.model?.glbUrl) {
          const url = data.model.glbUrl
          // Check that the model file exists before passing to useGLTF (avoids unhandled runtime error on 404)
          const headRes = await fetch(url, { method: 'HEAD' })
          if (!headRes.ok) {
            setError('Model file not found. Upload the model in Admin or add the .glb file to public/uploads/models/ or .data/uploads/models/')
            setModelUrl(null)
            return
          }
          console.log('[Hero3DViewer] Setting model URL:', url)
          setModelUrl(url)
        } else {
          console.warn('[Hero3DViewer] No glbUrl in model data:', data)
          setError('Model URL not found')
        }
      } catch (error) {
        console.error('[Hero3DViewer] Error loading model:', error)
        setError(error instanceof Error ? error.message : 'Failed to load model')
      } finally {
        setLoading(false)
      }
    }

    loadModel()
  }, [modelId, mounted])

  const handleDesignLoadingChange = (loading: boolean) => {
    setDesignLoading(loading)
  }

  const handleDesignError = (error: Error) => {
    console.error('[Hero3DViewer] Design error:', error)
    setError(error.message)
  }

  if (!mounted || loading || !modelUrl) {
    return (
      <div className="hero-3d-placeholder">
        <div className="hero-3d-content">
          <div className="hero-3d-loading">
            {loading ? 'Loading 3D model...' : error || 'Preparing 3D viewer...'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hero-3d-viewer">
      {designLoading && (
        <div className="hero-3d-loading-overlay">
          <div className="hero-3d-loading-text">Applying design...</div>
        </div>
      )}
      {error && !designLoading && (
        <div className="hero-3d-error-overlay">
          <div className="hero-3d-error-text">{error}</div>
        </div>
      )}
      {modelUrl && (
        <Canvas
          camera={{ position: [0, 2, 5], fov: 50 }}
          gl={{ 
            antialias: true, 
            powerPreference: 'high-performance',
            alpha: false, // ✅ FIX: Opaque background to prevent seeing through
            preserveDrawingBuffer: false
          }}
          style={{ width: '100%', height: '100%', display: 'block', position: 'relative', zIndex: 1 }}
          dpr={[1, 2]}
          onCreated={({ gl, scene, camera }) => {
            console.log('[Hero3DViewer] Canvas created, WebGL context:', gl)
            gl.setClearColor('#000000', 1) // Black background
            // ✅ FIX: Position camera to better view the model
            camera.position.set(0, 1.5, 6)
            camera.lookAt(0, 0.5, 0)
            // Set camera near/far planes for better visibility
            camera.near = 0.1
            camera.far = 1000
            camera.updateProjectionMatrix()
            console.log('[Hero3DViewer] Camera position:', camera.position)
            console.log('[Hero3DViewer] Scene children:', scene.children.length)
          }}
        >
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          {modelUrl && (
            <ModelScene 
              modelUrl={modelUrl} 
              designId={designId}
              onLoadingChange={handleDesignLoadingChange}
              onError={handleDesignError}
            />
          )}
        </Canvas>
      )}
      {!modelUrl && !loading && (
        <div className="hero-3d-placeholder">
          <div className="hero-3d-content">
            <div className="hero-3d-loading">No model URL available</div>
          </div>
        </div>
      )}
    </div>
  )
}
