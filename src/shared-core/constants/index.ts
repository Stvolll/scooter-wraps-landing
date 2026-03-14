// Constants - NO IMPORTS ALLOWED

export const MATERIAL_TYPES = {
  TEXTURE: 'texture' as const,
  PHOTO: 'photo' as const,
  VIDEO: 'video' as const,
  BACKGROUND: 'background' as const,
} as const

export const DESIGN_STATUS = {
  DRAFT: 'draft' as const,
  PUBLISHED: 'published' as const,
  ARCHIVED: 'archived' as const,
} as const

export const BACKGROUND_TYPES = {
  COLOR: 'color' as const,
  GRADIENT: 'gradient' as const,
  IMAGE: 'image' as const,
  HDRI: 'hdri' as const,
} as const

export const THUMBNAIL_DIMENSIONS = {
  WIDTH: 300,
  HEIGHT: 200,
} as const

export const VIDEO_THUMBNAIL_TIME = 1 // seconds


