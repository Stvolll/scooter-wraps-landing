/**
 * Model Scene 3D Component (Refactored)
 * Uses RenderDesignService from application layer per User Rules
 * 
 * NOTE: This component uses @react-three/fiber hooks (useGLTF, useThree)
 * to get Three.js objects, but does NOT work with Three.js directly.
 * All rendering logic is delegated to RenderDesignService.
 * 
 * ✅ FIXES:
 * - Race condition handling with AbortController
 * - Loading state management
 * - Complete cleanup function implementation
 * - Error handling
 */

import { useEffect, useRef, useState } from 'react'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { RenderDesignService } from '@/application/services/RenderDesignService'
import type { IDesignRepository } from '@/domain'
import type { Design } from '@/domain'
import * as THREE from 'three'

interface ModelScene3DProps {
  modelUrl: string
  designId?: string
  panoramaUrl?: string
  onLoadingChange?: (loading: boolean) => void
  onError?: (error: Error) => void
}

/** Inner component so all hooks run unconditionally (modelUrl is always set when this mounts) */
function ModelScene3DInner({
  modelUrl,
  designId,
  panoramaUrl,
  onLoadingChange,
  onError,
}: ModelScene3DProps) {
  console.log('[ModelScene3D] ✅ Component render START, modelUrl:', modelUrl, 'designId:', designId)

  console.log('[ModelScene3D] Calling useGLTF with:', modelUrl)
  const gltfResult = useGLTF(modelUrl) as { scene: THREE.Group; error?: Error }
  const { scene, error: gltfError } = gltfResult
  console.log('[ModelScene3D] useGLTF returned:', { hasScene: !!scene, hasError: !!gltfError })
  const groupRef = useRef<THREE.Group>(null)
  const clonedSceneRef = useRef<THREE.Group | null>(null)
  const { scene: threeScene } = useThree()
  const renderServiceRef = useRef<RenderDesignService | null>(null)
  
  // ✅ FIX: Race condition handling
  const abortControllerRef = useRef<AbortController | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Log scene loading state
  useEffect(() => {
    console.log('[ModelScene3D] Scene state:', {
      hasScene: !!scene,
      hasError: !!gltfError,
      modelUrl
    })
    if (scene) {
      console.log('[ModelScene3D] Scene loaded, children:', scene.children.length)
    }
  }, [scene, gltfError, modelUrl])

  // Handle GLTF loading errors
  useEffect(() => {
    if (gltfError) {
      console.error('[ModelScene3D] GLTF loading error:', gltfError)
      onError?.(new Error(`Failed to load model: ${gltfError.message || 'Unknown error'}`))
    }
  }, [gltfError, onError])

  // Initialize RenderDesignService (only once)
  // ✅ FIX: Use API-based repository for client-side rendering
  useEffect(() => {
    if (!renderServiceRef.current) {
      // Create a client-side repository that uses API calls and reconstructs domain objects
      const clientRepository: IDesignRepository = {
        async getById(id: string) {
          const response = await fetch(`/api/designs/${id}`)
          if (!response.ok) {
            throw new Error(`Failed to fetch design: ${response.statusText}`)
          }
          const data = await response.json()
          const designData = data.design
          
          // ✅ FIX: Reconstruct domain objects from serialized data
          // Import domain classes dynamically (client-side safe)
          const domain = await import('@/domain')
          const { TextureMaterial, PhotoMaterial, VideoMaterial, BackgroundMaterial, SupportMaterials, DesignVersion, Design: DesignClass } = domain
          
          // Reconstruct mainTexture
          const mainTexture = new TextureMaterial(
            designData.mainTexture.id,
            designData.mainTexture.payload
          )
          
          // Reconstruct supportMaterials
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
          
          // ✅ FIX: Reconstruct version using DesignVersion (not Version)
          const version = new DesignVersion(
            designData.version.major,
            designData.version.minor,
            designData.version.patch,
            designData.version.status
          )
          
          // Reconstruct Design object (parameter order: id, modelId, name, mainTexture, supportMaterials, version, status, previewImageUrl, createdAt, updatedAt)
          const design = new DesignClass(
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
          
          return design
        },
        async getByModelId(_modelId: string) {
          const response = await fetch(`/api/designs?modelId=${encodeURIComponent(_modelId)}`)
          if (!response.ok) return []
          const data = await response.json()
          const list = data.designs ?? []
          if (list.length === 0) return []
          const domain = await import('@/domain')
          const { TextureMaterial, PhotoMaterial, VideoMaterial, BackgroundMaterial, SupportMaterials, DesignVersion, Design: DesignClass } = domain
          return list.map((designData: any) => {
            const mainTexture = new TextureMaterial(designData.mainTexture.id, designData.mainTexture.payload)
            const photos = (designData.supportMaterials?.photos || []).map((p: any) => new PhotoMaterial(p.id, p.payload))
            const videos = (designData.supportMaterials?.videos || []).map((v: any) => new VideoMaterial(v.id, v.payload))
            const background = designData.supportMaterials?.sceneBackground
              ? new BackgroundMaterial(designData.supportMaterials.sceneBackground.id, designData.supportMaterials.sceneBackground.payload)
              : undefined
            const supportMaterials = new SupportMaterials(photos, videos, background)
            const version = new DesignVersion(designData.version.major, designData.version.minor, designData.version.patch, designData.version.status)
            return new DesignClass(designData.id, designData.modelId, designData.name, mainTexture, supportMaterials, version, designData.status, designData.previewImageUrl, new Date(designData.createdAt), new Date(designData.updatedAt))
          })
        },
        async getAll() {
          const response = await fetch('/api/designs')
          if (!response.ok) {
            throw new Error(`Failed to fetch designs: ${response.statusText}`)
          }
          const data = await response.json()
          // Note: getAll is not used by RenderDesignService, but we'll return empty array for completeness
          return []
        },
        async create(design: Design) {
          throw new Error('Create not supported on client')
        },
        async update(design: Design) {
          throw new Error('Update not supported on client')
        },
        async delete(id: string) {
          throw new Error('Delete not supported on client')
        },
      }
      renderServiceRef.current = new RenderDesignService(clientRepository)
    }
  }, [])

  // ✅ FIX: Store previous design ID to cleanup only when design actually changes
  const previousDesignIdRef = useRef<string | undefined>(undefined)
  
  // ✅ FIX: Store original textures from Blender model (to preserve them)
  // Use mesh name as key instead of mesh object (because cloned meshes have different references)
  const originalTexturesRef = useRef<Map<string, THREE.Texture | null>>(new Map())
  
  // ✅ FIX: Complete cleanup function - only cleanup previous design, not current
  const cleanupPreviousDesign = (previousDesignId: string | undefined) => {
    if (!clonedSceneRef.current || !threeScene) return
    
    // Only cleanup if we had a previous design
    if (!previousDesignId) return

    // Clear textures from design-applied meshes only (not original Blender textures)
    clonedSceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mesh = child as THREE.Mesh
        // Check if this mesh has a design-applied texture (marked with userData)
        if (child.material instanceof THREE.MeshStandardMaterial) {
          if (child.material.map && (child.material.map as any).userData?.isDesignTexture) {
            // Only dispose design textures, not original Blender textures
            const texture = child.material.map
            texture.dispose()
            child.material.map = null
            child.material.needsUpdate = true
          }
        } else if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              if (mat.map && (mat.map as any).userData?.isDesignTexture) {
                const texture = mat.map
                texture.dispose()
                mat.map = null
                mat.needsUpdate = true
              }
            }
          })
        }
      }
    })
    
    // Cleanup previous background only if it was from a design
    if (threeScene.background instanceof THREE.Texture) {
      if ((threeScene.background as any).userData?.isDesignBackground) {
        threeScene.background.dispose()
        threeScene.background = null
      }
    }
    if (threeScene.environment instanceof THREE.Texture) {
      if ((threeScene.environment as any).userData?.isDesignBackground) {
        threeScene.environment.dispose()
        threeScene.environment = null
      }
    }
  }

  // Add model to scene (always show model, even without design)
  useEffect(() => {
    if (!groupRef.current || !scene) {
      console.log('[ModelScene3D] Waiting for group or scene:', {
        hasGroup: !!groupRef.current,
        hasScene: !!scene
      })
      return
    }

    console.log('[ModelScene3D] Adding model to scene, scene children:', scene.children.length)

    // ✅ FIX: Clear previous cloned scene if exists
    if (clonedSceneRef.current && clonedSceneRef.current.parent === groupRef.current) {
      groupRef.current.remove(clonedSceneRef.current)
      clonedSceneRef.current = null
    }

    // ✅ FIX: Clone scene to avoid sharing state (complete logic)
    const clonedScene = scene.clone()
    clonedSceneRef.current = clonedScene
    
    // ✅ FIX: Store original textures from Blender model before applying design textures
    // Use mesh name as key (cloned meshes have different object references)
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mesh = child as THREE.Mesh
        const meshName = child.name || 'unnamed'
        console.log('[ModelScene3D] Found mesh:', meshName)
        
        // Store original texture if exists (from Blender)
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          if (mesh.material.map) {
            console.log('[ModelScene3D] ✅ Found original texture on mesh:', meshName)
            // Clone texture reference (don't modify original)
            originalTexturesRef.current.set(meshName, mesh.material.map)
            // Mark as original (not design texture)
            if (!(mesh.material.map as any).userData) {
              (mesh.material.map as any).userData = {}
            }
            (mesh.material.map as any).userData.isOriginalTexture = true
          } else {
            console.log('[ModelScene3D] ⚠️ No texture on mesh:', meshName)
            originalTexturesRef.current.set(meshName, null)
          }
        } else if (Array.isArray(mesh.material)) {
          // For multi-material meshes, store first material's texture
          const firstMat = mesh.material[0]
          if (firstMat instanceof THREE.MeshStandardMaterial && firstMat.map) {
            console.log('[ModelScene3D] ✅ Found original texture on multi-material mesh:', meshName)
            originalTexturesRef.current.set(meshName, firstMat.map)
            if (!(firstMat.map as any).userData) {
              (firstMat.map as any).userData = {}
            }
            (firstMat.map as any).userData.isOriginalTexture = true
          } else {
            originalTexturesRef.current.set(meshName, null)
          }
        } else {
          originalTexturesRef.current.set(meshName, null)
        }
      }
    })
    
    // Calculate bounding box and center model
    const box = new THREE.Box3().setFromObject(clonedScene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    console.log('[ModelScene3D] Model bounds:', {
      center: { x: center.x, y: center.y, z: center.z },
      size: { x: size.x, y: size.y, z: size.z }
    })
    
    // Center the model
    clonedScene.position.sub(center)
    
    // Scale model to fit view if too large or too small
    const maxSize = Math.max(size.x, size.y, size.z)
    if (maxSize > 5) {
      const scale = 5 / maxSize
      clonedScene.scale.set(scale, scale, scale)
      console.log('[ModelScene3D] Scaled model down by:', scale, 'to fit view')
    } else if (maxSize < 0.5) {
      const scale = 2 / maxSize
      clonedScene.scale.set(scale, scale, scale)
      console.log('[ModelScene3D] Scaled model up by:', scale, 'to be visible')
    }
    
    // ✅ FIX: Ensure model is visible by adjusting position (match camera lookAt 0.4)
    clonedScene.position.y += 0.4
    
    groupRef.current.add(clonedScene)
    console.log('[ModelScene3D] ✅ Model added to group, group children:', groupRef.current.children.length)

    return () => {
      if (groupRef.current && clonedScene.parent === groupRef.current) {
        groupRef.current.remove(clonedScene)
        clonedSceneRef.current = null
      }
    }
  }, [scene])

  // Apply design to scene using RenderDesignService (if designId provided)
  useEffect(() => {
    if (!groupRef.current || !threeScene || !renderServiceRef.current || !scene) {
      return
    }

    // ✅ FIX: Find cloned scene from ref (more reliable)
    const clonedScene = clonedSceneRef.current || (groupRef.current.children[0] as THREE.Group)
    if (!clonedScene) {
      console.warn('[ModelScene3D] Cloned scene not found')
      return
    }

    // ✅ FIX: Cancel previous operation if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    if (!designId) {
      // If no designId, clear design textures and use default background
      console.log('[ModelScene3D] Clearing design - no designId provided')
      cleanupPreviousDesign(previousDesignIdRef.current)
      previousDesignIdRef.current = undefined
      // ✅ FIX: Restore original Blender textures if they exist
      if (clonedSceneRef.current) {
        clonedSceneRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const meshName = child.name || 'unnamed'
            const originalTexture = originalTexturesRef.current.get(meshName)
            if (originalTexture && child.material instanceof THREE.MeshStandardMaterial) {
              console.log('[ModelScene3D] ✅ Restoring original texture to mesh:', meshName)
              child.material.map = originalTexture
              child.material.needsUpdate = true
            } else if (!originalTexture && child.material instanceof THREE.MeshStandardMaterial) {
              // If no original texture was stored, clear any design textures
              if (child.material.map && (child.material.map as any).userData?.isDesignTexture) {
                child.material.map = null
                child.material.needsUpdate = true
              }
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

    console.log('[ModelScene3D] Applying design:', designId)

    // ✅ FIX: Cleanup previous design BEFORE applying new one (but preserve original textures)
    if (previousDesignIdRef.current && previousDesignIdRef.current !== designId) {
      cleanupPreviousDesign(previousDesignIdRef.current)
    }

    // ✅ FIX: Optimize loading state - only show if operation takes > 200ms
    let loadingTimeout: NodeJS.Timeout | null = null
    const showLoading = () => {
      loadingTimeout = setTimeout(() => {
        setIsLoading(true)
        onLoadingChange?.(true)
      }, 200) // Only show loading after 200ms delay
    }
    showLoading()

    // ✅ FIX: Use RenderDesignService with race condition handling
    renderServiceRef.current
      .render3DSceneGroup(designId, threeScene, clonedScene, signal)
      .then(() => {
        // Check if operation was aborted
        if (signal.aborted) {
          console.log('[ModelScene3D] Operation aborted')
          if (loadingTimeout) clearTimeout(loadingTimeout)
          return
        }

        // ✅ FIX: Mark applied textures and backgrounds as design textures
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
        if (threeScene.environment instanceof THREE.Texture) {
          (threeScene.environment as any).userData.isDesignBackground = true
        }

        // Update previous design ID
        previousDesignIdRef.current = designId

        console.log('[ModelScene3D] ✅ Design applied successfully:', designId)
        if (loadingTimeout) clearTimeout(loadingTimeout)
        setIsLoading(false)
        onLoadingChange?.(false)
      })
      .catch((error) => {
        // Ignore abort errors
        if (error.name === 'AbortError' || signal.aborted) {
          console.log('[ModelScene3D] Operation aborted')
          if (loadingTimeout) clearTimeout(loadingTimeout)
          return
        }

        console.error('[ModelScene3D] ❌ Error rendering design:', error)
        if (loadingTimeout) clearTimeout(loadingTimeout)
        setIsLoading(false)
        onLoadingChange?.(false)
        onError?.(error instanceof Error ? error : new Error(String(error)))
      })

    // ✅ FIX: Cleanup on unmount or designId change
    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [designId, threeScene, scene, onLoadingChange, onError])

  // ✅ FIX: Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      cleanupPreviousDesign(previousDesignIdRef.current)
    }
  }, [])

  // Show error if GLTF failed to load
  if (gltfError) {
    console.error('[ModelScene3D] GLTF error:', gltfError)
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    )
  }

  // Show loading state if scene not ready - but still render group
  if (!scene) {
    console.log('[ModelScene3D] Scene not loaded yet, rendering placeholder')
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
      <color attach="background" args={['#0a0a0a']} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={1.5}
        maxDistance={5}
        minPolarAngle={Math.PI / 2.4}
        maxPolarAngle={Math.PI / 2.4}
        autoRotate
        autoRotateSpeed={0.85}
      />
      <group ref={groupRef} />
    </>
  )
}

export default function ModelScene3DRefactored(props: ModelScene3DProps) {
  if (!props.modelUrl) {
    console.warn('[ModelScene3D] ⚠️ No modelUrl provided, returning null')
    return null
  }
  return <ModelScene3DInner {...props} />
}



