import type { IModelRepository } from '@/domain'
import { Model } from '@/domain'
import { ModelRepository } from '@/infrastructure'
import { generateModelId } from '@/infrastructure/utils/idGenerator'

export class ModelService {
  private repository: IModelRepository

  constructor(repository?: IModelRepository) {
    this.repository = repository || new ModelRepository()
  }

  async getById(id: string): Promise<Model | null> {
    return this.repository.getById(id)
  }

  async getAll(): Promise<Model[]> {
    return this.repository.getAll()
  }

  async create(data: {
    name: string
    glbFile: Buffer | File
    glbUrl?: string
  }): Promise<Model> {
    // TODO: Upload glbFile to storage and get URL
    const glbUrl = data.glbUrl || `/uploads/models/${Date.now()}.glb`

    const model = new Model(
      generateModelId(),
      data.name,
      glbUrl,
      new Date(),
      new Date()
    )

    return this.repository.create(model)
  }

  async update(model: Model): Promise<Model> {
    return this.repository.update(model)
  }

  async delete(id: string): Promise<void> {
    // First, delete all associated designs
    const { DesignService } = await import('./DesignService')
    const { DesignQueryService } = await import('./DesignQueryService')
    
    const designQueryService = new DesignQueryService()
    const associatedDesigns = await designQueryService.getByModelId(id)
    
    console.log(`[ModelService] Deleting model ${id} and ${associatedDesigns.length} associated designs`)
    
    const designService = new DesignService()
    for (const design of associatedDesigns) {
      await designService.delete(design.id)
      console.log(`[ModelService] Deleted design ${design.id}`)
    }
    
    // Then delete the model itself
    await this.repository.delete(id)
    console.log(`[ModelService] Deleted model ${id}`)
  }
}

