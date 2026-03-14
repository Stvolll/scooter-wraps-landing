import type { ModelId } from '@/shared-core'
import type { Model } from '../entities/Model'

export interface IModelRepository {
  getById(id: ModelId): Promise<Model | null>
  getAll(): Promise<Model[]>
  create(model: Model): Promise<Model>
  update(model: Model): Promise<Model>
  delete(id: ModelId): Promise<void>
}


