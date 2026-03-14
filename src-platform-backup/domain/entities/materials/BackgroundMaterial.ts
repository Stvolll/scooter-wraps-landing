import type {
  MaterialId,
  BackgroundType,
  GradientDirection,
  ImageFormat,
  HDRFormat,
} from '@/shared-core'

export class BackgroundMaterial {
  public readonly type = 'background' as const

  constructor(
    public readonly id: MaterialId,
    public readonly payload: {
      type: BackgroundType
      color?: string
      gradient?: {
        from: string
        to: string
        direction: GradientDirection
      }
      url?: string
      format?: ImageFormat | HDRFormat
    }
  ) {}

  static createDefault(): BackgroundMaterial {
    return new BackgroundMaterial('bg-fallback-default', {
      type: 'gradient',
      gradient: {
        from: '#ffffff',
        to: '#e8e8e8',
        direction: 'vertical',
      },
    })
  }
}


