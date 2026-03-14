/**
 * Three.js Background Applier Service
 * Isolated in infrastructure layer per User Rules
 */

import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

export interface BackgroundConfig {
  type: 'color' | 'gradient' | 'image' | 'hdri'
  color?: string
  gradient?: {
    from: string
    to: string
    direction: 'vertical' | 'horizontal'
  }
  url?: string
}

export class BackgroundApplierService {
  /**
   * Apply background to Three.js scene
   */
  async applyBackground(scene: THREE.Scene, background: BackgroundConfig | null): Promise<void> {
    if (!background) {
      scene.background = null
      scene.environment = null
      return
    }

    if (background.type === 'color' && background.color) {
      scene.background = new THREE.Color(background.color)
      scene.environment = null
      return
    }

    if (background.type === 'gradient' && background.gradient) {
      const { from, to, direction } = background.gradient
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const context = canvas.getContext('2d')

      if (context) {
        const gradient =
          direction === 'vertical'
            ? context.createLinearGradient(0, 0, 0, 256)
            : context.createLinearGradient(0, 0, 256, 0)

        gradient.addColorStop(0, from)
        gradient.addColorStop(1, to)

        context.fillStyle = gradient
        context.fillRect(0, 0, 256, 256)

        const texture = new THREE.CanvasTexture(canvas)
        scene.background = texture
        scene.environment = null
      }
      return
    }

    if (background.type === 'image' && background.url) {
      return new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader()
        loader.load(
          background.url!,
          (texture) => {
            scene.background = texture
            scene.environment = null
            resolve()
          },
          undefined,
          (error) => {
            console.error('Error loading image background:', error)
            reject(error)
          }
        )
      })
    }

    if (background.type === 'hdri' && background.url) {
      return new Promise((resolve, reject) => {
        const loader = new RGBELoader()
        loader.load(
          background.url!,
          (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping
            scene.environment = texture
            scene.background = texture
            resolve()
          },
          undefined,
          (error) => {
            console.error('Error loading HDRI background:', error)
            reject(error)
          }
        )
      })
    }
  }
}


