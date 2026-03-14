// Core type definitions - NO IMPORTS ALLOWED

export type MaterialId = string
export type DesignId = string
export type ModelId = string

export type MaterialType = 'texture' | 'photo' | 'video' | 'background'

export type DesignStatus = 'draft' | 'published' | 'archived'

export interface BackgroundRenderData {
  type: 'color' | 'gradient' | 'image' | 'hdri'
  color?: string
  gradient?: {
    from: string
    to: string
    direction: 'vertical' | 'horizontal'
  }
  url?: string
}

export type BackgroundType = 'color' | 'gradient' | 'image' | 'hdri'

export type GradientDirection = 'vertical' | 'horizontal'

export type ImageFormat = 'jpg' | 'png' | 'webp'
export type VideoFormat = 'mp4' | 'webm'
export type HDRFormat = 'hdr' | 'exr'


