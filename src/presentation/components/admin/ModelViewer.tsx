import { useEffect, useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import dynamic from 'next/dynamic'

// Wrapper component to try main loader first, then fallback
function ModelLoaderWrapper({ modelUrl, onLoad, onError }: any) {
  const [useFallback, setUseFallback] = useState(false)

  if (useFallback) {
    return (
      <SimpleModelLoader
        glbUrl={modelUrl}
        onLoad={onLoad}
        onError={onError}
      />
    )
  }

  return (
    <ModelLoader
      glbUrl={modelUrl}
      onLoad={onLoad}
      onError={(err: Error) => {
        console.warn('⚠️ [ModelViewer] Main loader failed, switching to fallback')
        setUseFallback(true)
        // Don't call onError yet, try fallback first
      }}
    />
  )
}

// Dynamically import Three.js components
// Using refactored versions that use infrastructure services
const ModelLoader = dynamic(
  () => import('@/presentation/components/ModelLoaderRefactored').then((mod) => mod.ModelLoaderRefactored),
  { ssr: false, loading: () => null }
)

// Alternative loader using infrastructure service (fallback)
const SimpleModelLoader = dynamic(
  () => import('@/presentation/components/SimpleModelLoaderRefactored').then((mod) => mod.SimpleModelLoaderRefactored),
  { ssr: false, loading: () => null }
)

interface ModelViewerProps {
  modelUrl: string
}

export default function ModelViewer({ modelUrl }: ModelViewerProps) {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [fileAccessible, setFileAccessible] = useState<boolean | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if GLB file is accessible
  useEffect(() => {
    if (!mounted || !modelUrl) return

    console.log('🔍 [ModelViewer] Testing GLB accessibility for:', modelUrl)

    // Add cache busting for development
    const urlWithCache = `${modelUrl}?t=${Date.now()}`

    fetch(urlWithCache, {
      method: 'HEAD', // Just check if file exists, don't download
      cache: 'no-cache',
    })
      .then((response) => {
        console.log('📥 [ModelViewer] GLB HEAD response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length'),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        // Check if we got HTML instead of binary (404 page)
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('text/html')) {
          throw new Error('Received HTML instead of GLB - file not found!')
        }

        // GLB files should be application/octet-stream or model/gltf-binary
        const validTypes = [
          'application/octet-stream',
          'model/gltf-binary',
          'application/gltf-binary',
        ]
        const isValidType =
          !contentType ||
          validTypes.some((type) => contentType.includes(type)) ||
          contentType.includes('binary')

        if (!isValidType && contentType) {
          console.warn(
            `⚠️ [ModelViewer] Unexpected content-type: ${contentType}, but continuing...`
          )
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
        <details style={{ marginTop: '10px', fontSize: '12px' }}>
          <summary style={{ cursor: 'pointer', color: '#4a9eff' }}>
            Debug Info
          </summary>
          <div style={{ marginTop: '10px', textAlign: 'left' }}>
            <p>1. Check if file exists: `ls public/uploads/models/`</p>
            <p>2. Test direct access: Open {modelUrl} in browser</p>
            <p>3. Check server logs for upload errors</p>
            <p>4. Verify file was saved correctly</p>
          </div>
        </details>
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
          setError(error.message || 'Failed to initialize 3D canvas')
        }}
        onCreated={(state) => {
          console.log('✅ [ModelViewer] Canvas created:', {
            gl: !!state.gl,
            scene: !!state.scene,
            camera: !!state.camera,
          })
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
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="orange" />
            </mesh>
          }
        >
          <ModelLoaderWrapper
            modelUrl={modelUrl}
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
        </Suspense>
      </Canvas>
    </div>
  )
}
