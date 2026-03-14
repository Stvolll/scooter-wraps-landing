import type { MaterialId, ImageFormat } from '@/shared-core'

export class TextureMaterial {
  public readonly type = 'texture' as const

  constructor(
    public readonly id: MaterialId,
    public readonly payload: {
      url: string
      width: number
      height: number
      format: ImageFormat
    }
  ) {}
}


