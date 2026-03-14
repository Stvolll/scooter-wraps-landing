# Автономная система "Модель-Дизайны" для Three.js

Этот файл содержит полный автономный код для работы с 3D моделями и дизайнами в Three.js.
Система позволяет:
- Загружать 3D модели (GLB)
- Применять дизайн-текстуры к UV-мешам
- Сохранять оригинальные текстуры модели из Blender
- Переключать фоны сцен
- Управлять версиями дизайнов

## Установка зависимостей

```bash
npm install three @react-three/fiber @react-three/drei
# или
yarn add three @react-three/fiber @react-three/drei
```

## Структура файлов

Создайте следующую структуру:

```
your-project/
├── model-design-system/
│   ├── types.ts              # Типы и интерфейсы
│   ├── domain.ts             # Domain entities
│   ├── renderers.ts          # Three.js renderers
│   ├── service.ts            # Application service
│   └── component.tsx         # React component
└── ...
```

## 1. types.ts - Типы и интерфейсы

```typescript
// ============================================
// TYPES.TS - Типы и интерфейсы
// ============================================

// Core type definitions
export type MaterialId = string
export type DesignId = string
export type ModelId = string
export type DesignStatus = 'draft' | 'published' | 'archived'
export type ImageFormat = 'jpg' | 'png' | 'webp'
export type HDRFormat = 'hdr' | 'exr'
export type BackgroundType = 'color' | 'gradient' | 'image' | 'hdri'
export type GradientDirection = 'vertical' | 'horizontal'

// Background render data (for API serialization)
export interface BackgroundRenderData {
  type: BackgroundType
  color?: string
  gradient?: {
    from: string
    to: string
    direction: GradientDirection
  }
  url?: string
}

// Design Repository Interface
export interface IDesignRepository {
  getById(id: DesignId): Promise<Design | null>
  getByModelId(modelId: ModelId): Promise<Design[]>
  getAll(): Promise<Design[]>
  create(design: Design): Promise<Design>
  update(design: Design): Promise<Design>
  delete(id: DesignId): Promise<void>
}

// Material Renderer Interface
export interface IMaterialRenderer {
  readonly type: string
  render(material: any, target: any): void | Promise<void>
}

// Custom Errors
export class CannotPublishError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CannotPublishError'
  }
}
```

## 2. domain.ts - Domain Entities

