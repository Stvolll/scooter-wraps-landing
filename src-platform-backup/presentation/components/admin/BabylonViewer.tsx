/**
 * Babylon.js 3D Viewer Component
 * Uses infrastructure/BabylonRenderer per User Rules
 */

import { useEffect, useRef, useState } from 'react'

interface BabylonViewerProps {
  modelUrl: string
  textureUrl?: string
  background?: {
    type: 'color' | 'gradient' | 'image' | 'hdri'
    color?: string
    gradient?: {
      from: string
      to: string
      direction: 'vertical' | 'horizontal'
    }
    url?: string
  }
}

export default function BabylonViewer({
  modelUrl,
  textureUrl,
  background,
}: BabylonViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !canvasRef.current) return

    let renderer: any = null

    const initBabylon = async () => {
      try {
        const { BabylonRenderer } = await import('@/infrastructure/renderers/babylon/BabylonRenderer')
        renderer = new BabylonRenderer()
        rendererRef.current = renderer

        await renderer.initialize({
          canvas: canvasRef.current!,
          modelUrl,
          textureUrl,
          background,
        })

        setLoading(false)
        setError(null)
      } catch (err) {
        console.error('Error initializing Babylon.js:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize 3D viewer')
        setLoading(false)
      }
    }

    initBabylon()

    return () => {
      if (renderer) {
        renderer.dispose()
      }
    }
  }, [mounted, modelUrl, textureUrl, background])

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

  if (error) {
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
          ❌ Error loading 3D viewer
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>{error}</p>
      </div>
    )
  }

  if (loading) {
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
            Using Babylon.js
          </p>
        </div>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  )
}


