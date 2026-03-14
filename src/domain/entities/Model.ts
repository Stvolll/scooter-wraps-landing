import type { ModelId } from '@/shared-core'

export class Model {
  constructor(
    public readonly id: ModelId,
    public readonly name: string,
    public readonly glbUrl: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}


