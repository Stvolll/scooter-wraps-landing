import type { Design } from '@/domain'
import { ModelService } from './ModelService'
import { DesignQueryService } from './DesignQueryService'

/**
 * Service to get model information from a design
 * Bridges Design -> Model relationship
 */
export class DesignModelService {
  private designQueryService: DesignQueryService
  private modelService: ModelService

  constructor(
    designQueryService?: DesignQueryService,
    modelService?: ModelService
  ) {
    this.designQueryService = designQueryService || new DesignQueryService()
    this.modelService = modelService || new ModelService()
  }

  async getModelUrlForDesign(designId: string): Promise<string | null> {
    const design = await this.designQueryService.getById(designId)
    if (!design) {
      return null
    }

    const model = await this.modelService.getById(design.modelId)
    if (!model) {
      return null
    }

    return model.glbUrl
  }

  async getDesignWithModel(designId: string): Promise<{
    design: Design
    modelUrl: string
  } | null> {
    const design = await this.designQueryService.getById(designId)
    if (!design) {
      return null
    }

    const model = await this.modelService.getById(design.modelId)
    if (!model) {
      return null
    }

    return {
      design,
      modelUrl: model.glbUrl,
    }
  }
}


