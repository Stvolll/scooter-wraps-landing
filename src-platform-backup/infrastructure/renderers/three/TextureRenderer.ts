import type { IMaterialRenderer } from './IMaterialRenderer'
import type { TextureMaterial } from '@/domain'
import { TextureMaterial as TextureMaterialClass } from '@/domain'
import * as THREE from 'three'

export class TextureRenderer implements IMaterialRenderer {
  readonly type = 'texture' as const

  /**
   * Apply texture by URL (for presentation layer - no domain/three in UI).
   */
  renderTextureByUrl(
    target: THREE.Scene | THREE.Group,
    url: string
  ): Promise<void> {
    const temp = new TextureMaterialClass('temp-texture', {
      url,
      width: 2048,
      height: 2048,
      format: 'jpg',
    })
    return this.renderToScene(temp, target)
  }
  
  /**
   * ✅ FIX: Determine if a mesh is a UV-mapped mesh for design textures
   * UV meshes are typically named with patterns like "Texture_*", "UV_*", or contain "texture"
   * Original model meshes (like "Retopo_*") should preserve their Blender textures
   */
  private isUVMeshForDesign(meshName: string): boolean {
    const name = meshName.toLowerCase()
    // UV meshes for designs typically have these patterns:
    // - "Texture_*" (e.g., "Texture_SH160_Z-places")
    // - "UV_*" or contains "uv"
    // - Contains "texture" (but not "Retopo" which is the original model)
    return (
      name.includes('texture_') ||
      name.startsWith('uv_') ||
      (name.includes('texture') && !name.includes('retopo'))
    )
  }

  // ✅ FIX: Сохраняем ссылки на текстуры для освобождения памяти
  private textureCache = new Map<string, THREE.Texture>()

  /**
   * Get texture URL for rendering
   */
  getTextureUrl(material: TextureMaterial): string {
    return material.payload.url
  }

  /**
   * Dispose all cached textures (for cleanup)
   */
  dispose(): void {
    this.textureCache.forEach((texture) => {
      texture.dispose()
    })
    this.textureCache.clear()
  }

  /**
   * Dispose texture by URL
   */
  disposeTexture(url: string): void {
    const texture = this.textureCache.get(url)
    if (texture) {
      texture.dispose()
      this.textureCache.delete(url)
    }
  }

  /**
   * Apply texture to a single mesh
   */
  render(material: TextureMaterial, mesh: THREE.Mesh): void {
    const loader = new THREE.TextureLoader()
    const textureUrl = material.payload.url

    // ✅ FIX: Очищаем предыдущую текстуру если есть
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
        // ✅ FIX: Сохраняем ссылку на текстуру
        texture.userData = { url: textureUrl }
        this.textureCache.set(textureUrl, texture)

        // ✅ FIX: Use ClampToEdgeWrapping to respect original UV coordinates from Blender
        // This ensures texture matches the original UV layout without repeating
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        // Don't set repeat - use original UV coordinates from the mesh
        // texture.repeat.set(1, 1) - removed to preserve original UV mapping

        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.map = texture
          mesh.material.needsUpdate = true
        }
      },
      undefined,
      (error) => {
        console.error('[TextureRenderer] Error loading texture:', error)
        // ✅ FIX: Удаляем из кеша при ошибке
        this.textureCache.delete(textureUrl)
      }
    )
  }

  /**
   * Apply texture to all meshes in a scene/group
   * ✅ FIX: Возвращает Promise для обработки ошибок и race conditions
   */
  renderToScene(
    material: TextureMaterial,
    scene: THREE.Scene | THREE.Group
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader()
      const textureUrl = material.payload.url

      // ✅ FIX: Сохраняем только старые ДИЗАЙН-текстуры с UV-мешей (не оригинальные из Blender)
      const oldDesignTextures: THREE.Texture[] = []
      
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const meshName = child.name || ''
          // ✅ FIX: Only cleanup design textures from UV meshes
          const isUVMesh = this.isUVMeshForDesign(meshName)
          
          if (!isUVMesh) {
            // Skip non-UV meshes - they keep their original Blender textures permanently
            return
          }
          
          if (child.material instanceof THREE.MeshStandardMaterial) {
            if (child.material.map && (child.material.map as any).userData?.isDesignTexture) {
              // Only remove design textures from UV meshes
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

      // ✅ FIX: Освобождаем только старые дизайн-текстуры
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
            // ✅ FIX: Сохраняем ссылку на текстуру и помечаем как дизайн-текстуру
            texture.userData = { 
              url: textureUrl,
              isDesignTexture: true // Mark as design texture (not original Blender texture)
            }
            this.textureCache.set(textureUrl, texture)

            // ✅ FIX: Use ClampToEdgeWrapping to respect original UV coordinates from Blender
            // This ensures texture matches the original UV layout without repeating
            texture.wrapS = THREE.ClampToEdgeWrapping
            texture.wrapT = THREE.ClampToEdgeWrapping
            // Don't set repeat - use original UV coordinates from the mesh
            // texture.repeat.set(1, 1) - removed to preserve original UV mapping

            // ✅ FIX: Apply texture only to meshes that should have design textures
            // Skip meshes with original Blender textures (unless they're meant to be overwritten)
            // ✅ FIX: Apply texture ONLY to UV-mapped meshes (design texture meshes)
            // Original Blender textures on other meshes should remain unchanged
            scene.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                const meshName = child.name || ''
                // ✅ FIX: Identify UV-mapped meshes for design textures
                // UV meshes typically have names like "Texture_*" or contain "UV" or "texture"
                const isUVMesh = this.isUVMeshForDesign(meshName)
                
                if (isUVMesh) {
                  console.log('[TextureRenderer] ✅ Applying design texture to UV mesh:', meshName)
                  // Apply design texture to UV meshes only
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
                } else {
                  console.log('[TextureRenderer] ⏭️ Skipping non-UV mesh (preserving original texture):', meshName)
                  // Skip non-UV meshes - they keep their original Blender textures
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


