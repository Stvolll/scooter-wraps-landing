import type { DesignId, ModelId } from '@/shared-core'
import type { Design } from '../entities/Design'

export interface IDesignRepository {
  getById(id: DesignId): Promise<Design | null>
  getByModelId(modelId: ModelId): Promise<Design[]>
  getAll(): Promise<Design[]>
  create(design: Design): Promise<Design>
  update(design: Design): Promise<Design>
  delete(id: DesignId): Promise<void>
}


