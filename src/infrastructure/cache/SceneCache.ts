import type * as THREE from 'three'

export interface CachedScene {
  scene: THREE.Scene
  timestamp: number
}

export class SceneCache {
  private cache = new Map<string, CachedScene>()
  private readonly TTL = 60 * 60 * 1000 // 1 hour

  getCacheKey(modelId: string, designId: string, version: string): string {
    return `${modelId}:${designId}:${version}`
  }

  get(key: string): CachedScene | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }

    return cached
  }

  set(key: string, scene: THREE.Scene): void {
    this.cache.set(key, {
      scene,
      timestamp: Date.now(),
    })
  }

  clear(): void {
    this.cache.clear()
  }
}


