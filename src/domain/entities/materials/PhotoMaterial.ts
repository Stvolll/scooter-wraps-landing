import type { MaterialId } from '@/shared-core'

export class PhotoMaterial {
  public readonly type = 'photo' as const

  constructor(
    public readonly id: MaterialId,
    public readonly payload: {
      originalUrl: string
      thumbnailUrl: string
      width: number
      height: number
      caption?: string
    }
  ) {}
}


