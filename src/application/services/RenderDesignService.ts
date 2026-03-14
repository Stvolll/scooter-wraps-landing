import type { Design } from '@/domain'
import type { IDesignRepository } from '@/domain'
import type { BackgroundRenderData } from '@/shared-core'
import { TextureRenderer } from '@/infrastructure/renderers/three/TextureRenderer'
import { BackgroundRenderer } from '@/infrastructure/renderers/three/BackgroundRenderer'
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
    designRepository?: IDesignRepository,
    textureRenderer?: TextureRenderer,
    backgroundRenderer?: BackgroundRenderer
  ) {
    // ✅ FIX: Don't create DesignRepository on client - it uses fs
    if (!designRepository) {
      throw new Error('DesignRepository must be provided - cannot use file system on client')
    }
    this.designRepository = designRepository
    this.textureRenderer = textureRenderer || new TextureRenderer()
    this.backgroundRenderer = backgroundRenderer || new BackgroundRenderer()
  }

  /**
   * Get render data for a design (for API endpoints)
   * Returns data structure without Three.js objects
   */
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

  /**
   * Render design to Three.js scene
   * Accepts scene and mesh from react-three/fiber
   */
  async render3DScene(
    designId: string,
    scene: THREE.Scene,
    mesh: THREE.Mesh
  ): Promise<void> {
    const design = await this.designRepository.getById(designId)
    if (!design) {
      throw new Error(`Design not found: ${designId}`)
    }

    // 1. Apply texture to model
    this.textureRenderer.render(design.mainTexture, mesh)

    // 2. Set scene background (design or fallback)
    this.backgroundRenderer.render(scene, design)
  }

  /**
   * Render design to scene/group (for react-three/fiber)
   * Works with cloned scenes from useGLTF
   * ✅ FIX: Added AbortSignal support for race condition handling
   */
  async render3DSceneGroup(
    designId: string,
    scene: THREE.Scene,
    sceneGroup: THREE.Group,
    signal?: AbortSignal
  ): Promise<void> {
    // Check if aborted before starting
    if (signal?.aborted) {
      throw new DOMException('Operation aborted', 'AbortError')
    }

    const design = await this.designRepository.getById(designId)
    if (!design) {
      throw new Error(`Design not found: ${designId}`)
    }

    // Check again after async operation
    if (signal?.aborted) {
      throw new DOMException('Operation aborted', 'AbortError')
    }

    // 1. Apply texture to all meshes in the group
    // ✅ FIX: renderToScene now returns Promise, handle abort
    await this.textureRenderer.renderToScene(design.mainTexture, sceneGroup)

    // Check again before background
    if (signal?.aborted) {
      throw new DOMException('Operation aborted', 'AbortError')
    }

    // 2. Set scene background (design or fallback)
    this.backgroundRenderer.render(scene, design)
  }

  /**
   * Apply texture by URL (for admin preview)
   * Used when we have texture URL but not full design
   * ✅ FIX: Now returns Promise since renderToScene is async
   */
  async applyTextureByUrl(
    textureUrl: string,
    sceneGroup: THREE.Scene | THREE.Group
  ): Promise<void> {
    // Create temporary TextureMaterial for rendering
    // This is a workaround for admin preview where we only have URL
    const tempMaterial = {
      payload: { url: textureUrl, width: 2048, height: 2048, format: 'jpg' as const },
    } as any
    await this.textureRenderer.renderToScene(tempMaterial, sceneGroup)
  }

  /**
   * Apply background by config (for admin preview)
   * Used when we have background config but not full design
   * Delegates to BackgroundRenderer which handles all background types
   */
  applyBackgroundByConfig(
    scene: THREE.Scene,
    backgroundConfig: BackgroundRenderData
  ): void {
    // Use BackgroundRenderer's render method directly with a temporary design
    // BackgroundRenderer uses polymorphism, not if/switch
    const { BackgroundMaterial } = require('@/domain')
    
    let backgroundMaterial: any
    
    // Create BackgroundMaterial based on type - BackgroundRenderer handles the rest
    if (backgroundConfig.type === 'color' && backgroundConfig.color) {
      backgroundMaterial = new BackgroundMaterial('temp-bg', {
        type: 'color',
        color: backgroundConfig.color,
      })
    } else if (backgroundConfig.type === 'gradient' && backgroundConfig.gradient) {
      backgroundMaterial = new BackgroundMaterial('temp-bg', {
        type: 'gradient',
        gradient: backgroundConfig.gradient,
      })
    } else if (backgroundConfig.type === 'image' && backgroundConfig.url) {
      backgroundMaterial = new BackgroundMaterial('temp-bg', {
        type: 'image',
        url: backgroundConfig.url,
      })
    } else if (backgroundConfig.type === 'hdri' && backgroundConfig.url) {
      backgroundMaterial = new BackgroundMaterial('temp-bg', {
        type: 'hdri',
        url: backgroundConfig.url,
      })
    } else {
      // Fallback to default
      backgroundMaterial = BackgroundMaterial.createDefault()
    }

    // Create temporary Design with background
    // BackgroundRenderer.render() handles all types through polymorphism
    const tempDesign = {
      supportMaterials: {
        sceneBackground: backgroundMaterial,
      },
    } as any

    this.backgroundRenderer.render(scene, tempDesign)
  }
}


