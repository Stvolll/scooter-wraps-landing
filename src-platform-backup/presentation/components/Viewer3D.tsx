import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import dynamic from 'next/dynamic'

// Dynamically import Three.js components
const ModelScene3D = dynamic(
  () => import('./ModelScene3DRefactored'),
  { ssr: false, loading: () => null }
)

interface Viewer3DProps {
  designId: string
}

function getDeviceTier(): 'low' | 'medium' | 'high' {
  if (typeof window === 'undefined') return 'medium'
  
  const canvas = document.createElement('canvas')
  const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
  
  if (!gl) return 'low'
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
  if (!debugInfo) return 'medium'
  
  try {
    const rendererParam = (debugInfo as any).UNMASKED_RENDERER_WEBGL
    const renderer = String(gl.getParameter(rendererParam) || '')
    
    // High-end GPUs
    if (renderer.includes('NVIDIA') || renderer.includes('AMD') || renderer.includes('Apple')) {
      return 'high'
    }
    
    // Mobile or low-end
    if (renderer.includes('Mali') || renderer.includes('Adreno') || renderer.includes('PowerVR')) {
      return 'medium'
    }
  } catch (e) {
    // If WebGL debug info is not available, default to medium
    return 'medium'
  }
  
  return 'medium'
}

export function Viewer3D({ designId }: Viewer3DProps) {
  const [mounted, setMounted] = useState(false)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deviceTier, setDeviceTier] = useState<'low' | 'medium' | 'high'>('medium')

  useEffect(() => {
    setMounted(true)
    setDeviceTier(getDeviceTier())
  }, [])

  // Load model URL from design via API
  useEffect(() => {
    if (!mounted) return

    async function loadModelUrl() {
      try {
        const response = await fetch(`/api/designs/${designId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch design')
        }
        const data = await response.json()
        if (data.design?.modelId) {
          const modelResponse = await fetch(`/api/models/${data.design.modelId}`)
          if (modelResponse.ok) {
            const modelData = await modelResponse.json()
            if (modelData.model?.glbUrl) {
              setModelUrl(modelData.model.glbUrl)
            }
          }
        }
      } catch (error) {
        console.error('Error loading model URL:', error)
      } finally {
        setLoading(false)
      }
    }
    loadModelUrl()
  }, [designId, mounted])

  if (!mounted) {
    return (
      <div className="viewer-fallback">
        <p>Loading 3D viewer...</p>
      </div>
    )
  }

  if (deviceTier === 'low') {
    return (
      <div className="viewer-fallback">
        <p>3D viewer not supported on this device</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="viewer-loading">
        <p>Loading 3D model...</p>
      </div>
    )
  }

  if (!modelUrl) {
    return (
      <div className="viewer-fallback">
        <p>3D model not available</p>
      </div>
    )
  }

  const antialias = deviceTier === 'high'

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ antialias, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <ModelScene3D modelUrl={modelUrl} designId={designId} />
    </Canvas>
  )
}
