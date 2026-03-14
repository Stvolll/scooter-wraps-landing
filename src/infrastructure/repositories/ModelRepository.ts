import type { IModelRepository } from '@/domain'
import { Model } from '@/domain'
import type { ModelId } from '@/shared-core'
import { FileStorage } from '@/infrastructure/storage/FileStorage'

// CRITICAL: Global singleton - must be at module level, not class level
// This ensures the same instance is used across all imports
const globalModelStore = new Map<ModelId, Model>()

// Load models from file storage on module initialization
try {
  const savedModels = FileStorage.loadModels()
  savedModels.forEach((modelData: any) => {
    // Reconstruct Model from saved data
    const model = new Model(
      modelData.id,
      modelData.name,
      modelData.glbUrl,
      new Date(modelData.createdAt),
      new Date(modelData.updatedAt)
    )
    globalModelStore.set(model.id, model)
  })
  console.log(`[ModelRepository] Loaded ${globalModelStore.size} models from file storage`)
} catch (error: any) {
  console.error('[ModelRepository] Error loading models from file storage:', error.message)
  console.error('[ModelRepository] Error stack:', error.stack)
}

// Singleton pattern for in-memory storage
// In production, replace with database persistence
class ModelStore {
  private static instance: ModelStore
  private models = globalModelStore // Use global Map to ensure persistence

  static getInstance(): ModelStore {
    if (!ModelStore.instance) {
      console.log('[ModelStore] Creating new singleton instance')
      ModelStore.instance = new ModelStore()
    } else {
      console.log('[ModelStore] Using existing singleton instance')
    }
    return ModelStore.instance
  }

  getModels(): Map<ModelId, Model> {
    console.log(`[ModelStore] getModels(): Returning ${this.models.size} models`)
    if (this.models.size > 0) {
      console.log(`[ModelStore] Model IDs:`, Array.from(this.models.keys()))
    }
    return this.models
  }
}

export class ModelRepository implements IModelRepository {
  private store = ModelStore.getInstance()

  async getById(id: ModelId): Promise<Model | null> {
    const models = this.store.getModels()
    console.log(`[ModelRepository] getById(${id}): Total models in store: ${models.size}`)
    const model = models.get(id)
    if (model) {
      console.log(`[ModelRepository] Found model: ${model.id} - ${model.name}`)
    } else {
      console.log(`[ModelRepository] Model not found: ${id}`)
      console.log(`[ModelRepository] Available IDs:`, Array.from(models.keys()))
    }
    return model || null
  }

  async getAll(): Promise<Model[]> {
    const models = this.store.getModels()
    console.log(`[ModelRepository] getAll(): Total models in store: ${models.size}`)
    if (models.size > 0) {
      console.log(`[ModelRepository] getAll(): Model IDs:`, Array.from(models.keys()))
      models.forEach((model, id) => {
        console.log(`  - ${id}: ${model.name} (${model.glbUrl})`)
      })
    }
    return Array.from(models.values())
  }

  async create(model: Model): Promise<Model> {
    const models = this.store.getModels()
    models.set(model.id, model)
    console.log(`[ModelRepository] Created model: ${model.id} - ${model.name}`)
    console.log(`[ModelRepository] GLB URL: ${model.glbUrl}`)
    console.log(`[ModelRepository] Total models after create: ${models.size}`)
    
    // Save to file storage for persistence
    const allModels = Array.from(models.values())
    const serializedModels = allModels.map((m: Model) => ({
      id: m.id,
      name: m.name,
      glbUrl: m.glbUrl,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
      updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
    }))
    FileStorage.saveModels(serializedModels)
    
    // Verify it was saved
    const saved = models.get(model.id)
    if (!saved) {
      console.error(`[ModelRepository] ERROR: Model ${model.id} was not saved!`)
    } else {
      console.log(`[ModelRepository] Verified: Model ${model.id} is in store`)
    }
    
    console.log(`[ModelRepository] Verification: getAll() returns ${allModels.length} models`)
    
    return model
  }

  async update(model: Model): Promise<Model> {
    const models = this.store.getModels()
    models.set(model.id, model)
    
    // Save to file storage
    const allModels = Array.from(models.values())
    const serializedModels = allModels.map((m: Model) => ({
      id: m.id,
      name: m.name,
      glbUrl: m.glbUrl,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
      updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
    }))
    FileStorage.saveModels(serializedModels)
    
    return model
  }

  async delete(id: ModelId): Promise<void> {
    const models = this.store.getModels()
    models.delete(id)
    
    // Save to file storage
    const allModels = Array.from(models.values())
    const serializedModels = allModels.map((m: Model) => ({
      id: m.id,
      name: m.name,
      glbUrl: m.glbUrl,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
      updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
    }))
    FileStorage.saveModels(serializedModels)
  }
}
