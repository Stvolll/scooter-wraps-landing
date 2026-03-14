import { MaterialFormat, Material, MaterialHandler, RenderContext } from './types'

export class TextureMaterialHandler implements MaterialHandler {
  canHandle(format: MaterialFormat): boolean {
    return format === MaterialFormat.TEXTURE
  }

  getDisplayUrl(material: Material): string {
    return material.url
  }

  getPreviewUrl(material: Material): string | null {
    return material.url
  }

  async apply(material: Material, context: RenderContext): Promise<void> {
    const { modelViewer, scene } = context

    if (!modelViewer || !material.url) {
      console.warn('TextureMaterialHandler: Missing modelViewer or url')
      return
    }

    try {
      // Wait for model to be loaded
      if (!modelViewer.loaded) {
        await new Promise((resolve) => {
          const handler = () => {
            modelViewer.removeEventListener('model-loaded', handler)
            resolve(undefined)
          }
          modelViewer.addEventListener('model-loaded', handler)
        })
      }

      // Get the scene
      const modelScene = modelViewer.model?.scene || modelViewer.model?.scenes?.[0]
      if (!modelScene) {
        console.warn('TextureMaterialHandler: Scene not available')
        return
      }

      // Apply texture to all meshes
      modelScene.traverse((node: any) => {
        if (node.isMesh && node.material) {
          // Load texture
          const textureLoader = new (window as any).THREE.TextureLoader()
          const texture = textureLoader.load(material.url, () => {
            // Update material
            if (Array.isArray(node.material)) {
              node.material.forEach((mat: any) => {
                if (mat.map) mat.map.dispose()
                mat.map = texture
                mat.needsUpdate = true
              })
            } else {
              if (node.material.map) node.material.map.dispose()
              node.material.map = texture
              node.material.needsUpdate = true
            }
          })
        }
      })
    } catch (error) {
      console.error('TextureMaterialHandler: Error applying texture', error)
    }
  }
}

