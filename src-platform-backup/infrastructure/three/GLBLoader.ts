import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export class GLBLoader {
  private loader: GLTFLoader

  constructor() {
    this.loader = new GLTFLoader()
  }

  async load(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          resolve(gltf.scene)
        },
        undefined,
        (error) => {
          reject(error)
        }
      )
    })
  }
}


