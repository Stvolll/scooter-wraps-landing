/**
 * Model Load Service
 * Provides model loading functionality through application layer
 * Abstracts infrastructure ModelLoaderService
 */

import type { ModelLoadResult } from '@/infrastructure/renderers/three/ModelLoaderService'
import { ModelLoaderService } from '@/infrastructure/renderers/three/ModelLoaderService'

export class ModelLoadService {
  private modelLoaderService: ModelLoaderService

  constructor(modelLoaderService?: ModelLoaderService) {
    this.modelLoaderService = modelLoaderService || new ModelLoaderService()
  }

  /**
   * Load GLB model and return processed scene
   * Delegates to infrastructure ModelLoaderService
   */
  async loadModel(glbUrl: string): Promise<ModelLoadResult> {
    return this.modelLoaderService.loadModel(glbUrl)
  }
}

