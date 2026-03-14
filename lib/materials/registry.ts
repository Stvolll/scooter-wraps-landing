import { MaterialFormat } from './types'
import { MaterialHandler } from './types'
import { TextureMaterialHandler } from './texture-handler'
import { PanoramaMaterialHandler } from './panorama-handler'
import { VideoMaterialHandler } from './video-handler'
import { PhotoMaterialHandler } from './photo-handler'

class MaterialHandlerRegistry {
  private handlers: Map<MaterialFormat, MaterialHandler> = new Map()

  constructor() {
    // Register default handlers
    this.register(new TextureMaterialHandler())
    this.register(new PanoramaMaterialHandler())
    this.register(new VideoMaterialHandler())
    this.register(new PhotoMaterialHandler())
  }

  register(handler: MaterialHandler): void {
    // Find the format this handler supports
    const formats = Object.values(MaterialFormat) as MaterialFormat[]
    for (const format of formats) {
      if (handler.canHandle(format)) {
        this.handlers.set(format, handler)
        break
      }
    }
  }

  getHandler(format: MaterialFormat): MaterialHandler | null {
    return this.handlers.get(format) || null
  }

  async applyMaterial(material: any, context: any): Promise<void> {
    const handler = this.getHandler(material.format)
    if (!handler) {
      console.warn(`No handler found for format: ${material.format}`)
      return
    }
    await handler.apply(material, context)
  }

  getDisplayUrl(material: any): string | null {
    const handler = this.getHandler(material.format)
    if (!handler) return null
    return handler.getDisplayUrl(material)
  }

  getPreviewUrl(material: any): string | null {
    const handler = this.getHandler(material.format)
    if (!handler) return null
    return handler.getPreviewUrl(material)
  }

  // Helper methods for common material queries
  findMaterialByFormat(materials: any[], format: MaterialFormat): any | null {
    return materials.find((m) => m.format === format) || null
  }

  findMaterialByRole(materials: any[], role: 'cover' | 'gallery'): any | null {
    return materials.find((m) => m.metadata?.role === role) || null
  }

  findMaterialsByFormat(materials: any[], format: MaterialFormat): any[] {
    return materials.filter((m) => m.format === format)
  }
}

// Export singleton instance
export const materialRegistry = new MaterialHandlerRegistry()

// Export helper functions
export function getMaterialHandler(format: MaterialFormat): MaterialHandler | null {
  return materialRegistry.getHandler(format)
}

export async function applyMaterial(material: any, context: any): Promise<void> {
  return materialRegistry.applyMaterial(material, context)
}

export function getMaterialDisplayUrl(material: any): string | null {
  return materialRegistry.getDisplayUrl(material)
}

export function getMaterialPreviewUrl(material: any): string | null {
  return materialRegistry.getPreviewUrl(material)
}

export function findMaterialByFormat(materials: any[], format: MaterialFormat): any | null {
  return materialRegistry.findMaterialByFormat(materials, format)
}

export function findMaterialByRole(materials: any[], role: 'cover' | 'gallery'): any | null {
  return materialRegistry.findMaterialByRole(materials, role)
}

export function findMaterialsByFormat(materials: any[], format: MaterialFormat): any[] {
  return materialRegistry.findMaterialsByFormat(materials, format)
}

