// ============================================
// DOMAIN.TS - Domain Entities
// ============================================

import type {
  MaterialId,
  DesignId,
  ModelId,
  DesignStatus,
  ImageFormat,
  BackgroundType,
  GradientDirection,
  HDRFormat,
} from './types'

// ========== Design Version ==========
export class DesignVersion {
  constructor(
    public major: number,
    public minor: number,
    public patch: number,
    public status: DesignStatus
  ) {}

  static initial(): DesignVersion {
    return new DesignVersion(1, 0, 0, 'draft')
  }

  increment(): DesignVersion {
    return new DesignVersion(
      this.major,
      this.minor,
      this.patch + 1,
      'draft'
    )
  }

  toString(): string {
    return `v${this.major}.${this.minor}.${this.patch}`
  }
}

// ========== Materials ==========
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

export class VideoMaterial {
  public readonly type = 'video' as const

  constructor(
    public readonly id: MaterialId,
    public readonly payload: {
      url: string
      duration: number
      thumbnailUrl: string
      format: 'mp4' | 'webm'
    }
  ) {}
}

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

// ========== Support Materials ==========
export class SupportMaterials {
  constructor(
    public readonly photos: PhotoMaterial[],
    public readonly videos: VideoMaterial[],
    public readonly sceneBackground?: BackgroundMaterial
  ) {}
}

// ========== Design Entity ==========
export class Design {
  constructor(
    public readonly id: DesignId,
    public readonly modelId: ModelId,
    public readonly name: string,
    public readonly mainTexture: TextureMaterial,
    public readonly supportMaterials: SupportMaterials,
    public readonly version: DesignVersion,
    public readonly status: DesignStatus,
    public readonly previewImageUrl: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  updateMainTexture(newTexture: TextureMaterial): Design {
    return new Design(
      this.id,
      this.modelId,
      this.name,
      newTexture,
      this.supportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  addPhoto(photo: PhotoMaterial): Design {
    const newSupportMaterials = new SupportMaterials(
      [...this.supportMaterials.photos, photo],
      this.supportMaterials.videos,
      this.supportMaterials.sceneBackground
    )

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      newSupportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  removePhoto(photoId: string): Design {
    const newPhotos = this.supportMaterials.photos.filter(
      (p) => p.id !== photoId
    )
    const newSupportMaterials = new SupportMaterials(
      newPhotos,
      this.supportMaterials.videos,
      this.supportMaterials.sceneBackground
    )

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      newSupportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  addVideo(video: VideoMaterial): Design {
    const newSupportMaterials = new SupportMaterials(
      this.supportMaterials.photos,
      [...this.supportMaterials.videos, video],
      this.supportMaterials.sceneBackground
    )

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      newSupportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  removeVideo(videoId: string): Design {
    const newVideos = this.supportMaterials.videos.filter(
      (v) => v.id !== videoId
    )
    const newSupportMaterials = new SupportMaterials(
      this.supportMaterials.photos,
      newVideos,
      this.supportMaterials.sceneBackground
    )

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      newSupportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  updateBackground(background: BackgroundMaterial): Design {
    const newSupportMaterials = new SupportMaterials(
      this.supportMaterials.photos,
      this.supportMaterials.videos,
      background
    )

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      newSupportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  removeBackground(): Design {
    const newSupportMaterials = new SupportMaterials(
      this.supportMaterials.photos,
      this.supportMaterials.videos,
      undefined
    )

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      newSupportMaterials,
      this.version.increment(),
      'draft',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }

  canPublish(): boolean {
    return !!this.mainTexture
  }

  publish(): Design {
    if (!this.canPublish()) {
      throw new Error('Design must have main texture')
    }

    return new Design(
      this.id,
      this.modelId,
      this.name,
      this.mainTexture,
      this.supportMaterials,
      this.version,
      'published',
      this.previewImageUrl,
      this.createdAt,
      new Date()
    )
  }
}
