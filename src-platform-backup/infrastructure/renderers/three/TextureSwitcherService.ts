/**
 * Three.js Texture Switcher Service
 * Isolated in infrastructure layer per User Rules
 */

import * as THREE from 'three'

export class TextureSwitcherService {
  /**
   * Apply texture to all meshes in a scene
   * Similar to Babylon.js changeTexture function
   */
  async applyTextureToScene(
    scene: THREE.Scene | THREE.Group,
    textureUrl: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader()
      
      loader.load(
        textureUrl,
        (texture) => {
          // Configure texture
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          texture.repeat.set(1, 1)
          
          // Apply texture to all meshes in the scene
          scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.map = texture
                child.material.needsUpdate = true
              } else if (Array.isArray(child.material)) {
                // Handle multi-material meshes
                child.material.forEach((mat) => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    mat.map = texture
                    mat.needsUpdate = true
                  }
                })
              }
            }
          })
          
          resolve()
        },
        undefined,
        (error) => {
          reject(new Error(`Failed to load texture: ${textureUrl}`))
        }
      )
    })
  }
  
  /**
   * Remove texture from all meshes in a scene
   */
  removeTextureFromScene(scene: THREE.Scene | THREE.Group): void {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.map = null
          child.material.needsUpdate = true
        } else if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.map = null
              mat.needsUpdate = true
            }
          })
        }
      }
    })
  }
}