```typescript
// ============================================
// DOMAIN.TS - Domain Entities
// ============================================

import type {
  MaterialId,
  DesignId,
  ModelId,
  DesignStatus,
  ImageFormat,
  BackgroundType,
  GradientDirection,
  HDRFormat,
  CannotPublishError
} from './types'

// ========== Design Version ==========
export class DesignVersion {
  constructor(
    public major: number,
    public minor: number,
    public patch: number,
    public status: DesignStatus
  ) {}

  static initial(): DesignVersion {
    return new DesignVersion(1, 0, 0, 'draft')
  }

  increment(): DesignVersion {
    return new DesignVersion(
      this.major,
      this.minor,
      this.patch + 1,
      'draft'
    )
  }

  toString(): string {
    return `v${this.major}.${this.minor}.${this.patch}`
  }
}

// ========== Materials ==========
export class TextureMaterial {
  public readonly type = 'texture' as const

  constructor(
    public readonly id: MaterialId,
    public readonly payload: {
      url: string
      width: number
      height: number
      format: ImageFormat
    }
  ) {}
}

export class PhotoMaterial {
  public readonly type = 'photo' as const

  constructor(
    public readonly id: MaterialId,
    public readonly payload: {
      originalUrl: string
      thumbnailUrl: string
      width: number
      height: number
      caption?: string
    }
  ) {}
}

export class VideoMaterial {
  public readonly type = 'video' as const

  constructor(
    public readonly id: MaterialId,
    public readonly payload: {
      url: string
      duration: number
      thumbnailUrl: string
      format: 'mp4' | 'webm'
    }
  ) {}
}

export class BackgroundMaterial {
  public readonly type = 'background' as const

  constructor(
    public readonly id: MaterialId,
    public readonly payload: {
      type: BackgroundType
      color?: string
      gradient?: {
        from: string
        to: string
        direction: GradientDirection
      }
      url?: string
      format?: ImageFormat | HDRFormat
    }
  ) {}

  static createDefault(): BackgroundMaterial {
    return new BackgroundMaterial('bg-fallback-default', {
      type: 'gradient',
      gradient: {
        from: '#ffffff',
        to: '#e8e8e8',
        direction: 'vertical',
      },
    })
  }
}

// ========== Support Materials ==========
export class SupportMaterials {
  constructor(
    public readonly photos: PhotoMaterial[],
    public readonly videos: VideoMaterial[],
    public readonly sceneBackground?: BackgroundMaterial
  ) {}
}

// ========== Design Entity ==========
export class Design {
  constructor(
    public readonly id: DesignId,
    public readonly modelId: ModelId,
    public readonly name: string,
    public readonly mainTexture: TextureMaterial,
    public readonly supportMaterials: SupportMaterials,
    public readonly version: DesignVersion,
    public readonly status: DesignStatus,
    public readonly previewImageUrl: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  updateMainTexture(newTexture: TextureMaterial): Design {
    return new Design(
      this.id,
      this.modelId,
      this.name,
      newTexture,
      this.supportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  addPhoto(photo: PhotoMaterial): Design {
    const newSupportMaterials = new SupportMaterials(
      [...this.supportMaterials.photos, photo],
      this.supportMaterials.videos,
      this.supportMaterials.sceneBackground
    )

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      newSupportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  removePhoto(photoId: string): Design {
    const newPhotos = this.supportMaterials.photos.filter(
      (p) => p.id !== photoId
    )
    const newSupportMaterials = new SupportMaterials(
      newPhotos,
      this.supportMaterials.videos,
      this.supportMaterials.sceneBackground
    )

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      newSupportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  addVideo(video: VideoMaterial): Design {
    const newSupportMaterials = new SupportMaterials(
      this.supportMaterials.photos,
      [...this.supportMaterials.videos, video],
      this.supportMaterials.sceneBackground
    )

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      newSupportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  removeVideo(videoId: string): Design {
    const newVideos = this.supportMaterials.videos.filter(
      (v) => v.id !== videoId
    )
    const newSupportMaterials = new SupportMaterials(
      this.supportMaterials.photos,
      newVideos,
      this.supportMaterials.sceneBackground
    )

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      newSupportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  updateBackground(background: BackgroundMaterial): Design {
    const newSupportMaterials = new SupportMaterials(
      this.supportMaterials.photos,
      this.supportMaterials.videos,
      background
    )

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      newSupportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  removeBackground(): Design {
    const newSupportMaterials = new SupportMaterials(
      this.supportMaterials.photos,
      this.supportMaterials.videos,
      undefined
    )

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      newSupportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  canPublish(): boolean {
    return !!this.mainTexture
  }

  publish(): Design {
    if (!this.canPublish()) {
      throw new Error('Design must have main texture')
    }

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      this.supportMaterials,
      this.version,
      'published',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }
}
```

## 3. renderers.ts - Three.js Renderers

