import type { IDesignRepository } from '@/domain'
import type { Design } from '@/domain'
import { DesignRepository } from '@/infrastructure'
import type { ModelId } from '@/shared-core'

/**
 * Service for querying designs (read-only operations)
 * Separated from DesignService to follow single responsibility
 */
export class DesignQueryService {
  private repository: IDesignRepository

  constructor(repository?: IDesignRepository) {
    this.repository = repository || new DesignRepository()
  }

  async getById(id: string): Promise<Design | null> {
    return this.repository.getById(id)
  }

  async getByModelId(modelId: ModelId): Promise<Design[]> {
    return this.repository.getByModelId(modelId)
  }

  async getAll(): Promise<Design[]> {
    return this.repository.getAll()
  }

  async getPublished(): Promise<Design[]> {
    const all = await this.repository.getAll()
    return all.filter((d) => d.status === 'published')
  }

  async getByModelIdPublished(modelId: ModelId): Promise<Design[]> {
    const designs = await this.repository.getByModelId(modelId)
    return designs.filter((d) => d.status === 'published')
  }
}


