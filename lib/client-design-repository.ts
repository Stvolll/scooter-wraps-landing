'use client'

/**
 * Клиентский IDesignRepository для загрузки дизайнов через API
 * Соответствует документации MODEL_DESIGN_SYSTEM_AUTONOMOUS.md
 * 
 * Преобразует данные из API в domain entities:
 * - Design с mainTexture и supportMaterials
 * - TextureMaterial, PhotoMaterial, VideoMaterial, BackgroundMaterial
 * - DesignVersion
 */

// Типы из документации
type MaterialId = string
type DesignId = string
type ModelId = string
type DesignStatus = 'draft' | 'published' | 'archived'
type ImageFormat = 'jpg' | 'png' | 'webp'
type BackgroundType = 'color' | 'gradient' | 'image' | 'hdri'
type GradientDirection = 'vertical' | 'horizontal'

// Domain entities (упрощенные версии из документации)
class DesignVersion {
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

class TextureMaterial {
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

class PhotoMaterial {
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

class VideoMaterial {
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

class BackgroundMaterial {
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
      format?: ImageFormat | 'hdr' | 'exr'
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

class SupportMaterials {
  constructor(
    public readonly photos: PhotoMaterial[],
    public readonly videos: VideoMaterial[],
    public readonly sceneBackground?: BackgroundMaterial
  ) {}
}

class Design {
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
}

// IDesignRepository interface (из документации)
interface IDesignRepository {
  getById(id: DesignId): Promise<Design | null>
  getByModelId(modelId: ModelId): Promise<Design[]>
  getAll(): Promise<Design[]>
  create(design: Design): Promise<Design>
  update(design: Design): Promise<Design>
  delete(id: DesignId): Promise<void>
}

/**
 * Клиентский репозиторий для загрузки дизайнов через API
 * Преобразует данные из API в domain entities
 */
export class ClientDesignRepository implements IDesignRepository {
  /**
   * Загрузить дизайн по ID через API
   */
  async getById(id: DesignId): Promise<Design | null> {
    try {
      // Пробуем админский endpoint сначала
      let response = await fetch(`/api/admin/designs/${id}`)
      
      if (!response.ok) {
        // Fallback на публичный endpoint
        response = await fetch(`/api/designs/${id}`)
      }

      if (!response.ok) {
        console.warn(`[ClientDesignRepository] Design not found: ${id}`)
        return null
      }

      const data = await response.json()
      const designData = data.design

      if (!designData) {
        return null
      }

      // Преобразуем в domain entity
      return this.mapToDomain(designData)
    } catch (error) {
      console.error(`[ClientDesignRepository] Error loading design ${id}:`, error)
      return null
    }
  }

