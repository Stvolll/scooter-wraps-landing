import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { TextureSwitcherRefactored } from '../TextureSwitcherRefactored'
import { BackgroundApplierRefactored } from './BackgroundApplierRefactored'

// Dynamically import Three.js components
// Using refactored versions that use infrastructure services
const ModelLoader = dynamic(
  () => import('@/presentation/components/ModelLoaderRefactored').then((mod) => mod.ModelLoaderRefactored),
  { ssr: false, loading: () => null }
)

interface ModelViewerWithTextureSwitcherProps {
  modelUrl: string
  availableTextures?: Array<{ id: string; name: string; url: string; background?: any }>
  initialTextureUrl?: string | null
  initialBackground?: any
}

export default function ModelViewerWithTextureSwitcher({
  modelUrl,
  availableTextures = [],
  initialTextureUrl = null,
  initialBackground = null,
}: ModelViewerWithTextureSwitcherProps) {
  const [mounted, setMounted] = useState(false)
  const [currentTextureUrl, setCurrentTextureUrl] = useState<string | null>(initialTextureUrl)
  const [currentBackground, setCurrentBackground] = useState<any>(initialBackground)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [fileAccessible, setFileAccessible] = useState<boolean | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update texture and background when props change
  useEffect(() => {
    if (initialTextureUrl !== currentTextureUrl) {
      console.log('[ModelViewer] Updating texture from props:', initialTextureUrl)
      setCurrentTextureUrl(initialTextureUrl)
    }
  }, [initialTextureUrl])

  useEffect(() => {
    if (initialBackground !== currentBackground) {
      console.log('[ModelViewer] Updating background from props:', initialBackground)
      setCurrentBackground(initialBackground)
    }
  }, [initialBackground])

  // Check if GLB file is accessible
  useEffect(() => {
    if (!mounted || !modelUrl) return

    console.log('🔍 [ModelViewer] Testing GLB accessibility for:', modelUrl)

    const urlWithCache = `${modelUrl}?t=${Date.now()}`

    fetch(urlWithCache, {
      method: 'HEAD',
      cache: 'no-cache',
    })
      .then((response) => {
        console.log('📥 [ModelViewer] GLB HEAD response:', {
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type'),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const contentType = response.headers.get('content-type')
        if (contentType?.includes('text/html')) {
          throw new Error('Received HTML instead of GLB - file not found!')
        }

        setFileAccessible(true)
        setLoading(false)
      })
      .catch((error) => {
        console.error('❌ [ModelViewer] GLB file NOT accessible:', error)
        setError(error.message || 'Failed to access GLB file')
        setFileAccessible(false)
        setLoading(false)
      })
  }, [mounted, modelUrl])

  const handleTextureChange = (textureUrl: string) => {
    console.log('🔄 [ModelViewer] Changing texture to:', textureUrl)
    setCurrentTextureUrl(textureUrl)
    
    // Find corresponding background for this texture
    const texture = availableTextures.find((t) => t.url === textureUrl)
    if (texture && texture.background) {
      setCurrentBackground(texture.background)
      console.log('🎨 [ModelViewer] Setting background:', texture.background)
    }
  }

  if (!mounted) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
        }}
      >
        Initializing 3D viewer...
      </div>
    )
  }

  if (fileAccessible === false || error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
          flexDirection: 'column',
          gap: '10px',
          padding: '20px',
        }}
      >
        <p style={{ color: '#f44', fontSize: '18px', fontWeight: 'bold' }}>
          ❌ Error loading model
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>{error}</p>
        <p style={{ fontSize: '12px', color: '#666' }}>URL: {modelUrl}</p>
      </div>
    )
  }

  if (loading || fileAccessible === null) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p>Loading 3D model...</p>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
            Checking file accessibility...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Texture Switcher UI */}
      {availableTextures.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '12px',
            borderRadius: '8px',
          }}
        >
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
            Дизайны:
          </div>
          {availableTextures.map((texture) => (
            <button
              key={texture.id}
              onClick={() => handleTextureChange(texture.url)}
              style={{
                padding: '8px 12px',
                background: currentTextureUrl === texture.url ? '#4a9eff' : '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (currentTextureUrl !== texture.url) {
                  e.currentTarget.style.background = '#555'
                }
              }}
              onMouseLeave={(e) => {
                if (currentTextureUrl !== texture.url) {
                  e.currentTarget.style.background = '#333'
                }
              }}
            >
              {texture.name}
            </button>
          ))}
          {currentTextureUrl && (
            <button
              onClick={() => handleTextureChange(null as any)}
              style={{
                padding: '6px 12px',
                background: '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                marginTop: '4px',
              }}
            >
              Без текстуры
            </button>
          )}
        </div>
      )}

      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          preserveDrawingBuffer: false,
        }}
        dpr={[1, 2]}
        onError={(error: any) => {
          console.error('❌ [ModelViewer] Canvas error:', error)
          const errorMessage = error?.message || error?.toString() || 'Failed to initialize 3D canvas'
          setError(errorMessage)
        }}
        onCreated={(state) => {
          console.log('✅ [ModelViewer] Canvas created')
        }}
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={20}
          autoRotate={false}
        />
        <BackgroundApplierRefactored background={currentBackground} />
        <Suspense fallback={null}>
          <ModelLoader
            glbUrl={modelUrl}
            onLoad={() => {
              console.log('✅ [ModelViewer] Model loaded successfully')
              setError(null)
              setLoading(false)
            }}
            onError={(err) => {
              console.error('❌ [ModelViewer] Model load error:', err)
              setError(err.message || 'Failed to load 3D model')
              setLoading(false)
            }}
          />
          {currentTextureUrl && (
            <TextureSwitcherRefactored
                  textureUrl={currentTextureUrl}
                  onTextureLoaded={() => {
                    console.log('✅ [ModelViewer] Texture applied successfully')
                  }}
                  onTextureError={(err) => {
                    console.error('❌ [ModelViewer] Texture error:', err)
                  }}
                />
              )}
        </Suspense>
      </Canvas>
    </div>
  )
}

