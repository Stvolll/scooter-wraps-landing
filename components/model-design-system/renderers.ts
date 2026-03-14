// ============================================
// RENDERERS.TS - Three.js Renderers
// ============================================

import * as THREE from 'three'
import type { TextureMaterial, BackgroundMaterial, Design } from './domain'
import type { BackgroundRenderData, IMaterialRenderer } from './types'

// ========== Texture Renderer ==========
export class TextureRenderer implements IMaterialRenderer {
  readonly type = 'texture' as const

  /**
   * Determine if a mesh is a UV-mapped mesh for design textures
   * UV meshes are typically named with patterns like "Texture_*", "UV_*", or contain "texture"
   * Original model meshes (like "Retopo_*") should preserve their Blender textures
   */
  private isUVMeshForDesign(meshName: string): boolean {
    const name = meshName.toLowerCase()
    return (
      name.includes('texture_') ||
      name.startsWith('uv_') ||
      (name.includes('texture') && !name.includes('retopo'))
    )
  }

  private textureCache = new Map<string, THREE.Texture>()

  getTextureUrl(material: TextureMaterial): string {
    return material.payload.url
  }

  dispose(): void {
    this.textureCache.forEach((texture) => {
      texture.dispose()
    })
    this.textureCache.clear()
  }

  disposeTexture(url: string): void {
    const texture = this.textureCache.get(url)
    if (texture) {
      texture.dispose()
      this.textureCache.delete(url)
    }
  }

  render(material: TextureMaterial, mesh: THREE.Mesh): void {
    const loader = new THREE.TextureLoader()
    const textureUrl = material.payload.url

    if (mesh.material instanceof THREE.MeshStandardMaterial) {
      if (mesh.material.map) {
        const oldUrl = (mesh.material.map as any).userData?.url
        if (oldUrl && oldUrl !== textureUrl) {
          this.disposeTexture(oldUrl)
        }
        mesh.material.map.dispose()
        mesh.material.map = null
      }
    }

    loader.load(
      textureUrl,
      (texture) => {
        texture.userData = { url: textureUrl }
        this.textureCache.set(textureUrl, texture)

        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(1, 1)
        if (THREE.SRGBColorSpace !== undefined) {
          texture.colorSpace = THREE.SRGBColorSpace
        }

        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.map = texture
          mesh.material.needsUpdate = true
        }
      },
      undefined,
      (error) => {
        console.error('[TextureRenderer] Error loading texture:', error)
        this.textureCache.delete(textureUrl)
      }
    )
  }

  renderToScene(
    material: TextureMaterial,
    scene: THREE.Scene | THREE.Group
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader()
      const textureUrl = material.payload.url

      // Cleanup only design textures from UV meshes
      const oldDesignTextures: THREE.Texture[] = []

      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const meshName = child.name || ''
          const isUVMesh = this.isUVMeshForDesign(meshName)

          if (!isUVMesh) {
            return // Skip non-UV meshes
          }

          if (child.material instanceof THREE.MeshStandardMaterial) {
            if (child.material.map && (child.material.map as any).userData?.isDesignTexture) {
              oldDesignTextures.push(child.material.map)
              child.material.map = null
            }
          } else if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                if (mat.map && (mat.map as any).userData?.isDesignTexture) {
                  oldDesignTextures.push(mat.map)
                  mat.map = null
                }
              }
            })
          }
        }
      })

      oldDesignTextures.forEach((texture) => {
        const url = (texture as any).userData?.url
        if (url) {
          this.disposeTexture(url)
        } else {
          texture.dispose()
        }
      })

      loader.load(
        textureUrl,
        (texture) => {
          try {
            texture.userData = {
              url: textureUrl,
              isDesignTexture: true,
            }
            this.textureCache.set(textureUrl, texture)

            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            texture.repeat.set(1, 1)
            if (THREE.SRGBColorSpace !== undefined) {
              texture.colorSpace = THREE.SRGBColorSpace
            }

            // Apply texture ONLY to UV-mapped meshes
            scene.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                const meshName = child.name || ''
                const isUVMesh = this.isUVMeshForDesign(meshName)

                if (isUVMesh) {
                  if (child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.map = texture
                    child.material.needsUpdate = true
                  } else if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => {
                      if (mat instanceof THREE.MeshStandardMaterial) {
                        mat.map = texture
                        mat.needsUpdate = true
                      }
                    })
                  }
                }
              }
            })

            resolve()
          } catch (error) {
            console.error('[TextureRenderer] Error applying texture:', error)
            this.textureCache.delete(textureUrl)
            reject(error)
          }
        },
        undefined,
        (error) => {
          console.error('[TextureRenderer] Error loading texture:', error)
          this.textureCache.delete(textureUrl)
          reject(error)
        }
      )
    })
  }
}

// ========== Background Renderer ==========
export class BackgroundRenderer {
  getRenderData(design: Design): BackgroundRenderData {
    const background = this.resolveBackground(design)
    const payload = background.payload

    const renderData: BackgroundRenderData = {
      type: payload.type,
    }

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

    // Clear existing background
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
      const loader = new THREE.TextureLoader()
      loader.load(
        background.payload.url,
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping
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
