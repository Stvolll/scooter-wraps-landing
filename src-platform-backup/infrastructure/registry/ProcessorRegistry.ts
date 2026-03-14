import type { MaterialType } from '@/shared-core'
import type { IMaterialProcessor } from '../processors/IMaterialProcessor'
import { MaterialProcessorNotFoundError } from '@/shared-core'

export class ProcessorRegistry {
  private processors = new Map<MaterialType, IMaterialProcessor>()

  register(type: MaterialType, processor: IMaterialProcessor): void {
    this.processors.set(type, processor)
  }

  get(type: MaterialType): IMaterialProcessor {
    const processor = this.processors.get(type)
    if (!processor) {
      throw new MaterialProcessorNotFoundError(type)
    }
    return processor
  }

  has(type: MaterialType): boolean {
    return this.processors.has(type)
  }
}


