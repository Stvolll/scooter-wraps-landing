import type { MaterialId, VideoFormat } from '@/shared-core'

export class VideoMaterial {
  public readonly type = 'video' as const

  constructor(
    public readonly id: MaterialId,
    public readonly payload: {
      url: string
      duration: number
      thumbnailUrl: string
      format: VideoFormat
    }
  ) {}
}


