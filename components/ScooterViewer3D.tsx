'use client'

/**
 * ScooterViewer3D Component with Dynamic Lighting
 *
 * Features:
 * - Rim light for side views (0° and 180°)
 * - Studio lighting for front/three-quarter views (40°-140°)
 * - Smooth transitions based on rotation
 * - React Three Fiber implementation
 */

import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

interface ScooterViewer3DProps {
  modelPath: string
  selectedDesign?: any
  panoramaUrl?: string
  className?: string
}

// Helper function to map rotation to lighting intensity
function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const clamped = Math.max(inMin, Math.min(inMax, value))
  return ((clamped - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

// Lerp function for smooth transitions
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

// Model component with rotation tracking
function ScooterModel({
  modelPath,
  selectedDesign,
  onRotationChange,
}: {
  modelPath: string
  selectedDesign?: any
  onRotationChange?: (rotation: number) => void
}) {
  const gltf = useGLTF(modelPath)
  const modelRef = useRef<THREE.Group>(null)
  const previousRotation = useRef(0)

  // Use scene directly (drei handles caching)
  const scene = gltf.scene

  // Apply texture if provided
  useEffect(() => {
    if (selectedDesign?.texture && scene) {
      const textureLoader = new THREE.TextureLoader()
      const texturePath = selectedDesign.texture.startsWith('/') 
        ? selectedDesign.texture 
        : `/${selectedDesign.texture}`
      
      console.log('🎨 [ScooterViewer3D] Loading texture:', texturePath)
      
      textureLoader.load(
        texturePath,
        texture => {
          console.log('✅ [ScooterViewer3D] Texture loaded:', texturePath)
          texture.flipY = false
          
          // Set proper encoding
          if (THREE.sRGBEncoding !== undefined) {
            texture.encoding = THREE.sRGBEncoding
          } else if (THREE.SRGBColorSpace !== undefined) {
            texture.colorSpace = THREE.SRGBColorSpace
          }
          
          texture.needsUpdate = true
          
          let materialsFound = 0
          let materialsUpdated = 0
          
          scene.traverse(node => {
            if (node instanceof THREE.Mesh && node.material) {
              const materials = Array.isArray(node.material) ? node.material : [node.material]
              materialsFound += materials.length
              
              materials.forEach(material => {
                // Apply to ANY material type, not just MeshStandardMaterial
                if (material && typeof material === 'object') {
                  // Store original properties
                  const originalMap = material.map
                  
                  // Apply texture
                  material.map = texture
                  
                  // Ensure material properties are correct
                  if (material.metalness !== undefined && material.metalness > 0.8) {
                    material.metalness = 0.2
                  }
                  if (material.roughness !== undefined && material.roughness > 0.8) {
                    material.roughness = 0.6
                  }
                  
                  // Force updates
                  material.needsUpdate = true
                  if (material.map) {
                    material.map.needsUpdate = true
                  }
                  
                  // Update geometry UVs
                  if (node.geometry) {
                    node.geometry.uvsNeedUpdate = true
                    if (node.geometry.attributes && node.geometry.attributes.uv) {
                      node.geometry.attributes.uv.needsUpdate = true
                    }
                  }
                  
                  materialsUpdated++
                  console.log('✅ [ScooterViewer3D] Texture applied to material:', {
                    type: material.type,
                    name: material.name || 'unnamed',
                    hadMap: !!originalMap,
                    hasMap: !!material.map,
                  })
                }
              })
            }
          })
          
          console.log(`📊 [ScooterViewer3D] Texture application: ${materialsUpdated}/${materialsFound} materials updated`)
          
          // Force all materials to update again
          scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh && obj.material) {
              const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
              materials.forEach((mat) => {
                mat.needsUpdate = true
                if (mat.map) {
                  mat.map.needsUpdate = true
                }
              })
              if (obj.geometry) {
                obj.geometry.uvsNeedUpdate = true
              }
            }
          })
        },
        undefined,
        error => {
          console.error('❌ [ScooterViewer3D] Texture load error:', error)
          console.error('   Texture path:', texturePath)
        }
      )
    }
  }, [selectedDesign, scene])

  // Track rotation
  useFrame(() => {
    if (modelRef.current && onRotationChange) {
      const rotationY = modelRef.current.rotation.y
      // Normalize to 0-360 degrees
      const normalizedRotation = ((rotationY * 180) / Math.PI + 360) % 360

      // Only call callback if rotation changed significantly
      if (Math.abs(normalizedRotation - previousRotation.current) > 1) {
        onRotationChange(normalizedRotation)
        previousRotation.current = normalizedRotation
      }
    }
  })

  return <primitive object={scene} ref={modelRef} />
}