```typescript
// ============================================
// RENDERERS.TS - Three.js Renderers
// ============================================

import * as THREE from 'three'
import type { TextureMaterial, BackgroundMaterial, Design } from './domain'
import type { BackgroundRenderData, IMaterialRenderer } from './types'

// ========== Texture Renderer ==========
export class TextureRenderer implements IMaterialRenderer {
  readonly type = 'texture' as const
  
  /**
   * Determine if a mesh is a UV-mapped mesh for design textures
   * UV meshes are typically named with patterns like "Texture_*", "UV_*", or contain "texture"
   * Original model meshes (like "Retopo_*") should preserve their Blender textures
   */
  private isUVMeshForDesign(meshName: string): boolean {
    const name = meshName.toLowerCase()
    return (
      name.includes('texture_') ||
      name.startsWith('uv_') ||
      (name.includes('texture') && !name.includes('retopo'))
    )
  }

  private textureCache = new Map<string, THREE.Texture>()

  getTextureUrl(material: TextureMaterial): string {
    return material.payload.url
  }

  dispose(): void {
    this.textureCache.forEach((texture) => {
      texture.dispose()
    })
    this.textureCache.clear()
  }

  disposeTexture(url: string): void {
    const texture = this.textureCache.get(url)
    if (texture) {
      texture.dispose()
      this.textureCache.delete(url)
    }
  }

  render(material: TextureMaterial, mesh: THREE.Mesh): void {
    const loader = new THREE.TextureLoader()
    const textureUrl = material.payload.url

    if (mesh.material instanceof THREE.MeshStandardMaterial) {
      if (mesh.material.map) {
        const oldUrl = (mesh.material.map as any).userData?.url
        if (oldUrl && oldUrl !== textureUrl) {
          this.disposeTexture(oldUrl)
        }
        mesh.material.map.dispose()
        mesh.material.map = null
      }
    }

    loader.load(
      textureUrl,
      (texture) => {
        texture.userData = { url: textureUrl }
        this.textureCache.set(textureUrl, texture)

        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(1, 1)

        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.map = texture
          mesh.material.needsUpdate = true
        }
      },
      undefined,
      (error) => {
        console.error('[TextureRenderer] Error loading texture:', error)
        this.textureCache.delete(textureUrl)
      }
    )
  }

  renderToScene(
    material: TextureMaterial,
    scene: THREE.Scene | THREE.Group
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader()
      const textureUrl = material.payload.url

      // Cleanup only design textures from UV meshes
      const oldDesignTextures: THREE.Texture[] = []
      
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const meshName = child.name || ''
          const isUVMesh = this.isUVMeshForDesign(meshName)
          
          if (!isUVMesh) {
            return // Skip non-UV meshes
          }
          
          if (child.material instanceof THREE.MeshStandardMaterial) {
            if (child.material.map && (child.material.map as any).userData?.isDesignTexture) {
              oldDesignTextures.push(child.material.map)
              child.material.map = null
            }
          } else if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                if (mat.map && (mat.map as any).userData?.isDesignTexture) {
                  oldDesignTextures.push(mat.map)
                  mat.map = null
                }
              }
            })
          }
        }
      })

      oldDesignTextures.forEach((texture) => {
        const url = (texture as any).userData?.url
        if (url) {
          this.disposeTexture(url)
        } else {
          texture.dispose()
        }
      })

      loader.load(
        textureUrl,
        (texture) => {
          try {
            texture.userData = { 
              url: textureUrl,
              isDesignTexture: true
            }
            this.textureCache.set(textureUrl, texture)

            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            texture.repeat.set(1, 1)

            // Apply texture ONLY to UV-mapped meshes
            scene.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                const meshName = child.name || ''
                const isUVMesh = this.isUVMeshForDesign(meshName)
                
                if (isUVMesh) {
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
                }
              }
            })

            resolve()
          } catch (error) {
            console.error('[TextureRenderer] Error applying texture:', error)
            this.textureCache.delete(textureUrl)
            reject(error)
          }
        },
        undefined,
        (error) => {
          console.error('[TextureRenderer] Error loading texture:', error)
          this.textureCache.delete(textureUrl)
          reject(error)
        }
      )
    })
  }
}

// ========== Background Renderer ==========
export class BackgroundRenderer {
  getRenderData(design: Design): BackgroundRenderData {
    const background = this.resolveBackground(design)
    const payload = background.payload

    const renderData: BackgroundRenderData = {
      type: payload.type,
    }

    if (payload.type === 'color' && payload.color) {
      renderData.color = payload.color
    }

    if (payload.type === 'gradient' && payload.gradient) {
      renderData.gradient = payload.gradient
    }

    if ((payload.type === 'image' || payload.type === 'hdri') && payload.url) {
      renderData.url = payload.url
    }

    return renderData
  }

  render(scene: THREE.Scene, design: Design): void {
    const background = this.resolveBackground(design)

    // Clear existing background
    if (scene.background) {
      if (scene.background instanceof THREE.Texture) {
        scene.background.dispose()
      }
      scene.background = null
    }
    if (scene.environment) {
      if (scene.environment instanceof THREE.Texture) {
        scene.environment.dispose()
      }
      scene.environment = null
    }

    if (background.payload.type === 'image' && background.payload.url) {
      const loader = new THREE.TextureLoader()
      loader.load(
        background.payload.url,
        (texture) => {
          texture.userData = { isDesignBackground: true }
          scene.background = texture
        },
        undefined,
        (error) => {
          console.error('Error loading background image:', error)
        }
      )
    }

    if (background.payload.type === 'hdri' && background.payload.url) {
      const loader = new THREE.TextureLoader()
      loader.load(
        background.payload.url,
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping
          texture.userData = { isDesignBackground: true }
          scene.background = texture
          scene.environment = texture
        },
        undefined,
        (error) => {
          console.error('Error loading HDRI:', error)
        }
      )
    }

    if (background.payload.type === 'color' && background.payload.color) {
      scene.background = new THREE.Color(background.payload.color)
    }

    if (background.payload.type === 'gradient' && background.payload.gradient) {
      this.renderGradientBackground(scene, background)
    }
  }

  private resolveBackground(design: Design): BackgroundMaterial {
    return design.supportMaterials.sceneBackground || BackgroundMaterial.createDefault()
  }

  private renderGradientBackground(
    scene: THREE.Scene,
    background: BackgroundMaterial
  ): void {
    if (!background.payload.gradient) return

    const { from, to, direction } = background.payload.gradient
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const context = canvas.getContext('2d')

    if (!context) return

    const gradient =
      direction === 'vertical'
        ? context.createLinearGradient(0, 0, 0, 256)
        : context.createLinearGradient(0, 0, 256, 0)

    gradient.addColorStop(0, from)
    gradient.addColorStop(1, to)

    context.fillStyle = gradient
    context.fillRect(0, 0, 256, 256)

    const texture = new THREE.CanvasTexture(canvas)
    texture.userData = { isDesignBackground: true }
    scene.background = texture
  }
}
```

