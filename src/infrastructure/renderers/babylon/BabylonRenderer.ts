/**
 * Babylon.js Renderer for 3D models
 * Isolated in infrastructure layer per User Rules
 */

import type { Design } from '@/domain'
import type { Model } from '@/domain'

export interface BabylonSceneConfig {
  canvas: HTMLCanvasElement
  modelUrl: string
  textureUrl?: string
  background?: {
    type: 'color' | 'gradient' | 'image' | 'hdri'
    color?: string
    gradient?: {
      from: string
      to: string
      direction: 'vertical' | 'horizontal'
    }
    url?: string
  }
}

export class BabylonRenderer {
  private engine: any = null
  private scene: any = null
  private modelMesh: any = null

  /**
   * Initialize Babylon.js engine and scene
   */
  async initialize(config: BabylonSceneConfig): Promise<void> {
    // Dynamic import to avoid SSR issues
    const { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, Color3 } = await import('@babylonjs/core')
    // Import SceneLoader - it's a static class in @babylonjs/loaders
    const babylonLoaders = await import('@babylonjs/loaders')
    // SceneLoader is exported as a named export or may be on the module itself
    const SceneLoader = (babylonLoaders as any).SceneLoader || (babylonLoaders as any)

    // Create engine
    this.engine = new Engine(config.canvas, true, {
      preserveDrawingBuffer: false,
      stencil: true,
    })

    // Create scene
    this.scene = new Scene(this.engine)
    this.scene.clearColor = new Color3(0.9, 0.9, 0.9)

    // Create camera
    const camera = new ArcRotateCamera(
      'camera',
      Math.PI / 2,
      Math.PI / 3,
      5,
      Vector3.Zero(),
      this.scene
    )
    camera.attachControl(config.canvas, true)

    // Create light
    const light = new HemisphericLight('light', new Vector3(1, 1, 0), this.scene)

    // Load model
    // Extract base path and filename from modelUrl
    // Example: /uploads/models/file.glb -> basePath: '/uploads/models/', filename: 'file.glb'
    const urlParts = config.modelUrl.split('/')
    const filename = urlParts[urlParts.length - 1]
    const basePath = config.modelUrl.substring(0, config.modelUrl.lastIndexOf('/') + 1)

    console.log('[BabylonRenderer] Loading model:', { basePath, filename, fullUrl: config.modelUrl })

    await new Promise<void>((resolve, reject) => {
      if (!SceneLoader || !SceneLoader.ImportMesh) {
        reject(new Error('SceneLoader not available'))
        return
      }
      SceneLoader.ImportMesh(
        '',
        basePath || '/',
        filename,
        this.scene,
        (meshes) => {
          console.log('[BabylonRenderer] Model loaded, meshes:', meshes.length)
          if (meshes.length > 0) {
            this.modelMesh = meshes[0]
            
            // Apply texture if provided
            if (config.textureUrl) {
              this.applyTexture(config.textureUrl).catch((err) => {
                console.error('[BabylonRenderer] Error applying texture:', err)
              })
            }
            
            resolve()
          } else {
            reject(new Error('No meshes found in model'))
          }
        },
        undefined,
        (error) => {
          console.error('[BabylonRenderer] Error loading model:', error)
          reject(error)
        }
      )
    })

    // Apply background
    if (config.background) {
      this.applyBackground(config.background)
    }

    // Start render loop
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })

    // Handle resize
    window.addEventListener('resize', () => {
      this.engine.resize()
    })
  }

  /**
   * Apply texture to model
   * Similar to Babylon.js changeTexture function from example
   */
  async applyTexture(textureUrl: string): Promise<void> {
    if (!this.modelMesh || !this.scene) return

    const { StandardMaterial, Texture } = await import('@babylonjs/core')

    console.log('[BabylonRenderer] Applying texture:', textureUrl)
    
    const material = new StandardMaterial('material', this.scene)
    material.diffuseTexture = new Texture(textureUrl, this.scene)
    
    // Apply to all meshes if modelMesh is a group
    if (this.modelMesh.getChildMeshes) {
      const meshes = this.modelMesh.getChildMeshes()
      console.log('[BabylonRenderer] Applying texture to', meshes.length, 'meshes')
      meshes.forEach((mesh: any) => {
        mesh.material = material
      })
    } else {
      this.modelMesh.material = material
    }
    
    console.log('[BabylonRenderer] Texture applied successfully')
  }

  /**
   * Apply background to scene
   */
  async applyBackground(background: BabylonSceneConfig['background']): Promise<void> {
    if (!this.scene || !background) return

    const { Color3, Texture } = await import('@babylonjs/core')

    if (background.type === 'color' && background.color) {
      this.scene.clearColor = Color3.FromHexString(background.color)
    } else if (background.type === 'image' && background.url) {
      const texture = new Texture(background.url, this.scene)
      this.scene.environmentTexture = texture
    } else if (background.type === 'gradient' && background.gradient) {
      // Create gradient using canvas
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const context = canvas.getContext('2d')
      
      if (context) {
        const gradient =
          background.gradient.direction === 'vertical'
            ? context.createLinearGradient(0, 0, 0, 256)
            : context.createLinearGradient(0, 0, 256, 0)
        
        gradient.addColorStop(0, background.gradient.from)
        gradient.addColorStop(1, background.gradient.to)
        
        context.fillStyle = gradient
        context.fillRect(0, 0, 256, 256)
        
        const texture = new Texture(canvas.toDataURL(), this.scene)
        this.scene.environmentTexture = texture
      }
    }
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.scene) {
      this.scene.dispose()
    }
    if (this.engine) {
      this.engine.dispose()
    }
  }
}