// Dynamic lighting component
function DynamicLighting({ rotationY }: { rotationY: number }) {
  const rimLightRef = useRef<THREE.DirectionalLight>(null)
  const studioKeyRef = useRef<THREE.RectAreaLight>(null)
  const studioFillRef = useRef<THREE.RectAreaLight>(null)
  const topLightRef = useRef<THREE.DirectionalLight>(null)

  // Calculate lighting transition based on rotation
  // Side view (0° or 180°) = rim light only
  // Front view (40°-140°) = studio lighting
  useFrame(() => {
    // Normalize rotation to 0-360
    const normalizedRot = rotationY % 360

    // Calculate transition factor
    // 0°-40°: rim light (t = 0)
    // 40°-140°: transition to studio (t = 0 to 1)
    // 140°-180°: transition back to rim (t = 1 to 0)
    // 180°-220°: rim light (t = 0)
    // 220°-320°: transition to studio (t = 0 to 1)
    // 320°-360°: transition back to rim (t = 1 to 0)

    let t = 0

    if (normalizedRot >= 40 && normalizedRot <= 140) {
      // Front view zone: studio lighting
      t = mapRange(normalizedRot, 40, 140, 0, 1)
    } else if (normalizedRot > 140 && normalizedRot <= 180) {
      // Exit zone: fade back to rim
      t = mapRange(normalizedRot, 140, 180, 1, 0)
    } else if (normalizedRot >= 220 && normalizedRot <= 320) {
      // Opposite front view zone: studio lighting
      t = mapRange(normalizedRot, 220, 320, 0, 1)
    } else if (normalizedRot > 320 || normalizedRot < 40) {
      // Exit zones: fade back to rim
      if (normalizedRot > 320) {
        t = mapRange(normalizedRot, 320, 360, 1, 0)
      } else {
        t = 0 // Already at rim light
      }
    }

    // Smooth interpolation with lerp
    const smoothT = lerp(0, t, 0.1) // Adjust speed of transition

    // Rim light intensity: high when t is low (side views)
    const rimIntensity = lerp(2.5, 0.3, smoothT)

    // Studio lights intensity: high when t is high (front views)
    const studioIntensity = lerp(0, 1.5, smoothT)
    const fillIntensity = lerp(0, 0.8, smoothT)
    const topIntensity = lerp(0, 0.6, smoothT)

    // Update light intensities
    if (rimLightRef.current) {
      rimLightRef.current.intensity = rimIntensity
    }
    if (studioKeyRef.current) {
      studioKeyRef.current.intensity = studioIntensity
    }
    if (studioFillRef.current) {
      studioFillRef.current.intensity = fillIntensity
    }
    if (topLightRef.current) {
      topLightRef.current.intensity = topIntensity
    }
  })

  return (
    <>
      {/* Rim Light - Backlight for side views */}
      <directionalLight
        ref={rimLightRef}
        position={[0, 2, -5]}
        intensity={2.5}
        color="#ffffff"
        castShadow
      />

      {/* Studio Key Light - Main front light */}
      <rectAreaLight
        ref={studioKeyRef}
        position={[3, 1.5, 2]}
        width={4}
        height={4}
        intensity={0}
        color="#ffffff"
      />

      {/* Studio Fill Light - Soft fill from opposite side */}
      <rectAreaLight
        ref={studioFillRef}
        position={[-2, 1, 2]}
        width={3}
        height={3}
        intensity={0}
        color="#ffffff"
      />

      {/* Top Light - Gentle top illumination */}
      <directionalLight ref={topLightRef} position={[0, 5, 0]} intensity={0} color="#ffffff" />

      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.2} color="#ffffff" />
    </>
  )
}

// Main scene component
function Scene({
  modelPath,
  selectedDesign,
  panoramaUrl,
  onRotationChange,
}: {
  modelPath: string
  selectedDesign?: any
  panoramaUrl?: string
  onRotationChange?: (rotation: number) => void
}) {
  const [rotationY, setRotationY] = useState(0)
  const { camera } = useThree()

  // Set initial camera position (side view)
  useEffect(() => {
    camera.position.set(0, 0.4, 2.5)
    camera.lookAt(0, 0.4, 0)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 30
      camera.updateProjectionMatrix()
    }
  }, [camera])

  const handleRotationChange = (rotation: number) => {
    setRotationY(rotation)
    onRotationChange?.(rotation)
  }

  return (
    <>
      {/* Camera - set via useEffect in Scene component */}

      {/* Lighting */}
      <DynamicLighting rotationY={rotationY} />

      {/* Environment - HDRI для правильного освещения PBR материалов */}
      {/* Если panoramaUrl указан, используем его как HDRI, иначе используем preset */}
      {panoramaUrl ? (
        <Environment files={panoramaUrl} background />
      ) : (
        <Environment preset="sunset" background />
      )}

      {/* Model */}
      <Suspense fallback={null}>
        <ScooterModel
          modelPath={modelPath}
          selectedDesign={selectedDesign}
          onRotationChange={handleRotationChange}
        />
      </Suspense>

      {/* Controls - horizontal rotation and zoom */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={1.5} // Minimum zoom distance
        maxDistance={5} // Maximum zoom distance
        zoomSpeed={0.8} // Zoom sensitivity
        minPolarAngle={Math.PI / 2.4} // ~75 degrees
        maxPolarAngle={Math.PI / 2.4} // Lock vertical angle
        minAzimuthAngle={-Infinity}
        maxAzimuthAngle={Infinity}
        autoRotate
        autoRotateSpeed={0.5} // Slower rotation
      />
    </>
  )
}

export default function ScooterViewer3D({
  modelPath,
  selectedDesign,
  panoramaUrl = '/images/studio-panorama.png',
  className = '',
}: ScooterViewer3DProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div
        className={`relative w-full h-full ${className} flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-800`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 mx-auto mb-4"></div>
          <p className="text-white/60">Loading 3D Viewer...</p>
        </div>
      </div>
    )
  }

  // Ensure model path is absolute
  const fullModelPath = modelPath.startsWith('/') ? modelPath : `/${modelPath}`

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' }}
    >
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Scene
          modelPath={fullModelPath}
          selectedDesign={selectedDesign}
          panoramaUrl={panoramaUrl}
        />
      </Canvas>
    </div>
  )
}

// Note: Preload models if needed
// useGLTF.preload('/models/yamaha-nvx.glb')
// useGLTF.preload('/models/honda-lead.glb')
