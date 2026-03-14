/**
 * Three.js Model Loader Service
 * Isolated in infrastructure layer per User Rules
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export interface ModelLoadResult {
  scene: THREE.Group
  meshes: THREE.Mesh[]
}

export class ModelLoaderService {
  /**
   * Load GLB model and return processed scene
   */
  async loadModel(glbUrl: string): Promise<ModelLoadResult> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader()
      
      loader.load(
        glbUrl,
        (gltf) => {
          try {
            // Clone the scene to avoid sharing state
            const clonedScene = gltf.scene.clone()
            
            // Center and scale model
            const box = new THREE.Box3().setFromObject(clonedScene)
            const center = box.getCenter(new THREE.Vector3())
            const size = box.getSize(new THREE.Vector3())
            const maxDim = Math.max(size.x, size.y, size.z)
            
            if (maxDim > 0) {
              const scale = maxDim > 5 ? 5 / maxDim : maxDim < 0.5 ? 0.5 / maxDim : 1
              clonedScene.position.sub(center)
              clonedScene.scale.multiplyScalar(scale)
            }
            
            // Extract all meshes
            const meshes: THREE.Mesh[] = []
            clonedScene.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                meshes.push(child)
              }
            })
            
            resolve({
              scene: clonedScene,
              meshes,
            })
          } catch (error) {
            reject(error)
          }
        },
        undefined,
        (error) => {
          reject(error)
        }
      )
    })
  }
}


