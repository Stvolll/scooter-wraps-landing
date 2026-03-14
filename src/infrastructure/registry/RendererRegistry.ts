import type { MaterialType } from '@/shared-core'
import type { IMaterialRenderer } from '../renderers/three/IMaterialRenderer'
import { MaterialRendererNotFoundError } from '@/shared-core'

export class RendererRegistry {
  private renderers = new Map<MaterialType, IMaterialRenderer>()

  register(type: MaterialType, renderer: IMaterialRenderer): void {
    this.renderers.set(type, renderer)
  }

  get(type: MaterialType): IMaterialRenderer {
    const renderer = this.renderers.get(type)
    if (!renderer) {
      throw new MaterialRendererNotFoundError(type)
    }
    return renderer
  }

  has(type: MaterialType): boolean {
    return this.renderers.has(type)
  }
}


