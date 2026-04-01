// ============================================
// COMPONENT.TSX - React Component
// ============================================

'use client'

import { useEffect, useRef, useState } from 'react'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RenderDesignService } from './service'
import type { IDesignRepository, Design } from './types'
import {
  TextureMaterial,
  PhotoMaterial,
  VideoMaterial,
  BackgroundMaterial,
  SupportMaterials,
  DesignVersion,
  Design as DesignClass,
} from './domain'

interface ModelScene3DProps {
  modelUrl: string
  designId?: string
  onLoadingChange?: (loading: boolean) => void
  onError?: (error: Error) => void
  designRepository?: IDesignRepository // Optional custom repository
}

export default function ModelScene3D({
  modelUrl,
  designId,
  onLoadingChange,
  onError,
  designRepository,
}: ModelScene3DProps) {
  if (!modelUrl) {
    return null
  }

  const { scene, error: gltfError } = useGLTF(modelUrl) as {
    scene: THREE.Group
    error?: Error
  }
  const groupRef = useRef<THREE.Group>(null)
  const clonedSceneRef = useRef<THREE.Group | null>(null)
  const { scene: threeScene } = useThree()
  const renderServiceRef = useRef<RenderDesignService | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const previousDesignIdRef = useRef<string | undefined>(undefined)
  const originalTexturesRef = useRef<Map<string, THREE.Texture | null>>(new Map())

  // Initialize service
  useEffect(() => {
    if (!renderServiceRef.current) {
      const repository: IDesignRepository = designRepository || {
        async getById(id: string) {
          const response = await fetch(`/api/designs/${id}`)
          if (!response.ok) {
            throw new Error(`Failed to fetch design: ${response.statusText}`)
          }
          const data = await response.json()
          const designData = data.design

          // Reconstruct domain objects
          const mainTexture = new TextureMaterial(
            designData.mainTexture.id,
            designData.mainTexture.payload
          )

          const photos = (designData.supportMaterials?.photos || []).map((p: any) => {
            return new PhotoMaterial(p.id, p.payload)
          })

          const videos = (designData.supportMaterials?.videos || []).map((v: any) => {
            return new VideoMaterial(v.id, v.payload)
          })

          let background = undefined
          if (designData.supportMaterials?.sceneBackground) {
            background = new BackgroundMaterial(
              designData.supportMaterials.sceneBackground.id,
              designData.supportMaterials.sceneBackground.payload
            )
          }

          const supportMaterials = new SupportMaterials(photos, videos, background)
          const version = new DesignVersion(
            designData.version.major,
            designData.version.minor,
            designData.version.patch,
            designData.version.status
          )

          return new DesignClass(
            designData.id,
            designData.modelId,
            designData.name,
            mainTexture,
            supportMaterials,
            version,
            designData.status,
            designData.previewImageUrl,
            new Date(designData.createdAt),
            new Date(designData.updatedAt)
          )
        },
        async getAll() {
          return []
        },
        async create() {
          throw new Error('Not supported')
        },
        async update() {
          throw new Error('Not supported')
        },
        async delete() {
          throw new Error('Not supported')
        },
        async getByModelId() {
          return []
        },
      }

      renderServiceRef.current = new RenderDesignService(repository)
    }
  }, [designRepository])

  // Cleanup function
  const cleanupPreviousDesign = (previousDesignId: string | undefined) => {
    if (!clonedSceneRef.current || !threeScene || !previousDesignId) return

    clonedSceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          if (child.material.map && (child.material.map as any).userData?.isDesignTexture) {
            child.material.map.dispose()
            child.material.map = null
            child.material.needsUpdate = true
          }
        }
      }
    })

    if (threeScene.background instanceof THREE.Texture) {
      if ((threeScene.background as any).userData?.isDesignBackground) {
        threeScene.background.dispose()
        threeScene.background = null
      }
    }
  }

  // Add model to scene
  useEffect(() => {
    if (!groupRef.current || !scene) return

    if (clonedSceneRef.current && clonedSceneRef.current.parent === groupRef.current) {
      groupRef.current.remove(clonedSceneRef.current)
      clonedSceneRef.current = null
    }

    const clonedScene = scene.clone()
    clonedSceneRef.current = clonedScene

    // Store original textures
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const meshName = child.name || 'unnamed'
        if (child.material instanceof THREE.MeshStandardMaterial) {
          if (child.material.map) {
            originalTexturesRef.current.set(meshName, child.material.map)
            if (!(child.material.map as any).userData) {
              (child.material.map as any).userData = {}
            }
            (child.material.map as any).userData.isOriginalTexture = true
          } else {
            originalTexturesRef.current.set(meshName, null)
          }
        }
      }
    })

    // Center and scale
    const box = new THREE.Box3().setFromObject(clonedScene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    clonedScene.position.sub(center)

    const maxSize = Math.max(size.x, size.y, size.z)
    if (maxSize > 5) {
      const scale = 5 / maxSize
      clonedScene.scale.set(scale, scale, scale)
    } else if (maxSize < 0.5) {
      const scale = 2 / maxSize
      clonedScene.scale.set(scale, scale, scale)
    }

    clonedScene.position.y += 0.5
    groupRef.current.add(clonedScene)

    return () => {
      if (groupRef.current && clonedScene.parent === groupRef.current) {
        groupRef.current.remove(clonedScene)
        clonedSceneRef.current = null
      }
    }
  }, [scene])

  // Apply design
  useEffect(() => {
    if (!groupRef.current || !threeScene || !renderServiceRef.current || !scene) return

    const clonedScene = clonedSceneRef.current || (groupRef.current.children[0] as THREE.Group)
    if (!clonedScene) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    if (!designId) {
      cleanupPreviousDesign(previousDesignIdRef.current)
      previousDesignIdRef.current = undefined

      if (clonedSceneRef.current) {
        clonedSceneRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const meshName = child.name || 'unnamed'
            const originalTexture = originalTexturesRef.current.get(meshName)
            if (originalTexture && child.material instanceof THREE.MeshStandardMaterial) {
              child.material.map = originalTexture
              child.material.needsUpdate = true
            }
          }
        })
      }

      threeScene.background = new THREE.Color(0x000000)
      threeScene.environment = null
      setIsLoading(false)
      onLoadingChange?.(false)
      return
    }

    if (previousDesignIdRef.current && previousDesignIdRef.current !== designId) {
      cleanupPreviousDesign(previousDesignIdRef.current)
    }

    let loadingTimeout: ReturnType<typeof setTimeout> | null = null
    const showLoading = () => {
      loadingTimeout = setTimeout(() => {
        setIsLoading(true)
        onLoadingChange?.(true)
      }, 200)
    }
    showLoading()

    renderServiceRef.current
      .render3DSceneGroup(designId, threeScene, clonedScene, signal)
      .then(() => {
        if (signal.aborted) {
          if (loadingTimeout) clearTimeout(loadingTimeout)
          return
        }

        if (clonedSceneRef.current) {
          clonedSceneRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
              if (child.material.map && !(child.material.map as any).userData?.isOriginalTexture) {
                (child.material.map as any).userData.isDesignTexture = true
              }
            }
          })
        }

        if (threeScene.background instanceof THREE.Texture) {
          (threeScene.background as any).userData.isDesignBackground = true
        }

        previousDesignIdRef.current = designId
        if (loadingTimeout) clearTimeout(loadingTimeout)
        setIsLoading(false)
        onLoadingChange?.(false)
      })
      .catch((error) => {
        if (error.name === 'AbortError' || signal.aborted) {
          if (loadingTimeout) clearTimeout(loadingTimeout)
          return
        }

        console.error('[ModelScene3D] Error:', error)
        if (loadingTimeout) clearTimeout(loadingTimeout)
        setIsLoading(false)
        onLoadingChange?.(false)
        onError?.(error instanceof Error ? error : new Error(String(error)))
      })

    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [designId, threeScene, scene, onLoadingChange, onError])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      cleanupPreviousDesign(previousDesignIdRef.current)
    }
  }, [])

  if (gltfError) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    )
  }

  if (!scene) {
    return (
      <group ref={groupRef}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </group>
    )
  }

  return (
    <>
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={20}
      />
      <group ref={groupRef} />
    </>
  )
}
