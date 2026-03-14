import { MaterialFormat, Material, MaterialHandler, RenderContext } from './types'

export class PhotoMaterialHandler implements MaterialHandler {
  canHandle(format: MaterialFormat): boolean {
    return format === MaterialFormat.PHOTO
  }

  getDisplayUrl(material: Material): string {
    return material.url
  }

  getPreviewUrl(material: Material): string | null {
    return material.url
  }

  async apply(material: Material, context: RenderContext): Promise<void> {
    // Photo materials are for display/gallery, not 3D rendering
    // This handler is mainly for metadata and URL retrieval
    console.log('PhotoMaterialHandler: Photo materials are for display, not 3D rendering')
  }
}

