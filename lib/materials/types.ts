// MaterialFormat enum for client-side use (matches Prisma enum)
export enum MaterialFormat {
  TEXTURE = 'TEXTURE',
  PANORAMA = 'PANORAMA',
  VIDEO = 'VIDEO',
  PHOTO = 'PHOTO',
}

export interface Material {
  id: string
  designId: string
  format: MaterialFormat
  url: string
  metadata?: {
    role?: 'cover' | 'gallery'
    order?: number
    type?: 'preview' | 'full' | 'tutorial'
    resolution?: string
    [key: string]: any
  }
}

export interface RenderContext {
  modelViewer?: any
  scene?: any
  [key: string]: any
}

export interface MaterialHandler {
  canHandle(format: MaterialFormat): boolean
  apply(material: Material, context: RenderContext): Promise<void> | void
  getDisplayUrl(material: Material): string
  getPreviewUrl(material: Material): string | null
}

