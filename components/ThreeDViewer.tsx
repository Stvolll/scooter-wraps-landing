'use client'

/**
 * ThreeDViewer Component
 * 
 * This component displays a 3D scooter model with a "kaleidoscope" effect:
 * As the user rotates the model, different vinyl designs cycle through.
 * 
 * How the kaleidoscope effect works:
 * 1. We track the rotation angle of the model
 * 2. When the rotation crosses certain thresholds (e.g., every 60 degrees),
 *    we change the applied texture/design
 * 3. The designs are stored in an array and cycled through based on rotation
 * 
 * To add your own 3D model:
 * 1. Export your scooter model as a .glb or .gltf file
 * 2. Place it in /public/models/
 * 3. Update the modelPath prop
 * 
 * To add design textures:
 * 1. Create texture images for each design
 * 2. Place them in /public/textures/
 * 3. Update the designs array with texture paths
 */

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Note: Models will be loaded on demand when the component mounts

interface ThreeDViewerProps {
  modelPath?: string
  designs: Array<{
    id: string
    name: string
    texturePath?: string
    color?: string
  }>
  defaultDesignIndex?: number
}

// Component that loads and displays the 3D model
function ScooterModel({ 
  modelPath, 
  currentDesignIndex, 
  designs 
}: { 
  modelPath?: string
  currentDesignIndex: number
  designs: Array<{ texturePath?: string; color?: string }>
}) {
  const meshRef = useRef<THREE.Group>(null)
  
  // Hooks must be called unconditionally
  const gltf = useGLTF(modelPath || '/models/honda-lead.glb')
  let scene: THREE.Group | null = null
  try {
    if (modelPath && gltf) {
      scene = gltf.scene.clone() // Clone to avoid mutating the original
    }
  } catch (error) {
    console.warn('Failed to load 3D model:', error)
  }
  
  // Get texture path for current design
  const currentTexture = designs[currentDesignIndex]?.texturePath

  // Apply texture to model when it loads or design changes
  useEffect(() => {
    if (scene) {
      const textureLoader = new THREE.TextureLoader()
      
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Apply texture if available
          if (currentTexture) {
            textureLoader.load(
              currentTexture,
              (texture) => {
                texture.flipY = false // GLB models typically don't need Y flip
                
                if (child.material instanceof THREE.MeshStandardMaterial) {
                  child.material.map = texture
                  child.material.needsUpdate = true
                } else if (Array.isArray(child.material)) {
                  child.material.forEach((mat) => {
                    if (mat instanceof THREE.MeshStandardMaterial) {
                      mat.map = texture
                      mat.needsUpdate = true
                    }
                  })
                }
              },
              undefined,
              (error) => {
                console.warn('Failed to load texture:', error)
              }
            )
          } else if (designs[currentDesignIndex]?.color) {
            // Fallback to color if no texture
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.color.set(designs[currentDesignIndex].color || '#00ff88')
              child.material.needsUpdate = true
            }
          }
        }
      })
    }
  }, [scene, currentTexture, currentDesignIndex, designs])

  if (!scene) {
    // Fallback placeholder if model not loaded
    return (
      <mesh>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial color={designs[currentDesignIndex]?.color || '#00ff88'} />
      </mesh>
    )
  }

  return <primitive object={scene} ref={meshRef} />
}

// Component that tracks rotation and triggers design changes
function RotationTracker({ 
  onRotationChange 
}: { 
  onRotationChange: (angle: number) => void 
}) {
  const controlsRef = useRef<any>(null)
  
  useFrame(() => {
    if (controlsRef.current) {
      const azimuthalAngle = controlsRef.current.getAzimuthalAngle()
      onRotationChange(azimuthalAngle)
    }
  })

  return (
    <OrbitControls 
      ref={controlsRef} 
      enableZoom={true} 
      enablePan={false}
      autoRotate={false}
    />
  )
}

export default function ThreeDViewer({ 
  modelPath, 
  designs, 
  defaultDesignIndex = 0 
}: ThreeDViewerProps) {
  const [currentDesignIndex, setCurrentDesignIndex] = useState(defaultDesignIndex)
  const [rotationAngle, setRotationAngle] = useState(0)

  // Calculate which design to show based on rotation
  // Every 60 degrees (or 360 / designs.length), cycle to next design
  useEffect(() => {
    if (designs.length > 0) {
      const angleStep = (2 * Math.PI) / designs.length
      const normalizedAngle = ((rotationAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
      const newIndex = Math.floor(normalizedAngle / angleStep) % designs.length
      if (newIndex !== currentDesignIndex) {
        setCurrentDesignIndex(newIndex)
      }
    }
  }, [rotationAngle, designs.length, currentDesignIndex])

  const handleRotationChange = (angle: number) => {
    setRotationAngle(angle)
  }

  return (
    <div className="w-full h-full min-h-[500px] bg-gradient-to-b from-neutral-100 to-neutral-50 rounded-2xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          <Environment preset="city" />
          
          <ScooterModel 
            modelPath={modelPath}
            currentDesignIndex={currentDesignIndex}
            designs={designs}
          />
          
          <RotationTracker onRotationChange={handleRotationChange} />
        </Suspense>
      </Canvas>
      
      {/* Design indicator */}
      {designs.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
          {designs[currentDesignIndex]?.name || `Design ${currentDesignIndex + 1}`}
        </div>
      )}
    </div>
  )
}