## 4. service.ts - Application Service

```typescript
// ============================================
// SERVICE.TS - Application Service
// ============================================

import type { Design, IDesignRepository } from './types'
import { TextureRenderer } from './renderers'
import { BackgroundRenderer } from './renderers'
import type * as THREE from 'three'

export interface RenderData {
  textureUrl: string
  background: {
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

export class RenderDesignService {
  private designRepository: IDesignRepository
  private textureRenderer: TextureRenderer
  private backgroundRenderer: BackgroundRenderer

  constructor(
    designRepository: IDesignRepository,
    textureRenderer?: TextureRenderer,
    backgroundRenderer?: BackgroundRenderer
  ) {
    this.designRepository = designRepository
    this.textureRenderer = textureRenderer || new TextureRenderer()
    this.backgroundRenderer = backgroundRenderer || new BackgroundRenderer()
  }

  async getRenderData(designId: string): Promise<RenderData> {
    const design = await this.designRepository.getById(designId)
    if (!design) {
      throw new Error(`Design not found: ${designId}`)
    }

    const textureUrl = this.textureRenderer.getTextureUrl(design.mainTexture)
    const background = this.backgroundRenderer.getRenderData(design)

    return {
      textureUrl,
      background,
    }
  }

  async render3DScene(
    designId: string,
    scene: THREE.Scene,
    mesh: THREE.Mesh
  ): Promise<void> {
    const design = await this.designRepository.getById(designId)
    if (!design) {
      throw new Error(`Design not found: ${designId}`)
    }

    this.textureRenderer.render(design.mainTexture, mesh)
    this.backgroundRenderer.render(scene, design)
  }

  async render3DSceneGroup(
    designId: string,
    scene: THREE.Scene,
    sceneGroup: THREE.Group,
    signal?: AbortSignal
  ): Promise<void> {
    if (signal?.aborted) {
      throw new DOMException('Operation aborted', 'AbortError')
    }

    const design = await this.designRepository.getById(designId)
    if (!design) {
      throw new Error(`Design not found: ${designId}`)
    }

    if (signal?.aborted) {
      throw new DOMException('Operation aborted', 'AbortError')
    }

    await this.textureRenderer.renderToScene(design.mainTexture, sceneGroup)

    if (signal?.aborted) {
      throw new DOMException('Operation aborted', 'AbortError')
    }

    this.backgroundRenderer.render(scene, design)
  }
}
```

