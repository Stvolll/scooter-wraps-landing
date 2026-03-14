import type { Design } from '@/domain'
import type { BackgroundRenderData } from '@/shared-core'
import { BackgroundMaterial } from '@/domain'
import * as THREE from 'three'

/**
 * Background Renderer
 * Renders background for 3D scenes based on Design
 * Note: Does NOT implement IMaterialRenderer as it works with Design, not Material
 */
export class BackgroundRenderer {

  /**
   * Get render data for background without if/switch
   * Uses polymorphism through BackgroundMaterial payload structure
   */
  getRenderData(design: Design): BackgroundRenderData {
    const background = this.resolveBackground(design)
    const payload = background.payload

    // Use polymorphism - each type has its own structure
    const renderData: BackgroundRenderData = {
      type: payload.type,
    }

    // Only add properties that exist for this type
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

    // Clear existing background and environment first
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
          // ✅ FIX: Mark as design background for proper cleanup
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
      // TODO: Implement RGBELoader for HDR/EXR
      const loader = new THREE.TextureLoader()
      loader.load(
        background.payload.url,
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping
          // ✅ FIX: Mark as design background for proper cleanup
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

  /**
   * Render background from serialized data (shared-core).
   * Used by presentation layer so it does not need to import domain or three.
   */
  renderFromRenderData(scene: THREE.Scene, data: BackgroundRenderData | null): void {
    if (!data) {
      this.clearSceneBackground(scene)
      return
    }
    const temp = new BackgroundMaterial('temp-bg', {
      type: data.type,
      color: data.color,
      gradient: data.gradient,
      url: data.url,
    })
    const tempDesign = { supportMaterials: { sceneBackground: temp } } as Design
    this.render(scene, tempDesign)
  }

  clearSceneBackground(scene: THREE.Scene): void {
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


