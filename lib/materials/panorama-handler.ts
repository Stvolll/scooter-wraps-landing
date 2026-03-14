import { MaterialFormat, Material, MaterialHandler, RenderContext } from './types'

export class PanoramaMaterialHandler implements MaterialHandler {
  canHandle(format: MaterialFormat): boolean {
    return format === MaterialFormat.PANORAMA
  }

  getDisplayUrl(material: Material): string {
    return material.url
  }

  getPreviewUrl(material: Material): string | null {
    return material.url
  }

  async apply(material: Material, context: RenderContext): Promise<void> {
    const { modelViewer } = context

    if (!modelViewer || !material.url) {
      console.warn('PanoramaMaterialHandler: Missing modelViewer or url')
      return
    }

    try {
      // Set environment image for model-viewer
      if (modelViewer.setAttribute) {
        modelViewer.setAttribute('environment-image', material.url)
      } else if (modelViewer.environmentImage) {
        modelViewer.environmentImage = material.url
      }
    } catch (error) {
      console.error('PanoramaMaterialHandler: Error applying panorama', error)
    }
  }
}

