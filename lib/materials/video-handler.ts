import { MaterialFormat, Material, MaterialHandler, RenderContext } from './types'

export class VideoMaterialHandler implements MaterialHandler {
  canHandle(format: MaterialFormat): boolean {
    return format === MaterialFormat.VIDEO
  }

  getDisplayUrl(material: Material): string {
    return material.url
  }

  getPreviewUrl(material: Material): string | null {
    // For video, we might want to return a thumbnail if available
    return material.metadata?.thumbnail || material.url
  }

  async apply(material: Material, context: RenderContext): Promise<void> {
    // Video materials are typically used for previews, not 3D rendering
    // This handler is mainly for metadata and URL retrieval
    console.log('VideoMaterialHandler: Video materials are for display, not 3D rendering')
  }
}

