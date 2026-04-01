'use client'

/**
 * ScooterViewer3D renders a scooter in one stable world-space scene.
 */

import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface ScooterViewer3DProps {
  modelPath: string
  selectedDesign?: any
  panoramaUrl?: string
  className?: string
}

const FLOOR_Y = 0.12
const ORBIT_TARGET_Y = FLOOR_Y + 0.28

function ScooterModel({ modelPath, selectedDesign }: { modelPath: string; selectedDesign?: any }) {
  const gltf = useGLTF(modelPath)
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true)

    cloned.traverse(obj => {
      if (!(obj instanceof THREE.Mesh) || !obj.material) return

      if (Array.isArray(obj.material)) {
        obj.material = obj.material.map(material => {
          const clonedMaterial = material.clone()
          clonedMaterial.userData.__baseMap = material.map || null
          return clonedMaterial
        })
        return
      }

      const clonedMaterial = obj.material.clone()
      clonedMaterial.userData.__baseMap = obj.material.map || null
      obj.material = clonedMaterial
    })

    return cloned
  }, [gltf.scene])

  // Enable shadows on all meshes
  useEffect(() => {
    if (!scene) return
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
  }, [scene])

  useEffect(() => {
    const uvMaterials: THREE.Material[] = []

    scene.traverse(node => {
      if (!(node instanceof THREE.Mesh) || !node.material) return

      const name = node.name || ''
      if (!name.includes('Z-places') && !name.includes('UV') && !name.includes('uv')) return

      const materials = Array.isArray(node.material) ? node.material : [node.material]
      materials.forEach(material => {
        if (material && typeof material === 'object') {
          uvMaterials.push(material)
        }
      })
    })

    if (!selectedDesign?.texture) {
      uvMaterials.forEach((material: any) => {
        material.map = material.userData.__baseMap || null
        material.needsUpdate = true
      })
      return
    }

    const textureLoader = new THREE.TextureLoader()
    const texturePath = selectedDesign.texture.startsWith('/')
      ? selectedDesign.texture
      : `/${selectedDesign.texture}`
    let cancelled = false
    let loadedTexture: THREE.Texture | null = null

    textureLoader.load(
      texturePath,
      texture => {
        if (cancelled) {
          texture.dispose()
          return
        }

        texture.flipY = false

        if (THREE.SRGBColorSpace !== undefined) {
          texture.colorSpace = THREE.SRGBColorSpace
        }

        texture.needsUpdate = true
        loadedTexture = texture

        uvMaterials.forEach((material: any) => {
          material.map = texture
          material.needsUpdate = true
        })
      },
      undefined,
      error => {
        console.error('❌ [ScooterViewer3D] Texture load error:', error)
        console.error('   Texture path:', texturePath)
      }
    )

    return () => {
      cancelled = true
      if (loadedTexture) {
        loadedTexture.dispose()
      }
      uvMaterials.forEach((material: any) => {
        material.map = material.userData.__baseMap || null
        material.needsUpdate = true
      })
    }
  }, [scene, selectedDesign?.texture])

  useEffect(() => {
    if (scene) {
      scene.position.set(0, 0, 0)
      scene.rotation.set(0, 0, 0)
      scene.scale.setScalar(1)
      scene.updateMatrixWorld(true)

      const box = new THREE.Box3().setFromObject(scene)
      const center = box.getCenter(new THREE.Vector3())

      // One stable world-space contract for every model.
      scene.position.set(-center.x, FLOOR_Y - box.min.y, -center.z)
      scene.updateMatrixWorld(true)
    }
  }, [scene])

  return <primitive object={scene} />
}

/**
 * Panorama works only as an infinite scene background.
 */
function PanoramaBackground({ panoramaUrl }: { panoramaUrl?: string }) {
  const { scene } = useThree()
  useEffect(() => {
    const normalizedUrl =
      typeof panoramaUrl === 'string' && panoramaUrl.trim() !== ''
        ? panoramaUrl.startsWith('/')
          ? panoramaUrl
          : `/${panoramaUrl}`
        : null

    if (!normalizedUrl) {
      scene.background = new THREE.Color(0x0a0a0a)
      return
    }

    const loader = new THREE.TextureLoader()
    let disposed = false
    let loadedTexture: THREE.Texture | null = null

    loader.load(
      normalizedUrl,
      texture => {
        if (disposed) {
          texture.dispose()
          return
        }

        texture.mapping = THREE.EquirectangularReflectionMapping
        if (THREE.SRGBColorSpace !== undefined) {
          texture.colorSpace = THREE.SRGBColorSpace
        }

        loadedTexture = texture
        scene.background = texture
      },
      undefined,
      () => {
        if (!disposed) {
          scene.background = new THREE.Color(0x0a0a0a)
        }
      }
    )

    return () => {
      disposed = true
      if (scene.background === loadedTexture) {
        scene.background = new THREE.Color(0x0a0a0a)
      }
      if (loadedTexture) {
        loadedTexture.dispose()
      }
    }
  }, [panoramaUrl, scene])

  return null
}

function Scene({
  modelPath,
  selectedDesign,
  panoramaUrl,
}: {
  modelPath: string
  selectedDesign?: any
  panoramaUrl?: string
}) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, ORBIT_TARGET_Y, 2.5)
    camera.lookAt(0, ORBIT_TARGET_Y, 0)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 30
      camera.updateProjectionMatrix()
    }
  }, [camera])

  return (
    <>
      <PanoramaBackground panoramaUrl={panoramaUrl} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <Suspense fallback={null}>
        <ScooterModel modelPath={modelPath} selectedDesign={selectedDesign} />
      </Suspense>

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={1.5}
        maxDistance={5}
        zoomSpeed={0.8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate
        autoRotateSpeed={0.5}
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