## 5. component.tsx - React Component

```typescript
// ============================================
// COMPONENT.TSX - React Component
// ============================================

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
  Design as DesignClass 
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

  const { scene, error: gltfError } = useGLTF(modelUrl)
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
        async getAll() { return [] },
        async create() { throw new Error('Not supported') },
        async update() { throw new Error('Not supported') },
        async delete() { throw new Error('Not supported') },
        async getByModelId() { return [] },
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

    let loadingTimeout: NodeJS.Timeout | null = null
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
```

## Использование

```typescript
import { Canvas } from '@react-three/fiber'
import ModelScene3D from './model-design-system/component'

function App() {
  return (
    <Canvas>
      <ModelScene3D 
        modelUrl="/models/your-model.glb"
        designId="design-123"
        onLoadingChange={(loading) => console.log('Loading:', loading)}
        onError={(error) => console.error('Error:', error)}
      />
    </Canvas>
  )
}
```

## Ключевые особенности

1. **Сохранение оригинальных текстур**: Оригинальные текстуры модели из Blender сохраняются постоянно
2. **UV-меши**: Дизайн-текстуры применяются только к UV-мешам (имена содержат "Texture_" или "UV_")
3. **Управление памятью**: Автоматическая очистка текстур и фонов
4. **Race conditions**: Обработка через AbortController
5. **Версионирование**: Поддержка версий дизайнов
6. **Фоны**: Поддержка цветов, градиентов, изображений и HDRI

## API Endpoint (пример)

```typescript
// pages/api/designs/[id].ts
export default async function handler(req, res) {
  const { id } = req.query
  const design = await getDesignFromDatabase(id)
  
  res.json({
    design: {
      id: design.id,
      modelId: design.modelId,
      name: design.name,
      mainTexture: {
        id: design.mainTexture.id,
        payload: design.mainTexture.payload
      },
      supportMaterials: {
        photos: design.supportMaterials.photos.map(p => ({
          id: p.id,
          payload: p.payload
        })),
        videos: design.supportMaterials.videos.map(v => ({
          id: v.id,
          payload: v.payload
        })),
        sceneBackground: design.supportMaterials.sceneBackground ? {
          id: design.supportMaterials.sceneBackground.id,
          payload: design.supportMaterials.sceneBackground.payload
        } : undefined
      },
      version: {
        major: design.version.major,
        minor: design.version.minor,
        patch: design.version.patch,
        status: design.version.status
      },
      status: design.status,
      previewImageUrl: design.previewImageUrl,
      createdAt: design.createdAt.toISOString(),
      updatedAt: design.updatedAt.toISOString()
    }
  })
}
```

## Примечания

- Система работает с моделями GLB/GLTF
- UV-меши определяются по имени (паттерны: `Texture_*`, `UV_*`)
- Оригинальные текстуры сохраняются по имени меша
- Все Three.js логика изолирована в renderers
- Domain entities не зависят от Three.js

