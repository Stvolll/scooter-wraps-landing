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
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, ContactShadows, Environment } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
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
  onGroundLevelChange,
}: {
  modelPath: string
  selectedDesign?: any
  onRotationChange?: (rotation: number) => void
  onGroundLevelChange?: (groundY: number) => void
}) {
  const gltf = useGLTF(modelPath)
  const modelRef = useRef<THREE.Group>(null)
  const previousRotation = useRef(0)

  // Use scene directly (drei handles caching)
  const scene = gltf.scene

  // Enable shadows on all meshes
  useEffect(() => {
    if (!scene) return
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
  }, [scene])

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

          scene.traverse(node => {
            if (node instanceof THREE.Mesh && node.material) {
              const name = node.name || ''
              // Apply design texture only to UV/Z-places mesh
              if (!name.includes('Z-places') && !name.includes('UV') && !name.includes('uv')) {
                return // Skip - keep original texture
              }
              const materials = Array.isArray(node.material) ? node.material : [node.material]
              materials.forEach(material => {
                if (material && typeof material === 'object') {
                  material.map = texture
                  material.needsUpdate = true
                }
              })
            }
          })

          // Force all materials to update again
          scene.traverse(obj => {
            if (obj instanceof THREE.Mesh && obj.material) {
              const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
              materials.forEach(mat => {
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

  // Scale and place model so wheels sit on scene floor (FLOOR_Y), опустить на ~30%
  const FLOOR_Y = -0.35
  useEffect(() => {
    if (scene) {
      const MODEL_SCALE = 0.8
      scene.scale.setScalar(MODEL_SCALE)
      scene.updateMatrixWorld(true)
      const box = new THREE.Box3().setFromObject(scene)
      const size = new THREE.Vector3()
      box.getSize(size)
      const drop = size.y * 0.3
      const groundLevel = FLOOR_Y - drop
      scene.position.y = groundLevel - box.min.y
      scene.updateMatrixWorld(true)
      onGroundLevelChange?.(groundLevel)
    }
  }, [scene, onGroundLevelChange])

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

// Уровень «пола» сцены: опускаем модель и пол примерно на 30% высоты
const FLOOR_Y = -0.35
const ORBIT_TARGET_Y = FLOOR_Y + 0.28
const INITIAL_AZIMUTH = -Math.PI / 2 // правый борт к зрителю
const AUTOROTATE_SPEED = 60 / 70 // ~0.857, 70 сек на оборот (по часовой)

/**
 * HDR панорама как фон и environment (equirect). Одна загрузка через useLoader.
 */
function GroundedEnvironment({ panoramaUrl }: { panoramaUrl?: string }) {
  const { scene } = useThree()
  const url = panoramaUrl && panoramaUrl.trim() !== '' ? panoramaUrl : '/hdr/panoramic_3.webp'
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`
  const texture = useLoader(THREE.TextureLoader, normalizedUrl)
  texture.mapping = THREE.EquirectangularReflectionMapping
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace

  useEffect(() => {
    if (!texture) {
      scene.background = new THREE.Color(0x0a0a0a)
      scene.environment = null
      return
    }
    scene.background = texture
    scene.environment = texture
    return () => {
      if (scene.background === texture) scene.background = new THREE.Color(0x0a0a0a)
      if (scene.environment === texture) scene.environment = null
    }
  }, [scene, texture])

  if (!texture) return null
  return (
    <Environment
      map={texture}
      background
      backgroundIntensity={0.9}
      environmentIntensity={0.9}
      backgroundBlurriness={0.02}
    />
  )
}

function FovZoom({ min = 24, max = 38 }: { min?: number; max?: number }) {
  const { camera, gl } = useThree()
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const next = THREE.MathUtils.clamp(camera.fov + e.deltaY * 0.02, min, max)
      if (next !== camera.fov) {
        camera.fov = next
        camera.updateProjectionMatrix()
      }
    }
    gl.domElement.addEventListener('wheel', onWheel, { passive: false })
    return () => gl.domElement.removeEventListener('wheel', onWheel)
  }, [camera, gl, min, max])
  return null
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
  const [groundY, setGroundY] = useState(FLOOR_Y)
  const { camera } = useThree()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  // Set initial camera position (side view); камера отодвинута, фон кажется дальше
  useEffect(() => {
    camera.position.set(0, ORBIT_TARGET_Y + 0.15, 2.8)
    camera.lookAt(0, ORBIT_TARGET_Y, 0)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 34
      camera.updateProjectionMatrix()
    }
    controlsRef.current?.setAzimuthalAngle(INITIAL_AZIMUTH)
    controlsRef.current?.update()
  }, [camera])

  const handleRotationChange = (rotation: number) => {
    setRotationY(rotation)
    onRotationChange?.(rotation)
  }

  return (
    <>
      <FovZoom />
      {/* Lighting */}
      <DynamicLighting rotationY={rotationY} />

      <GroundedEnvironment panoramaUrl={panoramaUrl} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {/* Model */}
      <Suspense fallback={null}>
        <ScooterModel
          modelPath={modelPath}
          selectedDesign={selectedDesign}
          onRotationChange={handleRotationChange}
          onGroundLevelChange={setGroundY}
        />
      </Suspense>

      {/* Floor and contact shadows привязаны к уровню пола от модели */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY - 0.001, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.35} />
      </mesh>
      <ContactShadows position={[0, groundY + 0.001, 0]} opacity={0.35} blur={2.2} far={5} />

      {/* Controls - rotation only; zoom via FovZoom (FOV) */}
      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        minDistance={2.5}
        maxDistance={2.5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate
        autoRotateSpeed={AUTOROTATE_SPEED}
        enableDamping
        dampingFactor={0.08}
        target={[0, ORBIT_TARGET_Y, 0]}
      />
    </>
  )
}

export default function ScooterViewer3D({
  modelPath,
  selectedDesign,
  panoramaUrl = '/hdr/panoramic_3.webp',
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
