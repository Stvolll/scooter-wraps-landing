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
