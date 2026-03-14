import type { DesignId, ModelId, DesignStatus } from '@/shared-core'
import type { TextureMaterial } from './materials/TextureMaterial'
import { SupportMaterials } from '../value-objects/SupportMaterials'
import { DesignVersion } from '../value-objects/DesignVersion'
import { CannotPublishError } from '@/shared-core'

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
      throw new CannotPublishError('Design must have main texture')
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

// Import types needed for methods
import type { PhotoMaterial } from './materials/PhotoMaterial'
import type { VideoMaterial } from './materials/VideoMaterial'
import type { BackgroundMaterial } from './materials/BackgroundMaterial'