  /**
   * Преобразовать данные из API в domain entity Design
   */
  private mapToDomain(designData: any): Design {
    // Извлечь mainTexture
    // Поддержка разных форматов API:
    // 1. Новый формат из документации: mainTexture с payload
    // 2. Формат с materials array: TEXTURE материал
    // 3. Старый формат: textureUrl или texture
    // 4. WebP формат: textureWebp
    let mainTexture: TextureMaterial

    if (designData.mainTexture) {
      // Новый формат с mainTexture (из документации)
      mainTexture = new TextureMaterial(
        designData.mainTexture.id || 'main-texture',
        {
          url: designData.mainTexture.payload?.url || designData.mainTexture.url || '',
          width: designData.mainTexture.payload?.width || 2048,
          height: designData.mainTexture.payload?.height || 2048,
          format: (designData.mainTexture.payload?.format || 'png') as ImageFormat,
        }
      )
    } else if (designData.materials && Array.isArray(designData.materials)) {
      // Формат с materials array (текущий формат API)
      const textureMaterial = designData.materials.find(
        (m: any) => m.format === 'TEXTURE' || m.format === 'texture'
      )
      
      if (textureMaterial) {
        mainTexture = new TextureMaterial('main-texture', {
          url: textureMaterial.url || '',
          width: 2048,
          height: 2048,
          format: 'png',
        })
      } else {
        // Fallback на textureUrl
        const textureUrl = designData.textureUrl || designData.textureWebp || designData.texture || ''
        mainTexture = new TextureMaterial('main-texture', {
          url: textureUrl,
          width: 2048,
          height: 2048,
          format: textureUrl.endsWith('.webp') ? 'webp' : 'png',
        })
      }
    } else {
      // Старый формат: textureUrl, textureWebp или texture
      const textureUrl = designData.textureUrl || designData.textureWebp || designData.texture || ''
      mainTexture = new TextureMaterial('main-texture', {
        url: textureUrl,
        width: 2048,
        height: 2048,
        format: textureUrl.endsWith('.webp') ? 'webp' : (textureUrl.endsWith('.jpg') || textureUrl.endsWith('.jpeg') ? 'jpg' : 'png'),
      })
    }

    // Извлечь photos
    const photos: PhotoMaterial[] = []
    
    if (designData.supportMaterials?.photos) {
      designData.supportMaterials.photos.forEach((p: any, index: number) => {
        photos.push(
          new PhotoMaterial(p.id || `photo-${index}`, {
            originalUrl: p.payload?.originalUrl || p.originalUrl || p.url || '',
            thumbnailUrl: p.payload?.thumbnailUrl || p.thumbnailUrl || p.url || '',
            width: p.payload?.width || p.width || 1920,
            height: p.payload?.height || p.height || 1080,
            caption: p.payload?.caption || p.caption,
          })
        )
      })
    } else if (designData.galleryImages && Array.isArray(designData.galleryImages)) {
      // Старый формат с galleryImages
      designData.galleryImages.forEach((url: string, index: number) => {
        photos.push(
          new PhotoMaterial(`photo-${index}`, {
            originalUrl: url,
            thumbnailUrl: url,
            width: 1920,
            height: 1080,
          })
        )
      })
    }

    // Извлечь videos
    const videos: VideoMaterial[] = []
    
    if (designData.supportMaterials?.videos) {
      designData.supportMaterials.videos.forEach((v: any, index: number) => {
        videos.push(
          new VideoMaterial(v.id || `video-${index}`, {
            url: v.payload?.url || v.url || '',
            duration: v.payload?.duration || v.duration || 0,
            thumbnailUrl: v.payload?.thumbnailUrl || v.thumbnailUrl || '',
            format: (v.payload?.format || v.format || 'mp4') as 'mp4' | 'webm',
          })
        )
      })
    } else if (designData.videoPreview) {
      // Старый формат с videoPreview
      videos.push(
        new VideoMaterial('video-0', {
          url: designData.videoPreview,
          duration: 0,
          thumbnailUrl: '',
          format: 'mp4',
        })
      )
    }

    // Извлечь sceneBackground
    let sceneBackground: BackgroundMaterial | undefined

    if (designData.supportMaterials?.sceneBackground) {
      // Новый формат из документации
      const bg = designData.supportMaterials.sceneBackground
      sceneBackground = new BackgroundMaterial(bg.id || 'background-0', {
        type: (bg.payload?.type || bg.type || 'image') as BackgroundType,
        color: bg.payload?.color || bg.color,
        gradient: bg.payload?.gradient || bg.gradient,
        url: bg.payload?.url || bg.url,
        format: bg.payload?.format || bg.format,
      })
    } else if (designData.panorama || designData.bgWebp) {
      // Старый формат с panorama или bgWebp
      const panoramaUrl = designData.panorama || designData.bgWebp || ''
      sceneBackground = new BackgroundMaterial('background-0', {
        type: 'image',
        url: panoramaUrl,
        format: panoramaUrl.endsWith('.webp') ? 'webp' : (panoramaUrl.endsWith('.hdr') ? 'hdr' : (panoramaUrl.endsWith('.exr') ? 'exr' : 'png')),
      })
    } else if (designData.materials && Array.isArray(designData.materials)) {
      // Ищем PANORAMA материал в materials array
      const panoramaMaterial = designData.materials.find(
        (m: any) => m.format === 'PANORAMA' || m.format === 'panorama'
      )
      
      if (panoramaMaterial) {
        sceneBackground = new BackgroundMaterial('background-0', {
          type: 'image',
          url: panoramaMaterial.url || '',
          format: 'webp',
        })
      }
    }

    const supportMaterials = new SupportMaterials(photos, videos, sceneBackground)

    // Извлечь version
    let version: DesignVersion
    if (designData.version) {
      version = new DesignVersion(
        designData.version.major || 1,
        designData.version.minor || 0,
        designData.version.patch || 0,
        (designData.version.status || 'draft') as DesignStatus
      )
    } else {
      version = DesignVersion.initial()
    }

    // Создать Design entity
    return new Design(
      designData.id,
      designData.modelId || designData.scooterModel?.id || 'model-1',
      designData.name || designData.title || 'Design',
      mainTexture,
      supportMaterials,
      version,
      (designData.status || 'draft') as DesignStatus,
      designData.previewImageUrl || designData.thumbnail || designData.coverImage || '',
      designData.createdAt ? new Date(designData.createdAt) : new Date(),
      designData.updatedAt ? new Date(designData.updatedAt) : new Date()
    )
  }

  async getByModelId(modelId: ModelId): Promise<Design[]> {
    try {
      const response = await fetch(`/api/admin/designs?modelId=${modelId}`)
      if (!response.ok) {
        return []
      }
      const data = await response.json()
      const designs = data.designs || []
      return designs.map((d: any) => this.mapToDomain(d))
    } catch (error) {
      console.error(`[ClientDesignRepository] Error loading designs for model ${modelId}:`, error)
      return []
    }
  }

  async getAll(): Promise<Design[]> {
    try {
      const response = await fetch('/api/admin/designs')
      if (!response.ok) {
        return []
      }
      const data = await response.json()
      const designs = data.designs || []
      return designs.map((d: any) => this.mapToDomain(d))
    } catch (error) {
      console.error('[ClientDesignRepository] Error loading all designs:', error)
      return []
    }
  }

  async create(design: Design): Promise<Design> {
    throw new Error('Create not supported in client repository')
  }

  async update(design: Design): Promise<Design> {
    throw new Error('Update not supported in client repository')
  }

  async delete(id: DesignId): Promise<void> {
    throw new Error('Delete not supported in client repository')
  }
}

// Экспорт типов для использования в других файлах
export type { Design, TextureMaterial, PhotoMaterial, VideoMaterial, BackgroundMaterial, SupportMaterials, DesignVersion, IDesignRepository }

