'use client'

/**
 * PanoramaBackground Component
 * 
 * Renders a 360° equirectangular panorama background using Three.js
 * The panorama rotates in sync with the scooter model rotation
 * 
 * Usage:
 *   <PanoramaBackground 
 *     panoramaUrl="/images/panorama-360.jpg" 
 *     rotation={rotationAngle}
 *   />
 */

import { useEffect, useRef, useState } from 'react'

export default function PanoramaBackground({ 
  panoramaUrl = '/images/studio-panorama.png',
  rotation = 0,
  className = ''
}) {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const sphereRef = useRef(null)
  const animationFrameRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  console.log('🎨 PanoramaBackground render, panoramaUrl:', panoramaUrl, 'rotation:', rotation)

  useEffect(() => {
    if (typeof window === 'undefined') {
      console.log('⚠️ PanoramaBackground: window undefined, skipping')
      return
    }
    
    console.log('🚀 PanoramaBackground: Starting Three.js initialization')

    // Dynamically import Three.js only on client
    import('three').then((THREE) => {
      console.log('✅ Three.js loaded successfully')
      const canvas = canvasRef.current
      if (!canvas) return

      // Scene setup
      const scene = new THREE.Scene()
      sceneRef.current = scene

      // Camera setup - FOV matches model-viewer
      const camera = new THREE.PerspectiveCamera(
        45, // FOV
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
      )
      camera.position.set(0, 0, 0) // Camera at center
      cameraRef.current = camera

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true,
        antialias: true 
      })
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      rendererRef.current = renderer

      // Load panorama texture
      const textureLoader = new THREE.TextureLoader()
      console.log('🔄 Loading panorama from:', panoramaUrl)
      
      textureLoader.load(
        panoramaUrl,
        (texture) => {
          console.log('✅ Panorama texture loaded successfully')
          
          // Create sphere geometry (inverted normals to see inside)
          const geometry = new THREE.SphereGeometry(500, 60, 40)
          geometry.scale(-1, 1, 1) // Invert to see inside

          // Material with panorama texture
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide, // Render inside of sphere
            transparent: false,
            opacity: 1,
          })

          const sphere = new THREE.Mesh(geometry, material)
          scene.add(sphere)
          sphereRef.current = sphere
          setIsLoaded(true)

          console.log('🎨 Panorama sphere added to scene, rendering...')
          
          // Initial render
          renderer.render(scene, camera)
          console.log('✅ Panorama initial render complete')
        },
        (progress) => {
          console.log('📦 Loading panorama:', Math.round((progress.loaded / progress.total) * 100) + '%')
        },
        (error) => {
          console.error('❌ Failed to load panorama:', error)
          console.error('Path:', panoramaUrl)
        }
      )

      // Handle window resize
      const handleResize = () => {
        if (!canvas) return
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
        renderer.render(scene, camera)
      }

      window.addEventListener('resize', handleResize)

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (rendererRef.current) {
          rendererRef.current.dispose()
        }
        if (sphereRef.current) {
          sphereRef.current.geometry.dispose()
          sphereRef.current.material.dispose()
        }
      }
    })
  }, [panoramaUrl])

  // Update rotation when prop changes
  useEffect(() => {
    if (!sphereRef.current || !rendererRef.current || !cameraRef.current || !sceneRef.current) return

    // Rotate the panorama sphere
    sphereRef.current.rotation.y = rotation

    // Render the scene
    rendererRef.current.render(sceneRef.current, cameraRef.current)
  }, [rotation])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  )
}

